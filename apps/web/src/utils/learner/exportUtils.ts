import { type Transaction } from "@/services/paymentHistory/payment-history-service"
import { jsPDF } from 'jspdf';

// Neutralizes CSV/spreadsheet formula injection by prefixing values that
// start with =, +, -, or @ with a single quote so spreadsheet apps treat
// them as plain text instead of executing them as formulas.
function sanitizeCSVField(value: string): string {
  if (/^[=+\-@]/.test(value)) {
    return `'${value}`
  }
  return value
}

export function exportCSV(transactions: Transaction[]) {
  if (transactions.length === 0) return
  const headers = ["Date", "Tutor", "Subject", "Duration", "Amount", "Currency", "Status"]
  const rows = transactions.map((tx) => [
    tx.date, sanitizeCSVField(tx.tutorName), sanitizeCSVField(tx.subject),
    tx.duration >= 60 ? `${tx.duration / 60}h` : `${tx.duration}min`,
    tx.amount.toFixed(2), tx.currency, tx.status,
  ])
  const csvContent = [headers, ...rows]
    .map((row) => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    .join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "mentora_transactions.csv"
  link.click()
  URL.revokeObjectURL(url)
}




// ── Status color helper ───────────────────────────────────
function getStatusColors(status: string): {
  fill: [number, number, number];
  text: string;
} {
  switch (status.toLowerCase()) {
    case "completed":
      return { fill: [209, 250, 229], text: "#065f46" }; // green
    case "pending":
      return { fill: [254, 243, 199], text: "#92400e" }; // yellow/orange
    case "failed":
    case "cancelled":
      return { fill: [254, 226, 226], text: "#991b1b" }; // red
    case "refunded":
      return { fill: [219, 234, 254], text: "#1e40af" }; // blue
    default:
      return { fill: [243, 244, 246], text: "#374151" }; // gray
  }
}

export function exportInvoicePDF(tx: Transaction) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageW = 210;
  const margin = 20;
  let y = 20;

  // ── Helper functions ──────────────────────────────────────
  const setFont = (size: number, style: 'normal' | 'bold' = 'normal', color = '#1f2937') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    doc.setTextColor(r, g, b);
  };

  const drawRow = (label: string, value: string, bold = false) => {
    setFont(11, 'normal', '#6b7280');
    doc.text(label, margin, y);
    setFont(11, bold ? 'bold' : 'normal', '#1f2937');
    doc.text(value, pageW - margin, y, { align: 'right' });
    y += 10;
  };

  const drawLine = () => {
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 8;
  };

  // ── Header ────────────────────────────────────────────────
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, y - 5, 38, 10, 3, 3, 'F');
  setFont(13, 'bold', '#ffffff');
  doc.text('Mentora', margin + 4, y + 2);

  setFont(16, 'bold', '#1f2937');
  doc.text('Invoice', pageW - margin, y, { align: 'right' });
  y += 7;
  setFont(10, 'normal', '#6b7280');
  doc.text(`#${tx.id}`, pageW - margin, y, { align: 'right' });
  y += 16;

  drawLine();

  // ── Details ───────────────────────────────────────────────
  drawRow('Date',     tx.date);
  drawRow('Tutor',    tx.tutorName);
  drawRow('Subject',  tx.subject);
  drawRow('Duration', tx.duration >= 60 ? `${tx.duration / 60} Hour` : `${tx.duration} min`);

  // Status badge
  setFont(11, 'normal', '#6b7280');
  doc.text('Status', margin, y);
  const { fill, text } = getStatusColors(tx.status);
  doc.setFillColor(fill[0], fill[1], fill[2]);
  const statusW = doc.getTextWidth(tx.status) + 8;
  doc.roundedRect(pageW - margin - statusW, y - 5, statusW, 7, 2, 2, 'F');
  setFont(10, 'bold', text);
  doc.text(tx.status, pageW - margin - statusW / 2, y, { align: 'center' });
  y += 14;

  drawLine();

  // ── Totals ────────────────────────────────────────────────
  drawRow('Session Cost', `${tx.currency}${tx.amount.toFixed(2)}`);
  y += 2;
  drawLine();

  setFont(13, 'bold', '#4f46e5');
  doc.text('Total', margin, y);
  doc.text(`${tx.currency}${tx.amount.toFixed(2)}`, pageW - margin, y, { align: 'right' });
  y += 20;

  // ── Footer ────────────────────────────────────────────────
  y = 270;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 7;
  setFont(9, 'normal', '#9ca3af');
  doc.text(
    `Thank you for learning with Mentora! © ${new Date().getFullYear()} Mentora Academic Inc.`,
    pageW / 2,
    y,
    { align: 'center' }
  );

  // ── Save ──────────────────────────────────────────────────
  doc.save(`Invoice-${tx.id}.pdf`);
}