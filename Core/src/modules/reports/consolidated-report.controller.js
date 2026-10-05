import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { ok } from '../../utils/api-response.js';
import {
  auditReport,
  auditDetailReport,
  cashClosingReport,
  cashFlowReport,
  cashMovementDetailReport,
  cashReconciliationReport,
  cashSessionHistoryReport,
  consolidatedInventoryReport,
  expiredMedicinesReport,
  expiringMedicinesReport,
  fixedAssetDetailReport,
  fixedAssetReport,
  inventoryByBranchReport,
  inventoryKardexReport,
  lowMovementProductsReport,
  minimumStockReport,
  payrollReport,
  profitabilityByBranchReport,
  purchasesBySupplierReport,
  saleDetailReport,
  salesByMedicineReport,
  salesByPeriodReport,
  topProductsReport,
  transferReport
} from './consolidated-report.repository.js';

const reports = {
  'sales-period': salesByPeriodReport,
  'sales-branch': salesByPeriodReport,
  'sales-detail': saleDetailReport,
  'sales-medicine': salesByMedicineReport,
  'top-products': topProductsReport,
  'low-movement-products': lowMovementProductsReport,
  'inventory-branch': inventoryByBranchReport,
  'inventory-consolidated': consolidatedInventoryReport,
  'expiring-medicines': expiringMedicinesReport,
  'expired-medicines': expiredMedicinesReport,
  'minimum-stock': minimumStockReport,
  'inventory-kardex': inventoryKardexReport,
  'stock-transfers': transferReport,
  'cash-flow': cashFlowReport,
  'cash-closing': cashClosingReport,
  'cash-movement-detail': cashMovementDetailReport,
  'cash-reconciliation': cashReconciliationReport,
  'cash-session-history': cashSessionHistoryReport,
  'purchases-supplier': purchasesBySupplierReport,
  'profitability-branch': profitabilityByBranchReport,
  'fixed-assets': fixedAssetReport,
  'fixed-assets-detail': fixedAssetDetailReport,
  payroll: payrollReport,
  audit: auditReport,
  'audit-detail': auditDetailReport
};

const reportTitles = {
  'sales-period': 'Ventas por periodo',
  'sales-branch': 'Ventas por sucursal',
  'sales-detail': 'Detalle de venta',
  'sales-medicine': 'Ventas por medicamento',
  'top-products': 'Productos mas vendidos',
  'low-movement-products': 'Productos con baja rotacion',
  'inventory-branch': 'Inventario por sucursal',
  'inventory-consolidated': 'Inventario consolidado',
  'expiring-medicines': 'Medicamentos proximos a vencer',
  'expired-medicines': 'Medicamentos vencidos',
  'minimum-stock': 'Stock minimo',
  'inventory-kardex': 'Kardex de inventario',
  'stock-transfers': 'Traslados entre sucursales',
  'cash-flow': 'Flujo de efectivo',
  'cash-closing': 'Cierre y diferencias de caja',
  'cash-movement-detail': 'Movimientos detallados por caja',
  'cash-reconciliation': 'Conciliaciones de caja',
  'cash-session-history': 'Historial de ingresos y egresos por sesion',
  'purchases-supplier': 'Compras por proveedor',
  'profitability-branch': 'Rentabilidad por sucursal',
  'fixed-assets': 'Activos fijos',
  'fixed-assets-detail': 'Detalle de activos fijos',
  payroll: 'Planilla',
  audit: 'Auditoria',
  'audit-detail': 'Detalle de auditoria'
};

