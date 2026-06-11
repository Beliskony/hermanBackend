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
exports.exportAPESWord = exportAPESWord;
exports.exportGuideWord = exportGuideWord;
exports.exportAuditWord = exportAuditWord;
exports.exportConducteurWord = exportConducteurWord;
exports.exportAllFormsWord = exportAllFormsWord;
const docx_1 = require("docx");
// =============================================================================
//  CONSTANTES ET STYLES
// =============================================================================
const C = {
    primary: '1B3A5C',
    secondary: '2E75B6',
    accent: '00B0A0',
    headerBg: '1B3A5C',
    headerText: 'FFFFFF',
    subBg: 'D6E4F0',
    altRow: 'F0F6FB',
    white: 'FFFFFF',
    lightGray: 'F5F5F5',
    borderCol: 'B8CCE4',
    muted: '6B7A8D',
    text: '1A1A2E',
    green: '1A7A4A',
    red: 'C0392B',
    yellow: 'C07000',
    orange: 'E67E22',
};
const PAGE = {
    width: 11906,
    height: 16838,
    margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
};
const TW = 9638;
const BORDER = (color = C.borderCol) => ({ style: docx_1.BorderStyle.SINGLE, size: 4, color });
const CELL_MARGINS = { top: 100, bottom: 100, left: 140, right: 140 };
// =============================================================================
//  HELPERS D'ÉCRITURE
// =============================================================================
function mainTitle(projectName) {
    return new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 2000, after: 120 },
        children: [new docx_1.TextRun({ text: `RAPPORT ${projectName.toUpperCase()}`, bold: true, size: 48, color: C.primary, font: 'Calibri' })],
    });
}
function sectionTitle(text, num) {
    const children = [];
    if (num) {
        children.push(new docx_1.TextRun({ text: `${num}  `, bold: true, size: 32, color: C.accent, font: 'Calibri' }));
    }
    children.push(new docx_1.TextRun({ text, bold: true, size: 32, color: C.primary, font: 'Calibri' }));
    return new docx_1.Paragraph({
        heading: docx_1.HeadingLevel.HEADING_1,
        spacing: { before: 480, after: 120 },
        children,
    });
}
function subTitle(text) {
    return new docx_1.Paragraph({
        heading: docx_1.HeadingLevel.HEADING_2,
        spacing: { before: 280, after: 80 },
        children: [
            new docx_1.TextRun({ text, bold: true, size: 24, color: C.secondary, font: 'Calibri', underline: { type: docx_1.UnderlineType.SINGLE, color: C.secondary } }),
        ],
    });
}
function paragraph(text, options) {
    var _a, _b, _c, _d;
    return new docx_1.Paragraph({
        spacing: { after: (_a = options === null || options === void 0 ? void 0 : options.spacing) !== null && _a !== void 0 ? _a : 120 },
        children: [
            new docx_1.TextRun({
                text,
                bold: (_b = options === null || options === void 0 ? void 0 : options.bold) !== null && _b !== void 0 ? _b : false,
                italics: (_c = options === null || options === void 0 ? void 0 : options.italic) !== null && _c !== void 0 ? _c : false,
                color: (_d = options === null || options === void 0 ? void 0 : options.color) !== null && _d !== void 0 ? _d : C.text,
                size: 20,
                font: 'Calibri',
            }),
        ],
    });
}
function bulletPoint(text) {
    return new docx_1.Paragraph({
        numbering: { reference: 'bullet-list', level: 0 },
        spacing: { after: 60 },
        children: [new docx_1.TextRun({ text, size: 20, font: 'Calibri', color: C.text })],
    });
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
function divider() {
    return new docx_1.Paragraph({
        border: { bottom: { style: docx_1.BorderStyle.SINGLE, size: 8, color: C.accent, space: 1 } },
        spacing: { after: 160 },
        children: [],
    });
}
function pageBreak() {
    return new docx_1.Paragraph({ children: [new docx_1.PageBreak()] });
}
function spacer(after = 120) {
    return new docx_1.Paragraph({ spacing: { after }, children: [] });
}
function tableCell(text, width, options = {}) {
    var _a, _b;
    const textColor = options.header ? C.headerText : (options.color || C.text);
    return new docx_1.TableCell({
        width: { size: width, type: docx_1.WidthType.DXA },
        shading: options.header
            ? { fill: C.headerBg, type: docx_1.ShadingType.CLEAR }
            : { fill: options.shade ? C.altRow : C.white, type: docx_1.ShadingType.CLEAR },
        margins: CELL_MARGINS,
        borders: {
            top: BORDER(),
            bottom: BORDER(),
            left: BORDER(),
            right: BORDER(),
        },
        children: [
            new docx_1.Paragraph({
                alignment: options.center ? docx_1.AlignmentType.CENTER : docx_1.AlignmentType.LEFT,
                children: [
                    new docx_1.TextRun({
                        text,
                        bold: (_b = (_a = options.bold) !== null && _a !== void 0 ? _a : options.header) !== null && _b !== void 0 ? _b : false,
                        color: textColor,
                        size: 18,
                        font: 'Calibri',
                    }),
                ],
            }),
        ],
    });
}
function buildHeader(title) {
    return new docx_1.Header({
        children: [
            new docx_1.Paragraph({
                border: { bottom: { style: docx_1.BorderStyle.SINGLE, size: 8, color: C.primary, space: 1 } },
                spacing: { after: 0 },
                tabStops: [{ type: docx_1.TabStopType.RIGHT, position: docx_1.TabStopPosition.MAX }],
                children: [
                    new docx_1.TextRun({ text: title.toUpperCase(), bold: true, size: 16, color: C.primary, font: 'Calibri' }),
                    new docx_1.TextRun({ text: `\t${new Date().toLocaleDateString('fr-FR')}`, size: 16, color: C.muted, font: 'Calibri', italics: true }),
                ],
            }),
        ],
    });
}
function buildFooter(generatedAt) {
    const dateStr = generatedAt || new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    return new docx_1.Footer({
        children: [
            new docx_1.Paragraph({
                border: { top: { style: docx_1.BorderStyle.SINGLE, size: 8, color: C.accent, space: 1 } },
                spacing: { before: 80 },
                tabStops: [{ type: docx_1.TabStopType.RIGHT, position: docx_1.TabStopPosition.MAX }],
                children: [
                    new docx_1.TextRun({ text: `Document généré le ${dateStr}  —  Rapport confidentiel`, size: 14, color: C.muted, font: 'Calibri', italics: true }),
                    new docx_1.TextRun({ text: '\tPage ', size: 14, color: C.muted, font: 'Calibri' }),
                    new docx_1.TextRun({ children: [docx_1.PageNumber.CURRENT], size: 14, color: C.primary, bold: true, font: 'Calibri' }),
                    new docx_1.TextRun({ text: ' / ', size: 14, color: C.muted, font: 'Calibri' }),
                    new docx_1.TextRun({ children: [docx_1.PageNumber.TOTAL_PAGES], size: 14, color: C.primary, bold: true, font: 'Calibri' }),
                ],
            }),
        ],
    });
}
// =============================================================================
//  PAGE DE GARDE COMMUNE
// =============================================================================
function buildCoverPage(projectName, projectDate, projectLocation, auditors, formType) {
    const typeLabel = {
        apes: "ÉVALUATION APES",
        guide: "GUIDE D'ENTRETIEN",
        audit: "CHECKLIST D'AUDIT",
        conducteur: "CHECKLIST CONDUCTEUR",
        global: "SYNTHÈSE GLOBALE",
    };
    const typeText = formType ? typeLabel[formType] || "RAPPORT D'AUDIT" : "RAPPORT D'AUDIT";
    return [
        new docx_1.Paragraph({ spacing: { before: 2000, after: 0 }, children: [] }),
        new docx_1.Paragraph({
            alignment: docx_1.AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [new docx_1.TextRun({ text: typeText, bold: true, size: 48, color: C.primary, font: 'Calibri' })],
        }),
        new docx_1.Paragraph({
            alignment: docx_1.AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [new docx_1.TextRun({ text: projectName.toUpperCase(), bold: true, size: 36, color: C.secondary, font: 'Calibri' })],
        }),
        new docx_1.Paragraph({
            alignment: docx_1.AlignmentType.CENTER,
            border: { bottom: { style: docx_1.BorderStyle.SINGLE, size: 16, color: C.accent, space: 1 } },
            spacing: { after: 600 },
            children: [],
        }),
        new docx_1.Table({
            width: { size: 7000, type: docx_1.WidthType.DXA },
            columnWidths: [2800, 4200],
            rows: [
                new docx_1.TableRow({ children: [
                        new docx_1.TableCell({ width: { size: 2800, type: docx_1.WidthType.DXA }, shading: { fill: C.primary }, margins: CELL_MARGINS, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Projet', bold: true, color: C.white, size: 20, font: 'Calibri' })] })] }),
                        new docx_1.TableCell({ width: { size: 4200, type: docx_1.WidthType.DXA }, shading: { fill: C.lightGray }, margins: CELL_MARGINS, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: projectName, size: 20, color: C.text, font: 'Calibri' })] })] }),
                    ] }),
                new docx_1.TableRow({ children: [
                        new docx_1.TableCell({ width: { size: 2800, type: docx_1.WidthType.DXA }, shading: { fill: C.primary }, margins: CELL_MARGINS, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Lieu', bold: true, color: C.white, size: 20, font: 'Calibri' })] })] }),
                        new docx_1.TableCell({ width: { size: 4200, type: docx_1.WidthType.DXA }, shading: { fill: C.white }, margins: CELL_MARGINS, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: projectLocation, size: 20, color: C.text, font: 'Calibri' })] })] }),
                    ] }),
                new docx_1.TableRow({ children: [
                        new docx_1.TableCell({ width: { size: 2800, type: docx_1.WidthType.DXA }, shading: { fill: C.primary }, margins: CELL_MARGINS, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Date', bold: true, color: C.white, size: 20, font: 'Calibri' })] })] }),
                        new docx_1.TableCell({ width: { size: 4200, type: docx_1.WidthType.DXA }, shading: { fill: C.lightGray }, margins: CELL_MARGINS, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: projectDate, size: 20, color: C.text, font: 'Calibri' })] })] }),
                    ] }),
                new docx_1.TableRow({ children: [
                        new docx_1.TableCell({ width: { size: 2800, type: docx_1.WidthType.DXA }, shading: { fill: C.primary }, margins: CELL_MARGINS, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Auditeurs', bold: true, color: C.white, size: 20, font: 'Calibri' })] })] }),
                        new docx_1.TableCell({ width: { size: 4200, type: docx_1.WidthType.DXA }, shading: { fill: C.white }, margins: CELL_MARGINS, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: auditors, size: 20, color: C.text, font: 'Calibri' })] })] }),
                    ] }),
            ],
        }),
        pageBreak(),
    ];
}
// =============================================================================
//  SOMMAIRE
// =============================================================================
function buildTableOfContents(sections) {
    return [
        sectionTitle('SOMMAIRE'),
        spacer(200),
        ...sections.map((sec, idx) => new docx_1.Paragraph({
            spacing: { after: 60 },
            children: [new docx_1.TextRun({ text: `${idx + 1}. ${sec}`, size: 18, color: C.text, font: 'Calibri' })],
        })),
        pageBreak(),
    ];
}
// =============================================================================
//  INTRODUCTION GÉNÉRALE
// =============================================================================
function buildIntroduction() {
    return [
        sectionTitle('INTRODUCTION', '1'),
        divider(),
        subTitle('1.1 Contexte de l\'audit'),
        paragraph("Le présent rapport d'audit environnemental et social a été réalisé dans le cadre de l'évaluation des performances environnementales et sociales du projet. Il s'inscrit dans une démarche d'amélioration continue visant à garantir la conformité réglementaire et l'adoption des meilleures pratiques."),
        spacer(),
        subTitle('1.2 Objectifs et périmètre'),
        paragraph("L'audit avait pour objectifs de :"),
        bulletPoint("Évaluer la conformité du projet aux exigences légales et aux engagements du PGES"),
        bulletPoint("Identifier les non-conformités et les risques environnementaux et sociaux"),
        bulletPoint("Proposer des mesures correctives et préventives adaptées"),
        bulletPoint("Capitaliser les bonnes pratiques observées"),
        spacer(),
        subTitle('1.3 Méthodologie'),
        paragraph("La méthodologie déployée combine plusieurs approches complémentaires :"),
        bulletPoint("Revue documentaire exhaustive des documents de projet"),
        bulletPoint("Inspection terrain avec observation directe des installations"),
        bulletPoint("Entretiens semi-directifs avec les parties prenantes"),
        bulletPoint("Analyse des données quantitatives et qualitatives"),
        pageBreak(),
    ];
}
// =============================================================================
//  CONCLUSION GÉNÉRALE
// =============================================================================
function buildGeneralConclusion() {
    return [
        sectionTitle('CONCLUSION GÉNÉRALE'),
        divider(),
        paragraph("Au terme de cet audit environnemental et social, l'évaluation globale du projet permet de dégager les constats suivants :"),
        spacer(),
        subTitle('Forces et atouts'),
        bulletPoint("Engagement de la direction dans la mise en œuvre des mesures environnementales"),
        bulletPoint("Mise en place d'un système de gestion environnementale structuré"),
        bulletPoint("Consultation régulière des parties prenantes locales"),
        spacer(),
        subTitle('Points d\'amélioration'),
        bulletPoint("Renforcement nécessaire de la documentation environnementale"),
        bulletPoint("Amélioration des mesures d'atténuation des nuisances"),
        bulletPoint("Formation continue du personnel aux enjeux HSE"),
        spacer(),
        subTitle('Recommandations stratégiques'),
        bulletPoint("Élaborer un plan d'actions correctives avec échéancier"),
        bulletPoint("Désigner des référents HSE par secteur d'activité"),
        bulletPoint("Instaurer des revues de direction trimestrielles sur les performances E&S"),
        bulletPoint("Renforcer le mécanisme de gestion des plaintes des communautés"),
        spacer(),
        paragraph("La mise en œuvre des recommandations formulées permettra d'atteindre un niveau de conformité satisfaisant et de garantir la pérennité des performances environnementales et sociales du projet.", { bold: true }),
        spacer(400),
        new docx_1.Paragraph({
            alignment: docx_1.AlignmentType.RIGHT,
            children: [
                new docx_1.TextRun({ text: "Fait à ______, le ", size: 18, color: C.text, font: 'Calibri' }),
                new docx_1.TextRun({ text: new Date().toLocaleDateString('fr-FR'), size: 18, color: C.text, font: 'Calibri' }),
            ],
        }),
        spacer(200),
        new docx_1.Paragraph({
            alignment: docx_1.AlignmentType.RIGHT,
            children: [
                new docx_1.TextRun({ text: "L'équipe d'audit", bold: true, size: 20, color: C.primary, font: 'Calibri' }),
            ],
        }),
        pageBreak(),
    ];
}
// =============================================================================
//  REVUE DOCUMENTAIRE (APES)
// =============================================================================
function buildDocumentReviewSection(data) {
    var _a, _b;
    const dr = data.documentReview;
    if (!dr)
        return [];
    const docsPresents = (_a = dr.documents_presents) !== null && _a !== void 0 ? _a : {};
    const docsAnalysis = (_b = dr.documents_analysis) !== null && _b !== void 0 ? _b : {};
    const totalDocs = Object.keys(docsPresents).length;
    const presentCount = Object.values(docsPresents).filter((v) => v === true).length;
    const conformityCount = Object.values(docsAnalysis).filter((a) => a.rating === 'conforme').length;
    const partielCount = Object.values(docsAnalysis).filter((a) => a.rating === 'partiel').length;
    const nonConformeCount = Object.values(docsAnalysis).filter((a) => a.rating === 'non-conforme').length;
    const COL = [3200, 900, 3538, 2000];
    const ratingColor = {
        conforme: C.green,
        partiel: C.yellow,
        'non-conforme': C.red,
        'n/a': C.muted,
    };
    const rows = [
        new docx_1.TableRow({ tableHeader: true, children: [
                tableCell('Document', COL[0], { header: true }),
                tableCell('Présent', COL[1], { header: true, center: true }),
                tableCell('Observations', COL[2], { header: true }),
                tableCell('Conformité', COL[3], { header: true, center: true }),
            ] }),
        ...Object.keys(docsPresents).map((key, i) => {
            const present = docsPresents[key];
            const analysis = docsAnalysis[key];
            const rating = (analysis === null || analysis === void 0 ? void 0 : analysis.rating) || 'n/a';
            return new docx_1.TableRow({ children: [
                    tableCell(key, COL[0], { shade: i % 2 === 1 }),
                    tableCell(present ? '✓' : '✗', COL[1], { shade: i % 2 === 1, center: true, bold: true, color: present ? C.green : C.red }),
                    tableCell((analysis === null || analysis === void 0 ? void 0 : analysis.findings) || '—', COL[2], { shade: i % 2 === 1 }),
                    tableCell(rating.toUpperCase(), COL[3], { shade: i % 2 === 1, center: true, bold: true, color: ratingColor[rating] || C.text }),
                ] });
        }),
    ];
    return [
        sectionTitle('REVUE DOCUMENTAIRE'),
        divider(),
        subTitle('Analyse quantitative'),
        paragraph(`Sur les ${totalDocs} documents attendus, ${presentCount} ont été fournis, soit un taux de disponibilité de ${Math.round(presentCount / totalDocs * 100)}%.`),
        spacer(),
        subTitle('Analyse de conformité'),
        paragraph(`En matière de conformité documentaire, ${conformityCount} documents sont jugés conformes (${Math.round(conformityCount / totalDocs * 100)}%), ${partielCount} partiellement conformes et ${nonConformeCount} non conformes.`),
        spacer(),
        subTitle('Détail des documents analysés'),
        new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL, rows }),
        spacer(),
        ...(dr.documents_manquants ? [
            subTitle('Documents manquants'),
            paragraph(dr.documents_manquants, { italic: true, color: C.red }),
        ] : []),
        ...(dr.autres_documents ? [
            subTitle('Autres documents consultés'),
            paragraph(dr.autres_documents, { italic: true }),
        ] : []),
    ];
}
// =============================================================================
//  INSPECTION TERRAIN (APES)
// =============================================================================
function buildInspectionAnalysis(items, title) {
    if (!items || Object.keys(items).length === 0)
        return [];
    const values = Object.values(items);
    const statusCount = values.reduce((acc, v) => {
        const s = (v.status || '').toLowerCase();
        if (s.includes('conforme') || s.includes('ok') || s.includes('bon'))
            acc.conforme++;
        else if (s.includes('non conforme') || s.includes('critique'))
            acc.nonConforme++;
        else if (s.includes('partiel') || s.includes('amélioration'))
            acc.partiel++;
        else
            acc.nonEvalue++;
        return acc;
    }, { conforme: 0, nonConforme: 0, partiel: 0, nonEvalue: 0 });
    const riskCount = values.reduce((acc, v) => {
        const r = (v.risk || '').toLowerCase();
        if (r.includes('élevé') || r.includes('critique'))
            acc.eleve++;
        else if (r.includes('moyen'))
            acc.moyen++;
        else if (r.includes('faible'))
            acc.faible++;
        else
            acc.nonEvalue++;
        return acc;
    }, { eleve: 0, moyen: 0, faible: 0, nonEvalue: 0 });
    return [
        subTitle(title),
        paragraph(`Statut des vérifications : ${statusCount.conforme} conformes, ${statusCount.partiel} partiels, ${statusCount.nonConforme} non conformes.`),
        paragraph(`Niveaux de risque identifiés : ${riskCount.eleve} élevés, ${riskCount.moyen} moyens, ${riskCount.faible} faibles.`),
    ];
}
function buildInspectionTable(title, items) {
    if (!items || Object.keys(items).length === 0)
        return [];
    const COL = [2800, 1400, 3638, 1800];
    const riskColor = {
        faible: C.green,
        moyen: C.yellow,
        élevé: C.red,
        critique: C.red,
    };
    const rows = [
        new docx_1.TableRow({ tableHeader: true, children: [
                tableCell('Élément inspecté', COL[0], { header: true }),
                tableCell('Statut', COL[1], { header: true, center: true }),
                tableCell('Observations', COL[2], { header: true }),
                tableCell('Niveau de risque', COL[3], { header: true, center: true }),
            ] }),
        ...Object.entries(items).map(([key, val], i) => {
            const riskKey = (val.risk || '').toLowerCase();
            const rColor = Object.keys(riskColor).find(k => riskKey.includes(k));
            return new docx_1.TableRow({ children: [
                    tableCell(key, COL[0], { shade: i % 2 === 1 }),
                    tableCell(val.status, COL[1], { shade: i % 2 === 1, center: true }),
                    tableCell(val.observations, COL[2], { shade: i % 2 === 1 }),
                    tableCell(val.risk, COL[3], { shade: i % 2 === 1, center: true, bold: true, color: rColor ? riskColor[rColor] : C.text }),
                ] });
        }),
    ];
    return [new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL, rows }), spacer(160)];
}
function buildFieldInspectionSection(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const fi = data.fieldInspection;
    if (!fi)
        return [];
    return [
        sectionTitle('INSPECTION DE TERRAIN'),
        divider(),
        subTitle('Informations générales'),
        kvParagraph('Projet', (_a = fi.project_name) !== null && _a !== void 0 ? _a : '—'),
        kvParagraph('Date', fi.date ? new Date(fi.date).toLocaleDateString('fr-FR') : '—'),
        kvParagraph('Auditeurs', (_b = fi.auditors) !== null && _b !== void 0 ? _b : '—'),
        kvParagraph('Accompagnateurs', (_c = fi.accompaniers) !== null && _c !== void 0 ? _c : '—'),
        kvParagraph('Zones visitées', Array.isArray(fi.zones) ? fi.zones.join(', ') || '—' : '—'),
        spacer(),
        subTitle('Synthèse des constats terrain'),
        ...buildInspectionAnalysis(fi.water_management, 'Gestion de l\'eau'),
        ...buildInspectionAnalysis(fi.waste_management, 'Gestion des déchets'),
        ...buildInspectionAnalysis(fi.emissions, 'Émissions atmosphériques'),
        ...buildInspectionAnalysis(fi.health_safety, 'Santé et sécurité'),
        ...buildInspectionAnalysis(fi.community, 'Relations communautaires'),
        spacer(),
        subTitle('Détail par thématique'),
        ...buildInspectionTable('Gestion de l\'eau', (_d = fi.water_management) !== null && _d !== void 0 ? _d : {}),
        ...buildInspectionTable('Gestion des déchets', (_e = fi.waste_management) !== null && _e !== void 0 ? _e : {}),
        ...buildInspectionTable('Émissions atmosphériques', (_f = fi.emissions) !== null && _f !== void 0 ? _f : {}),
        ...buildInspectionTable('Santé et sécurité', (_g = fi.health_safety) !== null && _g !== void 0 ? _g : {}),
        ...buildInspectionTable('Relations communautaires', (_h = fi.community) !== null && _h !== void 0 ? _h : {}),
    ];
}
// =============================================================================
//  ENTRETIENS PARTIES PRENANTES (APES)
// =============================================================================
function buildStakeholderInterviewSection(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const si = data.stakeholderInterview;
    if (!si)
        return [];
    const responses = (_a = si.responses) !== null && _a !== void 0 ? _a : {};
    const avgScore = (si.eval_quality + si.eval_frankness + si.eval_relevance + si.eval_climate) / 4;
    const COL = [3200, 6438];
    const EVAL_COL = [2400, 2000, 5238];
    const evalEntries = [
        ['Qualité de l\'information', (_b = si.eval_quality) !== null && _b !== void 0 ? _b : 0],
        ['Franchise et authenticité', (_c = si.eval_frankness) !== null && _c !== void 0 ? _c : 0],
        ['Pertinence pour l\'audit', (_d = si.eval_relevance) !== null && _d !== void 0 ? _d : 0],
        ['Climat général de l\'échange', (_e = si.eval_climate) !== null && _e !== void 0 ? _e : 0],
    ];
    return [
        sectionTitle('ENTRETIENS PARTIES PRENANTES'),
        divider(),
        subTitle('Profil des interviewés'),
        new docx_1.Table({
            width: { size: TW, type: docx_1.WidthType.DXA },
            columnWidths: COL,
            rows: [
                new docx_1.TableRow({ tableHeader: true, children: [tableCell('Champ', COL[0], { header: true }), tableCell('Valeur', COL[1], { header: true })] }),
                new docx_1.TableRow({ children: [tableCell('Nom complet', COL[0]), tableCell((_f = si.profile_name) !== null && _f !== void 0 ? _f : '—', COL[1])] }),
                new docx_1.TableRow({ children: [tableCell('Fonction', COL[0]), tableCell((_g = si.profile_function) !== null && _g !== void 0 ? _g : '—', COL[1])] }),
                new docx_1.TableRow({ children: [tableCell('Genre', COL[0]), tableCell((_h = si.profile_gender) !== null && _h !== void 0 ? _h : '—', COL[1])] }),
                new docx_1.TableRow({ children: [tableCell('Tranche d\'âge', COL[0]), tableCell((_j = si.profile_age_range) !== null && _j !== void 0 ? _j : '—', COL[1])] }),
                new docx_1.TableRow({ children: [tableCell('Type partie prenante', COL[0]), tableCell((_k = si.stakeholder_type) !== null && _k !== void 0 ? _k : '—', COL[1])] }),
                new docx_1.TableRow({ children: [tableCell('Lieu', COL[0]), tableCell((_l = si.location) !== null && _l !== void 0 ? _l : '—', COL[1])] }),
                new docx_1.TableRow({ children: [tableCell('Durée', COL[0]), tableCell((_m = si.duration) !== null && _m !== void 0 ? _m : '—', COL[1])] }),
                new docx_1.TableRow({ children: [tableCell('Date', COL[0]), tableCell(si.date ? new Date(si.date).toLocaleDateString('fr-FR') : '—', COL[1])] }),
            ],
        }),
        spacer(),
        subTitle('Analyse des réponses'),
        paragraph("Les entretiens ont permis de recueillir des informations précieuses sur la perception du projet par les parties prenantes."),
        spacer(),
        ...Object.entries(responses).slice(0, 5).map(([question, answer]) => [
            paragraph(question, { bold: true }),
            paragraph(String(answer), { italic: true, spacing: 60 }),
            spacer(60),
        ]).flat(),
        spacer(),
        subTitle('Évaluation de la qualité des entretiens'),
        paragraph(`Note globale moyenne : ${avgScore.toFixed(1)}/5, témoignant d'une ${avgScore >= 4 ? 'excellente' : avgScore >= 3 ? 'bonne' : 'moyenne'} qualité d'échange.`),
        new docx_1.Table({
            width: { size: TW, type: docx_1.WidthType.DXA },
            columnWidths: EVAL_COL,
            rows: [
                new docx_1.TableRow({ tableHeader: true, children: [tableCell('Critère', EVAL_COL[0], { header: true }), tableCell('Note /5', EVAL_COL[1], { header: true, center: true }), tableCell('Représentation', EVAL_COL[2], { header: true })] }),
                ...evalEntries.map(([k, v], i) => new docx_1.TableRow({ children: [
                        tableCell(k, EVAL_COL[0], { shade: i % 2 === 1 }),
                        tableCell(String(v), EVAL_COL[1], { shade: i % 2 === 1, center: true, bold: true, color: C.secondary }),
                        tableCell('★'.repeat(v) + '☆'.repeat(5 - v), EVAL_COL[2], { shade: i % 2 === 1, color: C.secondary }),
                    ] })),
            ],
        }),
    ];
}
// =============================================================================
//  ÉVALUATION GENRE (APES)
// =============================================================================
function buildGenderAssessmentSection(data) {
    var _a, _b, _c, _d;
    const ga = data.genderAssessment;
    if (!ga)
        return [];
    const objectives = (_a = ga.objectives) !== null && _a !== void 0 ? _a : [];
    const achievements = objectives.filter((o) => o.status === 'atteint').length;
    const inProgress = objectives.filter((o) => o.status === 'en-cours').length;
    const notAchieved = objectives.filter((o) => o.status === 'non-atteint').length;
    const envImpacts = ((_b = ga.impacts) !== null && _b !== void 0 ? _b : []).filter((imp) => imp.impact_type === 'environmental');
    const socioImpacts = ((_c = ga.impacts) !== null && _c !== void 0 ? _c : []).filter((imp) => imp.impact_type === 'socioeconomic');
    return [
        sectionTitle('ÉVALUATION GENRE ET INCLUSION'),
        divider(),
        subTitle('Objectifs de genre'),
        paragraph(`Sur les ${objectives.length} objectifs définis, ${achievements} sont atteints, ${inProgress} en cours et ${notAchieved} non atteints.`),
        spacer(),
        subTitle('Impacts différenciés'),
        ...(envImpacts.length > 0 ? [
            paragraph(`Impacts environnementaux : ${envImpacts.length} impacts différenciés ont été identifiés.`),
        ] : []),
        ...(socioImpacts.length > 0 ? [
            paragraph(`Impacts socioéconomiques : ${socioImpacts.length} impacts différenciés ont été identifiés.`),
        ] : []),
        spacer(),
        subTitle('Recommandations genre'),
        paragraph(`Un total de ${((_d = ga.recommendations) !== null && _d !== void 0 ? _d : []).length} recommandations ont été formulées pour renforcer l'intégration du genre.`),
    ];
}
// =============================================================================
//  MÉCANISME DE PLAINTE (APES)
// =============================================================================
function buildComplaintMechanismSection(data) {
    var _a, _b, _c, _d;
    const cm = data.complaintMechanism;
    if (!cm)
        return [];
    const docCount = Object.keys((_a = cm.documentary_basis) !== null && _a !== void 0 ? _a : {}).length;
    const weaknessesCount = ((_b = cm.weaknesses) !== null && _b !== void 0 ? _b : []).length;
    const strengthsCount = ((_c = cm.strengths) !== null && _c !== void 0 ? _c : []).length;
    const recCount = ((_d = cm.recommendations) !== null && _d !== void 0 ? _d : []).length;
    const conclusionMap = {
        efficace: { text: 'EFFICACE ET CONFORME', color: C.green },
        ameliorer: { text: 'FONCTIONNEL MAIS À AMÉLIORER', color: C.yellow },
        inoperant: { text: 'INOPÉRANT OU INEFFICACE', color: C.red },
    };
    const conclusion = conclusionMap[cm.global_conclusion] || { text: 'Non évalué', color: C.muted };
    return [
        sectionTitle('MÉCANISME DE GESTION DES PLAINTES'),
        divider(),
        subTitle('Analyse documentaire'),
        paragraph(`La base documentaire du MGP comprend ${docCount} documents analysés.`),
        spacer(),
        subTitle('Points forts et faiblesses'),
        paragraph(`Le MGP présente ${strengthsCount} points forts et ${weaknessesCount} faiblesses identifiées.`),
        spacer(),
        subTitle('Conclusion'),
        new docx_1.Paragraph({
            spacing: { after: 160 },
            border: { left: { style: docx_1.BorderStyle.SINGLE, size: 12, color: conclusion.color, space: 20 } },
            indent: { left: 280 },
            children: [new docx_1.TextRun({ text: conclusion.text, size: 20, color: conclusion.color, font: 'Calibri', bold: true })],
        }),
        spacer(),
        subTitle('Recommandations'),
        paragraph(`${recCount} recommandations ont été formulées pour améliorer l'efficacité du MGP.`),
    ];
}
// =============================================================================
//  GUIDE ENTRETIEN
// =============================================================================
function buildGuideEntretienSection(data) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!data || !data.guide_type)
        return [];
    const guideLabels = {
        autorites_locales: 'Autorités Locales',
        riverains_communaute: 'Riverains / Communauté',
        travailleurs_chantier: 'Travailleurs du Chantier',
        maitrise_ouvrage_entreprise: "Maîtrise d'Ouvrage",
        direction_cfpt: 'Direction CFPT',
    };
    const result = [
        sectionTitle('GUIDE D\'ENTRETIEN'),
        divider(),
        subTitle('Informations générales'),
        kvParagraph('Type de guide', (_a = guideLabels[data.guide_type]) !== null && _a !== void 0 ? _a : data.guide_type),
        kvParagraph('Sous-projet', (_b = data.subprojet) !== null && _b !== void 0 ? _b : '—'),
        kvParagraph('Nom', (_c = data.gi_nom) !== null && _c !== void 0 ? _c : '—'),
        kvParagraph('Fonction', (_d = data.gi_fonction) !== null && _d !== void 0 ? _d : '—'),
        kvParagraph('Contact', (_e = data.gi_contact) !== null && _e !== void 0 ? _e : '—'),
        kvParagraph('Date', data.gi_date ? new Date(data.gi_date).toLocaleDateString('fr-FR') : '—'),
        kvParagraph('Lieu', (_f = data.gi_lieu) !== null && _f !== void 0 ? _f : '—'),
        spacer(),
    ];
    // Thèmes
    const themes = [
        { key: 'theme1', title: 'Thème 1' },
        { key: 'theme2', title: 'Thème 2' },
        { key: 'theme3', title: 'Thème 3' },
        { key: 'theme4', title: 'Thème 4' },
    ];
    for (const theme of themes) {
        const themeData = data[theme.key];
        if ((_g = themeData === null || themeData === void 0 ? void 0 : themeData.questions) === null || _g === void 0 ? void 0 : _g.length) {
            result.push(subTitle(theme.title));
            for (const q of themeData.questions) {
                result.push(paragraph(`${q.questionId || q.question_id}: ${q.question}`, { bold: true }));
                result.push(paragraph(`Réponse : ${q.reponse || '—'}`, { italic: true, spacing: 60 }));
                result.push(spacer(60));
            }
            result.push(spacer());
        }
    }
    if (data.notes_auditeur) {
        result.push(subTitle('Notes de l\'auditeur'));
        result.push(paragraph(data.notes_auditeur, { italic: true }));
    }
    return result;
}
// =============================================================================
//  CHECKLIST AUDIT
// =============================================================================
function buildAuditSection(data) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!data || !data.subprojet)
        return [];
    const COL = [800, 3000, 2000, 2000, 1838];
    const cConf = (c) => { var _a; return ((_a = { O: C.green, N: C.red, P: C.yellow }[c]) !== null && _a !== void 0 ? _a : C.muted); };
    const lConf = (c) => { var _a; return ((_a = { O: 'Conforme', N: 'Non conforme', P: 'Partiel' }[c]) !== null && _a !== void 0 ? _a : 'S.O.'); };
    const sections = [
        { title: 'Cadre juridique', key: 'section1_cadreJuridique' },
        { title: 'Stabilité de la structure', key: 'section2_infraSecurite', sub: 'stabiliteStructure' },
        { title: 'Sécurité incendie', key: 'section2_infraSecurite', sub: 'securiteIncendie' },
        { title: 'Accessibilité PMR', key: 'section2_infraSecurite', sub: 'accessibilitePMR' },
        { title: 'Gestion des déchets', key: 'section3_gestionEnvSociale', sub: 'gestionDechets' },
        { title: 'Nuisances et pollution', key: 'section3_gestionEnvSociale', sub: 'nuisancesPollution' },
        { title: 'Santé sécurité travailleurs', key: 'section3_gestionEnvSociale', sub: 'santeSecuteTravailleurs' },
        { title: 'Relations communautés', key: 'section4_gestionSociale', sub: 'relationsCommunautes' },
        { title: 'MGP', key: 'section4_gestionSociale', sub: 'mgp' },
        { title: 'Sécurité sûreté', key: 'section5_risquesERP', sub: 'securiteSurete' },
        { title: 'Hygiène environnement', key: 'section5_risquesERP', sub: 'hygieneEnvironnement' },
    ];
    const result = [
        sectionTitle('CHECKLIST D\'AUDIT'),
        divider(),
        subTitle('Informations générales'),
        kvParagraph('Sous-projet', (_a = data.subprojet) !== null && _a !== void 0 ? _a : '—'),
        kvParagraph('Auditeurs', (_b = data.auditeurs) !== null && _b !== void 0 ? _b : '—'),
        kvParagraph('Date', data.date ? new Date(data.date).toLocaleDateString('fr-FR') : '—'),
        spacer(),
    ];
    for (const section of sections) {
        let items = [];
        if (section.sub) {
            items = (_d = (_c = data[section.key]) === null || _c === void 0 ? void 0 : _c[section.sub]) !== null && _d !== void 0 ? _d : [];
        }
        else {
            items = (_e = data[section.key]) !== null && _e !== void 0 ? _e : [];
        }
        if (items.length > 0) {
            result.push(subTitle(section.title));
            const rows = [
                new docx_1.TableRow({ tableHeader: true, children: [
                        tableCell('N°', COL[0], { header: true, center: true }),
                        tableCell('Critère', COL[1], { header: true }),
                        tableCell('Observations', COL[2], { header: true }),
                        tableCell('Conformité', COL[3], { header: true, center: true }),
                        tableCell('Risque', COL[4], { header: true, center: true }),
                    ] }),
                ...items.map((item, i) => new docx_1.TableRow({ children: [
                        tableCell(item.numero || '—', COL[0], { shade: i % 2 === 1, center: true }),
                        tableCell(item.critere || '—', COL[1], { shade: i % 2 === 1 }),
                        tableCell(item.observations || '—', COL[2], { shade: i % 2 === 1 }),
                        tableCell(lConf(item.conformite), COL[3], { shade: i % 2 === 1, center: true, bold: true, color: cConf(item.conformite) }),
                        tableCell(item.risque_non_conformite || '—', COL[4], { shade: i % 2 === 1, center: true }),
                    ] })),
            ];
            result.push(new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL, rows }));
            result.push(spacer(160));
        }
    }
    if (data.synthese) {
        result.push(subTitle('Synthèse'));
        result.push(kvParagraph('Non-conformités majeures', String((_f = data.synthese.nombreNonConformitesMajeures) !== null && _f !== void 0 ? _f : 0)));
        result.push(kvParagraph('Domaines critiques', (_g = data.synthese.domainesCritiques) !== null && _g !== void 0 ? _g : '—'));
    }
    return result;
}
// =============================================================================
//  CHECKLIST CONDUCTEUR
// =============================================================================
function buildConducteurSection(data) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!data || !data.subprojet)
        return [];
    const COL = [600, 3500, 1000, 2000, 2538];
    const rC = (r) => { var _a; return ((_a = { oui: C.green, non: C.red, partiellement: C.yellow, nsp: C.secondary }[r]) !== null && _a !== void 0 ? _a : C.muted); };
    const rL = (r) => { var _a; return ((_a = { oui: 'Oui', non: 'Non', partiellement: 'Partiel', nsp: 'NSP' }[r]) !== null && _a !== void 0 ? _a : 'S.O.'); };
    const sections = [
        { num: '01', title: 'Informations générales', key: 'section1_infoGenerales' },
        { num: '02', title: 'Processus initial T1', key: 'section2_processusInitialT1' },
        { num: '03', title: 'Installation T2', key: 'section3_installationT2' },
        { num: '04', title: 'Recrutement T2', key: 'section4_recrutementT2' },
        { num: '05', title: 'HSE T2', key: 'section5_hseT2' },
        { num: '06', title: 'Gestion environnementale T2', key: 'section6_gestionEnvT2' },
        { num: '07', title: 'Sensibilisation T2', key: 'section7_sensibilisationT2' },
        { num: '08', title: 'MGP T2', key: 'section8_mgpT2' },
        { num: '09', title: 'Fermeture T2', key: 'section9_fermetureT2' },
        { num: '10', title: 'Exploitation T3', key: 'section10_exploitationT3' },
        { num: '11', title: 'Synthèse', key: 'section11_synthese' },
    ];
    const result = [
        sectionTitle('CHECKLIST CONDUCTEUR DES TRAVAUX'),
        divider(),
        subTitle('Informations générales'),
        kvParagraph('Sous-projet', (_a = data.subprojet) !== null && _a !== void 0 ? _a : '—'),
        kvParagraph('Auditeur', (_b = data.auditeur) !== null && _b !== void 0 ? _b : '—'),
        kvParagraph('Entreprise', (_c = data.entreprise) !== null && _c !== void 0 ? _c : '—'),
        kvParagraph('Personne rencontrée', (_d = data.personne_rencontree) !== null && _d !== void 0 ? _d : '—'),
        kvParagraph('Fonction', (_e = data.fonction) !== null && _e !== void 0 ? _e : '—'),
        kvParagraph('Date', data.date ? new Date(data.date).toLocaleDateString('fr-FR') : '—'),
        kvParagraph('Lieu', (_f = data.lieu) !== null && _f !== void 0 ? _f : '—'),
        spacer(),
    ];
    for (const section of sections) {
        const items = (_g = data[section.key]) !== null && _g !== void 0 ? _g : [];
        if (items.length > 0) {
            result.push(subTitle(`${section.num} - ${section.title}`));
            const rows = [
                new docx_1.TableRow({ tableHeader: true, children: [
                        tableCell('N°', COL[0], { header: true, center: true }),
                        tableCell('Question', COL[1], { header: true }),
                        tableCell('Réponse', COL[2], { header: true, center: true }),
                        tableCell('Détail', COL[3], { header: true }),
                        tableCell('Observations', COL[4], { header: true }),
                    ] }),
                ...items.map((item, i) => new docx_1.TableRow({ children: [
                        tableCell(item.numero || '—', COL[0], { shade: i % 2 === 1, center: true }),
                        tableCell((item.question || '').substring(0, 80), COL[1], { shade: i % 2 === 1 }),
                        tableCell(rL(item.reponse_booleenne), COL[2], { shade: i % 2 === 1, center: true, bold: true, color: rC(item.reponse_booleenne) }),
                        tableCell((item.reponse || '—').substring(0, 50), COL[3], { shade: i % 2 === 1 }),
                        tableCell((item.observations || '—').substring(0, 50), COL[4], { shade: i % 2 === 1 }),
                    ] })),
            ];
            result.push(new docx_1.Table({ width: { size: TW, type: docx_1.WidthType.DXA }, columnWidths: COL, rows }));
            result.push(spacer(160));
        }
    }
    if (data.commentaires_libres) {
        result.push(subTitle('Commentaires libres'));
        result.push(paragraph(data.commentaires_libres, { italic: true }));
    }
    return result;
}
// =============================================================================
//  SYNTHÈSE RAPIDE
// =============================================================================
function buildQuickSynthesis(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const result = [
        sectionTitle('SYNTHÈSE RAPIDE'),
        divider(),
    ];
    let hasData = false;
    if (data.documentReview) {
        const dr = data.documentReview;
        const docsPresents = (_a = dr.documents_presents) !== null && _a !== void 0 ? _a : {};
        const presentCount = Object.values(docsPresents).filter((v) => v === true).length;
        const totalDocs = Object.keys(docsPresents).length;
        result.push(paragraph(`Revue documentaire : ${presentCount}/${totalDocs} documents disponibles (${Math.round(presentCount / totalDocs * 100)}%)`));
        hasData = true;
    }
    if (data.fieldInspection) {
        const fi = data.fieldInspection;
        const allItems = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, ((_b = fi.water_management) !== null && _b !== void 0 ? _b : {})), ((_c = fi.waste_management) !== null && _c !== void 0 ? _c : {})), ((_d = fi.emissions) !== null && _d !== void 0 ? _d : {})), ((_e = fi.health_safety) !== null && _e !== void 0 ? _e : {})), ((_f = fi.community) !== null && _f !== void 0 ? _f : {}));
        const total = Object.keys(allItems).length;
        const risks = Object.values(allItems).filter((v) => (v.risk || '').toLowerCase().includes('élevé')).length;
        result.push(paragraph(`Inspection terrain : ${total} points vérifiés, ${risks} risques élevés identifiés`));
        hasData = true;
    }
    if (data.stakeholderInterview) {
        const si = data.stakeholderInterview;
        const avgScore = (si.eval_quality + si.eval_frankness + si.eval_relevance + si.eval_climate) / 4;
        result.push(paragraph(`Entretiens : Note moyenne ${avgScore.toFixed(1)}/5`));
        hasData = true;
    }
    if (data.genderAssessment) {
        const ga = data.genderAssessment;
        const recCount = ((_g = ga.recommendations) !== null && _g !== void 0 ? _g : []).length;
        result.push(paragraph(`👥 Évaluation genre : ${recCount} recommandations formulées`));
        hasData = true;
    }
    if (data.complaintMechanism) {
        const cm = data.complaintMechanism;
        const weakCount = ((_h = cm.weaknesses) !== null && _h !== void 0 ? _h : []).length;
        const strongCount = ((_j = cm.strengths) !== null && _j !== void 0 ? _j : []).length;
        result.push(paragraph(`MGP : ${strongCount} points forts, ${weakCount} points faibles`));
        hasData = true;
    }
    if (data.guide_type) {
        result.push(paragraph(`Guide d'entretien : ${data.subprojet || 'Sans sous-projet'}`));
        hasData = true;
    }
    if (data.subprojet && !data.guide_type) {
        if (data.auditeurs) {
            result.push(paragraph(`Checklist audit : ${data.subprojet} - ${data.auditeurs}`));
            hasData = true;
        }
        else if (data.auditeur) {
            result.push(paragraph(`Checklist conducteur : ${data.subprojet} - ${data.entreprise || data.auditeur}`));
            hasData = true;
        }
    }
    if (!hasData) {
        result.push(paragraph("Aucune donnée disponible pour la synthèse."));
    }
    result.push(pageBreak());
    return result;
}
// =============================================================================
//  EXPORTS PRINCIPAUX
// =============================================================================
/**
 * Export un formulaire APES complet (5 annexes)
 */
