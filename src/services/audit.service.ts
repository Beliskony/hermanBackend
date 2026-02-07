// src/services/AuditService.ts
import { Audit, IAudit, AuditType } from '../interfaces/Audit';
import { DocumentReview, IDocumentReview } from '../interfaces/DocumentReview';
import { SiteInspection, ISiteInspection } from '../interfaces/SiteInspection';
import { GenderAudit, IGenderAudit } from '../interfaces/GenderAudit';
import { ComplaintMechanism, IComplaintMechanism } from '../interfaces/ComplaintMechanism';
import { StakeholderInterview, IStakeholderInterview } from '../interfaces/StakeholderInterview';
import { StakeholderChecklist, IStakeholderChecklist } from '../interfaces/StakeholderChecklist';

type AuditModel = any; // Type simplifié pour éviter les erreurs

export class AuditService {
  // Mapper les types d'audit aux modèles - version simplifiée
  private static getModelByType(type: AuditType): AuditModel {
    switch (type) {
      case 'documentReview':
        return DocumentReview;
      case 'siteInspection':
        return SiteInspection;
      case 'genderAudit':
        return GenderAudit;
      case 'complaintMechanism':
        return ComplaintMechanism;
      case 'stakeholderInterview':
        return StakeholderInterview;
      case 'stakeholderChecklist':
        return StakeholderChecklist;
      default:
        throw new Error(`Type d'audit inconnu: ${type}`);
    }
  }

  /**
   * Créer un nouvel audit
   */
  static async createAudit(
    genericData: {
      title: string;
      type: AuditType;
      sousProjet: string;
      date?: Date;
      auditeurs: string[];
      createdBy: string;
      status?: 'draft' | 'completed' | 'archived';
    },
    specificData: Record<string, any>
  ) {
    try {
      const { type } = genericData;
      
      // 1. Créer l'audit spécifique
      const SpecificModel = this.getModelByType(type);
      const specificAuditData = {
        ...specificData,
        sousProjet: genericData.sousProjet,
        date: genericData.date || new Date(),
        auditeurs: genericData.auditeurs
      };
      
      // @ts-ignore - Problème de typage Mongoose
      const specificAudit = new SpecificModel(specificAuditData);
      await specificAudit.save();

      // 2. Créer l'audit générique
      const genericAuditData = {
        ...genericData,
        date: genericData.date || new Date(),
        status: genericData.status || 'draft',
        data: {
          specificAuditId: specificAudit._id,
          specificAuditType: type,
          lastSynced: new Date()
        }
      };

      // @ts-ignore - Problème de typage Mongoose
      const genericAudit = new Audit(genericAuditData);
      await genericAudit.save();

      return {
        success: true,
        genericAuditId: genericAudit._id,
        specificAuditId: specificAudit._id,
        audit: genericAudit.toObject()
      };
    } catch (error: any) {
      console.error('Erreur création audit:', error);
      throw new Error(`Échec création audit: ${error.message}`);
    }
  }

  /**
   * Récupérer un audit complet par ID
   */
  static async getAuditById(auditId: string, includeSpecific: boolean = true) {
  try {
    // 1. Récupérer l'audit générique
    const genericAudit = await Audit.findById(auditId);
    if (!genericAudit) {
      throw new Error('Audit non trouvé');
    }

    // 2. Si on ne veut pas inclure l'audit spécifique
    if (!includeSpecific) {
      return {
        success: true,
        audit: {
          ...genericAudit.toObject(),
          specificData: null
        }
      };
    }

    // 3. Récupérer l'audit spécifique si possible
    const specificId = genericAudit.data?.specificAuditId;
    const specificType = genericAudit.data?.specificAuditType as AuditType;

    let specificAudit = null;
    if (specificId && specificType) {
      const SpecificModel = this.getModelByType(specificType);
      // @ts-ignore - Problème de typage Mongoose
      specificAudit = await SpecificModel.findById(specificId);
      if (!specificAudit) {
        console.warn(`Audit spécifique ${specificId} non trouvé pour l'audit ${auditId}`);
      }
    }

    // 4. Retourner audit complet
    return {
      success: true,
      audit: {
        ...genericAudit.toObject(),
        specificData: specificAudit ? specificAudit.toObject() : null
      }
    };
  } catch (error: any) {
    console.error('Erreur récupération audit:', error);
    throw new Error(`Échec récupération audit: ${error.message}`);
  }
}


