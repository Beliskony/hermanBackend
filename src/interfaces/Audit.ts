import { Schema, model, Document } from 'mongoose';

export type AuditType = 'documentReview' | 'siteInspection' | 'stakeholderInterview' | 'genderAudit' | 'complaintMechanism' | 'stakeholderChecklist';

export interface IAudit extends Document {
  // Métadonnées communes
  title: string;
  type: AuditType;
  sousProjet: string;
  date: Date;
  auditeurs: string[];
  createdBy: string;
  
  // Données spécifiques au type (flexible)
  data: Record<string, any>;
  
  // Statut
  status: 'draft' | 'completed' | 'archived';
  
  // Métadonnées système
  createdAt: Date;
  updatedAt: Date;
}

const AuditSchema = new Schema<IAudit>({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: ['documentReview', 'siteInspection', 'stakeholderInterview', 'genderAudit', 'complaintMechanism', 'stakeholderChecklist']
  },
  sousProjet: { 
    type: String, 
    required: true,
    trim: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  auditeurs: [{ 
    type: String, 
    required: true 
  }],
  createdBy: { 
    type: String, 
    required: true 
  },
  
  // Données flexibles selon le type
  data: { 
    type: Schema.Types.Mixed, 
    default: {} 
  },
  
  status: { 
    type: String, 
    enum: ['draft', 'completed', 'archived'],
    default: 'draft'
  }
}, { 
  timestamps: true,
});

export const Audit = model<IAudit>('Audit', AuditSchema);