function exportAPESWord(data, projectName, projectLocation, auditors) {
    return __awaiter(this, void 0, void 0, function* () {
        const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        const projectDate = data.project_date ? new Date(data.project_date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
        const sectionsList = [
            'INTRODUCTION',
            'REVUE DOCUMENTAIRE',
            'INSPECTION DE TERRAIN',
            'ENTRETIENS PARTIES PRENANTES',
            'ÉVALUATION GENRE',
            'MÉCANISME DE PLAINTE',
            'SYNTHÈSE RAPIDE',
            'CONCLUSION GÉNÉRALE',
        ];
        const doc = new docx_1.Document({
            numbering: {
                config: [{
                        reference: 'bullet-list',
                        levels: [{ level: 0, format: docx_1.LevelFormat.BULLET, text: '•', alignment: docx_1.AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
                    }],
            },
            styles: {
                default: { document: { run: { font: 'Calibri', size: 20, color: C.text } } },
                paragraphStyles: [
                    { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, font: 'Calibri', color: C.primary }, paragraph: { spacing: { before: 480, after: 120 }, outlineLevel: 0 } },
                    { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, font: 'Calibri', color: C.secondary }, paragraph: { spacing: { before: 280, after: 80 }, outlineLevel: 1 } },
                ],
            },
            sections: [
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
                    children: buildCoverPage(projectName, projectDate, projectLocation, auditors, 'apes'),
                },
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
                    children: buildTableOfContents(sectionsList),
                },
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: Object.assign(Object.assign({}, PAGE.margin), { top: 1440, bottom: 1440 }) } },
                    headers: { default: buildHeader(projectName) },
                    footers: { default: buildFooter(generatedAt) },
                    children: [
                        ...buildIntroduction(),
                        ...buildDocumentReviewSection(data),
                        pageBreak(),
                        ...buildFieldInspectionSection(data),
                        pageBreak(),
                        ...buildStakeholderInterviewSection(data),
                        pageBreak(),
                        ...buildGenderAssessmentSection(data),
                        pageBreak(),
                        ...buildComplaintMechanismSection(data),
                        pageBreak(),
                        ...buildQuickSynthesis(data),
                        ...buildGeneralConclusion(),
                    ],
                },
            ],
        });
        return docx_1.Packer.toBuffer(doc);
    });
}
/**
 * Export un guide d'entretien seul
 */
