export const registerKardex = async (manager, { branchId, medicineId, movementType, quantityIn = 0, quantityOut = 0, balanceAfter, unitCost = null, referenceType = null, referenceId = null, reason = null, userId = null, movementDate = new Date() }) => {
  const repo = manager.getRepository('InventoryKardex');
  await repo.save(repo.create({ branchId, medicineId, movementDate, movementType, quantityIn, quantityOut, balanceAfter, unitCost, referenceType, referenceId, reason, createdBy: userId }));
};
