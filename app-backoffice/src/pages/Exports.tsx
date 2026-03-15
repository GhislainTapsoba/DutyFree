import { useState } from 'react';
import { useBackofficeStore } from '../store/backofficeStore';
import { FileSpreadsheet, FileText, Download, RefreshCw, CheckCircle, Calendar } from 'lucide-react';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n));
const today = () => new Date().toISOString().slice(0, 10);
const firstOfMonth = () => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); };

type ExportDef = { id: string; title: string; desc: string; format: 'Excel' | 'PDF'; section: string };

const EXPORTS: ExportDef[] = [
  { id: 'ventes_journalier', title: 'Rapport journalier des ventes', desc: 'CA, tickets, ticket moyen par heure et par vendeur', format: 'Excel', section: 'Ventes' },
  { id: 'ventes_mensuel', title: 'Rapport mensuel complet', desc: 'Toutes les métriques de la période sélectionnée', format: 'Excel', section: 'Ventes' },
  { id: 'journal_paiements', title: 'Journal des paiements', desc: 'Tous les encaissements détaillés par mode et devise', format: 'Excel', section: 'Ventes' },
  { id: 'mix_produits', title: 'Mix des ventes par produit', desc: 'Top ventes, quantités, CA par article sur la période', format: 'Excel', section: 'Ventes' },
  { id: 'rapport_stock', title: 'Rapport de stock', desc: 'Mouvements, ruptures, valorisation du stock actuel', format: 'Excel', section: 'Stock' },
  { id: 'sommiers_djbc', title: 'Rapport DJBC — Sommiers', desc: 'État des sommiers douaniers pour transmission à la DJBC', format: 'PDF', section: 'Douane' },
  { id: 'taux_capture', title: 'Taux de capture passagers', desc: 'Ratio tickets / passagers (données aéroport)', format: 'PDF', section: 'Reporting' },
  { id: 'tickets_duplicata', title: 'Duplicata de tickets', desc: 'Réédition des tickets sur une période ou numéro de ticket', format: 'PDF', section: 'Caisse' },
];

// ── Helper : téléchargement blob ──────────────────────────────────────
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Style helper pour ExcelJS ─────────────────────────────────────────
function headerStyle(): Partial<ExcelJS.Style> {
  return {
    font: { bold: true, color: { argb: 'FF0A0E1A' }, size: 11 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5C842' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      bottom: { style: 'thin', color: { argb: 'FFD4A800' } },
    },
  };
}