function exportGuideWord(data, projectName, projectLocation, auditors) {
    return __awaiter(this, void 0, void 0, function* () {
        const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        const projectDate = data.gi_date ? new Date(data.gi_date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
        const sectionsList = [
            'INTRODUCTION',
            'GUIDE D\'ENTRETIEN',
            'CONCLUSION GÉNÉRALE',
        ];
        const doc = new docx_1.Document({
            numbering: {
                config: [{
                        reference: 'bullet-list',
                        levels: [{ level: 0, format: docx_1.LevelFormat.BULLET, text: '•', alignment: docx_1.AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
                    }],
            },
            styles: {
                default: { document: { run: { font: 'Calibri', size: 20, color: C.text } } },
                paragraphStyles: [
                    { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, font: 'Calibri', color: C.primary }, paragraph: { spacing: { before: 480, after: 120 }, outlineLevel: 0 } },
                    { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, font: 'Calibri', color: C.secondary }, paragraph: { spacing: { before: 280, after: 80 }, outlineLevel: 1 } },
                ],
            },
            sections: [
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
                    children: buildCoverPage(projectName, projectDate, projectLocation, auditors, 'guide'),
                },
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
                    children: buildTableOfContents(sectionsList),
                },
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: Object.assign(Object.assign({}, PAGE.margin), { top: 1440, bottom: 1440 }) } },
                    headers: { default: buildHeader(projectName) },
                    footers: { default: buildFooter(generatedAt) },
                    children: [
                        ...buildIntroduction(),
                        ...buildGuideEntretienSection(data),
                        pageBreak(),
                        ...buildGeneralConclusion(),
                    ],
                },
            ],
        });
        return docx_1.Packer.toBuffer(doc);
    });
}
/**
 * Export une checklist audit seule
 */
