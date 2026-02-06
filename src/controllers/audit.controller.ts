// src/controllers/auditController.ts
import { Request, Response } from 'express';
import { AuditService } from '../services/audit.service';

const getParam = (param: any): string => {
  if (Array.isArray(param)) return param[0];
  if (typeof param === 'string') return param;
  return String(param || '');
};

export class AuditController {
  /**
   * Créer un nouvel audit
   */
  static async create(req: Request, res: Response) {
    try {
      const { genericData, specificData } = req.body;

      if (!genericData || !specificData) {
        return res.status(400).json({
          success: false,
          error: 'genericData et specificData sont requis'
        });
      }

      const result = await AuditService.createAudit(genericData, specificData);
      
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Erreur création audit:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Récupérer un audit par ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const id = getParam(req.params.id);
      const { includeSpecific = 'true' } = req.query;
      
      const result = await AuditService.getAuditById(
        id, 
        includeSpecific === 'true'
      );
      
      res.json(result);
    } catch (error: any) {
      console.error('Erreur récupération audit:', error);
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Récupérer tous les audits
   */
  static async getAll(req: Request, res: Response) {
    try {
      const {
        type,
        sousProjet,
        status,
        dateFrom,
        dateTo,
        auditeur,
        page = '1',
        limit = '20',
        sortBy = 'date',
        sortOrder = 'desc'
      } = req.query;

      // Convertir les dates
      const dateFromParsed = dateFrom ? new Date(dateFrom as string) : undefined;
      const dateToParsed = dateTo ? new Date(dateTo as string) : undefined;

      const result = await AuditService.getAllAudits(
        {
          type: type as any,
          sousProjet: sousProjet as string,
          status: status as any,
          dateFrom: dateFromParsed,
          dateTo: dateToParsed,
          auditeur: auditeur as string
        },
        {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          sortBy: sortBy as string,
          sortOrder: sortOrder as 'asc' | 'desc'
        }
      );

      res.json(result);
    } catch (error: any) {
      console.error('Erreur récupération audits:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Mettre à jour un audit
   */
  static async update(req: Request, res: Response) {
    try {
      const id = getParam(req.params.id);
      const { generic, specific } = req.body;
      
      if (!generic && !specific) {
        return res.status(400).json({
          success: false,
          error: 'Au moins generic ou specific doit être fourni'
        });
      }
      
      const result = await AuditService.updateAudit(id, { generic, specific });
      
      res.json(result);
    } catch (error: any) {
      console.error('Erreur mise à jour audit:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Supprimer un audit
   */
  static async delete(req: Request, res: Response) {
    try {
      const id = getParam(req.params.id);
      const { deleteSpecific = 'true' } = req.query;
      
      const result = await AuditService.deleteAudit(
        id, 
        deleteSpecific === 'true'
      );
      
      res.json(result);
    } catch (error: any) {
      console.error('Erreur suppression audit:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Rechercher des audits
   */
  static async search(req: Request, res: Response) {
    try {
      const { q: searchTerm, type } = req.query;
      
      if (!searchTerm || typeof searchTerm !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Terme de recherche (q) requis'
        });
      }
      
      const result = await AuditService.searchAudits(searchTerm, {
        type: type as any
      });
      
      res.json(result);
    } catch (error: any) {
      console.error('Erreur recherche audits:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Synchroniser les métadonnées d'un audit
   */
  static async syncMetadata(req: Request, res: Response) {
    try {
      const id = getParam(req.params.id);
      
      const result = await AuditService.syncAuditMetadata(id);
      
      res.json(result);
    } catch (error: any) {
      console.error('Erreur synchronisation métadonnées:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Récupérer les audits par type
   */
  static async getByType(req: Request, res: Response) {
    try {
      const type = getParam(req.params.id);
      const { limit = '50' } = req.query;
      
      const validTypes = [
        'documentReview',
        'siteInspection', 
        'genderAudit',
        'complaintMechanism',
        'stakeholderInterview',
        'stakeholderChecklist'
      ];
      
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: `Type d'audit invalide. Types valides: ${validTypes.join(', ')}`
        });
      }
      
      const result = await AuditService.getAuditsByType(
        type as any,
        parseInt(limit as string)
      );
      
      res.json(result);
    } catch (error: any) {
      console.error('Erreur récupération audits par type:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }



  /**
   * Vérifier si un audit existe
   */
  static async checkExists(req: Request, res: Response) {
    try {
      const id = getParam(req.params.id);
      
      const audit = await AuditService.getAuditById(id, false);
      
      res.json({
        success: true,
        exists: !!audit,
        audit: audit.audit
      });
    } catch (error: any) {
      // Si l'audit n'existe pas, getAuditById va throw une erreur
      res.json({
        success: true,
        exists: false,
        audit: null
      });
    }
  }
}