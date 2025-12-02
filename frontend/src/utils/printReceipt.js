import jsPDF from 'jspdf';
import { formatCurrency, formatDateTime } from './index';

/**
 * Generate and print receipt as PDF
 * @param {Object} order - Order data
 */
export function printReceipt(order) {
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 200], // 80mm width, auto height
  });

  const items = order.items || [];
  const customer = order.customer || {};
  
  let yPos = 10;
  const leftMargin = 5;
  const pageWidth = 80;
  const centerX = pageWidth / 2;

  // Helper function to add centered text
  const addCenteredText = (text, y, fontSize = 10, isBold = false) => {
    doc.setFontSize(fontSize);
    if (isBold) doc.setFont(undefined, 'bold');
    else doc.setFont(undefined, 'normal');
    
    const textWidth = doc.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, y);
    return y + (fontSize / 2.5);
  };

  // Helper function to add line
  const addLine = (y, style = 'solid') => {
    if (style === 'dashed') {
      doc.setLineDash([1, 1]);
    }
    doc.line(leftMargin, y, pageWidth - leftMargin, y);
    doc.setLineDash([]);
    return y + 3;
  };

  // ===== HEADER =====
  yPos = addCenteredText('SIMAUL', yPos, 16, true);
  yPos = addCenteredText('Sistem Manajemen Laundry', yPos, 8);
  yPos = addCenteredText('Telp: 0812-XXXX-XXXX', yPos, 8);
  yPos = addLine(yPos + 2, 'dashed');

  // ===== TRACKING CODE =====
  yPos += 3;
  doc.setFillColor(245, 245, 245);
  doc.rect(leftMargin, yPos - 4, pageWidth - (leftMargin * 2), 12, 'F');
  doc.setDrawColor(0);
  doc.rect(leftMargin, yPos - 4, pageWidth - (leftMargin * 2), 12);
  yPos = addCenteredText(order.tracking_code || 'N/A', yPos + 3, 14, true);
  yPos += 5;

  // ===== CUSTOMER INFO =====
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('PELANGGAN', leftMargin, yPos);
  yPos += 4;
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  doc.text('Nama:', leftMargin, yPos);
  doc.text(customer.name || '-', leftMargin + 15, yPos);
  yPos += 4;
  doc.text('Telepon:', leftMargin, yPos);
  doc.text(customer.phone || '-', leftMargin + 15, yPos);
  yPos += 2;
  yPos = addLine(yPos, 'dashed');

  // ===== ORDER DETAILS =====
  yPos += 2;
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('DETAIL PESANAN', leftMargin, yPos);
  yPos += 4;
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(7);
  doc.text('Tanggal:', leftMargin, yPos);
  doc.text(formatDateTime(order.created_at), leftMargin + 15, yPos);
  yPos += 5;

  // Items
  items.forEach((item, index) => {
    // Item background
    if (index % 2 === 0) {
      doc.setFillColor(249, 249, 249);
      doc.rect(leftMargin, yPos - 3, pageWidth - (leftMargin * 2), 10, 'F');
    }
    
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text(item.service?.name || 'Layanan', leftMargin + 1, yPos);
    yPos += 4;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);
    const qtyText = `${item.qty} ${item.service?.unit_type || 'unit'}`;
    const priceText = formatCurrency(item.subtotal);
    doc.text(qtyText, leftMargin + 1, yPos);
    
    const priceWidth = doc.getTextWidth(priceText);
    doc.text(priceText, pageWidth - leftMargin - priceWidth - 1, yPos);
    yPos += 6;
  });

  yPos += 1;
  yPos = addLine(yPos, 'dashed');

  // ===== TOTALS =====
  yPos += 3;
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  
  // Subtotal
  doc.text('Subtotal:', leftMargin, yPos);
  const subtotalText = formatCurrency(order.total_price);
  const subtotalWidth = doc.getTextWidth(subtotalText);
  doc.text(subtotalText, pageWidth - leftMargin - subtotalWidth, yPos);
  yPos += 4;

  // Discount (if any)
  if (order.discount_amount > 0) {
    doc.text('Diskon:', leftMargin, yPos);
    const discountText = `-${formatCurrency(order.discount_amount)}`;
    const discountWidth = doc.getTextWidth(discountText);
    doc.text(discountText, pageWidth - leftMargin - discountWidth, yPos);
    yPos += 4;
  }

  yPos = addLine(yPos);

  // Total
  yPos += 2;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL:', leftMargin, yPos);
  const totalText = formatCurrency(order.final_price);
  const totalWidth = doc.getTextWidth(totalText);
  doc.text(totalText, pageWidth - leftMargin - totalWidth, yPos);
  yPos += 6;

  yPos = addLine(yPos, 'dashed');

  // ===== PAYMENT INFO =====
  yPos += 3;
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('Pembayaran:', leftMargin, yPos);
  doc.text(order.payment_method || 'CASH', leftMargin + 25, yPos);
  yPos += 4;
  
  doc.text('Status:', leftMargin, yPos);
  const statusText = order.payment_status === 'PAID' ? 'LUNAS ✓' : 'BELUM LUNAS';
  doc.setFont(undefined, 'bold');
  if (order.payment_status === 'PAID') {
    doc.setTextColor(34, 197, 94); // Green
  } else {
    doc.setTextColor(249, 115, 22); // Orange
  }
  doc.text(statusText, leftMargin + 25, yPos);
  doc.setTextColor(0, 0, 0); // Reset to black
  yPos += 5;

  // ===== NOTES =====
  if (order.customer_notes) {
    yPos = addLine(yPos, 'dashed');
    yPos += 3;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(8);
    doc.text('CATATAN', leftMargin, yPos);
    yPos += 4;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);
    const notes = doc.splitTextToSize(order.customer_notes, pageWidth - (leftMargin * 2) - 2);
    notes.forEach(line => {
      doc.text(line, leftMargin + 1, yPos);
      yPos += 3;
    });
    yPos += 2;
  }

  yPos = addLine(yPos, 'dashed');

  // ===== FOOTER =====
  yPos += 3;
  doc.setFontSize(7);
  doc.setFont(undefined, 'normal');
  yPos = addCenteredText('Terima kasih atas kepercayaan Anda', yPos, 7);
  yPos = addCenteredText('Simpan label ini sebagai bukti', yPos, 7);
  yPos += 2;
  doc.setFontSize(6);
  yPos = addCenteredText(`Dicetak: ${formatDateTime(new Date())}`, yPos, 6);

  // Auto print
  doc.autoPrint();
  
  // Open in new window for printing
  window.open(doc.output('bloburl'), '_blank');
}
