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

// ─── FORM (ancien FormData) ───────────────────────────────────

export const createForm = async (req: Request, res: Response) => {
  try {
    const form = await formService.createForm(req.body);
    res.status(201).json({ success: true, message: 'Formulaire créé avec succès', data: form });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Erreur lors de la création du formulaire' });
  }
};

export const getForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return void res.status(400).json({ success: false, message: 'ID invalide' });
    const form = await formService.getFormById(id);
    if (!form) return void res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
    res.status(200).json({ success: true, data: form });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Erreur lors de la récupération du formulaire' });
  }
};

export const getAllForms = async (req: Request, res: Response) => {
  try {
    const status      = typeof req.query.status      === 'string' ? req.query.status      : undefined;
    const projectName = typeof req.query.projectName === 'string' ? req.query.projectName : undefined;
    const dateFrom    = typeof req.query.dateFrom    === 'string' ? req.query.dateFrom    : undefined;
    const dateTo      = typeof req.query.dateTo      === 'string' ? req.query.dateTo      : undefined;

    const pageParam  = req.query.page;
    const limitParam = req.query.limit;
    const page  = typeof pageParam  === 'string' ? parseInt(pageParam,  10) : Array.isArray(pageParam)  ? parseInt(pageParam[0]  as string, 10) : 1;
    const limit = typeof limitParam === 'string' ? parseInt(limitParam, 10) : Array.isArray(limitParam) ? parseInt(limitParam[0] as string, 10) : 10;

    const filters: any = {};
    if (status)      filters.status      = status;
    if (projectName) filters.projectName = projectName;
    if (dateFrom) { const d = new Date(dateFrom); if (!isNaN(d.getTime())) filters.dateFrom = d; }
    if (dateTo)   { const d = new Date(dateTo);   if (!isNaN(d.getTime())) filters.dateTo   = d; }

    const validatedPage  = isNaN(page)  || page  < 1 ? 1  : page;
    const validatedLimit = isNaN(limit) || limit < 1 ? 10 : limit;

    const result = await formService.getAllForms(filters, validatedPage, validatedLimit);
    res.status(200).json({
      success: true,
      data: result.forms,
      pagination: { page: result.page, limit: validatedLimit, total: result.total, totalPages: result.totalPages }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Erreur lors de la récupération des formulaires' });
  }
};

export const updateForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return void res.status(400).json({ success: false, message: 'ID invalide' });
    const updatedForm = await formService.updateForm(id, req.body);
    if (!updatedForm) return void res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
    res.status(200).json({ success: true, message: 'Formulaire mis à jour avec succès', data: updatedForm });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Erreur lors de la mise à jour du formulaire' });
  }
};

export const deleteForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return void res.status(400).json({ success: false, message: 'ID invalide' });
    const deleted = await formService.deleteForm(id);
    if (!deleted) return void res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
    res.status(200).json({ success: true, message: 'Formulaire supprimé avec succès' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Erreur lors de la suppression du formulaire' });
  }
};

export const submitForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return void res.status(400).json({ success: false, message: 'ID invalide' });
    const submittedForm = await formService.submitForm(id);
    if (!submittedForm) return void res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
    res.status(200).json({ success: true, message: 'Formulaire soumis avec succès', data: submittedForm });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Erreur lors de la soumission du formulaire' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await formService.getFormStats();
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

// ─── GUIDE D'ENTRETIEN ───────────────────────────────────────