const fieldLabels = {
  action: 'Acción',
  actionName: 'Acción',
  auditId: 'Id auditoría',
  assetName: 'Activo',
  assets: 'Activos',
  averageCost: 'Costo promedio',
  averagePrice: 'Precio promedio',
  averageTicket: 'Ticket promedio',
  balanceAfter: 'Existencia posterior',
  baseSalary: 'Salario base',
  bonuses: 'Bonificaciones',
  bookValue: 'Valor actual',
  branchId: 'Id sucursal',
  branchName: 'Sucursal',
  cashRegisterName: 'Caja',
  cashSessionId: 'Sesion caja',
  calculatedExpectedAmount: 'Saldo esperado calculado',
  category: 'Categoría',
  categoryName: 'Categoría',
  closingAmount: 'Saldo contado',
  closingDate: 'Fecha cierre',
  code: 'Código',
  cost: 'Costo',
  createdAt: 'Fecha',
  customerName: 'Cliente',
  customerTaxId: 'NIT',
  declaredAmount: 'Monto declarado',
  deductions: 'Descuentos',
  depreciation: 'Depreciación',
  destinationName: 'Destino',
  differenceAmount: 'Diferencia',
  discounts: 'Descuentos',
  employeeName: 'Empleado',
  expense: 'Egresos',
  expirationDate: 'Fecha vencimiento',
  expectedAmount: 'Saldo esperado',
  grossAmount: 'Monto bruto',
  id: 'Id',
  income: 'Ingresos',
  inventoryValue: 'Valor inventario',
  items: 'Items',
  lastSaleDate: 'Última venta',
  lineTotal: 'Total línea',
  location: 'Ubicación',
  lostValue: 'Valor perdido',
  lotNumber: 'Lote',
  margin: 'Margen %',
  medicineId: 'Id medicamento',
  medicineCode: 'Código medicamento',
  medicineName: 'Medicamento',
  missing: 'Faltante',
  module: 'Objeto técnico',
  method: 'Metodo',
  movementDate: 'Fecha movimiento',
  movementTypeName: 'Tipo movimiento',
  nearestExpirationDate: 'Vencimiento mas proximo',
  net: 'Neto',
  netAmount: 'Monto neto',
  newValues: 'Valor nuevo',
  objectName: 'Objeto',
  oldValues: 'Valor anterior',
  openingAmount: 'Saldo inicial',
  openingDate: 'Fecha apertura',
  operation: 'Operacion',
  orders: 'Ordenes',
  originName: 'Origen',
  paymentMethod: 'Forma de pago',
  payments: 'Pagos',
  products: 'Productos',
  profit: 'Utilidad',
  purchaseCost: 'Costo adquisición',
  purchaseDate: 'Fecha adquisición',
  quantity: 'Cantidad',
  quantityIn: 'Entrada',
  quantityOut: 'Salida',
  quantitySold: 'Cantidad vendida',
  reason: 'Motivo',
  recordId: 'Registro',
  referenceId: 'Referencia',
  referenceType: 'Tipo referencia',
  responsible: 'Responsable',
  receiptNumber: 'Comprobante',
  saleDate: 'Fecha venta',
  saleId: 'Venta',
  saleSubtotal: 'Subtotal venta',
  saleTax: 'Impuesto venta',
  saleTotal: 'Total venta',
  sales: 'Ventas',
  source: 'Tipo movimiento',
  sourceId: 'Documento',
  status: 'Estado',
  stockAvailable: 'Existencia',
  stockMin: 'Stock minimo',
  subtotal: 'Subtotal',
  systemAmount: 'Monto sistema',
  supplierName: 'Proveedor',
  tax: 'Impuestos',
  total: 'Total',
  totalQuantity: 'Cantidad total',
  totalSold: 'Venta total',
  totalValue: 'Valor total',
  unitCost: 'Costo unitario',
  unitPrice: 'Precio unitario',
  units: 'Unidades',
  usefulLifeMonths: 'Vida util meses',
  userId: 'Usuario'
};

const filterLabels = {
  action: 'Acción',
  auditId: 'Id auditoría',
  branchId: 'Sucursal',
  categoryId: 'Categoría',
  days: 'Días',
  endDate: 'Hasta',
  format: 'Formato',
  id: 'Id',
  limit: 'Límite',
  medicineId: 'Medicamento',
  module: 'Objeto',
  page: 'Página',
  paymentMethod: 'Forma de pago',
  productId: 'Producto',
  recordId: 'Registro',
  saleId: 'Venta',
  sortBy: 'Ordenado por',
  startDate: 'Desde',
  status: 'Estado',
  supplierId: 'Proveedor',
  userId: 'Usuario'
};

const palette = {
  purple: 'FF4633B9',
  purpleSoft: 'FFEDEBFF',
  ink: 'FF1B1533',
  inkSoft: 'FFF4F2FA',
  red: 'FFFFE4E6',
  redDark: 'FFB4232A',
  white: 'FFFFFFFF',
  soft: 'FFFAFAFF',
  border: 'FFE5E1F5'
};

const humanize = value => fieldLabels[value] ?? String(value).replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase());

const humanizeFilter = key => filterLabels[key] ?? humanize(key);

const processStamp = () => {
  const now = new Date();
  const pad = value => String(value).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
};

