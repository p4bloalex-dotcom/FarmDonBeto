import { AppDataSource } from '../../../config/data-source.js';
import { BusinessRuleError as TreasuryBusinessRuleError, createFinancialMovement } from '../treasury/treasury.repository.js';

export class BusinessRuleError extends Error {
  constructor(message) { super(message); this.name = 'BusinessRuleError'; }
}

const fullName = employee => employee ? [employee.firstName, employee.lastName, employee.secondLastname].filter(Boolean).join(' ') : null;

const STATUS_FLOW = {
  DRAFT: ['CALCULATED'],
  CALCULATED: ['REVIEWED'],
  REVIEWED: ['APPROVED'],
  APPROVED: ['PAID'],
  PAID: ['CLOSED'],
  CLOSED: []
};

const DEFAULT_CONCEPTS = [
  { code: 'SALARY', name: 'Salario ordinario', type: 'INCOME', isAutomatic: true, status: 'E' },
  { code: 'BONUS', name: 'Bonificaciones', type: 'INCOME', isAutomatic: true, status: 'E' },
  { code: 'DEDUCTION', name: 'Deducciones', type: 'DEDUCTION', isAutomatic: true, status: 'E' }
];

const ensureDefaultConcepts = async manager => {
  const repo = manager.getRepository('PayrollConcept');
  for (const concept of DEFAULT_CONCEPTS) {
    const exists = await repo.findOneBy({ code: concept.code });
    if (!exists) await repo.save(repo.create(concept));
  }
  return repo.findBy({ status: 'E' });
};


const positionDto = item => ({ id: item.id, name: item.name, description: item.description, status: item.status });

const salaryDto = item => ({
  id: item.id,
  employeeId: item.employeeId,
  employeeName: fullName(item.employee),
  positionId: item.positionId,
  positionName: item.position?.name ?? null,
  branchId: item.branchId,
  branchName: item.branch?.name ?? null,
  baseSalary: Number(item.baseSalary ?? 0),
  effectiveFrom: item.effectiveFrom,
  effectiveTo: item.effectiveTo,
  status: item.status,
  notes: item.notes
});

const paymentDto = item => ({
  id: item.id,
  employeeId: item.employeeId,
  employeeName: fullName(item.employee),
  branchId: item.branchId,
  branchName: item.branch?.name ?? null,
  positionId: item.positionId,
  positionName: item.position?.name ?? null,
  periodId: item.periodId,
  salaryId: item.salaryId,
  paymentDate: item.paymentDate,
  periodStart: item.periodStart,
  periodEnd: item.periodEnd,
  baseSalary: Number(item.baseSalary ?? 0),
  bonuses: Number(item.bonuses ?? 0),
  deductions: Number(item.deductions ?? 0),
  total: Number(item.total ?? 0),
  status: item.status,
  notes: item.notes
});

const adjustmentDto = item => ({
  id: item.id,
  employeeId: item.employeeId,
  employeeName: fullName(item.employee),
  branchId: item.branchId,
  branchName: item.branch?.name ?? null,
  adjustmentDate: item.adjustmentDate,
  type: item.type,
  amount: Number(item.amount ?? 0),
  reason: item.reason,
  status: item.status,
  payrollPaymentId: item.payrollPaymentId
});

const conceptDto = item => ({ id: item.id, code: item.code, name: item.name, type: item.type, isAutomatic: item.isAutomatic, status: item.status });
const periodDto = item => ({
  id: item.id,
  name: item.name,
  branchId: item.branchId,
  branchName: item.branch?.name ?? null,
  dateStart: item.dateStart,
  dateEnd: item.dateEnd,
  payDate: item.payDate,
  periodType: item.periodType,
  status: item.status
});

export const listPositions = async () => (await AppDataSource.getRepository('PayrollPosition').find({ order: { name: 'ASC' } })).map(positionDto);
export const createPosition = async (data, userId) => positionDto(await AppDataSource.getRepository('PayrollPosition').save(AppDataSource.getRepository('PayrollPosition').create({ ...data, createdBy: userId })));
export const updatePosition = async (id, data, userId) => (await AppDataSource.getRepository('PayrollPosition').update(id, { ...data, updatedBy: userId })).affected > 0;
export const deletePosition = async (id, userId) => (await AppDataSource.getRepository('PayrollPosition').update(id, { status: 'D', updatedBy: userId })).affected > 0;

