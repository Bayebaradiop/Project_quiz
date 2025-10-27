/**
 * DTOs pour les Participations
 */

export interface ParticipationResultDTO {
  participation: {
    id: number;
    score: number;
    score_max: number;
    pourcentage: number;
    temps_total: number;
    statut: string;
  };
  reponses: ReponseSimpleDTO[];
  quiz: {
    id: number;
    titre: string;
    description?: string | null;
  };
  statistiques: {
    score: number;
    score_max: number;
    pourcentage: number;
    temps_total: number;
    questions_repondues: number;
    questions_correctes: number;
  };
}

export interface ReponseSimpleDTO {
  question_id: number;
  texte_question: string;
  votre_reponse: string | null;
  est_correcte: boolean;
  points_obtenus: number;
  // On ne montre JAMAIS la bonne réponse si c'est faux
}

export interface ParticipationStatusDTO {
  id: number;
  statut: 'en_cours' | 'termine' | 'abandonne';
  score?: number;
  score_max?: number;
  pourcentage?: number;
  date_debut: string;
  date_fin?: string;
}

/**
 * Mapper pour les participations
 */
export class ParticipationMapper {
  /**
   * Convertir en ParticipationResultDTO (pour le participant)
   */
  static toResultDTO(participation: any, reponses: any[], quiz: any): ParticipationResultDTO {
    const reponsesCorrectes = reponses.filter((r: any) => r.est_correcte === true).length;
    
    return {
      participation: {
        id: participation.id,
        score: participation.score || 0,
        score_max: participation.score_max || 0,
        pourcentage: participation.pourcentage || 0,
        temps_total: participation.temps_total || 0,
        statut: participation.statut,
      },
      reponses: reponses.map((r: any) => this.toReponseSimpleDTO(r)),
      quiz: {
        id: quiz.id,
        titre: quiz.titre,
        description: quiz.description,
      },
      statistiques: {
        score: participation.score || 0,
        score_max: participation.score_max || 0,
        pourcentage: participation.pourcentage || 0,
        temps_total: participation.temps_total || 0,
        questions_repondues: reponses.length,
        questions_correctes: reponsesCorrectes,
      },
    };
  }

  /**
   * Convertir une réponse en format simple pour le participant
   */
  static toReponseSimpleDTO(reponse: any): ReponseSimpleDTO {
    return {
      question_id: reponse.question_id,
      texte_question: reponse.question?.texte || '',
      votre_reponse: reponse.texte_reponse || (reponse.choix_reponse ? reponse.choix_reponse.texte : ''),
      est_correcte: reponse.est_correcte,
      points_obtenus: reponse.points_obtenus || 0,
    };
  }

  /**
   * Convertir en ParticipationStatusDTO
   */
  static toStatusDTO(participation: any): ParticipationStatusDTO {
    const dto: ParticipationStatusDTO = {
      id: participation.id,
      statut: participation.statut,
      date_debut: participation.date_debut.toISOString(),
    };

    if (participation.statut === 'termine') {
      dto.score = participation.score;
      dto.score_max = participation.score_max;
      dto.pourcentage = participation.pourcentage;
      dto.date_fin = participation.date_fin?.toISOString();
    }

    return dto;
  }
}
