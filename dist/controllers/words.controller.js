"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordExportController = void 0;
const FormData_model_1 = require("../interfaces/FormData.model");
const words_service_1 = require("../services/words.service");
class WordExportController {
    exportToWord(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const formData = yield FormData_model_1.FormData.findById(id);
                if (!formData) {
                    res.status(404).json({ message: 'Formulaire non trouvé' });
                    return;
                }
                const buffer = yield (0, words_service_1.generateFormDataWordDocument)(formData);
                const filename = `audit-${formData.projectInfo.projectName.replace(/\s+/g, '_')}.docx`;
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(buffer);
            }
            catch (error) {
                console.error('[WordExport] Erreur lors de la génération du document:', error);
                res.status(500).json({ message: 'Erreur lors de la génération du document Word' });
            }
        });
    }
}
exports.WordExportController = WordExportController;
exports.default = new WordExportController();
//# sourceMappingURL=words.controller.js.map