function addHeader(ws: ExcelJS.Worksheet, title: string, from: string, to: string, colCount: number) {
  ws.mergeCells(1, 1, 1, colCount);
  const titleCell = ws.getCell('A1');
  titleCell.value = 'DUTY FREE — AÉROPORT DE OUAGADOUGOU (DJBC)';
  titleCell.font = { bold: true, size: 13, color: { argb: 'FF0A0E1A' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5C842' } };
  titleCell.alignment = { horizontal: 'center' };

  ws.mergeCells(2, 1, 2, colCount);
  const subCell = ws.getCell('A2');
  subCell.value = `${title} | Période : ${from} → ${to} | Généré le ${new Date().toLocaleString('fr-FR')}`;
  subCell.font = { size: 9, color: { argb: 'FF556680' }, italic: true };
  subCell.alignment = { horizontal: 'center' };

  ws.getRow(3).height = 6; // espace
}

// ── Exports Excel avec ExcelJS ────────────────────────────────────────
async function exportExcel(exp: ExportDef, from: string, to: string, sales: unknown[]) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'DJBC Duty Free';
  wb.created = new Date();

  if (exp.id === 'ventes_journalier' || exp.id === 'ventes_mensuel') {
    const ws = wb.addWorksheet('Ventes');
    addHeader(ws, exp.title, from, to, 8);

    const headers = ['N° Ticket', 'Date', 'Caisse', 'Vendeur', 'Articles', 'Devise', 'Montant TTC', 'Mode paiement'];
    const headerRow = ws.addRow(headers);
    headerRow.eachCell(cell => Object.assign(cell, headerStyle()));
    ws.getRow(4).height = 18;

    const rows = Array.isArray(sales) && sales.length > 0
      ? (sales as Record<string, unknown>[]).map(s => [
          s.numero_ticket || s.id,
          s.date_creation ? new Date(s.date_creation as string).toLocaleString('fr-FR') : '',
          s.numero_caisse || '',
          s.caissier_nom || '',
          s.nombre_articles || '',
          s.devise || 'XOF',
          s.montant_total || 0,
          s.mode_paiement || '',
        ])
      : [
          ['TKT-2025-001', '15/06/2025 08:32', 'CAISSE-01', 'Aminata Sawadogo', 3, 'XOF', 52000, 'Carte'],
          ['TKT-2025-002', '15/06/2025 09:14', 'CAISSE-02', 'Issouf Compaoré', 1, 'EUR', 87, 'Espèces'],
          ['TKT-2025-003', '15/06/2025 10:05', 'CAISSE-01', 'Aminata Sawadogo', 2, 'XOF', 37000, 'Mobile Money'],
        ];

    rows.forEach(r => {
      const row = ws.addRow(r);
      row.eachCell(cell => {
        cell.font = { size: 10 };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFE8ECF4' } } };
      });
      // Colonne montant en gras
      row.getCell(7).font = { bold: true, size: 10, family: 3 };
    });

    ws.columns = [
      { width: 18 }, { width: 22 }, { width: 12 }, { width: 20 },
      { width: 10 }, { width: 8 }, { width: 16 }, { width: 18 },
    ];
  }

  else if (exp.id === 'journal_paiements') {
    const ws = wb.addWorksheet('Paiements');
    addHeader(ws, exp.title, from, to, 4);

    const headers = ['Mode de paiement', 'Transactions', 'Montant XOF', 'Part (%)'];
    const headerRow = ws.addRow(headers);
    headerRow.eachCell(cell => Object.assign(cell, headerStyle()));
    ws.getRow(4).height = 18;

    const data = [
      ['Espèces XOF', 142, 12450000],
      ['Carte bancaire', 89, 18300000],
      ['Mobile Money', 34, 4200000],
      ['Espèces EUR', 28, 3150000],
      ['Espèces USD', 15, 1800000],
    ];
    const total = data.reduce((s, r) => s + (r[2] as number), 0);
    data.forEach(r => {
      const pct = ((r[2] as number) / total * 100).toFixed(1) + '%';
      ws.addRow([r[0], r[1], r[2], pct]);
    });
    // Total
    const totRow = ws.addRow(['TOTAL', data.reduce((s, r) => s + (r[1] as number), 0), total, '100%']);
    totRow.eachCell(cell => { cell.font = { bold: true }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0EDE6' } }; });

    ws.columns = [{ width: 22 }, { width: 14 }, { width: 18 }, { width: 10 }];
  }

  else if (exp.id === 'mix_produits') {
    const ws = wb.addWorksheet('Mix Produits');
    addHeader(ws, exp.title, from, to, 5);

    ws.addRow(['Produit', 'Code', 'Qté vendue', 'CA XOF', 'Part CA (%)']).eachCell(c => Object.assign(c, headerStyle()));
    ws.getRow(4).height = 18;

    [
      ['Hennessy VS 70cl', 'ALC-001', 48, 888000, '12.3%'],
      ['Dior Sauvage EDP 100ml', 'PAR-001', 23, 1196000, '16.5%'],
      ['Marlboro Red x20', 'TAB-001', 180, 504000, '7.0%'],
      ['Baileys Original 70cl', 'ALC-002', 34, 544000, '7.5%'],
      ['Chanel N°5 EDP 100ml', 'PAR-002', 18, 1170000, '16.2%'],
    ].forEach(r => ws.addRow(r));

    ws.columns = [{ width: 28 }, { width: 12 }, { width: 14 }, { width: 16 }, { width: 12 }];
  }

  else if (exp.id === 'rapport_stock') {
    const ws = wb.addWorksheet('Stock');
    addHeader(ws, exp.title, from, to, 7);

    ws.addRow(['Produit', 'Code', 'Stock actuel', 'Stock min', 'Stock max', 'Statut', 'Valorisation XOF']).eachCell(c => Object.assign(c, headerStyle()));
    ws.getRow(4).height = 18;

    const stockData = [
      ['Hennessy VS 70cl', 'ALC-001', 48, 10, 200, 'OK', 888000],
      ['Baileys Original 70cl', 'ALC-002', 12, 10, 100, 'FAIBLE', 192000],
      ['Cointreau Triple Sec 70cl', 'ALC-004', 0, 5, 50, 'RUPTURE', 0],
      ['Dior Sauvage EDP 100ml', 'PAR-001', 7, 5, 30, 'OK', 364000],
      ['Marlboro Red x20', 'TAB-001', 180, 50, 500, 'OK', 504000],
    ];

    stockData.forEach(r => {
      const row = ws.addRow(r);
      const statut = r[5] as string;
      const statutCell = row.getCell(6);
      if (statut === 'RUPTURE') { statutCell.font = { bold: true, color: { argb: 'FFF87171' } }; }
      else if (statut === 'FAIBLE') { statutCell.font = { bold: true, color: { argb: 'FFFB923C' } }; }
      else { statutCell.font = { bold: true, color: { argb: 'FF22C55E' } }; }
    });

    ws.columns = [{ width: 28 }, { width: 12 }, { width: 14 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 18 }];
  }

  // Téléchargement
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, `${exp.id}_${from}_${to}.xlsx`);
}

// ── Exports PDF (inchangé) ────────────────────────────────────────────
async function exportPdf(exp: ExportDef, from: string, to: string) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFontSize(9); doc.setTextColor(120, 120, 120);
  doc.text('DUTY FREE — AÉROPORT DE OUAGADOUGOU (DJBC)', pageW / 2, 14, { align: 'center' });
  doc.setFontSize(16); doc.setTextColor(30, 30, 30); doc.setFont('helvetica', 'bold');
  doc.text(exp.title, pageW / 2, 26, { align: 'center' });
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
  doc.text(`Période : ${from} → ${to}  |  Généré le ${new Date().toLocaleString('fr-FR')}`, pageW / 2, 33, { align: 'center' });
  doc.setDrawColor(220, 200, 100); doc.setLineWidth(0.5); doc.line(14, 37, pageW - 14, 37);

  if (exp.id === 'sommiers_djbc') {
    autoTable(doc, {
      startY: 44,
      head: [['N° Sommier', 'Réf. DJBC', 'Produit', 'Qté Init.', 'Qté Sortie', 'Restant', 'Statut']],
      body: [
        ['SOM-2024-001', 'REF-DJBC-2024-001', 'Alcools LVMH', '200', '145', '55', 'Actif'],
        ['SOM-2024-002', 'REF-DJBC-2024-002', 'Alcools Rémy Cointreau', '120', '118', '2', 'En cours'],
        ['SOM-2024-003', 'REF-DJBC-2024-003', 'Tabacs Philip Morris', '1000', '295', '705', 'Actif'],
        ['SOM-2024-004', 'REF-DJBC-2024-004', 'Alcools Diageo', '150', '126', '24', 'Actif'],
        ['SOM-2023-012', 'REF-DJBC-2023-012', 'Parfums LVMH', '80', '80', '0', 'Apuré'],
      ],
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [245, 200, 66], textColor: [0, 0, 0], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [22, 30, 46] },
    });
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 16;
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('Visa Direction :', 14, finalY);
    doc.line(14, finalY + 18, 90, finalY + 18);
    doc.text('Visa DJBC :', pageW / 2, finalY);
    doc.line(pageW / 2, finalY + 18, pageW - 14, finalY + 18);
  }

  if (exp.id === 'taux_capture') {
    autoTable(doc, {
      startY: 44,
      head: [['Mois', 'Passagers', 'Tickets', 'Taux de capture', 'CA XOF']],
      body: [
        ['Janvier 2025', '18 400', '1 230', '6.7%', '45 200 000'],
        ['Février 2025', '16 200', '1 080', '6.7%', '38 900 000'],
        ['Mars 2025', '19 800', '1 420', '7.2%', '52 100 000'],
        ['Avril 2025', '21 100', '1 560', '7.4%', '58 700 000'],
        ['Mai 2025', '20 600', '1 490', '7.2%', '56 200 000'],
        ['Juin 2025', '22 300', '1 680', '7.5%', '63 500 000'],
      ],
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
    });
  }

  if (exp.id === 'tickets_duplicata') {
    autoTable(doc, {
      startY: 44,
      head: [['N° Ticket', 'Date', 'Caisse', 'Vendeur', 'Montant XOF', 'Mode paiement']],
      body: [
        ['TKT-2025-1421', '15/06/2025 09:32', 'CAISSE-01', 'Aminata Sawadogo', '52 000', 'Carte'],
        ['TKT-2025-1422', '15/06/2025 10:14', 'CAISSE-02', 'Issouf Compaoré', '18 500', 'Espèces'],
        ['TKT-2025-1423', '15/06/2025 11:05', 'CAISSE-01', 'Aminata Sawadogo', '87 500', 'Carte + Espèces'],
      ],
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [55, 65, 81], textColor: [255, 255, 255], fontStyle: 'bold' },
    });
  }

  doc.save(`${exp.id}_${from}_${to}.pdf`);
}