function exportAuditWord(data, projectName, projectLocation, auditors) {
    return __awaiter(this, void 0, void 0, function* () {
        const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        const projectDate = data.date ? new Date(data.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
        const sectionsList = [
            'INTRODUCTION',
            'CHECKLIST D\'AUDIT',
            'CONCLUSION GÉNÉRALE',
        ];
        const doc = new docx_1.Document({
            numbering: {
                config: [{
                        reference: 'bullet-list',
                        levels: [{ level: 0, format: docx_1.LevelFormat.BULLET, text: '•', alignment: docx_1.AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
                    }],
            },
            styles: {
                default: { document: { run: { font: 'Calibri', size: 20, color: C.text } } },
                paragraphStyles: [
                    { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, font: 'Calibri', color: C.primary }, paragraph: { spacing: { before: 480, after: 120 }, outlineLevel: 0 } },
                    { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, font: 'Calibri', color: C.secondary }, paragraph: { spacing: { before: 280, after: 80 }, outlineLevel: 1 } },
                ],
            },
            sections: [
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
                    children: buildCoverPage(projectName, projectDate, projectLocation, auditors, 'audit'),
                },
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
                    children: buildTableOfContents(sectionsList),
                },
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: Object.assign(Object.assign({}, PAGE.margin), { top: 1440, bottom: 1440 }) } },
                    headers: { default: buildHeader(projectName) },
                    footers: { default: buildFooter(generatedAt) },
                    children: [
                        ...buildIntroduction(),
                        ...buildAuditSection(data),
                        pageBreak(),
                        ...buildGeneralConclusion(),
                    ],
                },
            ],
        });
        return docx_1.Packer.toBuffer(doc);
    });
}
/**
 * Export une checklist conducteur seule
 */
