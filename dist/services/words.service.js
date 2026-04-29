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
const docx_1 = require("docx");
// ─── Palette & constantes ────────────────────────────────────────────────────
const C = {
    primary: '1B3A5C', // bleu marine profond
    secondary: '2E75B6', // bleu moyen
    accent: '00B0A0', // teal pour séparateurs
    headerBg: '1B3A5C', // fond en-tête tableau = primary
    headerText: 'FFFFFF', // texte en-tête tableau
    subBg: 'D6E4F0', // fond sous-en-tête
    altRow: 'F0F6FB', // ligne alternée
    white: 'FFFFFF',
    lightGray: 'F5F5F5',
    borderCol: 'B8CCE4',
    muted: '6B7A8D',
    text: '1A1A2E',
};
// Page A4 avec marges 2cm
const PAGE = {
    width: 11906,
    height: 16838,
    margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }, // ~2cm
};
// Largeur utile = 11906 - 1134*2 = 9638 DXA
const TW = 9638;
const BORDER = (color = C.borderCol) => ({ style: docx_1.BorderStyle.SINGLE, size: 4, color });
const NO_BORDER = { style: docx_1.BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const CELL_MARGINS = { top: 100, bottom: 100, left: 140, right: 140 };
// ─── Helpers tableaux ────────────────────────────────────────────────────────
function hCell(text, width, center = false) {
    return new docx_1.TableCell({
        width: { size: width, type: docx_1.WidthType.DXA },
        shading: { fill: C.headerBg, type: docx_1.ShadingType.CLEAR },
        margins: CELL_MARGINS,
        borders: {
            top: BORDER('FFFFFF'),
            bottom: BORDER('FFFFFF'),
            left: BORDER('FFFFFF'),
            right: BORDER('334E6E'),
        },
        children: [
            new docx_1.Paragraph({
                alignment: center ? docx_1.AlignmentType.CENTER : docx_1.AlignmentType.LEFT,
                children: [
                    new docx_1.TextRun({
                        text,
                        bold: true,
                        color: C.headerText,
                        size: 18,
                        font: 'Calibri',
                    }),
                ],
            }),
        ],
    });
}
function dCell(text, width, options = {}) {
    const { shade = false, center = false, bold = false, color = C.text } = options;
    return new docx_1.TableCell({
        width: { size: width, type: docx_1.WidthType.DXA },
        shading: { fill: shade ? C.altRow : C.white, type: docx_1.ShadingType.CLEAR },
        margins: CELL_MARGINS,
        borders: {
            top: BORDER(),
            bottom: BORDER(),
            left: BORDER(),
            right: BORDER(),
        },
        children: [
            new docx_1.Paragraph({
                alignment: center ? docx_1.AlignmentType.CENTER : docx_1.AlignmentType.LEFT,
                children: [
                    new docx_1.TextRun({ text: String(text !== null && text !== void 0 ? text : '—'), bold, color, size: 18, font: 'Calibri' }),
                ],
            }),
        ],
    });
}
// Ligne de séparation visuelle sous un titre de section
function divider() {
    return new docx_1.Paragraph({
        border: {
            bottom: { style: docx_1.BorderStyle.SINGLE, size: 12, color: C.accent, space: 1 },
        },
        spacing: { after: 160 },
        children: [],
    });
}
function sectionTitle(num, text) {
    return [
        new docx_1.Paragraph({
            heading: docx_1.HeadingLevel.HEADING_1,
            spacing: { before: 480, after: 60 },
            children: [
                new docx_1.TextRun({ text: num + '  ', bold: true, size: 30, color: C.accent, font: 'Calibri' }),
                new docx_1.TextRun({ text, bold: true, size: 30, color: C.primary, font: 'Calibri' }),
            ],
        }),
        divider(),
    ];
}
function subTitle(text) {
    return [
        new docx_1.Paragraph({
            heading: docx_1.HeadingLevel.HEADING_2,
            spacing: { before: 280, after: 80 },
            children: [
                new docx_1.TextRun({
                    text,
                    bold: true,
                    size: 22,
                    color: C.secondary,
                    font: 'Calibri',
                    underline: { type: docx_1.UnderlineType.SINGLE, color: C.secondary },
                }),
            ],
        }),
    ];
}
function kvParagraph(label, value) {
    return new docx_1.Paragraph({
        spacing: { after: 80 },
        children: [
            new docx_1.TextRun({ text: `${label} : `, bold: true, size: 20, color: C.primary, font: 'Calibri' }),
            new docx_1.TextRun({ text: value || '—', size: 20, color: C.text, font: 'Calibri' }),
        ],
    });
}
function pageBreak() {
    return new docx_1.Paragraph({ children: [new docx_1.PageBreak()] });
}
function spacer(after = 120) {
    return new docx_1.Paragraph({ spacing: { after }, children: [] });
}
// ─── En-tête & pied de page ──────────────────────────────────────────────────
function buildHeader(projectName) {
    return new docx_1.Header({
        children: [
            new docx_1.Paragraph({
                border: {
                    bottom: { style: docx_1.BorderStyle.SINGLE, size: 8, color: C.primary, space: 1 },
                },
                spacing: { after: 0 },
                tabStops: [{ type: docx_1.TabStopType.RIGHT, position: docx_1.TabStopPosition.MAX }],
                children: [
                    new docx_1.TextRun({
                        text: 'RAPPORT D\'AUDIT ENVIRONNEMENTAL ET SOCIAL',
                        bold: true,
                        size: 16,
                        color: C.primary,
                        font: 'Calibri',
                    }),
                    new docx_1.TextRun({
                        text: `\t${projectName}`,
                        size: 16,
                        color: C.muted,
                        font: 'Calibri',
                        italics: true,
                    }),
                ],
            }),
        ],
    });
}
function buildFooter(generatedAt) {
    return new docx_1.Footer({
        children: [
            new docx_1.Paragraph({
                border: {
                    top: { style: docx_1.BorderStyle.SINGLE, size: 8, color: C.accent, space: 1 },
                },
                spacing: { before: 80 },
                tabStops: [{ type: docx_1.TabStopType.RIGHT, position: docx_1.TabStopPosition.MAX }],
                children: [
                    new docx_1.TextRun({
                        text: `Document généré le ${generatedAt}  —  Confidentiel`,
                        size: 14,
                        color: C.muted,
                        font: 'Calibri',
                        italics: true,
                    }),
                    new docx_1.TextRun({
                        text: '\tPage ',
                        size: 14,
                        color: C.muted,
                        font: 'Calibri',
                    }),
                    new docx_1.TextRun({
                        children: [docx_1.PageNumber.CURRENT],
                        size: 14,
                        color: C.primary,
                        bold: true,
                        font: 'Calibri',
                    }),
                    new docx_1.TextRun({
                        text: ' / ',
                        size: 14,
                        color: C.muted,
                        font: 'Calibri',
                    }),
                    new docx_1.TextRun({
                        children: [docx_1.PageNumber.TOTAL_PAGES],
                        size: 14,
                        color: C.primary,
                        bold: true,
                        font: 'Calibri',
                    }),
                ],
            }),
        ],
    });
}
// ─── Page de garde ───────────────────────────────────────────────────────────
function buildCoverPage(data) {
    const { projectInfo } = data;
    const date = new Date(projectInfo.date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
    });
    const infoTable = new docx_1.Table({
        width: { size: 7000, type: docx_1.WidthType.DXA },
        columnWidths: [2800, 4200],
        rows: [
            ['Projet', projectInfo.projectName],
            ['Lieu', projectInfo.location],
            ['Période', projectInfo.period],
            ['Date', date],
            ['Auditeurs', projectInfo.auditors],
            ['Statut', data.status.toUpperCase()],
        ].map(([label, val], i) => new docx_1.TableRow({
            children: [
                new docx_1.TableCell({
                    width: { size: 2800, type: docx_1.WidthType.DXA },
                    shading: { fill: C.primary, type: docx_1.ShadingType.CLEAR },
                    margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    borders: {
                        top: { style: docx_1.BorderStyle.SINGLE, size: 2, color: C.white },
                        bottom: { style: docx_1.BorderStyle.SINGLE, size: 2, color: C.white },
                        left: NO_BORDER,
                        right: { style: docx_1.BorderStyle.SINGLE, size: 4, color: C.accent },
                    },
                    children: [new docx_1.Paragraph({
                            children: [new docx_1.TextRun({ text: label, bold: true, color: C.white, size: 20, font: 'Calibri' })],
                        })],
                }),
                new docx_1.TableCell({
                    width: { size: 4200, type: docx_1.WidthType.DXA },
                    shading: { fill: i % 2 === 0 ? C.lightGray : C.white, type: docx_1.ShadingType.CLEAR },
                    margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    borders: {
                        top: BORDER(),
                        bottom: BORDER(),
                        left: BORDER(),
                        right: NO_BORDER,
                    },
                    children: [new docx_1.Paragraph({
                            children: [new docx_1.TextRun({ text: val, size: 20, color: C.text, font: 'Calibri' })],
                        })],
                }),
            ],
        })),
    });
    return [
        // Espace haut
        new docx_1.Paragraph({ spacing: { before: 1800, after: 0 }, children: [] }),
        // Titre principal
        new docx_1.Paragraph({
            alignment: docx_1.AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
                new docx_1.TextRun({
                    text: 'RAPPORT D\'AUDIT',
                    bold: true,
                    size: 64,
                    color: C.primary,
                    font: 'Calibri',
                }),
            ],
        }),
        new docx_1.Paragraph({
            alignment: docx_1.AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
                new docx_1.TextRun({
                    text: 'ENVIRONNEMENTAL ET SOCIAL',
                    bold: true,
                    size: 48,
                    color: C.secondary,
                    font: 'Calibri',
                }),
            ],
        }),
        // Ligne décorative
        new docx_1.Paragraph({
            alignment: docx_1.AlignmentType.CENTER,
            border: {
                bottom: { style: docx_1.BorderStyle.SINGLE, size: 16, color: C.accent, space: 1 },
            },
            spacing: { after: 600 },
            children: [],
        }),
        // Tableau d'infos centré
        new docx_1.Paragraph({
            alignment: docx_1.AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [],
        }),
        infoTable,
        pageBreak(),
    ];
}
// ─── 1. Revue documentaire ───────────────────────────────────────────────────
function buildDocumentReview(data) {
    const { documentReview } = data;
    const COL = [3200, 900, 3538, 2000];
    const rows = [
        new docx_1.TableRow({
            tableHeader: true,
            children: [
                hCell('Document', COL[0]),
                hCell('Présent', COL[1], true),
                hCell('Observations', COL[2]),
                hCell('Conformité', COL[3], true),
            ],
        }),
        ...Object.keys(documentReview.documentsPresents || {}).map((key, i) => {
            var _a;
            const present = documentReview.documentsPresents[key];
            const analysis = (_a = documentReview.documentsAnalysis) === null || _a === void 0 ? void 0 : _a[key];
            const shade = i % 2 === 1;
            // Couleur selon conformité
            const ratingColor = {
                conforme: '1A7A4A',
                partiel: 'C07000',
                'non-conforme': 'C0392B',
                'n/a': C.muted,
            };
            const rating = (analysis === null || analysis === void 0 ? void 0 : analysis.rating) || 'n/a';
            const rColor = ratingColor[rating] || C.text;
            return new docx_1.TableRow({
                children: [
                    dCell(key, COL[0], { shade }),
                    dCell(present ? '✓' : '✗', COL[1], { shade, center: true, bold: true, color: present ? '1A7A4A' : 'C0392B' }),
                    dCell((analysis === null || analysis === void 0 ? void 0 : analysis.findings) || '—', COL[2], { shade }),
                    dCell(rating.toUpperCase(), COL[3], { shade, center: true, bold: true, color: rColor }),
                ],
            });
        }),
    ];
    return [
        ...sectionTitle('01', 'Revue Documentaire'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL, rows }),
        spacer(160),
        ...(documentReview.documentsManquants ? [kvParagraph('Documents manquants', documentReview.documentsManquants)] : []),
        ...(documentReview.autresDocuments ? [kvParagraph('Autres documents', documentReview.autresDocuments)] : []),
        pageBreak(),
    ];
}
// ─── 2. Inspection de terrain ────────────────────────────────────────────────
function buildInspectionCategory(title, items) {
    if (!items || Object.keys(items).length === 0)
        return [];
    const COL = [2800, 1400, 3638, 1800];
    const riskColor = {
        faible: '1A7A4A',
        moyen: 'C07000',
        élevé: 'C0392B',
        critique: '8B0000',
    };
    const rows = [
        new docx_1.TableRow({
            tableHeader: true,
            children: [
                hCell('Élément inspecté', COL[0]),
                hCell('Statut', COL[1], true),
                hCell('Observations', COL[2]),
                hCell('Niveau de risque', COL[3], true),
            ],
        }),
        ...Object.entries(items).map(([key, val], i) => {
            const riskKey = (val.risk || '').toLowerCase();
            const rColor = Object.keys(riskColor).find(k => riskKey.includes(k));
            return new docx_1.TableRow({
                children: [
                    dCell(key, COL[0], { shade: i % 2 === 1 }),
                    dCell(val.status, COL[1], { shade: i % 2 === 1, center: true }),
                    dCell(val.observations, COL[2], { shade: i % 2 === 1 }),
                    dCell(val.risk, COL[3], { shade: i % 2 === 1, center: true, bold: true, color: rColor ? riskColor[rColor] : C.text }),
                ],
            });
        }),
    ];
    return [
        ...subTitle(title),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL, rows }),
        spacer(200),
    ];
}
function buildFieldInspection(data) {
    const { fieldInspection } = data;
    return [
        ...sectionTitle('02', 'Inspection de Terrain'),
        // Fiche synthèse
        ...subTitle('Informations générales'),
        kvParagraph('Projet', fieldInspection.projectName),
        kvParagraph('Date', new Date(fieldInspection.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })),
        kvParagraph('Auditeurs', fieldInspection.auditors),
        kvParagraph('Accompagnateurs', fieldInspection.accompaniers || '—'),
        kvParagraph('Zones visitées', (fieldInspection.zones || []).join(', ') || '—'),
        spacer(240),
        ...buildInspectionCategory("Gestion de l'eau", fieldInspection.waterManagement),
        ...buildInspectionCategory('Gestion des déchets', fieldInspection.wasteManagement),
        ...buildInspectionCategory('Émissions', fieldInspection.emissions),
        ...buildInspectionCategory('Santé & Sécurité', fieldInspection.healthSafety),
        ...buildInspectionCategory('Communauté', fieldInspection.community),
        pageBreak(),
    ];
}
// ─── 3. Entretiens parties prenantes ─────────────────────────────────────────
function buildStakeholderInterview(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const { stakeholderInterview } = data;
    const COL2 = [3200, 6438];
    const profileRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Champ', COL2[0]), hCell('Valeur', COL2[1])] }),
        ...[
            ["Nom complet", (_a = stakeholderInterview.profile) === null || _a === void 0 ? void 0 : _a.name],
            ["Fonction", (_b = stakeholderInterview.profile) === null || _b === void 0 ? void 0 : _b.function],
            ["Genre", (_c = stakeholderInterview.profile) === null || _c === void 0 ? void 0 : _c.gender],
            ["Tranche d'âge", (_d = stakeholderInterview.profile) === null || _d === void 0 ? void 0 : _d.ageRange],
            ["Type partie prenante", stakeholderInterview.stakeholderType],
            ["Lieu", stakeholderInterview.location],
            ["Durée", stakeholderInterview.duration],
            ["Date", new Date(stakeholderInterview.date).toLocaleDateString('fr-FR')],
        ].map(([k, v], i) => new docx_1.TableRow({ children: [dCell(k, COL2[0], { shade: i % 2 === 1, bold: true }), dCell(v || '—', COL2[1], { shade: i % 2 === 1 })] })),
    ];
    const COL_CONSENT = [3200, 3219, 3219];
    const consentRow = new docx_1.TableRow({
        children: [
            hCell('Confidentialité', COL_CONSENT[0]),
            hCell('Prise de notes', COL_CONSENT[1], true),
            hCell('Enregistrement', COL_CONSENT[2], true),
        ],
    });
    const consentData = new docx_1.TableRow({
        children: [
            dCell(((_e = stakeholderInterview.consent) === null || _e === void 0 ? void 0 : _e.confidentiality) ? '✓ Accordée' : '✗ Refusée', COL_CONSENT[0], { center: true, bold: true, color: ((_f = stakeholderInterview.consent) === null || _f === void 0 ? void 0 : _f.confidentiality) ? '1A7A4A' : 'C0392B' }),
            dCell(((_g = stakeholderInterview.consent) === null || _g === void 0 ? void 0 : _g.notes) ? '✓ Accordée' : '✗ Refusée', COL_CONSENT[1], { center: true, bold: true, color: ((_h = stakeholderInterview.consent) === null || _h === void 0 ? void 0 : _h.notes) ? '1A7A4A' : 'C0392B' }),
            dCell(((_j = stakeholderInterview.consent) === null || _j === void 0 ? void 0 : _j.recording) ? '✓ Accordée' : '✗ Refusée', COL_CONSENT[2], { center: true, bold: true, color: ((_k = stakeholderInterview.consent) === null || _k === void 0 ? void 0 : _k.recording) ? '1A7A4A' : 'C0392B' }),
        ],
    });
    const responseKeys = Object.keys(stakeholderInterview.responses || {});
    const responseRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Question', COL2[0]), hCell('Réponse', COL2[1])] }),
        ...responseKeys.map((k, i) => new docx_1.TableRow({ children: [dCell(k, COL2[0], { shade: i % 2 === 1, bold: true }), dCell(stakeholderInterview.responses[k], COL2[1], { shade: i % 2 === 1 })] })),
    ];
    // Évaluation avec étoiles visuelles
    const evalEntries = [
        ['Qualité', (_l = stakeholderInterview.evaluation) === null || _l === void 0 ? void 0 : _l.quality],
        ['Franchise', (_m = stakeholderInterview.evaluation) === null || _m === void 0 ? void 0 : _m.frankness],
        ['Pertinence', (_o = stakeholderInterview.evaluation) === null || _o === void 0 ? void 0 : _o.relevance],
        ['Climat', (_p = stakeholderInterview.evaluation) === null || _p === void 0 ? void 0 : _p.climate],
    ];
    const EVAl_COL = [2400, 2000, 5238];
    const evalRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Critère', EVAl_COL[0]), hCell('Note /5', EVAl_COL[1], true), hCell('Représentation', EVAl_COL[2])] }),
        ...evalEntries.map(([k, v], i) => {
            const stars = '★'.repeat(v || 0) + '☆'.repeat(5 - (v || 0));
            return new docx_1.TableRow({ children: [
                    dCell(k, EVAl_COL[0], { shade: i % 2 === 1, bold: true }),
                    dCell(String(v || '—'), EVAl_COL[1], { shade: i % 2 === 1, center: true, bold: true, color: C.secondary }),
                    dCell(stars, EVAl_COL[2], { shade: i % 2 === 1, color: C.secondary }),
                ] });
        }),
    ];
    return [
        ...sectionTitle('03', 'Entretiens Parties Prenantes'),
        ...subTitle('Profil de l\'interviewé(e)'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL2, rows: profileRows }),
        spacer(200),
        ...subTitle('Consentements recueillis'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL_CONSENT, rows: [consentRow, consentData] }),
        spacer(200),
        ...subTitle('Réponses aux questions'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL2, rows: responseRows }),
        spacer(200),
        ...subTitle('Évaluation de la qualité de l\'entretien'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: EVAl_COL, rows: evalRows }),
        spacer(160),
        pageBreak(),
    ];
}
// ─── 4. Évaluation Genre ─────────────────────────────────────────────────────
function buildGenderAssessment(data) {
    const { genderAssessment } = data;
    // Objectifs
    const OBJ_COL = [3800, 3000, 2838];
    const objRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Objectif', OBJ_COL[0]), hCell('Indicateur', OBJ_COL[1]), hCell('Statut', OBJ_COL[2], true)] }),
        ...(genderAssessment.objectives || []).map((o, i) => new docx_1.TableRow({ children: [
                dCell(o.objective, OBJ_COL[0], { shade: i % 2 === 1 }),
                dCell(o.indicator, OBJ_COL[1], { shade: i % 2 === 1 }),
                dCell(o.status, OBJ_COL[2], { shade: i % 2 === 1, center: true, bold: true }),
            ] })),
    ];
    // Données quantitatives
    const QT_COL = [2638, 1500, 1500, 1500, 2500];
    const qtRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Catégorie', QT_COL[0]), hCell('Femmes', QT_COL[1], true), hCell('Hommes', QT_COL[2], true), hCell('Autres', QT_COL[3], true), hCell('Source', QT_COL[4])] }),
        ...Object.entries(genderAssessment.quantitativeData || {}).map(([k, v], i) => new docx_1.TableRow({ children: [
                dCell(k, QT_COL[0], { shade: i % 2 === 1, bold: true }),
                dCell(String(v.women), QT_COL[1], { shade: i % 2 === 1, center: true }),
                dCell(String(v.men), QT_COL[2], { shade: i % 2 === 1, center: true }),
                dCell(String(v.other), QT_COL[3], { shade: i % 2 === 1, center: true }),
                dCell(v.source, QT_COL[4], { shade: i % 2 === 1 }),
            ] })),
    ];
    // Consultations
    const CONS_COL = [2638, 1500, 2000, 3500];
    const consRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Groupe', CONS_COL[0]), hCell('Sessions', CONS_COL[1], true), hCell('Participants', CONS_COL[2], true), hCell('Méthode', CONS_COL[3])] }),
        ...(genderAssessment.consultations || []).map((c, i) => new docx_1.TableRow({ children: [
                dCell(c.group, CONS_COL[0], { shade: i % 2 === 1, bold: true }),
                dCell(String(c.sessions), CONS_COL[1], { shade: i % 2 === 1, center: true }),
                dCell(String(c.participants), CONS_COL[2], { shade: i % 2 === 1, center: true }),
                dCell(c.method, CONS_COL[3], { shade: i % 2 === 1 }),
            ] })),
    ];
    // Recommandations
    const REC_COL = [3300, 1300, 1500, 1838, 1700];
    const recRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Recommandation', REC_COL[0]), hCell('Priorité', REC_COL[1], true), hCell('Portée', REC_COL[2], true), hCell('Responsable', REC_COL[3]), hCell('Échéance', REC_COL[4], true)] }),
        ...(genderAssessment.recommendations || []).map((r, i) => new docx_1.TableRow({ children: [
                dCell(r.recommendation, REC_COL[0], { shade: i % 2 === 1 }),
                dCell(r.priority, REC_COL[1], { shade: i % 2 === 1, center: true, bold: true }),
                dCell(r.scope, REC_COL[2], { shade: i % 2 === 1, center: true }),
                dCell(r.responsible, REC_COL[3], { shade: i % 2 === 1 }),
                dCell(r.deadline, REC_COL[4], { shade: i % 2 === 1, center: true }),
            ] })),
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
// ─── 5. Mécanisme de plainte ─────────────────────────────────────────────────
function buildComplaintMechanism(data) {
    const { complaintMechanism } = data;
    // Base documentaire
    const DOC_COL = [2638, 3500, 3500];
    const docRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Document', DOC_COL[0]), hCell('Constat', DOC_COL[1]), hCell('Évaluation', DOC_COL[2])] }),
        ...Object.entries(complaintMechanism.documentaryBasis || {}).map(([k, v], i) => new docx_1.TableRow({ children: [
                dCell(k, DOC_COL[0], { shade: i % 2 === 1, bold: true }),
                dCell(v.finding, DOC_COL[1], { shade: i % 2 === 1 }),
                dCell(v.evaluation, DOC_COL[2], { shade: i % 2 === 1 }),
            ] })),
    ];
    // Critères clés
    const CRIT_COL = [3819, 5819];
    const critRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Critère', CRIT_COL[0]), hCell('Évaluation', CRIT_COL[1])] }),
        ...Object.entries(complaintMechanism.keyCriteria || {}).map(([k, v], i) => new docx_1.TableRow({ children: [
                dCell(k, CRIT_COL[0], { shade: i % 2 === 1, bold: true }),
                dCell(v.evaluation, CRIT_COL[1], { shade: i % 2 === 1 }),
            ] })),
    ];
    // Faiblesses
    const WEAK_COL = [3400, 3638, 2600];
    const weakRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Déficience', WEAK_COL[0]), hCell('Conséquence', WEAK_COL[1]), hCell('Sévérité', WEAK_COL[2], true)] }),
        ...(complaintMechanism.weaknesses || []).map((w, i) => {
            const sevColor = { faible: '1A7A4A', modérée: 'C07000', élevée: 'C0392B', critique: '8B0000' };
            const sev = (w.severity || '').toLowerCase();
            const sColor = Object.keys(sevColor).find(k => sev.includes(k));
            return new docx_1.TableRow({ children: [
                    dCell(w.deficiency, WEAK_COL[0], { shade: i % 2 === 1 }),
                    dCell(w.consequence, WEAK_COL[1], { shade: i % 2 === 1 }),
                    dCell(w.severity, WEAK_COL[2], { shade: i % 2 === 1, center: true, bold: true, color: sColor ? sevColor[sColor] : C.text }),
                ] });
        }),
    ];
    // Recommandations
    const REC_COL = [3638, 1500, 2300, 2200];
    const recRows = [
        new docx_1.TableRow({ tableHeader: true, children: [hCell('Recommandation', REC_COL[0]), hCell('Priorité', REC_COL[1], true), hCell('Responsable', REC_COL[2]), hCell('Échéance', REC_COL[3], true)] }),
        ...(complaintMechanism.recommendations || []).map((r, i) => new docx_1.TableRow({ children: [
                dCell(r.recommendation, REC_COL[0], { shade: i % 2 === 1 }),
                dCell(r.priority, REC_COL[1], { shade: i % 2 === 1, center: true, bold: true }),
                dCell(r.responsible, REC_COL[2], { shade: i % 2 === 1 }),
                dCell(r.deadline, REC_COL[3], { shade: i % 2 === 1, center: true }),
            ] })),
    ];
    return [
        ...sectionTitle('05', 'Mécanisme de Plainte'),
        ...subTitle('Base documentaire'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: DOC_COL, rows: docRows }),
        spacer(200),
        ...subTitle('Critères clés d\'évaluation'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: CRIT_COL, rows: critRows }),
        spacer(200),
        ...subTitle('Points forts identifiés'),
        ...(complaintMechanism.strengths || []).map(s => new docx_1.Paragraph({
            numbering: { reference: 'bullets', level: 0 },
            spacing: { after: 60 },
            children: [new docx_1.TextRun({ text: s, size: 20, font: 'Calibri', color: C.text })],
        })),
        spacer(200),
        ...subTitle('Faiblesses et risques'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: WEAK_COL, rows: weakRows }),
        spacer(200),
        ...subTitle('Recommandations'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: REC_COL, rows: recRows }),
        spacer(240),
        ...subTitle('Conclusion générale'),
        new docx_1.Paragraph({
            spacing: { after: 160 },
            border: {
                left: { style: docx_1.BorderStyle.SINGLE, size: 12, color: C.accent, space: 20 },
            },
            indent: { left: 280 },
            children: [
                new docx_1.TextRun({
                    text: complaintMechanism.globalConclusion || '—',
                    size: 20,
                    color: C.text,
                    font: 'Calibri',
                    italics: true,
                }),
            ],
        }),
    ];
}
// ─── Export principal ────────────────────────────────────────────────────────
function generateFormDataWordDocument(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const generatedAt = new Date().toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'long', year: 'numeric',
        });
        const projectName = ((_a = data.projectInfo) === null || _a === void 0 ? void 0 : _a.projectName) || 'Projet';
        const doc = new docx_1.Document({
            numbering: {
                config: [{
                        reference: 'bullets',
                        levels: [{
                                level: 0,
                                format: docx_1.LevelFormat.BULLET,
                                text: '•',
                                alignment: docx_1.AlignmentType.LEFT,
                                style: { paragraph: { indent: { left: 720, hanging: 360 } } },
                            }],
                    }],
            },
            styles: {
                default: {
                    document: { run: { font: 'Calibri', size: 20, color: C.text } },
                },
                paragraphStyles: [
                    {
                        id: 'Heading1',
                        name: 'Heading 1',
                        basedOn: 'Normal',
                        next: 'Normal',
                        quickFormat: true,
                        run: { size: 30, bold: true, font: 'Calibri', color: C.primary },
                        paragraph: { spacing: { before: 480, after: 60 }, outlineLevel: 0 },
                    },
                    {
                        id: 'Heading2',
                        name: 'Heading 2',
                        basedOn: 'Normal',
                        next: 'Normal',
                        quickFormat: true,
                        run: { size: 22, bold: true, font: 'Calibri', color: C.secondary },
                        paragraph: { spacing: { before: 280, after: 80 }, outlineLevel: 1 },
                    },
                ],
            },
            sections: [
                {
                    properties: {
                        page: {
                            size: { width: PAGE.width, height: PAGE.height },
                            margin: PAGE.margin,
                        },
                    },
                    // Page de garde sans en-tête/pied
                    children: buildCoverPage(data),
                },
                {
                    properties: {
                        page: {
                            size: { width: PAGE.width, height: PAGE.height },
                            margin: Object.assign(Object.assign({}, PAGE.margin), { top: 1440, bottom: 1440 }), // marge haute pour l'en-tête
                        },
                    },
                    headers: { default: buildHeader(projectName) },
                    footers: { default: buildFooter(generatedAt) },
                    children: [
                        ...buildDocumentReview(data),
                        ...buildFieldInspection(data),
                        ...buildStakeholderInterview(data),
                        ...buildGenderAssessment(data),
                        ...buildComplaintMechanism(data),
                    ],
                },
            ],
        });
        return docx_1.Packer.toBuffer(doc);
    });
}
//# sourceMappingURL=words.service.js.map