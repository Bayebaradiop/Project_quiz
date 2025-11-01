const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import fs from 'fs/promises';

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
 * Extrait le texte d'une image via OCR (Reconnaissance Optique de Caractères)
 */
export async function extractTextFromImage(filePath: string): Promise<string> {
  console.log('[DocumentExtractor] Extraction Image (OCR):', filePath);
  
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'fra+eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`[DocumentExtractor] OCR progression: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    
    console.log('[DocumentExtractor] Image OCR extrait:', text.length, 'caractères');
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