  /**
   * Récupérer tous les audits (avec pagination et filtres)
   */
  static async getAllAudits(
    filters: {
      type?: AuditType;
      sousProjet?: string;
      status?: 'draft' | 'completed' | 'archived';
      dateFrom?: Date;
      dateTo?: Date;
      auditeur?: string;
    } = {},
    options: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'date',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;

      // Construire la requête
      const query: any = {};

      if (filters.type) query.type = filters.type;
      if (filters.sousProjet) query.sousProjet = filters.sousProjet;
      if (filters.status) query.status = filters.status;
      if (filters.auditeur) query.auditeurs = filters.auditeur;

      // Filtre par date
      if (filters.dateFrom || filters.dateTo) {
        query.date = {};
        if (filters.dateFrom) query.date.$gte = filters.dateFrom;
        if (filters.dateTo) query.date.$lte = filters.dateTo;
      }

      // Exécuter la requête
      const audits = await Audit.find(query)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .select('title type sousProjet date auditeurs status createdAt data');

      const total = await Audit.countDocuments(query);

      return {
        success: true,
        data: audits.map(audit => audit.toObject()),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total
        }
      };
    } catch (error: any) {
      console.error('Erreur récupération audits:', error);
      throw new Error(`Échec récupération audits: ${error.message}`);
    }
  }

  /**
   * Mettre à jour un audit
   */
  static async updateAudit(
    auditId: string,
    updates: {
      generic?: Partial<IAudit>;
      specific?: Record<string, any>;
    }
  ) {
    try {
      // 1. Récupérer l'audit existant
      const genericAudit = await Audit.findById(auditId);
      if (!genericAudit) {
        throw new Error('Audit non trouvé');
      }

      const specificId = genericAudit.data?.specificAuditId;
      const specificType = genericAudit.data?.specificAuditType as AuditType;

      // 2. Mettre à jour l'audit générique
      if (updates.generic && Object.keys(updates.generic).length > 0) {
        const updateData: any = { ...updates.generic };
        updateData.data = {
          ...genericAudit.data,
          lastSynced: new Date()
        };
        
        await Audit.updateOne({ _id: auditId }, updateData);
      }

      // 3. Mettre à jour l'audit spécifique s'il existe
      if (specificId && specificType && updates.specific) {
        const SpecificModel = this.getModelByType(specificType);
        
        // Synchroniser les métadonnées communes
        const specificUpdates: any = { ...updates.specific };
        
        if (updates.generic?.sousProjet) {
          specificUpdates.sousProjet = updates.generic.sousProjet;
          specificUpdates.projet = updates.generic.sousProjet;
        }
        
        if (updates.generic?.date) {
          specificUpdates.date = updates.generic.date;
        }
        
        if (updates.generic?.auditeurs) {
          specificUpdates.auditeurs = updates.generic.auditeurs;
        }

        // @ts-ignore - Problème de typage Mongoose
        await SpecificModel.updateOne({ _id: specificId }, specificUpdates);
      }

      // Récupérer l'audit mis à jour
      const updatedAudit = await Audit.findById(auditId);

      return await this.getAuditById(auditId, true);

    } catch (error: any) {
      console.error('Erreur mise à jour audit:', error);
      throw new Error(`Échec mise à jour audit: ${error.message}`);
    }
  }

  /**
   * Supprimer un audit
   */
  static async deleteAudit(auditId: string, deleteSpecific: boolean = true) {
    try {
      // 1. Récupérer l'audit
      const genericAudit = await Audit.findById(auditId);
      if (!genericAudit) {
        throw new Error('Audit non trouvé');
      }

      const specificId = genericAudit.data?.specificAuditId;
      const specificType = genericAudit.data?.specificAuditType as AuditType;

      // 2. Supprimer l'audit spécifique si demandé et s'il existe
      if (deleteSpecific && specificId && specificType) {
        const SpecificModel = this.getModelByType(specificType);
        // @ts-ignore - Problème de typage Mongoose
        await SpecificModel.deleteOne({ _id: specificId });
      }

      // 3. Supprimer l'audit générique
      await Audit.deleteOne({ _id: auditId });

      return {
        success: true,
        message: 'Audit supprimé avec succès',
        deletedGenericId: auditId,
        deletedSpecificId: deleteSpecific ? specificId : null
      };
    } catch (error: any) {
      console.error('Erreur suppression audit:', error);
      throw new Error(`Échec suppression audit: ${error.message}`);
    }
  }

  /**
   * Rechercher des audits par critères
   */
  static async searchAudits(
    searchTerm: string,
    filters: Partial<{
      type: AuditType;
    }> = {}
  ) {
    try {
      const query: any = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { sousProjet: { $regex: searchTerm, $options: 'i' } },
          { auditeurs: { $regex: searchTerm, $options: 'i' } }
        ]
      };

      if (filters.type) {
        query.type = filters.type;
      }

      const audits = await Audit.find(query)
        .limit(50)
        .select('title type sousProjet date status')
        .sort({ date: -1 });

      return {
        success: true,
        count: audits.length,
        data: audits.map(audit => audit.toObject())
      };
    } catch (error: any) {
      console.error('Erreur recherche audits:', error);
      throw new Error(`Échec recherche audits: ${error.message}`);
    }
  }

  /**
   * Synchroniser manuellement les métadonnées
   */
  static async syncAuditMetadata(auditId: string) {
    try {
      const audit = await Audit.findById(auditId);
      
      if (!audit || !audit.data?.specificAuditId) {
        return { 
          success: false, 
          message: 'Pas de données spécifiques à synchroniser' 
        };
      }

      // Mettre à jour la date de synchronisation
      await Audit.updateOne(
        { _id: auditId },
        { 'data.lastSynced': new Date() }
      );

      return {
        success: true,
        message: 'Métadonnées synchronisées',
        syncedAt: new Date()
      };
    } catch (error: any) {
      throw new Error(`Échec synchronisation: ${error.message}`);
    }
  }

  /**
   * Récupérer les audits par type
   */
  static async getAuditsByType(type: AuditType, limit: number = 50) {
    try {
      const audits = await Audit.find({ type })
        .limit(limit)
        .sort({ date: -1 });

      return {
        success: true,
        count: audits.length,
        data: audits.map(audit => audit.toObject())
      };
    } catch (error: any) {
      console.error(`Erreur récupération audits ${type}:`, error);
      throw new Error(`Échec récupération audits ${type}: ${error.message}`);
    }
  }
}