import axios from 'axios';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const HF_API_KEY = process.env.HF_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Génère des questions de quiz via IA avec système de fallback
 * Essaie plusieurs providers dans l'ordre : Groq -> HuggingFace -> OpenAI -> Fallback local
 */
export async function generateQuizQuestions(prompt: string): Promise<string> {
  // Tentative 1 : Groq (RECOMMANDÉ - rapide, gratuit, puissant)
  if (GROQ_API_KEY) {
    try {
      console.log('[QuizAI] 🚀 Tentative avec Groq...');
      return await generateWithGroq(prompt);
    } catch (error: any) {
      console.error('[QuizAI] Groq échoué:', error.response?.status || error.message);
    }
  }

  // Tentative 2 : Hugging Face
  if (HF_API_KEY) {
    try {
      console.log('[QuizAI] Tentative avec Hugging Face...');
      return await generateWithHuggingFace(prompt);
    } catch (error: any) {
      console.error('[QuizAI] Hugging Face échoué:', error.response?.status || error.message);
    }
  }

  // Tentative 3 : OpenAI
  if (OPENAI_API_KEY) {
    try {
      console.log('[QuizAI] Tentative avec OpenAI...');
      return await generateWithOpenAI(prompt);
    } catch (error: any) {
      console.error('[QuizAI] OpenAI échoué:', error.response?.status || error.message);
    }
  }

  // Fallback : Génération locale simple
  console.log('[QuizAI] Utilisation du générateur local (fallback)');
  return generateLocalFallback(prompt);
}

/**
 * Génération via Groq API (RECOMMANDÉ)
 * Utilise Llama 3.3 70B - Rapide, gratuit, puissant
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

/**
 * Génération via Hugging Face API
 */
async function generateWithHuggingFace(prompt: string): Promise<string> {
  const enhancedPrompt = `Tu es un assistant pédagogique. ${prompt}

Format JSON attendu:
[{"question":"...", "options":["A","B","C","D"], "correct_answer":"A", "explication":"..."}]

Réponds uniquement avec le JSON:`;

  // Utilise un modèle text-generation gratuit et accessible
  const response = await axios.post(
    'https://api-inference.huggingface.co/models/gpt2',
    {
      inputs: enhancedPrompt,
      parameters: { 
        max_new_tokens: 1024,
        temperature: 0.8,
        return_full_text: false
      },
      options: { 
        wait_for_model: true,
        use_cache: false
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );
  
  console.log('[QuizAI] Réponse HF:', JSON.stringify(response.data).substring(0, 200));
  
  if (Array.isArray(response.data)) {
    return response.data[0]?.generated_text || response.data[0]?.text || '';
  }
  return response.data.generated_text || '';
}

/**
 * Génération via OpenAI API
 */
async function generateWithOpenAI(prompt: string): Promise<string> {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `${prompt}\n\nFormat JSON:\n[{"question":"...", "options":["A","B","C","D"], "correct_answer":"A", "explication":"..."}]`
      }],
      max_tokens: 1024,
      temperature: 0.7
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.choices[0].message.content;
}

/**
 * Génération locale (fallback) - Créé des questions de démonstration
 * Note: Ce générateur est un fallback basique. Pour des questions réelles,
 * configurez une clé API valide (Hugging Face ou OpenAI) dans le fichier .env
 */
function generateLocalFallback(prompt: string): string {
  console.log('[QuizAI] ⚠️  Utilisation du générateur local (démo uniquement)');
  console.log('[QuizAI] 💡 Pour des questions réelles, ajoutez une clé API valide dans .env');
  
  // Extrait le thème et le nombre de questions
  const themeMatch = prompt.match(/sur (?:le thème de |la |le |l')?(.+?)(?:\.|$)/i);
  const theme = themeMatch?.[1]?.trim() || 'le sujet demandé';
  
  const numberMatch = prompt.match(/(\d+)\s+questions?/i);
  const numQuestions = numberMatch?.[1] ? parseInt(numberMatch[1]) : 3;
  
  const questions = [];
  
  // Template de questions génériques mais structurées correctement
  const questionTemplates = [
    {
      type: 'definition',
      question: `Quelle est la meilleure définition de ${theme} ?`,
      options: [
        `Un processus fondamental en lien avec ${theme}`,
        `Une théorie alternative sur ${theme}`,
        `Un concept secondaire de ${theme}`,
        `Une application pratique de ${theme}`
      ],
      correctIndex: 0,
      explication: `${theme} désigne un concept fondamental dans ce domaine d'étude.`
    },
    {
      type: 'component',
      question: `Quel élément est essentiel dans le contexte de ${theme} ?`,
      options: [
        `L'élément périphérique`,
        `Le composant principal`,
        `La structure accessoire`,
        `Le mécanisme secondaire`
      ],
      correctIndex: 1,
      explication: `Le composant principal joue un rôle central dans ${theme}.`
    },
    {
      type: 'application',
      question: `Dans quel domaine ${theme} est-il le plus appliqué ?`,
      options: [
        `Dans les applications théoriques`,
        `Dans les contextes expérimentaux`,
        `Dans les situations pratiques quotidiennes`,
        `Dans les recherches fondamentales`
      ],
      correctIndex: 2,
      explication: `${theme} trouve ses applications les plus courantes dans la pratique quotidienne.`
    },
    {
      type: 'characteristic',
      question: `Quelle caractéristique distingue ${theme} ?`,
      options: [
        `Sa complexité variable`,
        `Sa spécificité unique`,
        `Son universalité limitée`,
        `Sa dépendance contextuelle`
      ],
      correctIndex: 1,
      explication: `La spécificité unique est ce qui caractérise le mieux ${theme}.`
    },
    {
      type: 'relationship',
      question: `Comment ${theme} interagit-il avec d'autres concepts ?`,
      options: [
        `De manière isolée`,
        `Uniquement en théorie`,
        `À travers des mécanismes interconnectés`,
        `Sans relation directe`
      ],
      correctIndex: 2,
      explication: `${theme} s'intègre dans un réseau de concepts interconnectés.`
    }
  ];
  
  // Génère le nombre de questions demandé
  for (let i = 0; i < Math.min(numQuestions, questionTemplates.length); i++) {
    const template = questionTemplates[i];
    if (template) {
      questions.push({
        question: template.question,
        options: template.options,
        correct_answer: template.options[template.correctIndex],
        explication: template.explication
      });
    }
  }
  
  return JSON.stringify(questions, null, 2);
}

// Exemple d'utilisation :
// const questions = await generateQuizQuestions('Génère 5 questions à choix multiples sur le thème de la biologie.');
// console.log(questions);
