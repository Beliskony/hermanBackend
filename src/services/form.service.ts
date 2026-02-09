// src/services/form.service.ts
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
      const stats = await FormData.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            latest: { $max: '$createdAt' }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$count' },
            byStatus: {
              $push: {
                status: '$_id',
                count: '$count',
                latest: '$latest'
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            total: 1,
            byStatus: 1
          }
        }
      ]);

      return stats[0] || { total: 0, byStatus: [] };
    } catch (error) {
      throw new Error(`Erreur lors du calcul des statistiques: ${error}`);
    }
  }
}