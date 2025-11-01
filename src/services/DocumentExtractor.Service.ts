import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import fs from 'fs/promises';
import axios from 'axios';

// Import de pdf-parse avec wrapper pour compatibilité
let pdfParseModule: any = null;

async function getPdfParse() {
  if (!pdfParseModule) {
    try {
      // Essayer import ESM d'abord
      const module = await import('pdf-parse');
      pdfParseModule = module.default || module;
    } catch (e) {
      // Fallback: utiliser eval pour require (éviter les erreurs de compilation)
      pdfParseModule = eval("require('pdf-parse')");
    }
  }
  return pdfParseModule;
}

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_VISION_MODEL = 'llama-3.2-90b-vision-preview';

/**
 * Service d'extraction de texte depuis différents formats de documents
 * Support: PDF, Word (docx), Images (OCR)
 */

/**
 * Extrait le texte d'un fichier PDF
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  console.log('[DocumentExtractor] Extraction PDF:', filePath);
  
  try {
    const pdfParse = await getPdfParse();
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    
    console.log('[DocumentExtractor] PDF extrait:', data.text.length, 'caractères');
    return data.text;
  } catch (error: any) {
    console.error('[DocumentExtractor] Erreur extraction PDF:', error.message);
    throw new Error(`Impossible d'extraire le texte du PDF: ${error.message}`);
  }
}

/**
 * Extrait le texte d'un fichier Word (.docx)
 */
export async function extractTextFromWord(filePath: string): Promise<string> {
  console.log('[DocumentExtractor] Extraction Word:', filePath);
  
  try {
    const dataBuffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    
    console.log('[DocumentExtractor] Word extrait:', result.value.length, 'caractères');
    return result.value;
  } catch (error: any) {
    console.error('[DocumentExtractor] Erreur extraction Word:', error.message);
    throw new Error(`Impossible d'extraire le texte du document Word: ${error.message}`);
  }
}

/**
 * Analyse une image avec un modèle de vision IA (décrit le contenu même sans texte)
 */
async function analyzeImageWithVision(filePath: string): Promise<string> {
  if (!GROQ_API_KEY) {
    console.log('[DocumentExtractor] Pas de clé Groq, analyse de vision désactivée');
    return '';
  }

  try {
    console.log('[DocumentExtractor] Analyse de vision avec Groq...');
    
    // Convertir l'image en base64
    const imageBuffer = await fs.readFile(filePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = filePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: GROQ_VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Décris en détail le contenu de cette image en français. Identifie tous les éléments visuels importants, objets, personnes, scènes, textes visibles, concepts illustrés, etc. Sois précis et complet dans ta description.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const description = response.data.choices[0]?.message?.content || '';
    console.log('[DocumentExtractor] Description vision:', description.substring(0, 200) + '...');
    return description;
  } catch (error: any) {
    console.error('[DocumentExtractor] Erreur analyse vision:', error.response?.data || error.message);
    return '';
  }
}

/**
 * Extrait le texte d'une image via OCR (Reconnaissance Optique de Caractères)
 * + Analyse avec modèle de vision si pas de texte détecté
 */
export async function extractTextFromImage(filePath: string): Promise<string> {
  console.log('[DocumentExtractor] Extraction Image (OCR + Vision):', filePath);
  
  try {
    // 1. Tenter l'OCR d'abord (pour extraire le texte visible)
    const { data: { text } } = await Tesseract.recognize(filePath, 'fra+eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`[DocumentExtractor] OCR progression: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    
    console.log('[DocumentExtractor] Image OCR extrait:', text.length, 'caractères');
    
    // 2. Si peu ou pas de texte détecté, utiliser l'analyse de vision
    const cleanedText = text.trim();
    if (cleanedText.length < 50) {
      console.log('[DocumentExtractor] Peu de texte détecté, analyse avec modèle de vision...');
      const visionDescription = await analyzeImageWithVision(filePath);
      
      if (visionDescription) {
        // Combiner OCR et description vision
        return cleanedText 
          ? `Texte détecté: ${cleanedText}\n\nDescription de l'image: ${visionDescription}`
          : `Description de l'image: ${visionDescription}`;
      }
    }
    
    return text;
  } catch (error: any) {
    console.error('[DocumentExtractor] Erreur extraction Image:', error.message);
    throw new Error(`Impossible d'extraire le texte de l'image: ${error.message}`);
  }
}

/**
 * Extrait le texte d'un fichier selon son type MIME
 */
export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  console.log('[DocumentExtractor] Début extraction:', mimeType);
  
  // PDF
  if (mimeType === 'application/pdf') {
    return await extractTextFromPDF(filePath);
  }
  
  // Word (.docx)
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return await extractTextFromWord(filePath);
  }
  
  // Images (OCR)
  if (mimeType.startsWith('image/')) {
    return await extractTextFromImage(filePath);
  }
  
  throw new Error(`Type de fichier non supporté: ${mimeType}. Formats supportés: PDF, Word (.docx), Images (JPG, PNG)`);
}

/**
 * Nettoie et prépare le texte extrait pour la génération de questions
 */
export function cleanExtractedText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .replace(/\n{3,}/g, '\n\n') // Limiter les sauts de ligne multiples
    .trim();
}
