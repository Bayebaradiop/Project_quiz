import { Context } from 'hono';
import path from 'path';
import fs from 'fs/promises';
import { extractTextFromFile, cleanExtractedText } from '../services/DocumentExtractor.Service';
import { generateQuizQuestions } from '../services/QuizAI.Service';
import { getUserFromContext } from '../middleware/Auth';
import { getNumericId } from '../middleware/HashId';
import { createQuestionSchema } from '../validations/Question.validator';
import { QuestionService } from '../services/Question.Service';
import { SUCCESS_MESSAGES } from '../validations/erreurs_messages/Message.error';
import { ZodError } from 'zod';

/**
 * Génère des questions de quiz à partir d'un document uploadé
 * POST /api/v1/quizzes/:quizId/generate-from-document
 */
export const generateFromDocument = async (c: Context) => {
  let tempFilePath: string | null = null;
  
  try {
    const user = getUserFromContext(c);
    const quizHashId = c.req.param('quizId');
    const quiz_id = getNumericId(c, 'quizId');
    
    if (!quiz_id) {
      return c.json({ success: false, message: 'ID du quiz invalide' }, 400);
    }

    console.log(`[QuizAI] Génération depuis document pour quiz: ${quizHashId}`);

    // Récupérer le form-data
    const formData = await c.req.formData();
    const file = formData.get('document') as File;
    const numQuestions = parseInt(formData.get('numQuestions') as string) || 5;
    const difficulty = (formData.get('difficulty') as string) || 'moyen';
    
    if (!file) {
      return c.json({
        success: false,
        message: 'Aucun fichier fourni. Veuillez uploader un document.'
      }, 400);
    }

    // Vérifier le type de fichier
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (!allowedMimes.includes(file.type)) {
      return c.json({
        success: false,
        message: 'Type de fichier non supporté. Formats acceptés: PDF, Word (.docx), Images (JPG, PNG)'
      }, 400);
    }

    // Vérifier la taille (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({
        success: false,
        message: 'Le fichier est trop volumineux. Taille maximum: 10 MB'
      }, 400);
    }

    console.log('[QuizAI] Fichier reçu:', file.name, file.type, `${file.size} bytes`);

    // Créer le dossier uploads s'il n'existe pas
    const uploadDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Sauvegarder le fichier temporairement
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.name);
    tempFilePath = path.join(uploadDir, `quiz-doc-${uniqueSuffix}${ext}`);
    
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(tempFilePath, Buffer.from(arrayBuffer));
    
    console.log('[QuizAI] Fichier sauvegardé:', tempFilePath);

    // Extraire le texte du document
    const extractedText = await extractTextFromFile(tempFilePath, file.type);
    const cleanedText = cleanExtractedText(extractedText);

    console.log('[QuizAI] Texte extrait:', cleanedText.length, 'caractères');

    // Vérifier que le texte extrait n'est pas vide
    if (!cleanedText || cleanedText.length < 50) {
      return c.json({
        success: false,
        message: 'Le document ne contient pas suffisamment de texte exploitable.'
      }, 400);
    }

    // Construire le prompt avec le contexte du document
    const prompt = `En te basant sur le contenu suivant, génère ${numQuestions} questions à choix multiples de niveau ${difficulty}.

CONTENU DU DOCUMENT:
${cleanedText.substring(0, 3000)} ${cleanedText.length > 3000 ? '...' : ''}

Génère des questions pertinentes qui testent la compréhension du contenu ci-dessus.`;

    // Générer les questions avec l'IA
    const raw = await generateQuizQuestions(prompt);

    // Parser et valider comme dans QuizAIController
    let parsed: any = null;
    if (typeof raw === 'string') {
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        const m = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (m) {
          parsed = JSON.parse(m[0]);
        }
      }
    } else {
      parsed = raw;
    }

    if (!Array.isArray(parsed)) {
      return c.json({ success: false, message: 'Impossible d\'analyser la réponse IA au format JSON attendu.' }, 500);
    }

    const questionService = new QuestionService();
    const createdQuestions: any[] = [];

    // Créer chaque question en base de données
    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      const mapped: any = {
        texte: item.texte || item.question,
        duree: item.duree || item.duration || 30,
        ordre: item.ordre || (i + 1),
        choix_reponses: []
      };

      const opts = item.choix_reponses || item.options || item.choix || [];
      for (let j = 0; j < opts.length; j++) {
        const opt = opts[j];
        let estCorrecte = opt.est_correcte ?? opt.correct ?? opt.is_correct ?? false;
        
        if (!estCorrecte && item.correct_answer) {
          const optText = (opt.texte || opt.text || '').trim().toLowerCase();
          const correctText = item.correct_answer.trim().toLowerCase();
          if (optText === correctText || optText.includes(correctText) || correctText.includes(optText)) {
            estCorrecte = true;
          }
        }

        mapped.choix_reponses.push({
          texte: opt.texte || opt.text || opt.option || String(opt),
          est_correcte: estCorrecte,
          ordre: opt.ordre || (j + 1)
        });
      }

      try {
        const validated = createQuestionSchema.parse(mapped);
        const created = await questionService.createQuestion(quiz_id, validated, user.userId);
        createdQuestions.push(created);
      } catch (err: any) {
        if (err instanceof ZodError) {
          return c.json({ success: false, message: 'Erreur de validation sur une question générée', errors: err.issues }, 400);
        }
        return c.json({ success: false, message: 'Erreur lors de la création d\'une question', error: err.message }, 500);
      }
    }

    // Retourner le même format que QuizAIController
    if (createdQuestions.length === 1) {
      return c.json({
        success: true,
        message: SUCCESS_MESSAGES.QUESTION_CREATED,
        data: createdQuestions[0],
        metadata: {
          documentName: file.name,
          documentType: file.type,
          extractedChars: cleanedText.length
        }
      }, 201);
    }

    return c.json({
      success: true,
      message: `${createdQuestions.length} questions créées avec succès`,
      data: createdQuestions,
      metadata: {
        documentName: file.name,
        documentType: file.type,
        extractedChars: cleanedText.length,
        numQuestionsRequested: numQuestions
      }
    }, 201);

  } catch (error: any) {
    console.error('[QuizAI] Erreur génération depuis document:', error);
    
    return c.json({
      success: false,
      message: 'Erreur lors de la génération des questions depuis le document.',
      error: error.message
    }, 500);
  } finally {
    // Nettoyer le fichier temporaire
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
        console.log('[QuizAI] Fichier temporaire supprimé');
      } catch (error) {
        console.warn('[QuizAI] Impossible de supprimer le fichier temporaire');
      }
    }
  }
};
