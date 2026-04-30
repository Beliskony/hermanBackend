import { GuideEntretien, IGuideEntretien } from '../interfaces/GuideEntretien.model';
import { ChecklistAudit, ChecklistConducteurTravaux, IChecklistConducteurTravaux, IChecklistAudit } from '../interfaces/ChecklistAudit.model';
import { FormData, IFormData } from '../interfaces/FormData.model';

export class FormService {

 /**
   * Créer un nouveau formulaire
   */
  async createForm(formData: Partial<IFormData>): Promise<IFormData> {
    try {
      const form = new FormData(formData);
      return await form.save();
    } catch (error) {
      throw new Error(`Erreur lors de la création du formulaire: ${error}`);
    }
  }

  /**
   * Récupérer un formulaire par ID
   */
  async getFormById(id: string): Promise<IFormData | null> {
    try {
      return await FormData.findById(id);
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du formulaire: ${error}`);
    }
  }

  /**
   * Récupérer tous les formulaires
   */
  async getAllForms(
    filters: {
      status?: string;
      projectName?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ forms: IFormData[]; total: number; page: number; totalPages: number }> {
    try {
      const query: any = {};
      
      if (filters.status) query.status = filters.status;
      if (filters.projectName) {
        query['projectInfo.projectName'] = { $regex: filters.projectName, $options: 'i' };
      }
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = filters.dateFrom;
        if (filters.dateTo) query.createdAt.$lte = filters.dateTo;
      }

      const skip = (page - 1) * limit;
      
      const [forms, total] = await Promise.all([
        FormData.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        FormData.countDocuments(query)
      ]);

      return {
        forms,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des formulaires: ${error}`);
    }
  }

  /**
   * Mettre à jour un formulaire
   */
  async updateForm(id: string, updateData: Partial<IFormData>): Promise<IFormData | null> {
    try {
      // Ne pas permettre la mise à jour du statut à "submitted" si déjà soumis
      if (updateData.status === 'submitted') {
        const existingForm = await FormData.findById(id);
        if (existingForm?.status === 'submitted') {
          throw new Error('Le formulaire a déjà été soumis et ne peut plus être modifié');
        }
        updateData.submittedAt = new Date();
      }

      return await FormData.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du formulaire: ${error}`);
    }
  }

  /**
   * Supprimer un formulaire
   */
  async deleteForm(id: string): Promise<boolean> {
    try {
      const result = await FormData.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du formulaire: ${error}`);
    }
  }

  /**
   * Soumettre un formulaire (changer le statut à submitted)
   */
  async submitForm(id: string): Promise<IFormData | null> {
    try {
      return await FormData.findByIdAndUpdate(
        id,
        { 
          status: 'submitted',
          submittedAt: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Erreur lors de la soumission du formulaire: ${error}`);
    }
  }

  /**
   * Statistiques des formulaires
   */
  async getFormStats(): Promise<any> {
  try {
    // Récupérer les comptages de chaque collection séparément
    const [apesStats, checklistAuditStats, checklistConducteurStats, guideEntretienStats] = await Promise.all([
      FormData.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            latest: { $max: '$createdAt' }
          }
        }
      ]),
      ChecklistAudit.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            latest: { $max: '$createdAt' }
          }
        }
      ]),
      ChecklistConducteurTravaux.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            latest: { $max: '$createdAt' }
          }
        }
      ]),
      GuideEntretien.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            latest: { $max: '$createdAt' }
          }
        }
      ])
    ]);

    // Structure des statistiques par type
    const byFormType = {
      apes: this.formatStats(apesStats),
      checklistAudit: this.formatStats(checklistAuditStats),
      checklistConducteur: this.formatStats(checklistConducteurStats),
      guideEntretien: this.formatStats(guideEntretienStats)
    };

    // Calcul des totaux globaux
    const totalApres = apesStats.reduce((sum, s) => sum + s.count, 0);
    const totalChecklistAudit = checklistAuditStats.reduce((sum, s) => sum + s.count, 0);
    const totalChecklistConducteur = checklistConducteurStats.reduce((sum, s) => sum + s.count, 0);
    const totalGuideEntretien = guideEntretienStats.reduce((sum, s) => sum + s.count, 0);

    const totalAll = totalApres + totalChecklistAudit + totalChecklistConducteur + totalGuideEntretien;

    // Statistiques globales par statut
    const globalByStatus = this.mergeStatsByStatus([
      apesStats,
      checklistAuditStats,
      checklistConducteurStats,
      guideEntretienStats
    ]);

    return {
      total: totalAll,
      byFormType,
      byStatus: globalByStatus,
      details: {
        apes: { total: totalApres, stats: byFormType.apes },
        checklistAudit: { total: totalChecklistAudit, stats: byFormType.checklistAudit },
        checklistConducteur: { total: totalChecklistConducteur, stats: byFormType.checklistConducteur },
        guideEntretien: { total: totalGuideEntretien, stats: byFormType.guideEntretien }
      }
    };
  } catch (error) {
    throw new Error(`Erreur lors du calcul des statistiques: ${error}`);
  }
}

// Méthode utilitaire pour formater les stats d'un type
private formatStats(stats: any[]): any[] {
  return stats.map(stat => ({
    status: stat._id,
    count: stat.count,
    latest: stat.latest
  }));
}

// Méthode pour fusionner les statistiques par statut
private mergeStatsByStatus(allStatsArrays: any[][]): any[] {
  const statusMap = new Map();
  const statusOrder = ['draft', 'submitted', 'reviewed', 'approved', 'archived'];
  const statusLabels: Record<string, string> = {
    draft: 'Brouillon',
    submitted: 'Soumis',
    reviewed: 'Révisé',
    approved: 'Approuvé',
    archived: 'Archivé'
  };

  allStatsArrays.forEach(statsArray => {
    statsArray.forEach(stat => {
      const status = stat._id;
      if (statusMap.has(status)) {
        statusMap.set(status, statusMap.get(status) + stat.count);
      } else {
        statusMap.set(status, stat.count);
      }
    });
  });

  // Retourner les stats triées par ordre de statut
  return statusOrder
    .filter(status => statusMap.has(status))
    .map(status => ({
      status,
      label: statusLabels[status] || status,
      count: statusMap.get(status)
    }));
}

  // ─── GUIDE D'ENTRETIEN ───────────────────────────────────────
  async createGuideEntretien(data: Partial<IGuideEntretien>): Promise<IGuideEntretien> {
    try {
      return await new GuideEntretien(data).save();
    } catch (error) {
      throw new Error(`Erreur création GuideEntretien: ${error}`);
    }
  }
 
  async getGuideEntretienById(id: string): Promise<IGuideEntretien | null> {
    try {
      return await GuideEntretien.findById(id);
    } catch (error) {
      throw new Error(`Erreur récupération GuideEntretien: ${error}`);
    }
  }
 
  async getAllGuideEntretiens(
    filters: { guideType?: string; subprojet?: string } = {},
    page = 1,
    limit = 10
  ) {
    try {
      const query: any = {};
      if (filters.guideType) query.guideType = filters.guideType;
      if (filters.subprojet) query.subprojet = { $regex: filters.subprojet, $options: 'i' };
 
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        GuideEntretien.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        GuideEntretien.countDocuments(query)
      ]);
      return { items, total, page, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      throw new Error(`Erreur récupération GuideEntretiens: ${error}`);
    }
  }
 
  async updateGuideEntretien(id: string, data: Partial<IGuideEntretien>): Promise<IGuideEntretien | null> {
    try {
      return await GuideEntretien.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } catch (error) {
      throw new Error(`Erreur mise à jour GuideEntretien: ${error}`);
    }
  }
 
  async deleteGuideEntretien(id: string): Promise<boolean> {
    try {
      return (await GuideEntretien.findByIdAndDelete(id)) !== null;
    } catch (error) {
      throw new Error(`Erreur suppression GuideEntretien: ${error}`);
    }
  }
 
  // ─── CHECKLIST AUDIT ─────────────────────────────────────────
  async createChecklistAudit(data: Partial<IChecklistAudit>): Promise<IChecklistAudit> {
    try {
      return await new ChecklistAudit(data).save();
    } catch (error) {
      throw new Error(`Erreur création ChecklistAudit: ${error}`);
    }
  }
 
  async getChecklistAuditById(id: string): Promise<IChecklistAudit | null> {
    try {
      return await ChecklistAudit.findById(id);
    } catch (error) {
      throw new Error(`Erreur récupération ChecklistAudit: ${error}`);
    }
  }
 
  async getAllChecklistAudits(
    filters: { subprojet?: string; auditeurs?: string } = {},
    page = 1,
    limit = 10
  ) {
    try {
      const query: any = {};
      if (filters.subprojet) query.subprojet = { $regex: filters.subprojet, $options: 'i' };
      if (filters.auditeurs) query.auditeurs = { $regex: filters.auditeurs, $options: 'i' };
 
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        ChecklistAudit.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        ChecklistAudit.countDocuments(query)
      ]);
      return { items, total, page, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      throw new Error(`Erreur récupération ChecklistAudits: ${error}`);
    }
  }
 
  async updateChecklistAudit(id: string, data: Partial<IChecklistAudit>): Promise<IChecklistAudit | null> {
    try {
      return await ChecklistAudit.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } catch (error) {
      throw new Error(`Erreur mise à jour ChecklistAudit: ${error}`);
    }
  }
 
  async deleteChecklistAudit(id: string): Promise<boolean> {
    try {
      return (await ChecklistAudit.findByIdAndDelete(id)) !== null;
    } catch (error) {
      throw new Error(`Erreur suppression ChecklistAudit: ${error}`);
    }
  }
 
  // ─── CHECKLIST CONDUCTEUR TRAVAUX ────────────────────────────
  async createChecklistConducteur(data: Partial<IChecklistConducteurTravaux>): Promise<IChecklistConducteurTravaux> {
    try {
      return await new ChecklistConducteurTravaux(data).save();
    } catch (error) {
      throw new Error(`Erreur création ChecklistConducteurTravaux: ${error}`);
    }
  }
 
  async getChecklistConducteurById(id: string): Promise<IChecklistConducteurTravaux | null> {
    try {
      return await ChecklistConducteurTravaux.findById(id);
    } catch (error) {
      throw new Error(`Erreur récupération ChecklistConducteurTravaux: ${error}`);
    }
  }
 
  async getAllChecklistConducteurs(
    filters: { subprojet?: string; entreprise?: string } = {},
    page = 1,
    limit = 10
  ) {
    try {
      const query: any = {};
      if (filters.subprojet) query.subprojet = { $regex: filters.subprojet, $options: 'i' };
      if (filters.entreprise) query.entreprise = { $regex: filters.entreprise, $options: 'i' };
 
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        ChecklistConducteurTravaux.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        ChecklistConducteurTravaux.countDocuments(query)
      ]);
      return { items, total, page, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      throw new Error(`Erreur récupération ChecklistConducteurTravaux: ${error}`);
    }
  }
 
  async updateChecklistConducteur(id: string, data: Partial<IChecklistConducteurTravaux>): Promise<IChecklistConducteurTravaux | null> {
    try {
      return await ChecklistConducteurTravaux.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } catch (error) {
      throw new Error(`Erreur mise à jour ChecklistConducteurTravaux: ${error}`);
    }
  }
 
  async deleteChecklistConducteur(id: string): Promise<boolean> {
    try {
      return (await ChecklistConducteurTravaux.findByIdAndDelete(id)) !== null;
    } catch (error) {
      throw new Error(`Erreur suppression ChecklistConducteurTravaux: ${error}`);
    }
  }

}