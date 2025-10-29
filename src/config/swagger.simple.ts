import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';

/**
 * Configuration Swagger simple pour l'API QuizLab
 */
export const createSwaggerRoutes = (app: Hono) => {
  // Spécification OpenAPI en JSON
  app.get('/api-docs.json', (c) => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'QuizLab API',
        version: '1.0.0',
        description: `
API REST pour système de quiz avec questions à choix multiples (QCM).

## 🔒 Authentification

- **Endpoints PUBLICS ✅** : Inscription, Connexion, Participations
- **Endpoints PROTÉGÉS 🔒** : Gestion Quiz, Questions, Invitations, Statistiques

## 📚 Documentation

- [Guide Complet](https://github.com/Bayebaradiop/Project_quiz/blob/feature/api-standardization/GUIDE_TEST_COMPLET_POSTMAN.md)
- [Sécurité](https://github.com/Bayebaradiop/Project_quiz/blob/feature/api-standardization/ENDPOINTS_SECURITY.md)
        `,
        contact: {
          name: 'QuizLab Team',
          url: 'https://github.com/Bayebaradiop/Project_quiz',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Développement',
        },
      ],
      tags: [
        { name: 'Authentification', description: 'Inscription, connexion, profil' },
        { name: 'Quiz', description: 'CRUD Quiz (protégé)' },
        { name: 'Questions', description: 'CRUD Questions (protégé)' },
        { name: 'Invitations', description: 'Gérer invitations (protégé)' },
        { name: 'Participations', description: 'Passer quiz (public)' },
        { name: 'Statistiques', description: 'Résultats (protégé)' },
      ],
      paths: {
        '/api/v1/utilisateurs/register': {
          post: {
            tags: ['Authentification'],
            summary: 'Inscription (Public)',
            description: 'Créer un nouveau compte utilisateur',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['nom', 'prenom', 'email', 'password'],
                    properties: {
                      nom: { 
                        type: 'string', 
                        minLength: 2,
                        maxLength: 50,
                        example: 'Dupont',
                        description: 'Nom de famille (2-50 caractères)'
                      },
                      prenom: { 
                        type: 'string', 
                        minLength: 2,
                        maxLength: 50,
                        example: 'Jean',
                        description: 'Prénom (2-50 caractères)'
                      },
                      email: { 
                        type: 'string', 
                        format: 'email', 
                        maxLength: 255,
                        example: 'jean.dupont@example.com',
                        description: 'Adresse email valide (max 255 caractères)'
                      },
                      password: { 
                        type: 'string', 
                        format: 'password', 
                        minLength: 8,
                        maxLength: 100,
                        example: 'SecurePass@123',
                        description: 'Mot de passe (8-100 caractères) contenant au moins: 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial'
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Utilisateur créé avec succès',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Utilisateur créé avec succès' },
                        data: {
                          type: 'object',
                          properties: {
                            id: { type: 'number', example: 5 },
                            nom: { type: 'string', example: 'Dupont' },
                            prenom: { type: 'string', example: 'Jean' },
                            email: { type: 'string', example: 'jean.dupont@example.com' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '400': { 
                description: 'Erreur de validation',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Erreur de validation' },
                        errors: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              field: { type: 'string', example: 'email' },
                              message: { type: 'string', example: 'L\'adresse email n\'est pas valide' }
                            }
                          },
                          example: [
                            { field: 'nom', message: 'Le nom doit contenir au moins 2 caractères' },
                            { field: 'prenom', message: 'Le prénom doit contenir au moins 2 caractères' },
                            { field: 'email', message: 'L\'adresse email n\'est pas valide' },
                            { field: 'password', message: 'Le mot de passe doit contenir au moins 8 caractères' },
                            { field: 'password', message: 'Le mot de passe doit contenir au moins une lettre majuscule' },
                            { field: 'password', message: 'Le mot de passe doit contenir au moins une lettre minuscule' },
                            { field: 'password', message: 'Le mot de passe doit contenir au moins un chiffre' },
                            { field: 'password', message: 'Le mot de passe doit contenir au moins un caractère spécial' }
                          ]
                        }
                      }
                    }
                  }
                }
              },
              '409': {
                description: 'Email déjà utilisé',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Un utilisateur avec cet email existe déjà' }
                      }
                    }
                  }
                }
              },
              '500': {
                description: 'Erreur serveur',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Erreur lors de l\'inscription' }
                      }
                    }
                  }
                }
              }
            },
          },
        },
        '/api/v1/utilisateurs/login': {
          post: {
            tags: ['Authentification'],
            summary: 'Connexion (Public)',
            description: 'Se connecter et obtenir un cookie de session',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                      email: { 
                        type: 'string', 
                        format: 'email', 
                        maxLength: 255,
                        example: 'jean.dupont@example.com',
                        description: 'Adresse email valide'
                      },
                      password: { 
                        type: 'string', 
                        format: 'password', 
                        example: 'SecurePass@123',
                        description: 'Mot de passe'
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Connexion réussie',
                headers: {
                  'Set-Cookie': {
                    description: 'Cookie de session JWT',
                    schema: { type: 'string' },
                  },
                },
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Connexion réussie' },
                        data: {
                          type: 'object',
                          properties: {
                            id: { type: 'number', example: 5 },
                            nom: { type: 'string', example: 'Dupont' },
                            prenom: { type: 'string', example: 'Jean' },
                            email: { type: 'string', example: 'jean.dupont@example.com' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Erreur de validation',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Erreur de validation' },
                        errors: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              field: { type: 'string' },
                              message: { type: 'string' }
                            }
                          },
                          example: [
                            { field: 'email', message: 'L\'adresse email n\'est pas valide' },
                            { field: 'password', message: 'Le mot de passe est requis' }
                          ]
                        }
                      }
                    }
                  }
                }
              },
              '401': { 
                description: 'Identifiants invalides',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Identifiants incorrects' }
                      }
                    }
                  }
                }
              },
              '404': {
                description: 'Utilisateur non trouvé',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'L\'email est incorrect' }
                      }
                    }
                  }
                }
              }
            },
          },
        },
        '/api/v1/quizzes': {
          post: {
            tags: ['Quiz'],
            summary: 'Créer un quiz (Protégé)',
            description: 'Créer un nouveau quiz (authentification requise)',
            security: [{ cookieAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['titre', 'type_quiz', 'statut'],
                    properties: {
                      titre: { 
                        type: 'string', 
                        minLength: 3,
                        maxLength: 200,
                        example: 'Quiz JavaScript Avancé',
                        description: 'Titre du quiz (3-200 caractères)'
                      },
                      description: { 
                        type: 'string', 
                        maxLength: 1000,
                        example: 'Testez vos connaissances en JavaScript',
                        description: 'Description optionnelle (max 1000 caractères)'
                      },
                      type_quiz: { 
                        type: 'string', 
                        enum: ['instantane', 'programme'], 
                        example: 'instantane',
                        description: 'Type de quiz: instantane (sans temps limité) ou programme (avec dates)'
                      },
                      statut: { 
                        type: 'string', 
                        enum: ['brouillon', 'publie', 'archive'], 
                        example: 'brouillon',
                        description: 'Statut du quiz'
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '201': { 
                description: 'Quiz créé avec succès',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Quiz créé avec succès' },
                        data: {
                          type: 'object',
                          properties: {
                            id: { type: 'number', example: 1 },
                            titre: { type: 'string', example: 'Quiz JavaScript Avancé' },
                            type_quiz: { type: 'string', example: 'instantane' },
                            statut: { type: 'string', example: 'brouillon' }
                          }
                        }
                      }
                    }
                  }
                }
              },
              '400': {
                description: 'Erreur de validation',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Erreur de validation' },
                        errors: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              field: { type: 'string' },
                              message: { type: 'string' }
                            }
                          },
                          example: [
                            { field: 'titre', message: 'Le titre du quiz est requis' },
                            { field: 'type_quiz', message: 'Type de quiz invalide' },
                            { field: 'statut', message: 'Statut de quiz invalide' }
                          ]
                        }
                      }
                    }
                  }
                }
              },
              '401': { 
                description: 'Non authentifié - Cookie de session manquant ou invalide',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Non autorisé' }
                      }
                    }
                  }
                }
              },
            },
          },
          get: {
            tags: ['Quiz'],
            summary: 'Liste des quiz (Protégé)',
            description: 'Obtenir tous les quiz avec pagination',
            security: [{ cookieAuth: [] }],
            parameters: [
              { name: 'page', in: 'query', schema: { type: 'integer', default: 1, minimum: 1 }, description: 'Numéro de page' },
              { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 }, description: 'Nombre d\'éléments par page (max 100)' },
            ],
            responses: {
              '200': { 
                description: 'Liste des quiz',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'object',
                          properties: {
                            quizzes: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  id: { type: 'number' },
                                  titre: { type: 'string' },
                                  type_quiz: { type: 'string' },
                                  statut: { type: 'string' }
                                }
                              }
                            },
                            pagination: {
                              type: 'object',
                              properties: {
                                page: { type: 'number', example: 1 },
                                limit: { type: 'number', example: 10 },
                                total: { type: 'number', example: 45 }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              '401': { 
                description: 'Non authentifié',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Non autorisé' }
                      }
                    }
                  }
                }
              },
            },
          },
        },
        '/api/v1/participations': {
          post: {
            tags: ['Participations'],
            summary: 'Démarrer une participation (Public)',
            description: 'Démarrer un quiz sans authentification',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['quiz_id', 'email_participant', 'nom_participant'],
                    properties: {
                      quiz_id: { 
                        type: 'number', 
                        example: 8,
                        description: 'ID du quiz à démarrer'
                      },
                      email_participant: { 
                        type: 'string', 
                        format: 'email',
                        maxLength: 255,
                        example: 'participant@example.com',
                        description: 'Email du participant (max 255 caractères)'
                      },
                      nom_participant: { 
                        type: 'string', 
                        minLength: 2,
                        maxLength: 100,
                        example: 'Sophie Martin',
                        description: 'Nom du participant (2-100 caractères)'
                      },
                      code_acces: { 
                        type: 'string', 
                        example: 'a1b2c3d4e5f6...',
                        description: 'Code d\'accès (optionnel, requis si quiz avec invitation)'
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Participation démarrée',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Participation démarrée avec succès' },
                        data: {
                          type: 'object',
                          properties: {
                            id: { type: 'number', example: 14 },
                            quiz_id: { type: 'number', example: 8 },
                            statut: { type: 'string', example: 'en_cours' },
                            email_participant: { type: 'string', example: 'participant@example.com' },
                            nom_participant: { type: 'string', example: 'Sophie Martin' }
                          },
                        },
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Erreur de validation',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Erreur de validation' },
                        errors: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              field: { type: 'string' },
                              message: { type: 'string' }
                            }
                          },
                          example: [
                            { field: 'quiz_id', message: 'L\'ID du quiz est requis' },
                            { field: 'email_participant', message: 'L\'adresse email n\'est pas valide' },
                            { field: 'nom_participant', message: 'Le nom du participant est requis' }
                          ]
                        }
                      }
                    }
                  }
                }
              },
              '403': {
                description: 'Code d\'accès invalide ou expiré',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Code d\'accès invalide' }
                      }
                    }
                  }
                }
              },
              '404': {
                description: 'Quiz non trouvé',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Quiz non trouvé' }
                      }
                    }
                  }
                }
              }
            },
          },
        },
        '/api/v1/participations/reponses': {
          post: {
            tags: ['Participations'],
            summary: 'Soumettre une réponse (Public)',
            description: 'Répondre à une question du quiz',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['participation_id', 'question_id'],
                    properties: {
                      participation_id: { 
                        type: 'number', 
                        example: 14,
                        description: 'ID de la participation en cours'
                      },
                      question_id: { 
                        type: 'number', 
                        example: 19,
                        description: 'ID de la question'
                      },
                      choix_reponse_id: { 
                        type: 'number', 
                        example: 68,
                        description: 'ID du choix de réponse (pour QCM)'
                      },
                      texte_reponse: { 
                        type: 'string', 
                        maxLength: 1000,
                        example: 'Ma réponse',
                        description: 'Texte de la réponse (pour questions ouvertes, max 1000 caractères)'
                      },
                      temps_reponse: { 
                        type: 'number', 
                        minimum: 0,
                        example: 20,
                        description: 'Temps de réponse en secondes'
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Réponse enregistrée',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Réponse enregistrée avec succès' },
                        data: {
                          type: 'object',
                          properties: {
                            id: { type: 'number', example: 45 },
                            participation_id: { type: 'number', example: 14 },
                            question_id: { type: 'number', example: 19 },
                            est_correcte: { type: 'boolean', example: true }
                          }
                        }
                      }
                    }
                  }
                }
              },
              '400': {
                description: 'Erreur de validation',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Erreur de validation' },
                        errors: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              field: { type: 'string' },
                              message: { type: 'string' }
                            }
                          },
                          example: [
                            { field: 'participation_id', message: 'L\'ID de la participation est requis' },
                            { field: 'question_id', message: 'L\'ID de la question est requis' },
                            { field: 'choix_reponse_id', message: 'Une réponse est requise pour ce type de question' }
                          ]
                        }
                      }
                    }
                  }
                }
              },
              '403': {
                description: 'Participation déjà terminée ou abandonnée',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Cette participation est déjà terminée' }
                      }
                    }
                  }
                }
              },
              '404': {
                description: 'Participation ou question non trouvée',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Participation non trouvée' }
                      }
                    }
                  }
                }
              }
            },
          },
        },
        '/api/v1/participations/terminer': {
          post: {
            tags: ['Participations'],
            summary: 'Terminer le quiz (Public)',
            description: 'Terminer la participation et obtenir le score',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['participation_id'],
                    properties: {
                      participation_id: { 
                        type: 'number', 
                        example: 14,
                        description: 'ID de la participation à terminer'
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Quiz terminé avec score',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Quiz terminé avec succès' },
                        data: {
                          type: 'object',
                          properties: {
                            participation: {
                              type: 'object',
                              properties: {
                                id: { type: 'number', example: 14 },
                                score: { type: 'number', example: 2 },
                                score_max: { type: 'number', example: 2 },
                                pourcentage: { type: 'number', example: 100 },
                                statut: { type: 'string', example: 'termine' },
                                date_debut: { type: 'string', format: 'date-time' },
                                date_fin: { type: 'string', format: 'date-time' }
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Participation déjà terminée',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Cette participation est déjà terminée' }
                      }
                    }
                  }
                }
              },
              '404': {
                description: 'Participation non trouvée',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Participation non trouvée' }
                      }
                    }
                  }
                }
              }
            },
          },
        },
      },
      components: {
        securitySchemes: {
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'quiz_session',
            description: 'Cookie de session avec JWT',
          },
        },
      },
    };

    return c.json(spec);
  });

  // Interface Swagger UI
  app.get(
    '/api-docs',
    swaggerUI({
      url: '/api-docs.json',
    })
  );

  return app;
};