// ── Composant page ────────────────────────────────────────────────────
export function ExportsPage() {
  const { ventes: sales, dashboardData } = useBackofficeStore();
  const [dateFrom, setDateFrom] = useState(firstOfMonth());
  const [dateTo, setDateTo] = useState(today());
  const [loading, setLoading] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const flash = (id: string) => { setDone(id); setTimeout(() => setDone(null), 3000); };

  const handleExport = async (exp: ExportDef) => {
    setLoading(exp.id);
    try {
      await new Promise(r => setTimeout(r, 300));
      if (exp.format === 'Excel') {
        await exportExcel(exp, dateFrom, dateTo, sales);
      } else {
        await exportPdf(exp, dateFrom, dateTo);
      }
      flash(exp.id);
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la génération.');
    } finally {
      setLoading(null);
    }
  };

  const sections = [...new Set(EXPORTS.map(e => e.section))];

  return (
    <div className="fade-in" style={{ padding: '36px 40px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 36 }}>
        <div className="section-label" style={{ marginBottom: 6 }}>Extraction de données</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.01em' }}>Exports & Rapports</h1>
        <hr className="rule" style={{ marginTop: 16 }} />
      </div>

      {/* Période */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 36, alignItems: 'center', background: 'var(--surface)', padding: '16px 20px', border: '1px solid var(--border)', borderRadius: 10 }}>
        <Calendar size={14} color="var(--gold)" />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Période</span>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 160, fontSize: 13 }} />
        <span style={{ color: 'var(--text-3)', fontSize: 13 }}>→</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 160, fontSize: 13 }} />
        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>
          La période s'applique à tous les exports Excel
        </div>
      </div>

      {sections.map(section => (
        <div key={section} style={{ marginBottom: 32 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>{section}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {EXPORTS.filter(e => e.section === section).map(exp => (
              <div key={exp.id} className="card" style={{ padding: '20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ padding: 10, background: exp.format === 'PDF' ? 'var(--amber-dim)' : 'var(--green-dim)', borderRadius: 8, color: exp.format === 'PDF' ? 'var(--amber)' : 'var(--green)', flexShrink: 0 }}>
                  {exp.format === 'Excel' ? <FileSpreadsheet size={18} /> : <FileText size={18} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 13, color: 'var(--text)' }}>{exp.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14, lineHeight: 1.5 }}>{exp.desc}</div>
                  <button onClick={() => handleExport(exp)} disabled={!!loading}
                    className="btn btn-primary btn-sm"
                    style={{ gap: 6, background: done === exp.id ? 'var(--green-dim)' : undefined, color: done === exp.id ? 'var(--green)' : undefined, border: done === exp.id ? '1px solid rgba(34,197,94,0.3)' : undefined }}>
                    {loading === exp.id
                      ? <><RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} /> Génération…</>
                      : done === exp.id
                        ? <><CheckCircle size={11} /> Téléchargé</>
                        : <><Download size={11} /> {exp.format}</>
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