const fileNameFor = (reportName, extension) => `${(reportTitles[reportName] ?? reportName).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '')}_${processStamp()}.${extension}`;

const localDateTime = () => new Date().toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' });

const readableDate = value => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' });
};

const prettyJson = value => {
  if (!value || typeof value !== 'string') return value;
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

const formatFilterValue = (key, value) => {
  if (value === null || value === undefined || value === '') return '';
  if (key === 'format') return String(value).toUpperCase();
  if (key.toLowerCase().includes('date')) return String(readableDate(value)).replace(', 00:00', '');
  return String(value);
};

const filtersText = filters => Object.entries(filters)
  .filter(([, value]) => value !== '' && value !== null && value !== undefined)
  .map(([key, value]) => `${humanizeFilter(key)}: ${formatFilterValue(key, value)}`)
  .join(' | ') || 'Sin filtros';

const exportRows = rows => rows.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [humanize(key), key === 'oldValues' || key === 'newValues' ? prettyJson(value) : key.toLowerCase().includes('date') || key === 'createdAt' ? readableDate(value) : formatValue(value)])));

const responseRows = rows => rows.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, key.toLowerCase().includes('date') || key === 'createdAt' ? readableDate(value) : value])));

const formatValue = value => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  return value;
};

const toXlsx = async (rows, reportName, filters) => {
  const exportData = exportRows(rows);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Farmacia Don Beto';
  workbook.created = new Date();
  workbook.subject = reportTitles[reportName] ?? reportName;
  const worksheet = workbook.addWorksheet('Reporte');
  worksheet.properties.defaultRowHeight = 22;
  const title = reportTitles[reportName] ?? reportName;
  const headers = Object.keys(exportData[0]);
  const lastColumn = Math.max(headers.length, 4);
  const lastLetter = worksheet.getColumn(lastColumn).letter;
  worksheet.mergeCells(`A1:${lastLetter}1`);
  worksheet.getCell('A1').value = 'Farmacia Don Beto';
  worksheet.getCell('A1').font = { bold: true, size: 20, color: { argb: palette.white } };
  worksheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: palette.purple } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 30;
  worksheet.mergeCells(`A2:${lastLetter}2`);
  worksheet.getCell('A2').value = title;
  worksheet.getCell('A2').font = { bold: true, size: 15, color: { argb: palette.ink } };
  worksheet.getCell('A2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: palette.purpleSoft } };
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).height = 26;
  worksheet.getCell('A4').value = 'Generado';
  worksheet.getCell('B4').value = localDateTime();
  worksheet.getCell('A5').value = 'Filtros';
  worksheet.getCell('B5').value = filtersText(filters);
  worksheet.getCell('A6').value = 'Registros';
  worksheet.getCell('B6').value = rows.length;
  ['A4', 'A5', 'A6'].forEach(cell => {
    worksheet.getCell(cell).font = { bold: true, color: { argb: palette.ink } };
    worksheet.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: palette.inkSoft } };
  });
  ['B4', 'B5', 'B6'].forEach(cell => {
    worksheet.getCell(cell).font = { color: { argb: palette.ink } };
  });

  const headerRowNumber = 8;
  headers.forEach((header, index) => {
    worksheet.getCell(headerRowNumber, index + 1).value = humanize(header);
  });
  worksheet.getRow(headerRowNumber).font = { bold: true, color: { argb: palette.ink } };
  worksheet.getRow(headerRowNumber).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: palette.ink } };
  worksheet.getRow(headerRowNumber).font = { bold: true, color: { argb: palette.white } };
  worksheet.getRow(headerRowNumber).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  worksheet.getRow(headerRowNumber).height = 26;
  exportData.forEach(row => worksheet.addRow(headers.map(header => row[header])));
  worksheet.columns.forEach((column, index) => {
    const header = headers[index] ?? '';
    column.width = ['Valor anterior', 'Valor nuevo'].includes(header) ? 70 : Math.min(Math.max(header.length + 6, 14), 32);
  });
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell(cell => {
      cell.border = { top: { style: 'thin', color: { argb: palette.border } }, left: { style: 'thin', color: { argb: palette.border } }, bottom: { style: 'thin', color: { argb: palette.border } }, right: { style: 'thin', color: { argb: palette.border } } };
      cell.alignment = { vertical: 'top', wrapText: true };
      if (rowNumber > headerRowNumber && rowNumber % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: palette.soft } };
      if (rowNumber > headerRowNumber && rowNumber % 2 !== 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: palette.white } };
    });
  });
  worksheet.autoFilter = { from: `A${headerRowNumber}`, to: `${worksheet.getColumn(headers.length).letter}${headerRowNumber}` };
  worksheet.views = [{ state: 'frozen', ySplit: headerRowNumber }];
  worksheet.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } };
  return Buffer.from(await workbook.xlsx.writeBuffer({ filename: fileNameFor(reportName, 'xlsx') }));
};

