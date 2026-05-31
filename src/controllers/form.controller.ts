import { Request, Response } from 'express';
import { FormService } from '../services/form.service';

const formService = new FormService();

// ─── HELPERS ─────────────────────────────────────────────────

const isValidId = (id: any): id is string => !Array.isArray(id);

const paginate = (req: Request) => {
  const page = parseInt(req.query.page as string, 10);
  const limit = parseInt(req.query.limit as string, 10);
  return {
    page: isNaN(page) || page < 1 ? 1 : page,
    limit: isNaN(limit) || limit < 1 ? 10 : limit
  };
};

/**
 * Détection automatique du type de formulaire
 */
const detectFormType = (body: any): 'apes' | 'checklist-audit' | 'checklist-conducteur' | 'guide-entretien' => {
  // Guide Entretien
  if (body.guide_type || body.gi_nom || body.theme1) {
    return 'guide-entretien';
  }
  // Checklist Audit
  if (body.section1_cadreJuridique !== undefined || body.section2_infraSecurite || body.section6_bilanDocumentaire) {
    return 'checklist-audit';
  }
  // Checklist Conducteur
  if (body.section1_infoGenerales || body.section2_processusInitialT1 || body.auditeur) {
    return 'checklist-conducteur';
  }
  // APES (par défaut)
  if (body.projectInfo || body.project_name) {
    return 'apes';
  }
  throw new Error('Impossible de détecter le type de formulaire. Vérifiez les champs envoyés.');
};

// ─── ROUTE UNIFIÉE ───────────────────────────────────────────

/**
 * POST /forms
 * Crée n'importe quel type de formulaire automatiquement
 */
export const createAnyForm = async (req: Request, res: Response) => {
  try {
    const formType = detectFormType(req.body);
    let result;

    switch (formType) {
      case 'guide-entretien':
        result = await formService.createGuideEntretien(req.body);
        break;
      case 'checklist-audit':
        result = await formService.createChecklistAudit(req.body);
        break;
      case 'checklist-conducteur':
        result = await formService.createChecklistConducteur(req.body);
        break;
      case 'apes':
        result = await formService.createForm(req.body);
        break;
    }

    res.status(201).json({
      success: true,
      message: `${formType} créé avec succès`,
      data: result,
      type: formType
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la création du formulaire'
    });
  }
};

/**
 * GET /forms/:id
 * Récupère n'importe quel formulaire par son ID
 */
export const getAnyFormById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }

    // Essayer chaque type
    let result = await formService.getGuideEntretienById(id);
    if (result) {
      return res.json({ success: true, type: 'guide-entretien', data: result });
    }

    result = await formService.getChecklistAuditById(id);
    if (result) {
      return res.json({ success: true, type: 'checklist-audit', data: result });
    }

    result = await formService.getChecklistConducteurById(id);
    if (result) {
      return res.json({ success: true, type: 'checklist-conducteur', data: result });
    }

    result = await formService.getFormById(id);
    if (result) {
      return res.json({ success: true, type: 'apes', data: result });
    }

    res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du formulaire'
    });
  }
};

/**
 * PUT /forms/:id
 * Met à jour n'importe quel formulaire
 */
export const updateAnyForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }

    const formType = detectFormType(req.body);
    let result;

    switch (formType) {
      case 'guide-entretien':
        result = await formService.updateGuideEntretien(id, req.body);
        break;
      case 'checklist-audit':
        result = await formService.updateChecklistAudit(id, req.body);
        break;
      case 'checklist-conducteur':
        result = await formService.updateChecklistConducteur(id, req.body);
        break;
      case 'apes':
        result = await formService.updateForm(id, req.body);
        break;
    }

    if (!result) {
      return res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
    }

    res.json({
      success: true,
      message: `${formType} mis à jour avec succès`,
      data: result,
      type: formType
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du formulaire'
    });
  }
};

/**
 * DELETE /forms/:id
 * Supprime n'importe quel formulaire
 */
export const deleteAnyForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }

    // Essayer chaque type
    let deleted = await formService.deleteGuideEntretien(id);
    if (deleted) {
      return res.json({ success: true, message: 'Guide entretien supprimé avec succès' });
    }

    deleted = await formService.deleteChecklistAudit(id);
    if (deleted) {
      return res.json({ success: true, message: 'Checklist audit supprimée avec succès' });
    }

    deleted = await formService.deleteChecklistConducteur(id);
    if (deleted) {
      return res.json({ success: true, message: 'Checklist conducteur supprimée avec succès' });
    }

    deleted = await formService.deleteForm(id);
    if (deleted) {
      return res.json({ success: true, message: 'Formulaire APES supprimé avec succès' });
    }

    res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression du formulaire'
    });
  }
};

/**
 * GET /forms
 * Liste tous les formulaires (tous types confondus)
 */
export const getAllFormsUnified = async (req: Request, res: Response) => {
  try {
    const { page, limit } = paginate(req);
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;

    // Récupérer tous les types
    const [apesResult, auditResult, conducteurResult, guideResult] = await Promise.all([
      formService.getAllForms({ status, projectName: search }, page, 100),
      formService.getAllChecklistAudits({ subprojet: search }, page, 100),
      formService.getAllChecklistConducteurs({ subprojet: search }, page, 100),
      formService.getAllGuideEntretiens({ subprojet: search }, page, 100)
    ]);

    // Fusionner et trier
    const allForms = [
      ...apesResult.forms.map((f: any) => ({ ...f, formType: 'apes' })),
      ...auditResult.items.map((f: any) => ({ ...f, formType: 'checklist-audit' })),
      ...conducteurResult.items.map((f: any) => ({ ...f, formType: 'checklist-conducteur' })),
      ...guideResult.items.map((f: any) => ({ ...f, formType: 'guide-entretien' }))
    ];

    // Trier par date de création
    allForms.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Pagination manuelle
    const start = (page - 1) * limit;
    const paginated = allForms.slice(start, start + limit);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        page,
        limit,
        total: allForms.length,
        totalPages: Math.ceil(allForms.length / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des formulaires'
    });
  }
};


export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await formService.getGlobalStats();
    res.status(200).json({ 
      success: true, 
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Erreur getStats:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la récupération des statistiques' 
    });
  }
};