function exportConducteurWord(data, projectName, projectLocation, auditors) {
    return __awaiter(this, void 0, void 0, function* () {
        const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        const projectDate = data.date ? new Date(data.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
        const sectionsList = [
            'INTRODUCTION',
            'CHECKLIST CONDUCTEUR',
            'CONCLUSION GÉNÉRALE',
        ];
        const doc = new docx_1.Document({
            numbering: {
                config: [{
                        reference: 'bullet-list',
                        levels: [{ level: 0, format: docx_1.LevelFormat.BULLET, text: '•', alignment: docx_1.AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
                    }],
            },
            styles: {
                default: { document: { run: { font: 'Calibri', size: 20, color: C.text } } },
                paragraphStyles: [
                    { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, font: 'Calibri', color: C.primary }, paragraph: { spacing: { before: 480, after: 120 }, outlineLevel: 0 } },
                    { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, font: 'Calibri', color: C.secondary }, paragraph: { spacing: { before: 280, after: 80 }, outlineLevel: 1 } },
                ],
            },
            sections: [
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
                    children: buildCoverPage(projectName, projectDate, projectLocation, auditors, 'conducteur'),
                },
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
                    children: buildTableOfContents(sectionsList),
                },
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: Object.assign(Object.assign({}, PAGE.margin), { top: 1440, bottom: 1440 }) } },
                    headers: { default: buildHeader(projectName) },
                    footers: { default: buildFooter(generatedAt) },
                    children: [
                        ...buildIntroduction(),
                        ...buildConducteurSection(data),
                        pageBreak(),
                        ...buildGeneralConclusion(),
                    ],
                },
            ],
        });
        return docx_1.Packer.toBuffer(doc);
    });
}
/**
 * Export tout-en-un : tous les formulaires d'un projet
 */
