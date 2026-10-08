import assert from 'node:assert/strict';
import test from 'node:test';
import { applySupplierReturnsToDetails, calculatePurchaseTotals, calculateReceiptLine, determineInvoiceMatching } from '../../src/modules/catalog/purchases/purchase-flow.js';

test('recepcion perfecta: todo llega en buen estado y factura coincide', () => {
  const receipt = calculateReceiptLine({ ordered: 10, arrived: 10, good: 10 });
  assert.equal(receipt.notAccepted, 0);
  assert.equal(receipt.pendingAfter, 0);

  const invoice = determineInvoiceMatching({
    details: [{ quantityOrdered: 10, quantityReceived: 10, quantityRejected: 0, unitPrice: 12.5 }],
    invoiceTotal: 125
  });
  assert.equal(invoice.payableTotal, 125);
  assert.equal(invoice.matchingStatus, 'MATCHED');
});

test('entrega parcial: si llegan 9 de 10 queda pendiente 1 y no hay rechazo', () => {
  const receipt = calculateReceiptLine({ ordered: 10, arrived: 9, good: 9 });
  assert.equal(receipt.notAccepted, 0);
  assert.equal(receipt.pendingAfter, 1);
});

test('producto no aceptado: lo pagable es solo lo que esta en buen estado', () => {
  const receipt = calculateReceiptLine({ ordered: 2, arrived: 2, good: 1 });
  assert.equal(receipt.notAccepted, 1);
  assert.equal(receipt.pendingAfter, 0);

  const totals = calculatePurchaseTotals([{ quantityOrdered: 2, quantityReceived: 2, quantityRejected: 1, unitPrice: 65.6 }]);
  assert.equal(totals.orderedTotal, 131.2);
  assert.equal(totals.payableTotal, 65.6);
  assert.equal(totals.notAcceptedTotal, 65.6);
});

test('factura por producto no aceptado genera discrepancia', () => {
  const invoice = determineInvoiceMatching({
    details: [{ quantityOrdered: 2, quantityReceived: 2, quantityRejected: 1, unitPrice: 65.6 }],
    invoiceTotal: 131.2
  });
  assert.equal(invoice.payableTotal, 65.6);
  assert.equal(invoice.difference, 65.6);
  assert.equal(invoice.matchingStatus, 'DISCREPANCY');
});

test('factura menor a lo pagable genera discrepancia', () => {
  const invoice = determineInvoiceMatching({
    details: [{ quantityOrdered: 5, quantityReceived: 5, quantityRejected: 0, unitPrice: 20 }],
    invoiceTotal: 90
  });
  assert.equal(invoice.payableTotal, 100);
  assert.equal(invoice.difference, -10);
  assert.equal(invoice.matchingStatus, 'DISCREPANCY');
});

test('devolucion a proveedor reduce lo pagable antes de facturar', () => {
  const details = applySupplierReturnsToDetails([
    { medicineId: 1, quantityOrdered: 10, quantityReceived: 10, quantityRejected: 0, unitPrice: 15 }
  ], [
    { medicineId: 1, quantity: 3 }
  ]);

  const invoice = determineInvoiceMatching({ details, invoiceTotal: 105 });
  assert.equal(invoice.returned, 3);
  assert.equal(invoice.returnedTotal, 45);
  assert.equal(invoice.payableTotal, 105);
  assert.equal(invoice.matchingStatus, 'MATCHED');
});

test('factura que incluye producto devuelto genera discrepancia', () => {
  const details = applySupplierReturnsToDetails([
    { medicineId: 1, quantityOrdered: 10, quantityReceived: 10, quantityRejected: 0, unitPrice: 15 }
  ], [
    { medicineId: 1, quantity: 3 }
  ]);

  const invoice = determineInvoiceMatching({ details, invoiceTotal: 150 });
  assert.equal(invoice.payableTotal, 105);
  assert.equal(invoice.difference, 45);
  assert.equal(invoice.matchingStatus, 'DISCREPANCY');
});

test('no permite recibir mas de lo pendiente', () => {
  assert.throws(() => calculateReceiptLine({ ordered: 10, alreadyVerified: 6, arrived: 5, good: 5 }), /pendiente por recibir/);
});

test('no permite que buen estado supere lo que llego', () => {
  assert.throws(() => calculateReceiptLine({ ordered: 10, arrived: 4, good: 5 }), /buen estado/);
});
