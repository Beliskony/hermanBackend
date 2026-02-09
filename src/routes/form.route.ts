// src/routes/form.routes.ts
import { Router } from 'express';
import { 
  createForm, 
  getForm, 
  getAllForms, 
  updateForm, 
  deleteForm, 
  submitForm, 
  getStats 
} from '../controllers/form.controller';
import { authMiddleware } from '../middlewares/auth.middleware';


const formRouter = Router();

// ============================================
// ROUTES PRINCIPALES
// ============================================

/**
 * @route   POST /form
 * @desc    Créer un nouveau formulaire APES
 * @access  Private
 * @body    {object} formData - Les données complètes du formulaire
 */
formRouter.post('/form', authMiddleware, createForm);

/**
 * @route   GET /form
 * @desc    Récupérer tous les formulaires (avec pagination et filtres)
 * @access  Private
 * @query   {string} [status] - Statut (draft, submitted, archived)
 * @query   {string} [projectName] - Nom du projet (recherche partielle)
 * @query   {string} [dateFrom] - Date de début (format ISO)
 * @query   {string} [dateTo] - Date de fin (format ISO)
 * @query   {number} [page=1] - Numéro de page
 * @query   {number} [limit=10] - Nombre d'éléments par page
 */
formRouter.get('/form', authMiddleware, getAllForms);

/**
 * @route   GET /form/stats
 * @desc    Obtenir les statistiques des formulaires
 * @access  Private
 */
formRouter.get('/form/stats', authMiddleware, getStats);

/**
 * @route   GET /form/:id
 * @desc    Récupérer un formulaire par son ID
 * @access  Private
 * @param   {string} id - ID du formulaire
 */
formRouter.get('/form/:id', authMiddleware, getForm);

/**
 * @route   PUT /form/:id
 * @desc    Mettre à jour complètement un formulaire
 * @access  Private
 * @param   {string} id - ID du formulaire
 * @body    {object} updateData - Nouvelles données complètes
 */
formRouter.put('/form/:id', authMiddleware, updateForm);

/**
 * @route   DELETE /form/:id
 * @desc    Supprimer un formulaire
 * @access  Private
 * @param   {string} id - ID du formulaire
 */
formRouter.delete('/form/:id', authMiddleware, deleteForm);

/**
 * @route   POST /form/:id/submit
 * @desc    Soumettre un formulaire (changer le statut à "submitted")
 * @access  Private
 * @param   {string} id - ID du formulaire
 */
formRouter.post('/form/:id/submit', authMiddleware, submitForm);



export default formRouter;