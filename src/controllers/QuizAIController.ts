import { generateQuizQuestions } from '../services/QuizAI.Service';
import { Context } from 'hono';
import { getUserFromContext } from '../middleware/Auth';
import { getNumericId } from '../middleware/HashId';
import { createQuestionSchema } from '../validations/Question.validator';
import { QuestionService } from '../services/Question.Service';
import { SUCCESS_MESSAGES } from '../validations/erreurs_messages/Message.error';
import { ZodError } from 'zod';

export const generateQuestionsHandler = async (c: Context) => {
  const quizHashId = c.req.param('quizId');
  const body = await c.req.json().catch(() => ({}));
  const prompt = body.prompt;
  if (!prompt) {
    return c.json({ success: false, message: 'Prompt requis pour générer les questions.' }, 400);
  }

  try {
    const user = getUserFromContext(c);
    const quiz_id = getNumericId(c, 'quizId');
    if (!quiz_id) {
      return c.json({ success: false, message: 'ID du quiz invalide' }, 400);
    }

    const raw = await generateQuizQuestions(prompt);

    // raw can be a string containing JSON or already an array
    let parsed: any = null;
    if (typeof raw === 'string') {
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        // try to extract JSON substring
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

    // Validate each generated question and create using existing service
    for (let i = 0; i < parsed.length; i++) {
      const q = parsed[i];

      // Ensure keys match expected names: texte, duree, ordre, choix_reponses
      // If AI returned 'question' or 'options', map them
      const mapped: any = {
        texte: q.texte || q.question || q.question_text || q.title || '',
        duree: q.duree || q.duration || 30,
        ordre: q.ordre || (i + 1),
        choix_reponses: q.choix_reponses || q.options || q.reponses || [],
      };

      // Normalize choix_reponses to have texte, est_correcte, ordre
      mapped.choix_reponses = mapped.choix_reponses.map((opt: any, idx: number) => {
        if (typeof opt === 'string') {
          return { texte: opt, est_correcte: false, ordre: idx + 1 };
        }
        return {
          texte: opt.texte || opt.text || opt.label || '',
          est_correcte: !!opt.est_correcte || !!opt.correct || (opt.is_correct ?? false),
          ordre: opt.ordre || idx + 1,
        };
      });

      // If none marked correct, try map from 'correct_answer' field
      if (!mapped.choix_reponses.some((cOpt: any) => cOpt.est_correcte) && q.correct_answer) {
        const ca = q.correct_answer;
        for (const cOpt of mapped.choix_reponses) {
          if (cOpt.texte && ca && cOpt.texte.trim().toLowerCase() === String(ca).trim().toLowerCase()) {
            cOpt.est_correcte = true;
            break;
          }
        }
      }

      // Validate with zod schema
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

    // Si une seule question générée, retourner le format singulier (comme création manuelle)
    if (createdQuestions.length === 1) {
      return c.json({
        success: true,
        message: SUCCESS_MESSAGES.QUESTION_CREATED,
        data: createdQuestions[0]
      }, 201);
    }

    // Si plusieurs questions, retourner un format pluriel cohérent
    return c.json({
      success: true,
      message: `${createdQuestions.length} questions créées avec succès`,
      data: createdQuestions
    }, 201);
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return c.json({ success: false, message: 'Erreur lors de la génération des questions.', error: errorMsg }, 500);
  }
};