export const listConcepts = async () => (await AppDataSource.getRepository('PayrollConcept').find({ order: { type: 'ASC', name: 'ASC' } })).map(conceptDto);
export const createConcept = async (data, userId) => conceptDto(await AppDataSource.getRepository('PayrollConcept').save(AppDataSource.getRepository('PayrollConcept').create({ ...data, createdBy: userId })));
export const updateConcept = async (id, data, userId) => (await AppDataSource.getRepository('PayrollConcept').update(id, { ...data, updatedBy: userId })).affected > 0;
export const deleteConcept = async (id, userId) => (await AppDataSource.getRepository('PayrollConcept').update(id, { status: 'D', updatedBy: userId })).affected > 0;

const periodQuery = () => AppDataSource.getRepository('PayrollPeriod').createQueryBuilder('item')
  .leftJoin('item.branch', 'branch').addSelect(['branch.id', 'branch.name']);
export const listPeriods = async () => (await periodQuery().orderBy('item.dateStart', 'DESC').getMany()).map(periodDto);
export const createPeriod = async (data, userId) => periodDto(await AppDataSource.getRepository('PayrollPeriod').save(AppDataSource.getRepository('PayrollPeriod').create({ ...data, createdBy: userId })));
export const updatePeriodStatus = async (id, statusChange, userId) => {
  const status = typeof statusChange === 'string' ? statusChange : statusChange.status;
  const paymentSourceType = typeof statusChange === 'string' ? 'CASH_SESSION' : statusChange.paymentSourceType;
  const paymentOptions = typeof statusChange === 'string' ? { paymentSourceType } : { ...statusChange, paymentSourceType };
  return AppDataSource.transaction(async manager => {
    const period = await manager.getRepository('PayrollPeriod').findOneBy({ id });
    if (!period) throw new BusinessRuleError('El periodo de nomina no existe.');
    if (!STATUS_FLOW[period.status]?.includes(status)) throw new BusinessRuleError(`Transicion de estado no permitida: ${period.status} a ${status}.`);
    const payments = await manager.getRepository('PayrollPayment').findBy({ periodId: id, status: 'E' });
    if (!payments.length && status !== 'CALCULATED') throw new BusinessRuleError('El periodo no tiene nomina generada.');
    if (status === 'PAID') {
      for (const payment of payments) {
        const employee = await manager.getRepository('Employee').findOneBy({ id: payment.employeeId });
        await registerPayrollPaymentMovement(manager, payment, fullName(employee), paymentOptions, userId);
      }
    }
    return (await manager.getRepository('PayrollPeriod').update(id, { status, updatedBy: userId })).affected > 0;
  });
};

const salaryQuery = () => AppDataSource.getRepository('EmployeeSalary').createQueryBuilder('item')
  .leftJoin('item.employee', 'employee').addSelect(['employee.id', 'employee.firstName', 'employee.lastName', 'employee.secondLastname'])
  .leftJoin('item.position', 'position').addSelect(['position.id', 'position.name'])
  .leftJoin('item.branch', 'branch').addSelect(['branch.id', 'branch.name']);

export const listSalaries = async () => (await salaryQuery().orderBy('item.effectiveFrom', 'DESC').getMany()).map(salaryDto);
export const createSalary = async (data, userId) => AppDataSource.transaction(async manager => {
  if (Number(data.baseSalary ?? 0) <= 0) throw new BusinessRuleError('El salario debe ser mayor a cero.');
  const employee = await manager.getRepository('Employee').findOneBy({ id: data.employeeId, status: 'E' });
  if (!employee) throw new BusinessRuleError('El empleado seleccionado no existe o esta desactivado.');
  if (employee.branchId && employee.branchId !== data.branchId) throw new BusinessRuleError('La sucursal del salario no coincide con la sucursal del empleado.');
  await manager.getRepository('EmployeeSalary').update({ employeeId: data.employeeId, status: 'A' }, { status: 'I', effectiveTo: data.effectiveFrom, updatedBy: userId });
  const saved = await manager.getRepository('EmployeeSalary').save(manager.getRepository('EmployeeSalary').create({ ...data, createdBy: userId }));
  return saved.id;
});
export const updateSalary = async (id, data, userId) => (await AppDataSource.getRepository('EmployeeSalary').update(id, { ...data, updatedBy: userId })).affected > 0;

const paymentQuery = () => AppDataSource.getRepository('PayrollPayment').createQueryBuilder('item')
  .leftJoin('item.employee', 'employee').addSelect(['employee.id', 'employee.firstName', 'employee.lastName', 'employee.secondLastname'])
  .leftJoin('item.branch', 'branch').addSelect(['branch.id', 'branch.name'])
  .leftJoin('item.position', 'position').addSelect(['position.id', 'position.name']);

export const listPayments = async () => (await paymentQuery().orderBy('item.paymentDate', 'DESC').addOrderBy('item.id', 'DESC').getMany()).map(paymentDto);

