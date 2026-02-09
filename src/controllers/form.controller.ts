import { Request, Response } from 'express';
import { FormService } from '../services/form.service';

const formService = new FormService();


 export const createForm = async (req: Request, res: Response) => {
    try {
      const formData = req.body;
      const form = await formService.createForm(formData);
      
      res.status(201).json({
        success: true,
        message: 'Formulaire créé avec succès',
        data: form
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la création du formulaire'
      });
    }
  }

  /**
   * Récupérer un formulaire par ID
   */
  export const getForm = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Validation: s'assurer que id est une string
      if (Array.isArray(id)) {
        res.status(400).json({
          success: false,
          message: 'ID invalide'
        });
        return;
      }
      
      const form = await formService.getFormById(id);
      
      if (!form) {
        res.status(404).json({
          success: false,
          message: 'Formulaire non trouvé'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: form
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du formulaire'
      });
    }
  }

  /**
   * Récupérer tous les formulaires avec pagination et filtres
   */
  export const getAllForms = async(req: Request, res: Response) => {
    try {
      // Extraction et validation des paramètres de requête
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const projectName = typeof req.query.projectName === 'string' ? req.query.projectName : undefined;
      const dateFrom = typeof req.query.dateFrom === 'string' ? req.query.dateFrom : undefined;
      const dateTo = typeof req.query.dateTo === 'string' ? req.query.dateTo : undefined;
      
      // Gestion des paramètres de pagination
      const pageParam = req.query.page;
      const limitParam = req.query.limit;
      
      const page = typeof pageParam === 'string' 
        ? parseInt(pageParam, 10) 
        : Array.isArray(pageParam)
          ? parseInt(pageParam[0] as string, 10)
          : 1;
          
      const limit = typeof limitParam === 'string' 
        ? parseInt(limitParam, 10) 
        : Array.isArray(limitParam)
          ? parseInt(limitParam[0] as string, 10)
          : 10;
      
      const filters: any = {};
      
      if (status) filters.status = status;
      if (projectName) filters.projectName = projectName;
      if (dateFrom) {
        const date = new Date(dateFrom);
        if (!isNaN(date.getTime())) {
          filters.dateFrom = date;
        }
      }
      if (dateTo) {
        const date = new Date(dateTo);
        if (!isNaN(date.getTime())) {
          filters.dateTo = date;
        }
      }
      
      // Validation des valeurs numériques
      const validatedPage = isNaN(page) || page < 1 ? 1 : page;
      const validatedLimit = isNaN(limit) || limit < 1 ? 10 : limit;

      const result = await formService.getAllForms(
        filters,
        validatedPage,
        validatedLimit
      );

      res.status(200).json({
        success: true,
        data: result.forms,
        pagination: {
          page: result.page,
          limit: validatedLimit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des formulaires'
      });
    }
  }

  /**
   * Mettre à jour un formulaire
   */
  export const updateForm = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Validation: s'assurer que id est une string
      if (Array.isArray(id)) {
        res.status(400).json({
          success: false,
          message: 'ID invalide'
        });
        return;
      }
      
      const updatedForm = await formService.updateForm(id, updateData);
      
      if (!updatedForm) {
        res.status(404).json({
          success: false,
          message: 'Formulaire non trouvé'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Formulaire mis à jour avec succès',
        data: updatedForm
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du formulaire'
      });
    }
  }

  /**
   * Supprimer un formulaire
   */
  export const deleteForm = async(req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Validation: s'assurer que id est une string
      if (Array.isArray(id)) {
        res.status(400).json({
          success: false,
          message: 'ID invalide'
        });
        return;
      }
      
      const deleted = await formService.deleteForm(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Formulaire non trouvé'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Formulaire supprimé avec succès'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression du formulaire'
      });
    }
  }

  /**
   * Soumettre un formulaire
   */
  export const submitForm = async(req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Validation: s'assurer que id est une string
      if (Array.isArray(id)) {
        res.status(400).json({
          success: false,
          message: 'ID invalide'
        });
        return;
      }
      
      const submittedForm = await formService.submitForm(id);
      
      if (!submittedForm) {
        res.status(404).json({
          success: false,
          message: 'Formulaire non trouvé'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Formulaire soumis avec succès',
        data: submittedForm
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la soumission du formulaire'
      });
    }
  }

  /**
   * Récupérer les statistiques
   */
  export const getStats = async(req: Request, res: Response) => {
    try {
      const stats = await formService.getFormStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des statistiques'
      });
    }
  }
