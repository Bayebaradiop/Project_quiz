import { Context, Next } from 'hono';
import { encodeId, decodeId } from '../utils/hashid.utils';

/**
 * Middleware pour décoder automatiquement les HashIds dans les paramètres d'URL
 * Utilisation : hashIdMiddleware('id', 'quizId', 'questionId')
 */
export const hashIdMiddleware = (...paramNames: string[]) => {
  return async (c: Context, next: Next): Promise<Response | void> => {
    try {
      // Pour chaque paramètre spécifié
      for (const paramName of paramNames) {
        const hashValue = c.req.param(paramName);
        
        if (hashValue) {
          // Décoder le hash en ID numérique
          const numericId = decodeId(hashValue);
          
          if (numericId === null) {
            return c.json(
              {
                success: false,
                message: `ID invalide pour le paramètre "${paramName}"`,
              },
              400
            );
          }
          
          // Stocker l'ID numérique dans le contexte pour l'utiliser dans le controller
          c.set(`${paramName}_numeric`, numericId);
        }
      }
      
      await next();
    } catch (error) {
      return c.json(
        {
          success: false,
          message: 'Erreur lors du décodage des IDs',
        },
        400
      );
    }
  };
};

/**
 * Fonction helper pour encoder récursivement tous les champs ID dans une réponse
 * Encode automatiquement: id, quiz_id, question_id, participation_id, invitation_id, utilisateur_id, createur_id, choix_reponse_id
 */
export const encodeAllIds = (data: any): any => {
  if (!data) return data;
  
  // Si c'est un tableau, encoder chaque élément
  if (Array.isArray(data)) {
    return data.map(item => encodeAllIds(item));
  }
  
  // Si c'est un objet
  if (typeof data === 'object' && data !== null) {
    const encoded: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Liste des champs ID à encoder
      const idFields = [
        'id', 'quiz_id', 'question_id', 'participation_id', 
        'invitation_id', 'utilisateur_id', 'createur_id', 
        'choix_reponse_id', 'reponse_id'
      ];
      
      // Si c'est un champ ID et c'est un nombre, l'encoder
      if (idFields.includes(key) && typeof value === 'number') {
        encoded[key] = encodeId(value);
      }
      // Sinon, encoder récursivement les objets/tableaux imbriqués
      else if (typeof value === 'object') {
        encoded[key] = encodeAllIds(value);
      }
      // Garder les autres valeurs telles quelles
      else {
        encoded[key] = value;
      }
    }
    
    return encoded;
  }
  
  return data;
};

/**
 * Middleware pour encoder automatiquement tous les IDs dans les réponses JSON
 * Le frontend reçoit UNIQUEMENT des hashs, jamais d'IDs numériques
 * AUCUNE logique côté frontend - tout est géré ici
 */
export const autoEncodeIdsMiddleware = async (c: Context, next: Next) => {
  // Sauvegarder la méthode json originale
  const originalJson = c.json.bind(c);
  
  // Remplacer c.json par notre version qui encode les IDs
  c.json = ((data: any, init?: any) => {
    // Encoder automatiquement tous les IDs dans les données
    const encodedData = encodeAllIds(data);
    // Appeler la méthode json originale avec les données encodées
    return originalJson(encodedData, init);
  }) as any;
  
  await next();
};

/**
 * Fonction helper pour encoder les IDs dans les réponses
 */
export const encodeResponse = (data: any, fieldsToEncode: string[]): any => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => encodeResponse(item, fieldsToEncode));
  }
  
  if (typeof data === 'object') {
    const encoded = { ...data };
    
    for (const field of fieldsToEncode) {
      if (encoded[field] !== undefined && encoded[field] !== null) {
        encoded[field] = encodeId(Number(encoded[field]));
      }
    }
    
    return encoded;
  }
  
  return data;
};

/**
 * Middleware pour décoder les HashIds dans le body JSON
 * Utilisation : hashIdBodyMiddleware('reponse_id', 'question_id')
 */
export const hashIdBodyMiddleware = (...fieldNames: string[]) => {
  return async (c: Context, next: Next): Promise<Response | void> => {
    try {
      const contentType = c.req.header('content-type');
      
      // Ne traiter que si c'est du JSON
      if (contentType && contentType.includes('application/json')) {
        const body = await c.req.json();
        
        // Décoder chaque champ spécifié
        for (const fieldName of fieldNames) {
          const hashValue = body[fieldName];
          
          if (hashValue) {
            // Si c'est une string (hash), on la décode
            if (typeof hashValue === 'string') {
              const numericId = decodeId(hashValue);
              
              if (numericId === null) {
                return c.json(
                  {
                    success: false,
                    message: `ID invalide pour le champ "${fieldName}"`,
                  },
                  400
                );
              }
              
              // Remplacer le hash par l'ID numérique dans le body
              body[fieldName] = numericId;
            }
            // Si c'est déjà un nombre, on le garde tel quel
          }
        }
        
        // Stocker le body modifié pour qu'il soit accessible dans le controller
        c.set('decodedBody', body);
      }
      
      await next();
    } catch (error) {
      return c.json(
        {
          success: false,
          message: 'Erreur lors du décodage des IDs dans le body',
        },
        400
      );
    }
  };
};

/**
 * Helper pour récupérer le body décodé ou le body original
 */
export const getDecodedBody = async (c: Context): Promise<any> => {
  const decodedBody = c.get('decodedBody');
  if (decodedBody) {
    return decodedBody;
  }
  return await c.req.json();
};

/**
 * Helper pour obtenir l'ID numérique décodé depuis le contexte
 */
export const getNumericId = (c: Context, paramName: string): number => {
  const numericId = c.get(`${paramName}_numeric`);
  if (!numericId) {
    throw new Error(`ID numérique introuvable pour ${paramName}`);
  }
  return Number(numericId);
};

