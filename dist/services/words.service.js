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
exports.generateFormDataWordDocument = generateFormDataWordDocument;
exports.exportChecklistAuditWord = exportChecklistAuditWord;
exports.exportChecklistConducteurWord = exportChecklistConducteurWord;
exports.exportGuideEntretienWord = exportGuideEntretienWord;
const docx_1 = require("docx");
// ─── Interfaces SQL (snake_case retourné par MySQL) ──────────
// On n'importe plus les interfaces Mongoose — on type directement
// les objets tels que retournés par FormService / pool.query()
// ─── Palette & constantes ────────────────────────────────────
const C = {
    primary: '1B3A5C', secondary: '2E75B6', accent: '00B0A0',
    headerBg: '1B3A5C', headerText: 'FFFFFF', subBg: 'D6E4F0',
    altRow: 'F0F6FB', white: 'FFFFFF', lightGray: 'F5F5F5',
    borderCol: 'B8CCE4', muted: '6B7A8D', text: '1A1A2E',
    green: '1A7A4A', red: 'C0392B', yellow: 'C07000',
};
const PAGE = { width: 11906, height: 16838, margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } };
const TW = 9638;
const BORDER = (color = C.borderCol) => ({ style: docx_1.BorderStyle.SINGLE, size: 4, color });
const NO_BORDER = { style: docx_1.BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const CELL_MARGINS = { top: 100, bottom: 100, left: 140, right: 140 };
// ─── Helpers génériques ──────────────────────────────────────
function hCell(text, width, center = false) {
    return new docx_1.TableCell({
        width: { size: width, type: docx_1.WidthType.DXA },
        shading: { fill: C.headerBg, type: docx_1.ShadingType.CLEAR },
        margins: CELL_MARGINS,
        borders: { top: BORDER('FFFFFF'), bottom: BORDER('FFFFFF'), left: BORDER('FFFFFF'), right: BORDER('334E6E') },
        children: [new docx_1.Paragraph({ alignment: center ? docx_1.AlignmentType.CENTER : docx_1.AlignmentType.LEFT, children: [new docx_1.TextRun({ text, bold: true, color: C.headerText, size: 18, font: 'Calibri' })] })],
    });
}
function dCell(text, width, opts = {}) {
    const { shade = false, center = false, bold = false, color = C.text } = opts;
    return new docx_1.TableCell({
        width: { size: width, type: docx_1.WidthType.DXA },
        shading: { fill: shade ? C.altRow : C.white, type: docx_1.ShadingType.CLEAR },
        margins: CELL_MARGINS,
        borders: { top: BORDER(), bottom: BORDER(), left: BORDER(), right: BORDER() },
        children: [new docx_1.Paragraph({ alignment: center ? docx_1.AlignmentType.CENTER : docx_1.AlignmentType.LEFT, children: [new docx_1.TextRun({ text: String(text !== null && text !== void 0 ? text : '—'), bold, color, size: 18, font: 'Calibri' })] })],
    });
}
function divider() {
    return new docx_1.Paragraph({ border: { bottom: { style: docx_1.BorderStyle.SINGLE, size: 12, color: C.accent, space: 1 } }, spacing: { after: 160 }, children: [] });
}
function sectionTitle(num, text) {
    return [
        new docx_1.Paragraph({ heading: docx_1.HeadingLevel.HEADING_1, spacing: { before: 480, after: 60 }, children: [new docx_1.TextRun({ text: num + '  ', bold: true, size: 30, color: C.accent, font: 'Calibri' }), new docx_1.TextRun({ text, bold: true, size: 30, color: C.primary, font: 'Calibri' })] }),
        divider(),
    ];
}
function subTitle(text) {
    return [new docx_1.Paragraph({ heading: docx_1.HeadingLevel.HEADING_2, spacing: { before: 280, after: 80 }, children: [new docx_1.TextRun({ text, bold: true, size: 22, color: C.secondary, font: 'Calibri', underline: { type: docx_1.UnderlineType.SINGLE, color: C.secondary } })] })];
}
function kvParagraph(label, value) {
    return new docx_1.Paragraph({ spacing: { after: 80 }, children: [new docx_1.TextRun({ text: `${label} : `, bold: true, size: 20, color: C.primary, font: 'Calibri' }), new docx_1.TextRun({ text: value || '—', size: 20, color: C.text, font: 'Calibri' })] });
}
function pageBreak() { return new docx_1.Paragraph({ children: [new docx_1.PageBreak()] }); }
function spacer(after = 120) { return new docx_1.Paragraph({ spacing: { after }, children: [] }); }
function buildHeader(title) {
    return new docx_1.Header({ children: [new docx_1.Paragraph({ border: { bottom: { style: docx_1.BorderStyle.SINGLE, size: 8, color: C.primary, space: 1 } }, spacing: { after: 0 }, tabStops: [{ type: docx_1.TabStopType.RIGHT, position: docx_1.TabStopPosition.MAX }], children: [new docx_1.TextRun({ text: title.toUpperCase(), bold: true, size: 16, color: C.primary, font: 'Calibri' }), new docx_1.TextRun({ text: `\t${new Date().toLocaleDateString('fr-FR')}`, size: 16, color: C.muted, font: 'Calibri', italics: true })] })] });
}
function buildFooter(generatedAt) {
    const dateStr = generatedAt || new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    return new docx_1.Footer({ children: [new docx_1.Paragraph({ border: { top: { style: docx_1.BorderStyle.SINGLE, size: 8, color: C.accent, space: 1 } }, spacing: { before: 80 }, tabStops: [{ type: docx_1.TabStopType.RIGHT, position: docx_1.TabStopPosition.MAX }], children: [new docx_1.TextRun({ text: `Document généré le ${dateStr}  —  Confidentiel`, size: 14, color: C.muted, font: 'Calibri', italics: true }), new docx_1.TextRun({ text: '\tPage ', size: 14, color: C.muted, font: 'Calibri' }), new docx_1.TextRun({ children: [docx_1.PageNumber.CURRENT], size: 14, color: C.primary, bold: true, font: 'Calibri' }), new docx_1.TextRun({ text: ' / ', size: 14, color: C.muted, font: 'Calibri' }), new docx_1.TextRun({ children: [docx_1.PageNumber.TOTAL_PAGES], size: 14, color: C.primary, bold: true, font: 'Calibri' })] })] });
}
// =============================================================================
// 1. EXPORT APES (FormData MySQL)
//    data = résultat de formService.getFormById()
//    Champs SQL : project_name, project_date, auditors, location, period, status
//    Sections   : documentReview, fieldInspection, stakeholderInterview,
//                 genderAssessment, complaintMechanism
// =============================================================================
function buildCoverPage(data) {
    var _a, _b, _c, _d, _e;
    // ← project_name / project_date viennent de v_form_summary (snake_case)
    const date = data.project_date
        ? new Date(data.project_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
        : '—';
    const infoTable = new docx_1.Table({
        width: { size: 7000, type: docx_1.WidthType.DXA },
        columnWidths: [2800, 4200],
        rows: [
            ['Projet', (_a = data.project_name) !== null && _a !== void 0 ? _a : '—'],
            ['Lieu', (_b = data.location) !== null && _b !== void 0 ? _b : '—'],
            ['Période', (_c = data.period) !== null && _c !== void 0 ? _c : '—'],
            ['Date', date],
            ['Auditeurs', (_d = data.auditors) !== null && _d !== void 0 ? _d : '—'],
            ['Statut', ((_e = data.status) !== null && _e !== void 0 ? _e : 'draft').toUpperCase()],
        ].map(([label, val], i) => new docx_1.TableRow({
            children: [
                new docx_1.TableCell({ width: { size: 2800, type: docx_1.WidthType.DXA }, shading: { fill: C.primary, type: docx_1.ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 160, right: 160 }, borders: { top: { style: docx_1.BorderStyle.SINGLE, size: 2, color: C.white }, bottom: { style: docx_1.BorderStyle.SINGLE, size: 2, color: C.white }, left: NO_BORDER, right: { style: docx_1.BorderStyle.SINGLE, size: 4, color: C.accent } }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: label, bold: true, color: C.white, size: 20, font: 'Calibri' })] })] }),
                new docx_1.TableCell({ width: { size: 4200, type: docx_1.WidthType.DXA }, shading: { fill: i % 2 === 0 ? C.lightGray : C.white, type: docx_1.ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 160, right: 160 }, borders: { top: BORDER(), bottom: BORDER(), left: BORDER(), right: NO_BORDER }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: val, size: 20, color: C.text, font: 'Calibri' })] })] }),
            ],
        })),
    });
    return [
        new docx_1.Paragraph({ spacing: { before: 1800, after: 0 }, children: [] }),
        new docx_1.Paragraph({ alignment: docx_1.AlignmentType.CENTER, spacing: { after: 80 }, children: [new docx_1.TextRun({ text: "RAPPORT D'AUDIT", bold: true, size: 64, color: C.primary, font: 'Calibri' })] }),
        new docx_1.Paragraph({ alignment: docx_1.AlignmentType.CENTER, spacing: { after: 80 }, children: [new docx_1.TextRun({ text: 'ENVIRONNEMENTAL ET SOCIAL', bold: true, size: 48, color: C.secondary, font: 'Calibri' })] }),
        new docx_1.Paragraph({ alignment: docx_1.AlignmentType.CENTER, border: { bottom: { style: docx_1.BorderStyle.SINGLE, size: 16, color: C.accent, space: 1 } }, spacing: { after: 600 }, children: [] }),
        new docx_1.Paragraph({ alignment: docx_1.AlignmentType.CENTER, spacing: { after: 200 }, children: [] }),
        infoTable,
        pageBreak(),
    ];
}
function buildDocumentReview(data) {
    var _a, _b;
    const dr = data.documentReview;
    if (!dr)
        return [];
    // MySQL retourne JSON parsé ou string → _parseJson déjà fait dans FormService
    const documentsPresents = (_a = dr.documents_presents) !== null && _a !== void 0 ? _a : {};
    const documentsAnalysis = (_b = dr.documents_analysis) !== null && _b !== void 0 ? _b : {};
    const COL = [3200, 900, 3538, 2000];
    const ratingColor = { conforme: '1A7A4A', partiel: 'C07000', 'non-conforme': 'C0392B', 'n/a': C.muted };
    const rows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Document', COL[0]), hCell('Présent', COL[1], true), hCell('Observations', COL[2]), hCell('Conformité', COL[3], true)] }),
        ...Object.keys(documentsPresents).map((key, i) => {
            const present = documentsPresents[key];
            const analysis = documentsAnalysis[key];
            const rating = (analysis === null || analysis === void 0 ? void 0 : analysis.rating) || 'n/a';
            return new docx_1.TableRow({ children: [dCell(key, COL[0], { shade: i % 2 === 1 }), dCell(present ? '✓' : '✗', COL[1], { shade: i % 2 === 1, center: true, bold: true, color: present ? '1A7A4A' : 'C0392B' }), dCell((analysis === null || analysis === void 0 ? void 0 : analysis.findings) || '—', COL[2], { shade: i % 2 === 1 }), dCell(rating.toUpperCase(), COL[3], { shade: i % 2 === 1, center: true, bold: true, color: ratingColor[rating] || C.text })] });
        }),
    ];
    return [
        ...sectionTitle('01', 'Revue Documentaire'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL, rows }),
        spacer(160),
        ...(dr.documents_manquants ? [kvParagraph('Documents manquants', dr.documents_manquants)] : []),
        ...(dr.autres_documents ? [kvParagraph('Autres documents', dr.autres_documents)] : []),
        pageBreak(),
    ];
}
function buildInspectionCategory(title, items) {
    if (!items || Object.keys(items).length === 0)
        return [];
    const COL = [2800, 1400, 3638, 1800];
    const riskColor = { faible: '1A7A4A', moyen: 'C07000', élevé: 'C0392B', critique: '8B0000' };
    const rows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Élément inspecté', COL[0]), hCell('Statut', COL[1], true), hCell('Observations', COL[2]), hCell('Niveau de risque', COL[3], true)] }),
        ...Object.entries(items).map(([key, val], i) => {
            const riskKey = (val.risk || '').toLowerCase();
            const rColorK = Object.keys(riskColor).find(k => riskKey.includes(k));
            return new docx_1.TableRow({ children: [dCell(key, COL[0], { shade: i % 2 === 1 }), dCell(val.status, COL[1], { shade: i % 2 === 1, center: true }), dCell(val.observations, COL[2], { shade: i % 2 === 1 }), dCell(val.risk, COL[3], { shade: i % 2 === 1, center: true, bold: true, color: rColorK ? riskColor[rColorK] : C.text })] });
        }),
    ];
    return [...subTitle(title), new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL, rows }), spacer(200)];
}
function buildFieldInspection(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const fi = data.fieldInspection;
    if (!fi)
        return [];
    // Champs SQL : project_name, water_management, waste_management, health_safety, community
    return [
        ...sectionTitle('02', 'Inspection de Terrain'),
        ...subTitle('Informations générales'),
        kvParagraph('Projet', (_a = fi.project_name) !== null && _a !== void 0 ? _a : '—'),
        kvParagraph('Date', fi.date ? new Date(fi.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'),
        kvParagraph('Auditeurs', (_b = fi.auditors) !== null && _b !== void 0 ? _b : '—'),
        kvParagraph('Accompagnateurs', (_c = fi.accompaniers) !== null && _c !== void 0 ? _c : '—'),
        kvParagraph('Zones visitées', (fi.zones || []).join(', ') || '—'),
        spacer(240),
        ...buildInspectionCategory("Gestion de l'eau", (_d = fi.water_management) !== null && _d !== void 0 ? _d : {}),
        ...buildInspectionCategory('Gestion des déchets', (_e = fi.waste_management) !== null && _e !== void 0 ? _e : {}),
        ...buildInspectionCategory('Émissions', (_f = fi.emissions) !== null && _f !== void 0 ? _f : {}),
        ...buildInspectionCategory('Santé & Sécurité', (_g = fi.health_safety) !== null && _g !== void 0 ? _g : {}),
        ...buildInspectionCategory('Communauté', (_h = fi.community) !== null && _h !== void 0 ? _h : {}),
        pageBreak(),
    ];
}
function buildStakeholderInterview(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const si = data.stakeholderInterview;
    if (!si)
        return [];
    // Champs SQL : profile_name, profile_function, profile_gender, profile_age_range,
    //              stakeholder_type, consent_confidentiality, consent_notes, consent_recording,
    //              eval_quality, eval_frankness, eval_relevance, eval_climate
    const COL2 = [3200, 6438];
    const profileRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Champ', COL2[0]), hCell('Valeur', COL2[1])] }),
        ...[
            ["Nom complet", (_a = si.profile_name) !== null && _a !== void 0 ? _a : '—'],
            ["Fonction", (_b = si.profile_function) !== null && _b !== void 0 ? _b : '—'],
            ["Genre", (_c = si.profile_gender) !== null && _c !== void 0 ? _c : '—'],
            ["Tranche d'âge", (_d = si.profile_age_range) !== null && _d !== void 0 ? _d : '—'],
            ["Type partie prenante", (_e = si.stakeholder_type) !== null && _e !== void 0 ? _e : '—'],
            ["Lieu", (_f = si.location) !== null && _f !== void 0 ? _f : '—'],
            ["Durée", (_g = si.duration) !== null && _g !== void 0 ? _g : '—'],
            ["Date", si.date ? new Date(si.date).toLocaleDateString('fr-FR') : '—'],
        ].map(([k, v], i) => new docx_1.TableRow({ children: [dCell(k, COL2[0], { shade: i % 2 === 1, bold: true }), dCell(v, COL2[1], { shade: i % 2 === 1 })] })),
    ];
    const COL_C = [3200, 3219, 3219];
    const consentRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Confidentialité', COL_C[0]), hCell('Prise de notes', COL_C[1], true), hCell('Enregistrement', COL_C[2], true)] }),
        new docx_1.TableRow({ children: [
                dCell(si.consent_confidentiality ? '✓ Accordée' : '✗ Refusée', COL_C[0], { center: true, bold: true, color: si.consent_confidentiality ? '1A7A4A' : 'C0392B' }),
                dCell(si.consent_notes ? '✓ Accordée' : '✗ Refusée', COL_C[1], { center: true, bold: true, color: si.consent_notes ? '1A7A4A' : 'C0392B' }),
                dCell(si.consent_recording ? '✓ Accordée' : '✗ Refusée', COL_C[2], { center: true, bold: true, color: si.consent_recording ? '1A7A4A' : 'C0392B' }),
            ] }),
    ];
    const responses = (_h = si.responses) !== null && _h !== void 0 ? _h : {};
    const responseRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Question', COL2[0]), hCell('Réponse', COL2[1])] }),
        ...Object.keys(responses).map((k, i) => new docx_1.TableRow({ children: [dCell(k, COL2[0], { shade: i % 2 === 1, bold: true }), dCell(responses[k], COL2[1], { shade: i % 2 === 1 })] })),
    ];
    const EVAL_COL = [2400, 2000, 5238];
    const evalEntries = [
        ['Qualité', (_j = si.eval_quality) !== null && _j !== void 0 ? _j : 0],
        ['Franchise', (_k = si.eval_frankness) !== null && _k !== void 0 ? _k : 0],
        ['Pertinence', (_l = si.eval_relevance) !== null && _l !== void 0 ? _l : 0],
        ['Climat', (_m = si.eval_climate) !== null && _m !== void 0 ? _m : 0],
    ];
    const evalRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Critère', EVAL_COL[0]), hCell('Note /5', EVAL_COL[1], true), hCell('Représentation', EVAL_COL[2])] }),
        ...evalEntries.map(([k, v], i) => new docx_1.TableRow({ children: [dCell(k, EVAL_COL[0], { shade: i % 2 === 1, bold: true }), dCell(String(v), EVAL_COL[1], { shade: i % 2 === 1, center: true, bold: true, color: C.secondary }), dCell('★'.repeat(v) + '☆'.repeat(5 - v), EVAL_COL[2], { shade: i % 2 === 1, color: C.secondary })] })),
    ];
    return [
        ...sectionTitle('03', 'Entretiens Parties Prenantes'),
        ...subTitle("Profil de l'interviewé(e)"),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL2, rows: profileRows }),
        spacer(200),
        ...subTitle('Consentements recueillis'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL_C, rows: consentRows }),
        spacer(200),
        ...subTitle('Réponses aux questions'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL2, rows: responseRows }),
        spacer(200),
        ...subTitle("Évaluation de la qualité de l'entretien"),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: EVAL_COL, rows: evalRows }),
        spacer(160),
        pageBreak(),
    ];
}
function buildGenderAssessment(data) {
    var _a, _b, _c, _d;
    const ga = data.genderAssessment;
    if (!ga)
        return [];
    // Champs SQL : quantitative_data (JSON), objectives[], consultations[], impacts[], recommendations[]
    const OBJ_COL = [3800, 3000, 2838];
    const objRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Objectif', OBJ_COL[0]), hCell('Indicateur', OBJ_COL[1]), hCell('Statut', OBJ_COL[2], true)] }),
        ...((_a = ga.objectives) !== null && _a !== void 0 ? _a : []).map((o, i) => new docx_1.TableRow({ children: [dCell(o.objective, OBJ_COL[0], { shade: i % 2 === 1 }), dCell(o.indicator, OBJ_COL[1], { shade: i % 2 === 1 }), dCell(o.status, OBJ_COL[2], { shade: i % 2 === 1, center: true, bold: true })] })),
    ];
    const QT_COL = [2638, 1500, 1500, 1500, 2500];
    const qtRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Catégorie', QT_COL[0]), hCell('Femmes', QT_COL[1], true), hCell('Hommes', QT_COL[2], true), hCell('Autres', QT_COL[3], true), hCell('Source', QT_COL[4])] }),
        ...Object.entries((_b = ga.quantitative_data) !== null && _b !== void 0 ? _b : {}).map(([k, v], i) => new docx_1.TableRow({ children: [dCell(k, QT_COL[0], { shade: i % 2 === 1, bold: true }), dCell(String(v.women), QT_COL[1], { shade: i % 2 === 1, center: true }), dCell(String(v.men), QT_COL[2], { shade: i % 2 === 1, center: true }), dCell(String(v.other), QT_COL[3], { shade: i % 2 === 1, center: true }), dCell(v.source, QT_COL[4], { shade: i % 2 === 1 })] })),
    ];
    const CONS_COL = [2638, 1500, 2000, 3500];
    const consRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Groupe', CONS_COL[0]), hCell('Sessions', CONS_COL[1], true), hCell('Participants', CONS_COL[2], true), hCell('Méthode', CONS_COL[3])] }),
        ...((_c = ga.consultations) !== null && _c !== void 0 ? _c : []).map((c, i) => new docx_1.TableRow({ children: [dCell(c.group, CONS_COL[0], { shade: i % 2 === 1, bold: true }), dCell(String(c.sessions), CONS_COL[1], { shade: i % 2 === 1, center: true }), dCell(String(c.participants), CONS_COL[2], { shade: i % 2 === 1, center: true }), dCell(c.method, CONS_COL[3], { shade: i % 2 === 1 })] })),
    ];
    const REC_COL = [3300, 1300, 1500, 1838, 1700];
    const recRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Recommandation', REC_COL[0]), hCell('Priorité', REC_COL[1], true), hCell('Portée', REC_COL[2], true), hCell('Responsable', REC_COL[3]), hCell('Échéance', REC_COL[4], true)] }),
        ...((_d = ga.recommendations) !== null && _d !== void 0 ? _d : []).map((r, i) => new docx_1.TableRow({ children: [dCell(r.recommendation, REC_COL[0], { shade: i % 2 === 1 }), dCell(r.priority, REC_COL[1], { shade: i % 2 === 1, center: true, bold: true }), dCell(r.scope, REC_COL[2], { shade: i % 2 === 1, center: true }), dCell(r.responsible, REC_COL[3], { shade: i % 2 === 1 }), dCell(r.deadline, REC_COL[4], { shade: i % 2 === 1, center: true })] })),
    ];
    return [
        ...sectionTitle('04', 'Évaluation Genre'),
        ...subTitle('Objectifs de genre'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: OBJ_COL, rows: objRows }),
        spacer(200),
        ...subTitle('Données quantitatives'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: QT_COL, rows: qtRows }),
        spacer(200),
        ...subTitle('Consultations réalisées'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: CONS_COL, rows: consRows }),
        spacer(200),
        ...subTitle('Recommandations'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: REC_COL, rows: recRows }),
        spacer(160),
        pageBreak(),
    ];
}
function buildComplaintMechanism(data) {
    var _a, _b, _c, _d, _e;
    const cm = data.complaintMechanism;
    if (!cm)
        return [];
    // Champs SQL : documentary_basis, key_criteria, strengths[], weaknesses[], recommendations[], global_conclusion
    const DOC_COL = [2638, 3500, 3500];
    const docRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Document', DOC_COL[0]), hCell('Constat', DOC_COL[1]), hCell('Évaluation', DOC_COL[2])] }),
        ...Object.entries((_a = cm.documentary_basis) !== null && _a !== void 0 ? _a : {}).map(([k, v], i) => new docx_1.TableRow({ children: [dCell(k, DOC_COL[0], { shade: i % 2 === 1, bold: true }), dCell(v.finding, DOC_COL[1], { shade: i % 2 === 1 }), dCell(v.evaluation, DOC_COL[2], { shade: i % 2 === 1 })] })),
    ];
    const CRIT_COL = [3819, 5819];
    const critRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Critère', CRIT_COL[0]), hCell('Évaluation', CRIT_COL[1])] }),
        ...Object.entries((_b = cm.key_criteria) !== null && _b !== void 0 ? _b : {}).map(([k, v], i) => new docx_1.TableRow({ children: [dCell(k, CRIT_COL[0], { shade: i % 2 === 1, bold: true }), dCell(v.evaluation, CRIT_COL[1], { shade: i % 2 === 1 })] })),
    ];
    const sevColor = { faible: '1A7A4A', modérée: 'C07000', élevée: 'C0392B', critique: '8B0000' };
    const WEAK_COL = [3400, 3638, 2600];
    const weakRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Déficience', WEAK_COL[0]), hCell('Conséquence', WEAK_COL[1]), hCell('Sévérité', WEAK_COL[2], true)] }),
        ...((_c = cm.weaknesses) !== null && _c !== void 0 ? _c : []).map((w, i) => {
            const sev = (w.severity || '').toLowerCase();
            const sColorK = Object.keys(sevColor).find(k => sev.includes(k));
            return new docx_1.TableRow({ children: [dCell(w.deficiency, WEAK_COL[0], { shade: i % 2 === 1 }), dCell(w.consequence, WEAK_COL[1], { shade: i % 2 === 1 }), dCell(w.severity, WEAK_COL[2], { shade: i % 2 === 1, center: true, bold: true, color: sColorK ? sevColor[sColorK] : C.text })] });
        }),
    ];
    const REC_COL = [3638, 1500, 2300, 2200];
    const recRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Recommandation', REC_COL[0]), hCell('Priorité', REC_COL[1], true), hCell('Responsable', REC_COL[2]), hCell('Échéance', REC_COL[3], true)] }),
        ...((_d = cm.recommendations) !== null && _d !== void 0 ? _d : []).map((r, i) => new docx_1.TableRow({ children: [dCell(r.recommendation, REC_COL[0], { shade: i % 2 === 1 }), dCell(r.priority, REC_COL[1], { shade: i % 2 === 1, center: true, bold: true }), dCell(r.responsible, REC_COL[2], { shade: i % 2 === 1 }), dCell(r.deadline, REC_COL[3], { shade: i % 2 === 1, center: true })] })),
    ];
    return [
        ...sectionTitle('05', 'Mécanisme de Plainte'),
        ...subTitle('Base documentaire'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: DOC_COL, rows: docRows }),
        spacer(200),
        ...subTitle("Critères clés d'évaluation"),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: CRIT_COL, rows: critRows }),
        spacer(200),
        ...subTitle('Points forts identifiés'),
        ...((_e = cm.strengths) !== null && _e !== void 0 ? _e : []).map((s) => new docx_1.Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 60 }, children: [new docx_1.TextRun({ text: s, size: 20, font: 'Calibri', color: C.text })] })),
        spacer(200),
        ...subTitle('Faiblesses et risques'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: WEAK_COL, rows: weakRows }),
        spacer(200),
        ...subTitle('Recommandations'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: REC_COL, rows: recRows }),
        spacer(240),
        ...subTitle('Conclusion générale'),
        new docx_1.Paragraph({ spacing: { after: 160 }, border: { left: { style: docx_1.BorderStyle.SINGLE, size: 12, color: C.accent, space: 20 } }, indent: { left: 280 }, children: [new docx_1.TextRun({ text: cm.global_conclusion || '—', size: 20, color: C.text, font: 'Calibri', italics: true })] }),
    ];
}
function generateFormDataWordDocument(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        const projectName = (_a = data.project_name) !== null && _a !== void 0 ? _a : 'Projet'; // ← snake_case
        const doc = new docx_1.Document({
            numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: docx_1.LevelFormat.BULLET, text: '•', alignment: docx_1.AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
            styles: {
                default: { document: { run: { font: 'Calibri', size: 20, color: C.text } } },
                paragraphStyles: [
                    { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 30, bold: true, font: 'Calibri', color: C.primary }, paragraph: { spacing: { before: 480, after: 60 }, outlineLevel: 0 } },
                    { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 22, bold: true, font: 'Calibri', color: C.secondary }, paragraph: { spacing: { before: 280, after: 80 }, outlineLevel: 1 } },
                ],
            },
            sections: [
                { properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } }, children: buildCoverPage(data) },
                { properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: Object.assign(Object.assign({}, PAGE.margin), { top: 1440, bottom: 1440 }) } }, headers: { default: buildHeader(projectName) }, footers: { default: buildFooter(generatedAt) }, children: [...buildDocumentReview(data), ...buildFieldInspection(data), ...buildStakeholderInterview(data), ...buildGenderAssessment(data), ...buildComplaintMechanism(data)] },
            ],
        });
        return docx_1.Packer.toBuffer(doc);
    });
}
// =============================================================================
// 2. EXPORT CHECKLIST AUDIT
//    data = résultat de formService.getChecklistAuditById()
//    Champs SQL : subprojet, auditeurs, date, synth_*, section1..section6 (reconstitués)
// =============================================================================
function buildCritereTable(items) {
    if (!(items === null || items === void 0 ? void 0 : items.length))
        return [];
    const COL = [800, 3000, 2000, 2000, 1838];
    const cConf = (c) => { var _a; return ((_a = { O: C.green, N: C.red, P: C.yellow }[c]) !== null && _a !== void 0 ? _a : C.muted); };
    const lConf = (c) => { var _a; return ((_a = { O: 'Conforme', N: 'Non conforme', P: 'Partiel' }[c]) !== null && _a !== void 0 ? _a : 'S.O.'); };
    const rows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('N°', COL[0], true), hCell('Critère', COL[1]), hCell('Sources/Méthode', COL[2]), hCell('Observations', COL[3]), hCell('Conformité', COL[4], true)] }),
        ...items.map((item, i) => { var _a, _b; return new docx_1.TableRow({ children: [dCell(item.numero, COL[0], { shade: i % 2 === 1, center: true }), dCell(item.critere, COL[1], { shade: i % 2 === 1 }), dCell((_a = item.sources_methode) !== null && _a !== void 0 ? _a : '—', COL[2], { shade: i % 2 === 1 }), dCell((_b = item.observations) !== null && _b !== void 0 ? _b : '—', COL[3], { shade: i % 2 === 1 }), dCell(lConf(item.conformite), COL[4], { shade: i % 2 === 1, center: true, bold: true, color: cConf(item.conformite) })] }); }),
    ];
    return [new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL, rows }), spacer(160)];
}
function buildDocumentAuditTable(items) {
    if (!(items === null || items === void 0 ? void 0 : items.length))
        return [];
    const COL = [800, 3000, 1500, 4338];
    const cDisp = (d) => { var _a; return ((_a = { O: C.green, N: C.red, P: C.yellow }[d]) !== null && _a !== void 0 ? _a : C.muted); };
    const lDisp = (d) => { var _a; return ((_a = { O: 'Disponible', N: 'Non disponible', P: 'Partiel' }[d]) !== null && _a !== void 0 ? _a : 'S.O.'); };
    const rows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('N°', COL[0], true), hCell('Document', COL[1]), hCell('Disponible', COL[2], true), hCell('Commentaires', COL[3])] }),
        ...items.map((item, i) => new docx_1.TableRow({ children: [dCell(item.numero, COL[0], { shade: i % 2 === 1, center: true }), dCell(item.document, COL[1], { shade: i % 2 === 1 }), dCell(lDisp(item.disponible), COL[2], { shade: i % 2 === 1, center: true, bold: true, color: cDisp(item.disponible) }), dCell(item.commentaires || '—', COL[3], { shade: i % 2 === 1 })] })),
    ];
    return [new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL, rows }), spacer(160)];
}
function exportChecklistAuditWord(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        // _buildAuditResponse dans FormService reconstitue section1_cadreJuridique, section2_infraSecurite, etc.
        // Ces champs camelCase sont conservés pour la compatibilité avec le service Word
        const doc = new docx_1.Document({
            sections: [
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
                    children: [
                        new docx_1.Paragraph({ spacing: { before: 1800, after: 0 }, children: [] }),
                        new docx_1.Paragraph({ alignment: docx_1.AlignmentType.CENTER, spacing: { after: 80 }, children: [new docx_1.TextRun({ text: "CHECKLIST D'AUDIT", bold: true, size: 64, color: C.primary, font: 'Calibri' })] }),
                        new docx_1.Paragraph({ alignment: docx_1.AlignmentType.CENTER, spacing: { after: 80 }, children: [new docx_1.TextRun({ text: 'ENVIRONNEMENTAL ET SOCIAL', bold: true, size: 48, color: C.secondary, font: 'Calibri' })] }),
                        new docx_1.Paragraph({ alignment: docx_1.AlignmentType.CENTER, border: { bottom: { style: docx_1.BorderStyle.SINGLE, size: 16, color: C.accent, space: 1 } }, spacing: { after: 600 }, children: [] }),
                        new docx_1.Table({ width: { size: 7000, type: docx_1.WidthType.DXA }, columnWidths: [2800, 4200], rows: [['Sous-projet', data.subprojet], ['Auditeurs', data.auditeurs], ['Date', data.date ? new Date(data.date).toLocaleDateString('fr-FR') : '—']].map(([label, val], i) => new docx_1.TableRow({ children: [new docx_1.TableCell({ width: { size: 2800, type: docx_1.WidthType.DXA }, shading: { fill: C.primary }, margins: CELL_MARGINS, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: label, bold: true, color: C.white, size: 20, font: 'Calibri' })] })] }), new docx_1.TableCell({ width: { size: 4200, type: docx_1.WidthType.DXA }, shading: { fill: i % 2 === 0 ? C.lightGray : C.white }, margins: CELL_MARGINS, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: val, size: 20, color: C.text, font: 'Calibri' })] })] })] })) }),
                        pageBreak(),
                    ],
                },
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: Object.assign(Object.assign({}, PAGE.margin), { top: 1440, bottom: 1440 }) } },
                    headers: { default: buildHeader("CHECKLIST D'AUDIT") },
                    footers: { default: buildFooter(generatedAt) },
                    children: [
                        ...sectionTitle('01', 'Cadre juridique, administratif et foncier'),
                        ...buildCritereTable(data.section1_cadreJuridique),
                        ...sectionTitle('02', 'Conception, structure et sécurité'),
                        ...subTitle('Stabilité de la structure'), ...buildCritereTable((_a = data.section2_infraSecurite) === null || _a === void 0 ? void 0 : _a.stabiliteStructure),
                        ...subTitle('Sécurité incendie'), ...buildCritereTable((_b = data.section2_infraSecurite) === null || _b === void 0 ? void 0 : _b.securiteIncendie),
                        ...subTitle('Accessibilité PMR'), ...buildCritereTable((_c = data.section2_infraSecurite) === null || _c === void 0 ? void 0 : _c.accessibilitePMR),
                        ...sectionTitle('03', 'Gestion environnementale et sociale du chantier'),
                        ...subTitle('Gestion des déchets'), ...buildCritereTable((_d = data.section3_gestionEnvSociale) === null || _d === void 0 ? void 0 : _d.gestionDechets),
                        ...subTitle('Nuisances et pollution'), ...buildCritereTable((_e = data.section3_gestionEnvSociale) === null || _e === void 0 ? void 0 : _e.nuisancesPollution),
                        ...subTitle('Santé et sécurité travailleurs'), ...buildCritereTable((_f = data.section3_gestionEnvSociale) === null || _f === void 0 ? void 0 : _f.santeSecuteTravailleurs),
                        ...sectionTitle('04', 'Gestion sociale et parties prenantes'),
                        ...subTitle('Relations avec les communautés'), ...buildCritereTable((_g = data.section4_gestionSociale) === null || _g === void 0 ? void 0 : _g.relationsCommunautes),
                        ...subTitle('MGP'), ...buildCritereTable((_h = data.section4_gestionSociale) === null || _h === void 0 ? void 0 : _h.mgp),
                        ...sectionTitle('05', 'Analyse des risques liés au futur ERP'),
                        ...subTitle('Sécurité / Sûreté'), ...buildCritereTable((_j = data.section5_risquesERP) === null || _j === void 0 ? void 0 : _j.securiteSurete),
                        ...subTitle('Hygiène et environnement'), ...buildCritereTable((_k = data.section5_risquesERP) === null || _k === void 0 ? void 0 : _k.hygieneEnvironnement),
                        ...sectionTitle('06', 'Bilan documentaire'),
                        ...buildDocumentAuditTable(data.section6_bilanDocumentaire),
                        ...sectionTitle('07', 'Synthèse'),
                        // synthese reconstitué par _buildAuditResponse avec les clés camelCase
                        kvParagraph('Nombre de non-conformités majeures', String((_m = (_l = data.synthese) === null || _l === void 0 ? void 0 : _l.nombreNonConformitesMajeures) !== null && _m !== void 0 ? _m : 0)),
                        kvParagraph('Domaines critiques', (_p = (_o = data.synthese) === null || _o === void 0 ? void 0 : _o.domainesCritiques) !== null && _p !== void 0 ? _p : '—'),
                        kvParagraph("Signature de l'auditeur", (_r = (_q = data.synthese) === null || _q === void 0 ? void 0 : _q.signatureAuditeur) !== null && _r !== void 0 ? _r : '—'),
                        spacer(240),
                    ],
                },
            ],
        });
        return docx_1.Packer.toBuffer(doc);
    });
}
// =============================================================================
// 3. EXPORT CHECKLIST CONDUCTEUR
//    data = résultat de formService.getChecklistConducteurById()
//    Champs SQL : personne_rencontree, duree_entretien, commentaires_libres, signature_auditeur
//    Sections reconstitués camelCase par _buildConducteurResponse
// =============================================================================
function buildQuestionTableConducteur(items) {
    if (!(items === null || items === void 0 ? void 0 : items.length))
        return [];
    const COL = [600, 3500, 1000, 1800, 2738];
    const rC = (r) => { var _a; return ((_a = { oui: C.green, non: C.red, partiellement: C.yellow, nsp: C.secondary }[r]) !== null && _a !== void 0 ? _a : C.muted); };
    const rL = (r) => { var _a; return ((_a = { oui: 'Oui', non: 'Non', partiellement: 'Partiel', nsp: 'NSP' }[r]) !== null && _a !== void 0 ? _a : 'S.O.'); };
    const rows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('N°', COL[0], true), hCell('Question', COL[1]), hCell('Réponse', COL[2], true), hCell('Réponse détaillée', COL[3]), hCell('Observations', COL[4])] }),
        ...items.map((item, i) => new docx_1.TableRow({ children: [dCell(item.numero, COL[0], { shade: i % 2 === 1, center: true }), dCell(item.question, COL[1], { shade: i % 2 === 1 }), dCell(rL(item.reponse_booleenne), COL[2], { shade: i % 2 === 1, center: true, bold: true, color: rC(item.reponse_booleenne) }), dCell(item.reponse || '—', COL[3], { shade: i % 2 === 1 }), dCell(item.observations || '—', COL[4], { shade: i % 2 === 1 })] })),
    ];
    return [new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL, rows }), spacer(160)];
}
const SECTIONS_CONDUCTEUR = [
    { key: 'section1_infoGenerales', num: '01', title: 'Informations générales et rôle' },
    { key: 'section2_processusInitialT1', num: '02', title: 'Processus environnemental et social initial' },
    { key: 'section3_installationT2', num: '03', title: 'Installation et organisation du chantier' },
    { key: 'section4_recrutementT2', num: '04', title: 'Recrutement et conditions de travail' },
    { key: 'section5_hseT2', num: '05', title: 'Santé et sécurité au travail (HSE)' },
    { key: 'section6_gestionEnvT2', num: '06', title: 'Gestion environnementale du chantier' },
    { key: 'section7_sensibilisationT2', num: '07', title: 'Campagnes de sensibilisation VIH/SIDA' },
    { key: 'section8_mgpT2', num: '08', title: 'Mécanisme de gestion des plaintes (MGP)' },
    { key: 'section9_fermetureT2', num: '09', title: 'Fermeture et repli du chantier' },
    { key: 'section10_exploitationT3', num: '10', title: "Exploitation actuelle et retour d'expérience" },
    { key: 'section11_synthese', num: '11', title: 'Synthèse et recommandations' },
];
function exportChecklistConducteurWord(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        const doc = new docx_1.Document({
            sections: [
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
                    children: [
                        new docx_1.Paragraph({ spacing: { before: 1800, after: 0 }, children: [] }),
                        new docx_1.Paragraph({ alignment: docx_1.AlignmentType.CENTER, spacing: { after: 80 }, children: [new docx_1.TextRun({ text: 'CHECKLIST CONDUCTEUR', bold: true, size: 64, color: C.primary, font: 'Calibri' })] }),
                        new docx_1.Paragraph({ alignment: docx_1.AlignmentType.CENTER, spacing: { after: 80 }, children: [new docx_1.TextRun({ text: 'DES TRAVAUX', bold: true, size: 48, color: C.secondary, font: 'Calibri' })] }),
                        new docx_1.Paragraph({ alignment: docx_1.AlignmentType.CENTER, border: { bottom: { style: docx_1.BorderStyle.SINGLE, size: 16, color: C.accent, space: 1 } }, spacing: { after: 600 }, children: [] }),
                        new docx_1.Table({ width: { size: 7000, type: docx_1.WidthType.DXA }, columnWidths: [2800, 4200], rows: [
                                ['Sous-projet', (_a = data.subprojet) !== null && _a !== void 0 ? _a : '—'],
                                ['Auditeur', (_b = data.auditeur) !== null && _b !== void 0 ? _b : '—'],
                                ['Entreprise', (_c = data.entreprise) !== null && _c !== void 0 ? _c : '—'],
                                ['Personne rencontrée', (_d = data.personne_rencontree) !== null && _d !== void 0 ? _d : '—'], // ← snake_case
                                ['Fonction', (_e = data.fonction) !== null && _e !== void 0 ? _e : '—'],
                                ['Date', data.date ? new Date(data.date).toLocaleDateString('fr-FR') : '—'],
                            ].map(([label, val], i) => new docx_1.TableRow({ children: [new docx_1.TableCell({ width: { size: 2800, type: docx_1.WidthType.DXA }, shading: { fill: C.primary }, margins: CELL_MARGINS, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: label, bold: true, color: C.white, size: 20, font: 'Calibri' })] })] }), new docx_1.TableCell({ width: { size: 4200, type: docx_1.WidthType.DXA }, shading: { fill: i % 2 === 0 ? C.lightGray : C.white }, margins: CELL_MARGINS, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: val, size: 20, color: C.text, font: 'Calibri' })] })] })] })) }),
                        pageBreak(),
                    ],
                },
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: Object.assign(Object.assign({}, PAGE.margin), { top: 1440, bottom: 1440 }) } },
                    headers: { default: buildHeader('CHECKLIST CONDUCTEUR DES TRAVAUX') },
                    footers: { default: buildFooter(generatedAt) },
                    children: [
                        ...subTitle("Informations de l'entretien"),
                        kvParagraph('Contact', (_f = data.contact) !== null && _f !== void 0 ? _f : '—'),
                        kvParagraph("Durée de l'entretien", (_g = data.duree_entretien) !== null && _g !== void 0 ? _g : '—'), // ← snake_case
                        kvParagraph('Lieu', (_h = data.lieu) !== null && _h !== void 0 ? _h : '—'),
                        spacer(240),
                        ...SECTIONS_CONDUCTEUR.flatMap(s => {
                            const items = data[s.key];
                            if (!(items === null || items === void 0 ? void 0 : items.length))
                                return [];
                            return [...sectionTitle(s.num, s.title), ...buildQuestionTableConducteur(items)];
                        }),
                        ...sectionTitle('12', 'Commentaires libres'),
                        new docx_1.Paragraph({ spacing: { after: 160 }, border: { left: { style: docx_1.BorderStyle.SINGLE, size: 12, color: C.accent, space: 20 } }, indent: { left: 280 }, children: [new docx_1.TextRun({ text: data.commentaires_libres || '—', size: 20, color: C.text, font: 'Calibri', italics: true })] }), // ← snake_case
                        spacer(240),
                        ...sectionTitle('13', 'Signature'),
                        kvParagraph("Signature de l'auditeur", (_j = data.signature_auditeur) !== null && _j !== void 0 ? _j : '—'), // ← snake_case
                        spacer(240),
                    ],
                },
            ],
        });
        return docx_1.Packer.toBuffer(doc);
    });
}
// =============================================================================
// 4. EXPORT GUIDE D'ENTRETIEN
//    data = résultat de formService.getGuideEntretienById()
//    Champs SQL : guide_type, gi_nom, gi_fonction, gi_date, gi_lieu,
//                 gi_type_entretien, gi_employeur, gi_type_contrat, notes_auditeur
//    Thèmes reconstitués camelCase par _buildGuideResponse (theme1..theme4)
// =============================================================================
function buildThemeTable(theme, showNuisances = false) {
    var _a;
    const questions = (_a = theme === null || theme === void 0 ? void 0 : theme.questions) !== null && _a !== void 0 ? _a : [];
    if (!questions.length)
        return [];
    const COL = showNuisances ? [600, 3200, 2000, 2000, 1838] : [600, 4000, 2500, 2538];
    const headers = showNuisances ? ['N°', 'Question', 'Réponse', 'Nuisances observées', 'Notes'] : ['N°', 'Question', 'Réponse', 'Notes'];
    const rows = [
        new docx_1.TableRow({ tableHeader: true, children: headers.map((h, i) => hCell(h, COL[i], i === 0 || i === 2)) }),
        ...questions.map((q, i) => {
            var _a, _b, _c, _d;
            const shade = i % 2 === 1;
            const notes = (_b = (_a = q.observations) !== null && _a !== void 0 ? _a : q.notes) !== null && _b !== void 0 ? _b : '—';
            let nuisancesText = '—';
            if (showNuisances && q.nuisancesObservees) {
                const n = q.nuisancesObservees;
                nuisancesText = [n.poussiere && '✓ Poussière', n.bruit && '✓ Bruit', n.circulation && '✓ Circulation', n.odeurs && '✓ Odeurs', n.dechets && '✓ Déchets'].filter(Boolean).join(', ') || 'Aucune';
            }
            if (showNuisances) {
                return new docx_1.TableRow({ children: [dCell((_c = q.questionId) !== null && _c !== void 0 ? _c : q.question_id, COL[0], { shade, center: true }), dCell(q.question, COL[1], { shade }), dCell(q.reponse || '—', COL[2], { shade }), dCell(nuisancesText, COL[3], { shade }), dCell(notes, COL[4], { shade })] });
            }
            return new docx_1.TableRow({ children: [dCell((_d = q.questionId) !== null && _d !== void 0 ? _d : q.question_id, COL[0], { shade, center: true }), dCell(q.question, COL[1], { shade }), dCell(q.reponse || '—', COL[2], { shade }), dCell(notes, COL[3], { shade })] });
        }),
    ];
    return [new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL, rows }), spacer(200)];
}
function exportGuideEntretienWord(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        const guideType = (_a = data.guide_type) !== null && _a !== void 0 ? _a : ''; // ← snake_case
        const isRiverains = guideType === 'riverains_communaute';
        const guideLabels = {
            autorites_locales: 'Autorités Locales', riverains_communaute: 'Riverains / Communauté',
            travailleurs_chantier: 'Travailleurs du Chantier', maitrise_ouvrage_entreprise: "Maîtrise d'Ouvrage / Entreprise",
            direction_cfpt: 'Direction du CFPT',
        };
        const infoRows = [
            ['Sous-projet', (_b = data.subprojet) !== null && _b !== void 0 ? _b : '—'],
            ['Type de guide', (_c = guideLabels[guideType]) !== null && _c !== void 0 ? _c : guideType],
            ['Nom', (_d = data.gi_nom) !== null && _d !== void 0 ? _d : '—'], // ← snake_case
            ['Fonction', (_e = data.gi_fonction) !== null && _e !== void 0 ? _e : '—'],
            ['Contact', (_f = data.gi_contact) !== null && _f !== void 0 ? _f : '—'],
            ['Date', data.gi_date ? new Date(data.gi_date).toLocaleDateString('fr-FR') : '—'],
            ['Lieu', (_g = data.gi_lieu) !== null && _g !== void 0 ? _g : '—'],
            ...(data.gi_type_entretien ? [['Type entretien', data.gi_type_entretien === 'focus_group' ? 'Focus Group' : 'Individuel']] : []),
            ...(data.gi_employeur ? [['Employeur', data.gi_employeur]] : []),
            ...(data.gi_type_contrat ? [['Type contrat', data.gi_type_contrat.toUpperCase()]] : []),
        ];
        const theme2Titles = {
            autorites_locales: 'Perception du projet', riverains_communaute: 'Nuisances des travaux',
            travailleurs_chantier: 'EPI et santé sécurité', maitrise_ouvrage_entreprise: 'Gestion E&S',
            direction_cfpt: "Accessibilité et sécurité de l'ERP",
        };
        const theme3Titles = {
            autorites_locales: 'Gestion des plaintes', riverains_communaute: 'Gestion des plaintes',
            travailleurs_chantier: "Conditions d'emploi et MGP", maitrise_ouvrage_entreprise: 'Gestion des travailleurs',
            direction_cfpt: 'Gestion quotidienne du CFPT',
        };
        const theme4Titles = {
            riverains_communaute: 'Attentes pour le futur', maitrise_ouvrage_entreprise: 'Relations riverains et MGP',
        };
        const doc = new docx_1.Document({
            sections: [
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
                    children: [
                        new docx_1.Paragraph({ spacing: { before: 1800, after: 0 }, children: [] }),
                        new docx_1.Paragraph({ alignment: docx_1.AlignmentType.CENTER, spacing: { after: 80 }, children: [new docx_1.TextRun({ text: "GUIDE D'ENTRETIEN", bold: true, size: 64, color: C.primary, font: 'Calibri' })] }),
                        new docx_1.Paragraph({ alignment: docx_1.AlignmentType.CENTER, spacing: { after: 80 }, children: [new docx_1.TextRun({ text: 'PARTIES PRENANTES', bold: true, size: 48, color: C.secondary, font: 'Calibri' })] }),
                        new docx_1.Paragraph({ alignment: docx_1.AlignmentType.CENTER, border: { bottom: { style: docx_1.BorderStyle.SINGLE, size: 16, color: C.accent, space: 1 } }, spacing: { after: 600 }, children: [] }),
                        new docx_1.Table({ width: { size: 7000, type: docx_1.WidthType.DXA }, columnWidths: [2800, 4200], rows: infoRows.map(([label, val], i) => new docx_1.TableRow({ children: [new docx_1.TableCell({ width: { size: 2800, type: docx_1.WidthType.DXA }, shading: { fill: C.primary }, margins: CELL_MARGINS, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: label, bold: true, color: C.white, size: 20, font: 'Calibri' })] })] }), new docx_1.TableCell({ width: { size: 4200, type: docx_1.WidthType.DXA }, shading: { fill: i % 2 === 0 ? C.lightGray : C.white }, margins: CELL_MARGINS, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: val, size: 20, color: C.text, font: 'Calibri' })] })] })] })) }),
                        pageBreak(),
                    ],
                },
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: Object.assign(Object.assign({}, PAGE.margin), { top: 1440, bottom: 1440 }) } },
                    headers: { default: buildHeader("GUIDE D'ENTRETIEN") },
                    footers: { default: buildFooter(generatedAt) },
                    children: [
                        ...sectionTitle('01', guideType === 'autorites_locales' ? 'Statut foncier' : 'Information et perception'),
                        ...buildThemeTable(data.theme1, false),
                        ...sectionTitle('02', (_h = theme2Titles[guideType]) !== null && _h !== void 0 ? _h : 'Thème 2'),
                        ...buildThemeTable(data.theme2, isRiverains),
                        ...sectionTitle('03', (_j = theme3Titles[guideType]) !== null && _j !== void 0 ? _j : 'Thème 3'),
                        ...buildThemeTable(data.theme3, false),
                        ...(data.theme4 ? [...sectionTitle('04', (_k = theme4Titles[guideType]) !== null && _k !== void 0 ? _k : 'Thème 4'), ...buildThemeTable(data.theme4, false)] : []),
                        ...sectionTitle('05', "Notes de l'auditeur"),
                        new docx_1.Paragraph({ spacing: { after: 160 }, border: { left: { style: docx_1.BorderStyle.SINGLE, size: 12, color: C.accent, space: 20 } }, indent: { left: 280 }, children: [new docx_1.TextRun({ text: data.notes_auditeur || '—', size: 20, color: C.text, font: 'Calibri', italics: true })] }), // ← snake_case
                        spacer(240),
                    ],
                },
            ],
        });
        return docx_1.Packer.toBuffer(doc);
    });
}
//# sourceMappingURL=words.service.js.map