function exportAllFormsWord(projectName, projectLocation, auditors, apesData, guideData, auditData, conducteurData) {
    return __awaiter(this, void 0, void 0, function* () {
        const generatedAt = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        const projectDate = new Date().toLocaleDateString('fr-FR');
        const sectionsList = [
            'INTRODUCTION',
            ...(apesData ? ['RAPPORT APES (COMPLET)'] : []),
            ...(guideData && guideData.length > 0 ? ['GUIDES D\'ENTRETIEN'] : []),
            ...(auditData && auditData.length > 0 ? ['CHECKLISTS D\'AUDIT'] : []),
            ...(conducteurData && conducteurData.length > 0 ? ['CHECKLISTS CONDUCTEUR'] : []),
            'CONCLUSION GÉNÉRALE',
        ];
        const children = [
            ...buildIntroduction(),
        ];
        // APES complet
        if (apesData) {
            children.push(sectionTitle('RAPPORT APES (COMPLET)'));
            children.push(...buildDocumentReviewSection(apesData));
            children.push(pageBreak());
            children.push(...buildFieldInspectionSection(apesData));
            children.push(pageBreak());
            children.push(...buildStakeholderInterviewSection(apesData));
            children.push(pageBreak());
            children.push(...buildGenderAssessmentSection(apesData));
            children.push(pageBreak());
            children.push(...buildComplaintMechanismSection(apesData));
            children.push(pageBreak());
        }
        // Guides d'entretien
        if (guideData && guideData.length > 0) {
            children.push(sectionTitle('GUIDES D\'ENTRETIEN'));
            for (let i = 0; i < guideData.length; i++) {
                children.push(subTitle(`Guide ${i + 1}`));
                children.push(...buildGuideEntretienSection(guideData[i]));
                if (i < guideData.length - 1)
                    children.push(pageBreak());
            }
            children.push(pageBreak());
        }
        // Checklists audit
        if (auditData && auditData.length > 0) {
            children.push(sectionTitle('CHECKLISTS D\'AUDIT'));
            for (let i = 0; i < auditData.length; i++) {
                children.push(subTitle(`Audit ${i + 1}`));
                children.push(...buildAuditSection(auditData[i]));
                if (i < auditData.length - 1)
                    children.push(pageBreak());
            }
            children.push(pageBreak());
        }
        // Checklists conducteur
        if (conducteurData && conducteurData.length > 0) {
            children.push(sectionTitle('CHECKLISTS CONDUCTEUR'));
            for (let i = 0; i < conducteurData.length; i++) {
                children.push(subTitle(`Conducteur ${i + 1}`));
                children.push(...buildConducteurSection(conducteurData[i]));
                if (i < conducteurData.length - 1)
                    children.push(pageBreak());
            }
            children.push(pageBreak());
        }
        // Conclusion générale
        children.push(...buildGeneralConclusion());
        const doc = new docx_1.Document({
            numbering: {
                config: [{
                        reference: 'bullet-list',
                        levels: [{ level: 0, format: docx_1.LevelFormat.BULLET, text: '•', alignment: docx_1.AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
                    }],
            },
            styles: {
                default: { document: { run: { font: 'Calibri', size: 20, color: C.text } } },
                paragraphStyles: [
                    { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, font: 'Calibri', color: C.primary }, paragraph: { spacing: { before: 480, after: 120 }, outlineLevel: 0 } },
                    { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, font: 'Calibri', color: C.secondary }, paragraph: { spacing: { before: 280, after: 80 }, outlineLevel: 1 } },
                ],
            },
            sections: [
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
                    children: buildCoverPage(projectName, projectDate, projectLocation, auditors, 'global'),
                },
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: PAGE.margin } },
                    children: buildTableOfContents(sectionsList),
                },
                {
                    properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: Object.assign(Object.assign({}, PAGE.margin), { top: 1440, bottom: 1440 }) } },
                    headers: { default: buildHeader(projectName) },
                    footers: { default: buildFooter(generatedAt) },
                    children,
                },
            ],
        });
        return docx_1.Packer.toBuffer(doc);
    });
}
//# sourceMappingURL=words.service.js.map