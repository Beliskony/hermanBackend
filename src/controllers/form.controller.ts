import { Request, Response } from 'express';
import { FormService } from '../services/form.service';
import { QuestionService } from '../services/form.service';
import { FormType } from '../interfaces/IQuestionTemplate';
import { pool } from '../config/databaseConnect';

const formService = new FormService();
const questionService = new QuestionService();

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
    const { sectionKey } = req.query;
    const data = await questionService.getFormQuestions(projectId as string, formType as FormType, sectionKey as string | undefined);
    res.json({ data });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
}

async getFormQuestionsBySection(req: Request, res: Response) {
  try {
    const { projectId, formType, sectionKey } = req.params;
    const data = await questionService.getProjectQuestionsBySection(projectId as string, formType as FormType, sectionKey as string);
    res.json({ data });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
}

async getQuestionById(req: Request, res: Response) {
  try {
    const data = await questionService.getProjectQuestionById(req.params.id as string);
    if (!data) return res.status(404).json({ message: 'Question introuvable' });
    res.json({ data });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
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
    const type = req.query.type as string | undefined;

    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

    const resolvers: Record<string, () => Promise<any>> = {
      guide_entretien:      () => formService.guideEntretien.getById(id),
      checklist_audit:      () => formService.checklistAudit.getById(id),
      checklist_conducteur: () => formService.checklistConducteur.getById(id),
      apes:                 () => formService.apes.getById(id),
      data_collection:      () => formService.dataCollection.getById(id),
    };

    // Si le type est fourni, requête directe
    if (type && resolvers[type]) {
      const data = await resolvers[type]();
      if (!data) return res.status(404).json({ success: false, message: 'Formulaire non trouvé' });
      return res.json({ success: true, type, data });
    }

    // Fallback : essai séquentiel
    for (const [formType, resolve] of Object.entries(resolvers)) {
      const data = await resolve();
      if (data) return res.json({ success: true, type: formType, data });
    }

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

    if (!projectId) {
      return res.status(400).json({ success: false, message: 'projectId requis' });
    }

    // Utiliser les procédures existantes
    const [apesRows] = await pool.query<any[]>(
      'CALL sp_list_apes(?, ?, ?, ?)',
      [projectId, null, limit, (page - 1) * limit]
    );

    const [guideRows] = await pool.query<any[]>(
      `SELECT id, status, created_at, submitted_at, subprojet, 'guide_entretien' AS formType 
       FROM guide_entretien WHERE project_id = ?`,
      [projectId]
    );

    const [auditRows] = await pool.query<any[]>(
      `SELECT id, status, created_at, submitted_at, subprojet, 'checklist_audit' AS formType 
       FROM checklist_audit WHERE project_id = ?`,
      [projectId]
    );

    const [conducteurRows] = await pool.query<any[]>(
      `SELECT id, status, created_at, submitted_at, subprojet, 'checklist_conducteur' AS formType 
       FROM checklist_conducteur WHERE project_id = ?`,
      [projectId]
    );

    const [dataCollectionRows] = await pool.query<any[]>(
      `SELECT dc.id, dc.status, dc.created_at, dc.submitted_at, drd.subprojet, 'data_collection' AS formType
       FROM data_collection dc
       LEFT JOIN data_collection_revue_doc drd ON drd.data_collection_id = dc.id
       WHERE dc.project_id = ?`,
      [projectId]
    );

    // apesRows[0] contient les résultats, apesRows[1] contient le total
    const apesItems = apesRows[0] || [];
    
    const allForms = [
      ...apesItems.map((r: any) => ({
        id: r.form_id,
        name: r.project_name || 'Formulaire APES',
        type: 'apes',
        status: r.status,
        created_at: r.created_at,
        submitted_at: r.submitted_at
      })),
      ...guideRows.map((r: any) => ({
        id: r.id,
        name: r.subprojet || 'Guide entretien',
        type: 'guide_entretien',
        status: r.status,
        created_at: r.created_at,
        submitted_at: r.submitted_at
      })),
      ...auditRows.map((r: any) => ({
        id: r.id,
        name: r.subprojet || 'Checklist audit',
        type: 'checklist_audit',
        status: r.status,
        created_at: r.created_at,
        submitted_at: r.submitted_at
      })),
      ...conducteurRows.map((r: any) => ({
        id: r.id,
        name: r.subprojet || 'Checklist conducteur',
        type: 'checklist_conducteur',
        status: r.status,
        created_at: r.created_at,
        submitted_at: r.submitted_at
      })),
      ...dataCollectionRows.map((r: any) => ({
        id: r.id,
        name: r.subprojet || 'Data collection',
        type: 'data_collection',
        status: r.status,
        created_at: r.created_at,
        submitted_at: r.submitted_at
      }))
    ];

    allForms.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const total = allForms.length;
    const start = (page - 1) * limit;
    const paginated = allForms.slice(start, start + limit);

    res.json({
      success: true,
      data: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error: any) {
    console.error('Erreur getAllForms:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
}

export const formController = new FormController();