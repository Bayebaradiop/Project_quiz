import axios from 'axios';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function generateQuizQuestions(prompt: string): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error(
      'Service de génération temporairement indisponible. Veuillez réessayer plus tard.'
    );
  }

  try {
    console.log('[QuizAI] 🚀 Génération avec Groq...');
    return await generateWithGroq(prompt);
  } catch (error: any) {
    console.error('[QuizAI] ❌ Erreur Groq:', error.response?.data?.error?.message || error.message);
    
    // Message générique pour le client
    throw new Error(
      'Un problème temporaire empêche la génération de questions'
    );
  }
}

/**
 * Génération via Groq API
 * Utilise llama-3.3-70b-versatile (rapide et performant)
 */
async function generateWithGroq(prompt: string): Promise<string> {
  const systemPrompt = `Tu es un assistant pédagogique expert. Tu génères des questions de quiz pédagogiques de haute qualité.

Format de réponse OBLIGATOIRE (JSON strict):
[
  {
    "question": "Question claire et précise ?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A",
    "explication": "Explication détaillée de la réponse correcte"
  }
]

Règles importantes:
- Questions claires et pédagogiques
- 4 options plausibles par question
- Une seule réponse correcte
- Explications détaillées et instructives
- Respecter strictement le format JSON`;

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9
    },
    {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );
  
  console.log('[QuizAI] ✅ Réponse Groq reçue');
  return response.data.choices[0].message.content;
}