const activeAdjustmentsFor = async (manager, employeeId, branchId, periodStart, periodEnd) => manager.getRepository('PayrollAdjustment').createQueryBuilder('adj')
  .where('adj.employeeId = :employeeId', { employeeId })
  .andWhere('adj.branchId = :branchId', { branchId })
  .andWhere('adj.status = :status', { status: 'P' })
  .andWhere('adj.adjustmentDate >= :periodStart', { periodStart })
  .andWhere('adj.adjustmentDate <= :periodEnd', { periodEnd })
  .getMany();

const registerPayrollPaymentMovement = async (manager, payment, employeeName, options, userId) => {
  const sourceType = options.paymentSourceType ?? 'CASH_SESSION';
  const description = `Pago de nomina - ${employeeName}`;

  if (await manager.getRepository('FinancialMovement').findOneBy({ referenceType: 'PAYROLL_PAYMENT', referenceId: payment.id, status: 'E' })) {
    return;
  }

  let cashSessionId = options.cashSessionId ?? null;
  if (sourceType === 'CASH_SESSION' && !cashSessionId) {
    const session = await manager.getRepository('CashSession').findOneBy({ branchId: payment.branchId, status: 'A' });
    if (!session) throw new BusinessRuleError('Debe existir una sesion de caja abierta en la sucursal para registrar el pago de nomina.');
    cashSessionId = session.id;
  }

  try {
    await createFinancialMovement(manager, {
      financialAccountId: options.financialAccountId ?? null,
      cashSessionId,
      branchId: payment.branchId,
      sourceType,
      operation: 'S',
      amount: payment.total,
      description,
      referenceId: payment.id,
      referenceType: 'PAYROLL_PAYMENT',
      movementDate: payment.paymentDate
    }, userId);
  } catch (error) {
    if (error instanceof TreasuryBusinessRuleError) throw new BusinessRuleError(error.message);
    throw error;
  }

  if (sourceType !== 'CASH_SESSION') return;

  const session = await manager.getRepository('CashSession').findOneBy({ id: cashSessionId, status: 'A' });
  if (!session) throw new BusinessRuleError('Debe existir una sesion de caja abierta en la sucursal para registrar el pago de nomina.');
  const type = await manager.getRepository('CashMovementType').findOneBy({ code: 'PAYROLL_PAYMENT', status: 'E' });
  if (!type) throw new BusinessRuleError('No existe el tipo de movimiento de caja PAYROLL_PAYMENT.');
  if (await manager.getRepository('CashMovement').findOneBy({ referenceType: 'PAYROLL_PAYMENT', referenceId: payment.id, status: 'E' })) return;
  await manager.getRepository('CashMovement').save(manager.getRepository('CashMovement').create({
    cashSessionId: session.id,
    branchId: payment.branchId,
    movementTypeId: type.id,
    amount: payment.total,
    description,
    referenceId: payment.id,
    referenceType: 'PAYROLL_PAYMENT',
    movementDate: payment.paymentDate,
    status: 'E',
    createdBy: payment.createdBy
  }));
};

