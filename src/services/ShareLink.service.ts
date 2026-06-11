// services/formTokenService.ts
// Génération et validation de liens de partage via JWT — aucun stockage DB

import jwt from 'jsonwebtoken';

const SECRET      = 'monSuperCodeSecretAxel123456@'; // variable d'env obligatoire
const EXPIRES_IN  = '5h';
const FRONTEND    = process.env.APP_FRONTEND_URL ?? 'https://acenviro.pro';

export interface FormTokenPayload {
  projectId: string;
  // iat / exp injectés automatiquement par jwt
}

export const formTokenService = {

  /**
   * Génère le lien à envoyer.
   * URL : https://acenviro.pro/projets/:projectId/:token
   */
  generateLink(projectId: string): string {
    const token = jwt.sign({ projectId } satisfies FormTokenPayload, SECRET, {
      expiresIn: EXPIRES_IN,
    });
    return `${FRONTEND}/projets/${projectId}/${token}`;
  },

  /**
   * Vérifie le token extrait de l'URL.
   * Retourne le payload si valide, lance une erreur sinon (expiré, falsifié, etc.)
   */
  verify(token: string): FormTokenPayload {
    return jwt.verify(token, SECRET) as FormTokenPayload;
  },
};