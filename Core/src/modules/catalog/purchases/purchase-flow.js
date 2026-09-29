export const roundMoney = value => Math.round(Number(value ?? 0) * 100) / 100;

export const calculateReceiptLine = ({ ordered, alreadyVerified = 0, arrived, good }) => {
  const orderedQty = Number(ordered ?? 0);
  const verifiedQty = Number(alreadyVerified ?? 0);
  const arrivedQty = Number(arrived ?? 0);
  const goodQty = Number(good ?? 0);
  const pendingBefore = Math.max(0, orderedQty - verifiedQty);

  if (!Number.isFinite(arrivedQty) || arrivedQty <= 0) throw new Error('La cantidad que llego debe ser mayor a cero.');
  if (!Number.isFinite(goodQty) || goodQty < 0) throw new Error('La cantidad en buen estado no puede ser negativa.');
  if (arrivedQty > pendingBefore) throw new Error(`La cantidad que llego no puede superar lo pendiente por recibir (${pendingBefore}).`);
  if (goodQty > arrivedQty) throw new Error('La cantidad en buen estado no puede superar la cantidad que llego.');

  const notAccepted = arrivedQty - goodQty;
  const verifiedAfter = verifiedQty + arrivedQty;

  return {
    ordered: orderedQty,
    arrived: arrivedQty,
    good: goodQty,
    notAccepted,
    pendingBefore,
    verifiedAfter,
    pendingAfter: Math.max(0, orderedQty - verifiedAfter),
    isComplete: verifiedAfter >= orderedQty
  };
};

export const calculatePurchaseTotals = details => (details ?? []).reduce((totals, detail) => {
  const ordered = Number(detail.quantityOrdered ?? detail.quantity ?? 0);
  const verified = Number(detail.quantityReceived ?? 0);
  const notAccepted = Number(detail.quantityRejected ?? 0);
  const good = Math.max(0, verified - notAccepted);
  const pending = Number(detail.quantityPending ?? Math.max(0, ordered - verified));
  const unitPrice = Number(detail.unitPrice ?? detail.unit_price ?? 0);

  totals.ordered += ordered;
  totals.arrived += verified;
  totals.good += good;
  totals.notAccepted += notAccepted;
  totals.pending += pending;
  totals.orderedTotal = roundMoney(totals.orderedTotal + ordered * unitPrice);
  totals.payableTotal = roundMoney(totals.payableTotal + good * unitPrice);
  totals.notAcceptedTotal = roundMoney(totals.notAcceptedTotal + notAccepted * unitPrice);
  totals.pendingTotal = roundMoney(totals.pendingTotal + pending * unitPrice);
  return totals;
}, { ordered: 0, arrived: 0, good: 0, notAccepted: 0, pending: 0, orderedTotal: 0, payableTotal: 0, notAcceptedTotal: 0, pendingTotal: 0 });

export const determineInvoiceMatching = ({ details, invoiceTotal, tolerance = 0.01 }) => {
  const totals = calculatePurchaseTotals(details);
  const total = roundMoney(invoiceTotal);
  const difference = roundMoney(total - totals.payableTotal);
  return {
    ...totals,
    invoiceTotal: total,
    difference,
    matchingStatus: Math.abs(difference) <= Number(tolerance ?? 0.01) ? 'MATCHED' : 'DISCREPANCY'
  };
};