const toPdf = (rows, reportName, filters) => new Promise((resolve, reject) => {
  const exportData = exportRows(rows);
  const doc = new PDFDocument({ margin: 36, size: 'A4', layout: 'landscape' });
  const chunks = [];
  doc.on('data', chunk => chunks.push(chunk));
  doc.on('end', () => resolve(Buffer.concat(chunks)));
  doc.on('error', reject);

  const title = reportTitles[reportName] ?? reportName;
  const headers = Object.keys(exportData[0]).slice(0, 7);
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const columnWidth = pageWidth / headers.length;
  const drawHeader = () => {
    doc.rect(0, 0, doc.page.width, 68).fill('#4633B9');
    doc.rect(0, 68, doc.page.width, 5).fill('#ffe4e6');
    doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text('Farmacia Don Beto', 36, 18);
    doc.fontSize(11).font('Helvetica').text(title, 36, 42);
    doc.fillColor('#1b1533').fontSize(8).text(`Generado: ${localDateTime()}`, 36, 82);
    const filterText = filtersText(filters);
    doc.roundedRect(36, 96, pageWidth, 34, 6).fill('#f4f2fa');
    doc.fillColor('#1b1533').text(`Filtros: ${filterText}`, 46, 104, { width: pageWidth - 20 });
    doc.text(`Registros: ${rows.length}`, 46, 118);
    let y = 146;
    doc.roundedRect(36, y, pageWidth, 24, 4).fill('#1b1533');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7);
    headers.forEach((header, index) => doc.text(humanize(header), 40 + index * columnWidth, y + 7, { width: columnWidth - 8, ellipsis: true }));
    doc.fillColor('#1b1533').font('Helvetica').fontSize(7);
    return y + 22;
  };
  let y = drawHeader();
  if (reportName === 'sales-detail') {
    const row = rows[0] ?? {};
    const lineTotal = rows.reduce((sum, item) => sum + Number(item.lineTotal ?? 0), 0);
    doc.roundedRect(36, y, pageWidth, 54, 6).fill('#f4f2fa');
    doc.fillColor('#1b1533').font('Helvetica-Bold').fontSize(11).text(filters.saleId ? `Venta #${row.saleId ?? filters.saleId}` : 'Detalle de ventas', 48, y + 10);
    doc.font('Helvetica').fontSize(8).text(`Comprobante: ${row.receiptNumber ?? 'Varios'} | Sucursal: ${row.branchName ?? filters.branchId ?? 'Todas'} | Registros: ${rows.length}`, 48, y + 27, { width: pageWidth - 24 });
    doc.text(`Cliente: ${filters.saleId ? (row.customerName ?? 'Consumidor final') : 'Varios'} | NIT: ${filters.saleId ? (row.customerTaxId ?? 'CF') : 'Varios'} | Vendedor: ${filters.saleId ? (row.employeeName ?? '-') : 'Varios'}`, 48, y + 40, { width: pageWidth - 24 });
    y += 62;
    const detailHeaders = ['Venta', 'Fecha', 'Código', 'Medicamento', 'Cant.', 'Precio', 'Total'];
    const widths = [62, 82, 78, pageWidth - 454, 54, 80, 80];
    doc.roundedRect(36, y, pageWidth, 26, 4).fill('#1b1533');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7);
    let x = 44;
    detailHeaders.forEach((header, index) => {
      doc.text(header, x, y + 9, { width: widths[index] - 8, ellipsis: true });
      x += widths[index];
    });
    y += 28;
    rows.forEach((item, index) => {
      if (y > doc.page.height - 90) {
        doc.addPage();
        y = drawHeader();
      }
      doc.rect(36, y, pageWidth, 22).fill(index % 2 === 0 ? '#ffffff' : '#fafaff');
      doc.fillColor('#1b1533').font('Helvetica').fontSize(7);
      x = 44;
      [item.saleId, readableDate(item.saleDate), item.medicineCode, item.medicineName, item.quantity, `Q ${Number(item.unitPrice ?? 0).toFixed(2)}`, `Q ${Number(item.lineTotal ?? 0).toFixed(2)}`].forEach((value, columnIndex) => {
        doc.text(String(value ?? ''), x, y + 7, { width: widths[columnIndex] - 8, ellipsis: true });
        x += widths[columnIndex];
      });
      y += 22;
    });
    y += 12;
    doc.roundedRect(pageWidth - 210, y, 246, 58, 6).fill('#f4f2fa');
    doc.fillColor('#1b1533').font('Helvetica-Bold').fontSize(9).text(`Lineas: ${rows.length}`, pageWidth - 190, y + 13, { width: 210, align: 'right' });
    doc.fillColor('#4633B9').fontSize(12).text(`Total detalle: Q ${lineTotal.toFixed(2)}`, pageWidth - 190, y + 33, { width: 210, align: 'right' });
    doc.end();
    return;
  }
  if (reportName === 'audit-detail') {
    exportData.forEach((row, rowIndex) => {
      if (y > doc.page.height - 170) {
        doc.addPage();
        y = drawHeader();
      }
      doc.roundedRect(36, y, pageWidth, 24, 4).fill(rowIndex % 2 === 0 ? '#ffffff' : '#f4f2fa');
      doc.fillColor('#1b1533').font('Helvetica-Bold').fontSize(8).text(`Registro de auditoria ${row['Id auditoria'] ?? ''}`, 44, y + 8);
      y += 30;
      ['Fecha', 'Usuario', 'Objeto', 'Accion', 'Registro'].forEach(label => {
        doc.font('Helvetica-Bold').text(`${label}:`, 44, y, { width: 70, continued: true });
        doc.font('Helvetica').text(` ${row[label] ?? ''}`, { width: pageWidth - 90 });
        y += 14;
      });
      doc.font('Helvetica-Bold').fillColor('#4633B9').text('Valor anterior', 44, y);
      y += 12;
      doc.fillColor('#1b1533').font('Courier').fontSize(6).text(String(row['Valor anterior'] ?? ''), 44, y, { width: pageWidth - 16, height: 120 });
      y += 128;
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#b4232a').text('Valor nuevo', 44, y);
      y += 12;
      doc.fillColor('#1b1533').font('Courier').fontSize(6).text(String(row['Valor nuevo'] ?? ''), 44, y, { width: pageWidth - 16, height: 120 });
      y += 136;
    });
    doc.end();
    return;
  }
  exportData.slice(0, 500).forEach((row, rowIndex) => {
    if (y > doc.page.height - 54) {
      doc.addPage();
      y = drawHeader();
    }
    doc.rect(36, y, pageWidth, 20).fill(rowIndex % 2 === 0 ? '#ffffff' : '#fafaff');
    doc.fillColor('#1b1533');
    headers.forEach((header, index) => doc.text(String(formatValue(row[header])).replaceAll('\n', ' '), 40 + index * columnWidth, y + 6, { width: columnWidth - 8, ellipsis: true }));
    y += 20;
  });
  doc.fillColor('#4633B9').fontSize(7).text(rows.length > 500 ? `Mostrando 500 de ${rows.length} filas. Use XLSX para el detalle completo.` : 'Fin del reporte', 36, doc.page.height - 36, { align: 'center' });
  doc.end();
});

const sendFile = async (res, reportName, format, rows, filters) => {
  const data = rows.length ? rows : [{ mensaje: 'Sin datos' }];
  if (format === 'xlsx') {
    const buffer = await toXlsx(data, reportName, filters);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileNameFor(reportName, 'xlsx')}"`);
    return res.send(buffer);
  }
  if (format === 'pdf') {
    const buffer = await toPdf(data, reportName, filters);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileNameFor(reportName, 'pdf')}"`);
    return res.send(buffer);
  }
  return null;
};

export const getReport = async (req, res) => {
  const loader = reports[req.params.report];
  if (!loader) return ok(res, []);
  const data = await loader(req.query);
  if (req.params.report === 'audit-detail') return ok(res, responseRows(data));
  if (['xlsx', 'pdf'].includes(req.query.format)) return sendFile(res, req.params.report, req.query.format, data, req.query);
  return ok(res, responseRows(data));
};
