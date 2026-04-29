import { Document } from 'mongoose';
import { IProjectInfo } from './ProjectInfo.model';
import { IDocumentReview } from './DocumentReview.model';
import { IFieldInspection } from './FieldInspection.model';
import { IStakeholderInterview } from './StakeholderInterview.model';
import { IGenderAssessment } from './GenderAssessment.model';
import { IComplaintMechanism } from './ComplaintMechanism.model';
export interface IFormData extends Document {
    projectInfo: IProjectInfo;
    documentReview: IDocumentReview;
    fieldInspection: IFieldInspection;
    stakeholderInterview: IStakeholderInterview;
    genderAssessment: IGenderAssessment;
    complaintMechanism: IComplaintMechanism;
    status: 'draft' | 'submitted' | 'archived';
    createdAt: Date;
    updatedAt: Date;
    submittedAt?: Date;
}
export declare const FormData: import("mongoose").Model<IFormData, {}, {}, {}, Document<unknown, {}, IFormData, {}, import("mongoose").DefaultSchemaOptions> & IFormData & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IFormData>;
//# sourceMappingURL=FormData.model.d.ts.map