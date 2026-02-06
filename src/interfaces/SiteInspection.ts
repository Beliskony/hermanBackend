import { Schema, model, Document } from 'mongoose';

export interface ISiteInspection extends Document {
  sousProjet: string;
  date: Date;
  auditeurs: string[];
  personnesRencontrees: string[];
  zonesInspectees: {
    zoneTraitement: boolean;
    zoneStockage: boolean;
    zonesExternes: boolean;
    bureauxCommuns: boolean;
  };
  gestionEaux: Array<{
    pointControle: string;
    conforme: boolean;
    nonApplicable: boolean;
    observations: string;
    preuves: string[];
    niveauCriticite?: 'H' | 'M' | 'L';
  }>;
  gestionDechets: Array<{
    pointControle: string;
    conforme: boolean;
    nonApplicable: boolean;
    observations: string;
    preuves: string[];
    niveauCriticite?: 'H' | 'M' | 'L';
  }>;
  emissionsAtmospheriques: Array<{
    pointControle: string;
    conforme: boolean;
    nonApplicable: boolean;
    observations: string;
    preuves: string[];
    niveauCriticite?: 'H' | 'M' | 'L';
  }>;
  santeSecurite: Array<{
    pointControle: string;
    conforme: boolean;
    nonApplicable: boolean;
    observations: string;
    preuves: string[];
    niveauCriticite?: 'H' | 'M' | 'L';
  }>;
  relationsCommunautes: Array<{
    pointControle: string;
    conforme: boolean;
    nonApplicable: boolean;
    observations: string;
    preuves: string[];
    niveauCriticite?: 'H' | 'M' | 'L';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const SiteInspectionSchema = new Schema<ISiteInspection>({
  sousProjet: { type: String, required: true },
  date: { type: Date, default: Date.now },
  auditeurs: [{ type: String, required: true }],
  personnesRencontrees: [String],
  zonesInspectees: {
    zoneTraitement: Boolean,
    zoneStockage: Boolean,
    zonesExternes: Boolean,
    bureauxCommuns: Boolean
  },
  gestionEaux: [{
    pointControle: String,
    conforme: Boolean,
    nonApplicable: Boolean,
    observations: String,
    preuves: [String],
    niveauCriticite: { type: String, enum: ['H', 'M', 'L'] }
  }],
  gestionDechets: [{
    pointControle: String,
    conforme: Boolean,
    nonApplicable: Boolean,
    observations: String,
    preuves: [String],
    niveauCriticite: { type: String, enum: ['H', 'M', 'L'] }
  }],
  emissionsAtmospheriques: [{
    pointControle: String,
    conforme: Boolean,
    nonApplicable: Boolean,
    observations: String,
    preuves: [String],
    niveauCriticite: { type: String, enum: ['H', 'M', 'L'] }
  }],
  santeSecurite: [{
    pointControle: String,
    conforme: Boolean,
    nonApplicable: Boolean,
    observations: String,
    preuves: [String],
    niveauCriticite: { type: String, enum: ['H', 'M', 'L'] }
  }],
  relationsCommunautes: [{
    pointControle: String,
    conforme: Boolean,
    nonApplicable: Boolean,
    observations: String,
    preuves: [String],
    niveauCriticite: { type: String, enum: ['H', 'M', 'L'] }
  }]
}, { timestamps: true });

export const SiteInspection = model<ISiteInspection>('SiteInspection', SiteInspectionSchema);