export const generatePayroll = async (data, userId) => {
  return AppDataSource.transaction(async manager => {
  const period = data.periodId ? await manager.getRepository('PayrollPeriod').findOneBy({ id: data.periodId }) : null;
  if (data.periodId && !period) throw new BusinessRuleError('El periodo de nomina no existe.');
  if (period && period.status !== 'DRAFT') throw new BusinessRuleError('Solo se puede calcular nomina en periodos DRAFT.');
  const periodStart = period?.dateStart ?? data.periodStart;
  const periodEnd = period?.dateEnd ?? data.periodEnd;
  const paymentDate = period?.payDate ?? data.paymentDate;
  const branchId = period?.branchId ?? data.branchId;
  const salaryRepo = manager.getRepository('EmployeeSalary');
  const query = salaryRepo.createQueryBuilder('salary')
    .leftJoin('salary.employee', 'employee').addSelect(['employee.id', 'employee.status', 'employee.firstName', 'employee.lastName', 'employee.secondLastname'])
    .where('salary.status = :status', { status: 'A' })
    .andWhere('salary.effectiveFrom <= :periodEnd', { periodEnd })
    .andWhere('(salary.effectiveTo IS NULL OR salary.effectiveTo >= :periodStart)', { periodStart })
    .andWhere('employee.status = :employeeStatus', { employeeStatus: 'E' });
  if (branchId) query.andWhere('salary.branchId = :branchId', { branchId });
  const salaries = await query.getMany();
  if (!salaries.length) throw new BusinessRuleError('No hay salarios activos para generar nomina en el periodo seleccionado.');

  const paymentRepo = manager.getRepository('PayrollPayment');
  const concepts = await ensureDefaultConcepts(manager);
  const conceptByCode = code => concepts.find(item => item.code === code)?.id ?? null;
  const created = [];
  for (const salary of salaries) {
    const exists = data.periodId
      ? await paymentRepo.findOneBy({ employeeId: salary.employeeId, periodId: data.periodId, status: 'E' })
      : await paymentRepo.findOneBy({ employeeId: salary.employeeId, periodStart, periodEnd, status: 'E' });
    if (exists) continue;
    const baseSalary = Number(salary.baseSalary ?? 0);
    const adjustments = await activeAdjustmentsFor(manager, salary.employeeId, salary.branchId, periodStart, periodEnd);
    const bonuses = Number(data.defaultBonus ?? 0) + adjustments.filter(item => item.type === 'B').reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
    const deductions = Number(data.defaultDeduction ?? 0) + adjustments.filter(item => item.type === 'D').reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
    const total = baseSalary + bonuses - deductions;
    const saved = await paymentRepo.save(paymentRepo.create({
      employeeId: salary.employeeId,
      branchId: salary.branchId,
      salaryId: salary.id,
      positionId: salary.positionId,
      periodId: data.periodId ?? null,
      paymentDate,
      periodStart,
      periodEnd,
      baseSalary,
      bonuses,
      deductions,
      total,
      status: 'E',
      notes: data.notes,
      createdBy: userId
    }));
    const detailRepo = manager.getRepository('PayrollDetail');
    await detailRepo.save(detailRepo.create({ payrollPaymentId: saved.id, branchId: salary.branchId, conceptId: conceptByCode('SALARY'), type: 'INCOME', amount: baseSalary, description: 'Salario ordinario' }));
    if (bonuses > 0) await detailRepo.save(detailRepo.create({ payrollPaymentId: saved.id, branchId: salary.branchId, conceptId: conceptByCode('BONUS'), type: 'INCOME', amount: bonuses, description: 'Bonificaciones' }));
    if (deductions > 0) await detailRepo.save(detailRepo.create({ payrollPaymentId: saved.id, branchId: salary.branchId, conceptId: conceptByCode('DEDUCTION'), type: 'DEDUCTION', amount: deductions, description: 'Deducciones' }));
    for (const adjustment of adjustments) {
      adjustment.status = 'A';
      adjustment.payrollPaymentId = saved.id;
      adjustment.updatedBy = userId;
      await manager.getRepository('PayrollAdjustment').save(adjustment);
    }
    created.push(saved.id);
  }
  if (period) await manager.getRepository('PayrollPeriod').update(period.id, { status: 'CALCULATED', updatedBy: userId });
  return created;
  });
};

export const listPaymentDetails = async paymentId => (await AppDataSource.getRepository('PayrollDetail').createQueryBuilder('item')
  .leftJoin('item.concept', 'concept').addSelect(['concept.id', 'concept.name'])
  .where('item.payrollPaymentId = :paymentId', { paymentId })
  .orderBy('item.id', 'ASC')
  .getMany()).map(item => ({ id: item.id, payrollPaymentId: item.payrollPaymentId, branchId: item.branchId, conceptId: item.conceptId, conceptName: item.concept?.name ?? null, type: item.type, amount: Number(item.amount ?? 0), description: item.description }));

export const listAdjustments = async () => (await AppDataSource.getRepository('PayrollAdjustment').createQueryBuilder('item')
  .leftJoin('item.employee', 'employee').addSelect(['employee.id', 'employee.firstName', 'employee.lastName', 'employee.secondLastname'])
  .leftJoin('item.branch', 'branch').addSelect(['branch.id', 'branch.name'])
  .orderBy('item.adjustmentDate', 'DESC').addOrderBy('item.id', 'DESC').getMany()).map(adjustmentDto);

export const createAdjustment = async (data, userId) => {
  return AppDataSource.transaction(async manager => {
    const employee = await manager.getRepository('Employee').findOneBy({ id: data.employeeId, status: 'E' });
    if (!employee) throw new BusinessRuleError('El empleado seleccionado no existe o esta desactivado.');
    if (employee.branchId && employee.branchId !== data.branchId) throw new BusinessRuleError('La sucursal del ajuste no coincide con la sucursal del empleado.');
    const repo = manager.getRepository('PayrollAdjustment');
    const saved = await repo.save(repo.create({ ...data, status: 'P', createdBy: userId }));
    return saved.id;
  });
};

export const voidPayment = async (id, reason, userId) => (await AppDataSource.getRepository('PayrollPayment').update(id, { status: 'I', notes: reason, updatedBy: userId })).affected > 0;
export const getPaymentById = async id => paymentQuery().where('item.id = :id', { id }).getOne();
export const toPaymentDto = paymentDto;
