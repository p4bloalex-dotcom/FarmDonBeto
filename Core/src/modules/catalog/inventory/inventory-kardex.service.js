export const registerKardex = async (manager, { branchId, medicineId, inventoryLotId = null, movementType, quantityIn = 0, quantityOut = 0, previousBalance = 0, balanceAfter, unitCost = null, referenceType = null, referenceId = null, reason = null, userId = null, movementDate = new Date() }) => {
  const repo = manager.getRepository('InventoryKardex');
  const safeReason = reason == null ? null : String(reason).slice(0, 255);
  await repo.save(repo.create({ branchId, medicineId, inventoryLotId, movementDate, movementType, quantityIn, quantityOut, previousBalance, balanceAfter, unitCost, referenceType, referenceId, reason: safeReason, createdBy: userId }));
};
