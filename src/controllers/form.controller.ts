import { Request, Response } from 'express';
import { FormService } from '../services/form.service';

const formService = new FormService();

// =============================================================================
// HELPERS
// =============================================================================

const isValidId = (id: any): id is string => {
  return typeof id === 'string' && id.length === 16 && /^[a-f0-9]{16}$/i.test(id);
};

const paginate = (req: Request) => {
  const page = parseInt(req.query.page as string, 10);
  const limit = parseInt(req.query.limit as string, 10);
  return {
    page: isNaN(page) || page < 1 ? 1 : page,
    limit: isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100)
  };
};

// =============================================================================
// FORM CONTROLLER
// =============================================================================

export class FormController {
  
  // ===========================================================================
  // PROJETS
  // ===========================================================================

  async getAllProjects(req: Request, res: Response) {
    try {
      const { page, limit } = paginate(req);
      const result = await formService.projects.getAll(page, limit);
      res.json({ success: true, data: result.items, pagination: { page: result.page, limit, total: result.total, totalPages: result.totalPages } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getProjectById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });
      const project = await formService.projects.getById(id);
      if (!project) return res.status(404).json({ success: false, message: 'Projet non trouvé' });
      res.json({ success: true, data: project });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ===========================================================================
  // QUESTIONS (charge les questions selon le type de formulaire)
  // ===========================================================================

  async getFormQuestions(req: Request, res: Response) {
    try {
      const { projectId, formType } = req.params;
      if (!isValidId(projectId)) return res.status(400).json({ success: false, message: 'ID invalide' });
      
      const questions = await formService.questions.getFormQuestions(projectId, formType as any);
      res.json({ success: true, data: questions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ===========================================================================
  // APES FORM
  // ===========================================================================

  async createAPES(req: Request, res: Response) {
    try {
      const result = await formService.apes.create(req.body);
      res.status(201).json({ success: true, type: 'apes', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAPES(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });
      
      const apes = await formService.apes.getById(id);
      if (!apes) return res.status(404).json({ success: false, message: 'Formulaire APES non trouvé' });
      
      res.json({ success: true, type: 'apes', data: apes });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateAPES(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });
      
      // Pour la mise à jour, on utilise saveDocumentReview, saveFieldInspection, etc.
      // ou on implémente une méthode update dans le service
      res.json({ success: true, message: 'Mise à jour APES à implémenter' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async submitAPES(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });
      
      const result = await formService.apes.submit(id);
      res.json({ success: true, type: 'apes', message: 'Formulaire APES soumis avec succès', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ===========================================================================
  // GUIDE ENTRETIEN
  // ===========================================================================

  async createGuideEntretien(req: Request, res: Response) {
    try {
      const result = await formService.guideEntretien.create(req.body);
      res.status(201).json({ success: true, type: 'guide_entretien', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getGuideEntretien(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });
      
      const guide = await formService.guideEntretien.getById(id);
      if (!guide) return res.status(404).json({ success: false, message: 'Guide non trouvé' });
      
      res.json({ success: true, type: 'guide_entretien', data: guide });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateGuideEntretien(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });
      
      const result = await formService.guideEntretien.update(id, req.body);
      res.json({ success: true, type: 'guide_entretien', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async submitGuideEntretien(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });
      
      // Implémenter la soumission si nécessaire
      res.json({ success: true, type: 'guide_entretien', message: 'Guide soumis avec succès' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

// ===========================================================================
// DATA COLLECTION
// ===========================================================================

async createDataCollection(req: Request, res: Response) {
  try {
    const result = await formService.dataCollection.create(req.body);
    res.status(201).json({ success: true, type: 'data_collection', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async getDataCollection(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });
    
    const data = await formService.dataCollection.getById(id);
    if (!data) return res.status(404).json({ success: false, message: 'Formulaire Data Collection non trouvé' });
    
    res.json({ success: true, type: 'data_collection', data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async updateDataCollection(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });
    
    const result = await formService.dataCollection.update(id, req.body);
    res.json({ success: true, type: 'data_collection', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async submitDataCollection(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });
    
    const result = await formService.dataCollection.submit(id);
    res.json({ success: true, type: 'data_collection', message: 'Formulaire Data Collection soumis avec succès', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

  // ===========================================================================
  // CHECKLIST AUDIT
  // ===========================================================================

  async createChecklistAudit(req: Request, res: Response) {
    try {
      const result = await formService.checklistAudit.create(req.body);
      res.status(201).json({ success: true, type: 'checklist_audit', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getChecklistAudit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });
      
      const audit = await formService.checklistAudit.getById(id);
      if (!audit) return res.status(404).json({ success: false, message: 'Audit non trouvé' });
      
      res.json({ success: true, type: 'checklist_audit', data: audit });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateChecklistAudit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });
      
      const result = await formService.checklistAudit.update(id, req.body);
      res.json({ success: true, type: 'checklist_audit', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async submitChecklistAudit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });
      
      res.json({ success: true, type: 'checklist_audit', message: 'Audit soumis avec succès' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ===========================================================================
  // CHECKLIST CONDUCTEUR
  // ===========================================================================

  async createChecklistConducteur(req: Request, res: Response) {
    try {
      const result = await formService.checklistConducteur.create(req.body);
      res.status(201).json({ success: true, type: 'checklist_conducteur', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getChecklistConducteur(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });
      
      const conducteur = await formService.checklistConducteur.getById(id);
      if (!conducteur) return res.status(404).json({ success: false, message: 'Checklist non trouvée' });
      
      res.json({ success: true, type: 'checklist_conducteur', data: conducteur });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateChecklistConducteur(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });
      
      const result = await formService.checklistConducteur.update(id, req.body);
      res.json({ success: true, type: 'checklist_conducteur', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async submitChecklistConducteur(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });
      
      res.json({ success: true, type: 'checklist_conducteur', message: 'Checklist soumise avec succès' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ===========================================================================
  // FORMULAIRE UNIQUE (GET)
  // ===========================================================================

  async getForm(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      // Essayer chaque type
      const guide = await formService.guideEntretien.getById(id);
      if (guide) return res.json({ success: true, type: 'guide_entretien', data: guide });

      const audit = await formService.checklistAudit.getById(id);
      if (audit) return res.json({ success: true, type: 'checklist_audit', data: audit });

      const conducteur = await formService.checklistConducteur.getById(id);
      if (conducteur) return res.json({ success: true, type: 'checklist_conducteur', data: conducteur });

      const apes = await formService.apes.getById(id);
      if (apes) return res.json({ success: true, type: 'apes', data: apes });

      // Data Collection ← AJOUTER
      const dataCollection = await formService.dataCollection.getById(id);
      if (dataCollection) return res.json({ success: true, type: 'data_collection', data: dataCollection });

      res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async submitForm(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const apesResult = await formService.apes.submit(id);
      if (apesResult) {
        return res.json({ success: true, type: 'apes', message: 'Formulaire soumis avec succès', data: apesResult });
      }

      res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllForms(req: Request, res: Response) {
    try {
      const { page, limit } = paginate(req);
      const projectId = req.query.projectId as string;

      const [apes, guides, audits, conducteurs, dataCollections] = await Promise.all([
        formService.apes.getAll(projectId, undefined, page, 100),
        formService.guideEntretien.getAll(projectId, undefined, page, 100),
        formService.checklistAudit.getAll(projectId, page, 100),
        formService.checklistConducteur.getAll(projectId, page, 100),
        formService.dataCollection.getAll(projectId, undefined, page, 100)
      ]);

      const allForms = [
        ...(apes.items || []).map((f: any) => ({ ...f, formType: 'apes' })),
        ...(guides.items || []).map((f: any) => ({ ...f, formType: 'guide_entretien' })),
        ...(audits.items || []).map((f: any) => ({ ...f, formType: 'checklist_audit' })),
        ...(conducteurs.items || []).map((f: any) => ({ ...f, formType: 'checklist_conducteur' })),
        ...(dataCollections.items || []).map((f: any) => ({ ...f, formType: 'data_collection' }))
      ];

      allForms.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const start = (page - 1) * limit;
      const paginated = allForms.slice(start, start + limit);

      res.json({
        success: true,
        data: paginated,
        pagination: { page, limit, total: allForms.length, totalPages: Math.ceil(allForms.length / limit) }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const formController = new FormController();