export const createGuideEntretien = async (req: Request, res: Response) => {
  try {
    const data = await formService.createGuideEntretien(req.body);
    res.status(201).json({ success: true, message: 'GuideEntretien créé avec succès', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getGuideEntretien = async (req: Request, res: Response) => {
  try {
    if (!isValidId(req.params.id)) return void res.status(400).json({ success: false, message: 'ID invalide' });
    const data = await formService.getGuideEntretienById(req.params.id);
    if (!data) return void res.status(404).json({ success: false, message: 'GuideEntretien non trouvé' });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllGuideEntretiens = async (req: Request, res: Response) => {
  try {
    const { page, limit } = paginate(req);
    const guideType = typeof req.query.guideType === 'string' ? req.query.guideType : undefined;
    const subprojet = typeof req.query.subprojet === 'string' ? req.query.subprojet : undefined;
    const result = await formService.getAllGuideEntretiens({ guideType, subprojet }, page, limit);
    res.status(200).json({ success: true, data: result.items, pagination: { page: result.page, limit, total: result.total, totalPages: result.totalPages } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateGuideEntretien = async (req: Request, res: Response) => {
  try {
    if (!isValidId(req.params.id)) return void res.status(400).json({ success: false, message: 'ID invalide' });
    const data = await formService.updateGuideEntretien(req.params.id, req.body);
    if (!data) return void res.status(404).json({ success: false, message: 'GuideEntretien non trouvé' });
    res.status(200).json({ success: true, message: 'GuideEntretien mis à jour avec succès', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteGuideEntretien = async (req: Request, res: Response) => {
  try {
    if (!isValidId(req.params.id)) return void res.status(400).json({ success: false, message: 'ID invalide' });
    const deleted = await formService.deleteGuideEntretien(req.params.id);
    if (!deleted) return void res.status(404).json({ success: false, message: 'GuideEntretien non trouvé' });
    res.status(200).json({ success: true, message: 'GuideEntretien supprimé avec succès' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── CHECKLIST AUDIT ─────────────────────────────────────────

export const createChecklistAudit = async (req: Request, res: Response) => {
  try {
    const data = await formService.createChecklistAudit(req.body);
    res.status(201).json({ success: true, message: 'ChecklistAudit créée avec succès', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getChecklistAudit = async (req: Request, res: Response) => {
  try {
    if (!isValidId(req.params.id)) return void res.status(400).json({ success: false, message: 'ID invalide' });
    const data = await formService.getChecklistAuditById(req.params.id);
    if (!data) return void res.status(404).json({ success: false, message: 'ChecklistAudit non trouvée' });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllChecklistAudits = async (req: Request, res: Response) => {
  try {
    const { page, limit } = paginate(req);
    const subprojet = typeof req.query.subprojet === 'string' ? req.query.subprojet : undefined;
    const auditeurs = typeof req.query.auditeurs === 'string' ? req.query.auditeurs : undefined;
    const result = await formService.getAllChecklistAudits({ subprojet, auditeurs }, page, limit);
    res.status(200).json({ success: true, data: result.items, pagination: { page: result.page, limit, total: result.total, totalPages: result.totalPages } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateChecklistAudit = async (req: Request, res: Response) => {
  try {
    if (!isValidId(req.params.id)) return void res.status(400).json({ success: false, message: 'ID invalide' });
    const data = await formService.updateChecklistAudit(req.params.id, req.body);
    if (!data) return void res.status(404).json({ success: false, message: 'ChecklistAudit non trouvée' });
    res.status(200).json({ success: true, message: 'ChecklistAudit mise à jour avec succès', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteChecklistAudit = async (req: Request, res: Response) => {
  try {
    if (!isValidId(req.params.id)) return void res.status(400).json({ success: false, message: 'ID invalide' });
    const deleted = await formService.deleteChecklistAudit(req.params.id);
    if (!deleted) return void res.status(404).json({ success: false, message: 'ChecklistAudit non trouvée' });
    res.status(200).json({ success: true, message: 'ChecklistAudit supprimée avec succès' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── CHECKLIST CONDUCTEUR TRAVAUX ────────────────────────────

export const createChecklistConducteur = async (req: Request, res: Response) => {
  try {
    const data = await formService.createChecklistConducteur(req.body);
    res.status(201).json({ success: true, message: 'ChecklistConducteur créée avec succès', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getChecklistConducteur = async (req: Request, res: Response) => {
  try {
    if (!isValidId(req.params.id)) return void res.status(400).json({ success: false, message: 'ID invalide' });
    const data = await formService.getChecklistConducteurById(req.params.id);
    if (!data) return void res.status(404).json({ success: false, message: 'ChecklistConducteur non trouvée' });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllChecklistConducteurs = async (req: Request, res: Response) => {
  try {
    const { page, limit } = paginate(req);
    const subprojet = typeof req.query.subprojet === 'string' ? req.query.subprojet : undefined;
    const entreprise = typeof req.query.entreprise === 'string' ? req.query.entreprise : undefined;
    const result = await formService.getAllChecklistConducteurs({ subprojet, entreprise }, page, limit);
    res.status(200).json({ success: true, data: result.items, pagination: { page: result.page, limit, total: result.total, totalPages: result.totalPages } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateChecklistConducteur = async (req: Request, res: Response) => {
  try {
    if (!isValidId(req.params.id)) return void res.status(400).json({ success: false, message: 'ID invalide' });
    const data = await formService.updateChecklistConducteur(req.params.id, req.body);
    if (!data) return void res.status(404).json({ success: false, message: 'ChecklistConducteur non trouvée' });
    res.status(200).json({ success: true, message: 'ChecklistConducteur mise à jour avec succès', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteChecklistConducteur = async (req: Request, res: Response) => {
  try {
    if (!isValidId(req.params.id)) return void res.status(400).json({ success: false, message: 'ID invalide' });
    const deleted = await formService.deleteChecklistConducteur(req.params.id);
    if (!deleted) return void res.status(404).json({ success: false, message: 'ChecklistConducteur non trouvée' });
    res.status(200).json({ success: true, message: 'ChecklistConducteur supprimée avec succès' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};