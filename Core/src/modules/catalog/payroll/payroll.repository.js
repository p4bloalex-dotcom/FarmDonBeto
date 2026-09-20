import { AppDataSource } from '../../../config/data-source.js';

export class BusinessRuleError extends Error {
  constructor(message) { super(message); this.name = 'BusinessRuleError'; }
}

const fullName = employee => employee ? [employee.firstName, employee.lastName, employee.secondLastname].filter(Boolean).join(' ') : null;

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

export const listPositions = async () => (await AppDataSource.getRepository('PayrollPosition').find({ order: { name: 'ASC' } })).map(positionDto);
export const createPosition = async (data, userId) => positionDto(await AppDataSource.getRepository('PayrollPosition').save(AppDataSource.getRepository('PayrollPosition').create({ ...data, createdBy: userId })));
export const updatePosition = async (id, data, userId) => (await AppDataSource.getRepository('PayrollPosition').update(id, { ...data, updatedBy: userId })).affected > 0;

const salaryQuery = () => AppDataSource.getRepository('EmployeeSalary').createQueryBuilder('item')
  .leftJoin('item.employee', 'employee').addSelect(['employee.id', 'employee.firstName', 'employee.lastName', 'employee.secondLastname'])
  .leftJoin('item.position', 'position').addSelect(['position.id', 'position.name'])
  .leftJoin('item.branch', 'branch').addSelect(['branch.id', 'branch.name']);

export const listSalaries = async () => (await salaryQuery().orderBy('item.effectiveFrom', 'DESC').getMany()).map(salaryDto);
export const createSalary = async (data, userId) => AppDataSource.transaction(async manager => {
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

const registerPayrollCashMovement = async (manager, payment, employeeName) => {
  const session = await manager.getRepository('CashSession').findOneBy({ branchId: payment.branchId, status: 'A' });
  if (!session) throw new BusinessRuleError('Debe existir una sesion de caja abierta en la sucursal para registrar el pago de nomina.');
  const type = await manager.getRepository('CashMovementType').findOneBy({ code: 'PAYROLL_PAYMENT', status: 'E' });
  if (!type) throw new BusinessRuleError('No existe el tipo de movimiento de caja PAYROLL_PAYMENT.');
  await manager.getRepository('CashMovement').save(manager.getRepository('CashMovement').create({
    cashSessionId: session.id,
    branchId: payment.branchId,
    movementTypeId: type.id,
    amount: payment.total,
    description: `Pago de nomina - ${employeeName}`,
    referenceId: payment.id,
    referenceType: 'PAYROLL_PAYMENT',
    movementDate: payment.paymentDate,
    status: 'E',
    createdBy: payment.createdBy
  }));
};

export const generatePayroll = async (data, userId) => AppDataSource.transaction(async manager => {
  const salaryRepo = manager.getRepository('EmployeeSalary');
  const query = salaryRepo.createQueryBuilder('salary')
    .leftJoin('salary.employee', 'employee').addSelect(['employee.id', 'employee.status', 'employee.firstName', 'employee.lastName', 'employee.secondLastname'])
    .where('salary.status = :status', { status: 'A' })
    .andWhere('salary.effectiveFrom <= :periodEnd', { periodEnd: data.periodEnd })
    .andWhere('(salary.effectiveTo IS NULL OR salary.effectiveTo >= :periodStart)', { periodStart: data.periodStart })
    .andWhere('employee.status = :employeeStatus', { employeeStatus: 'E' });
  if (data.branchId) query.andWhere('salary.branchId = :branchId', { branchId: data.branchId });
  const salaries = await query.getMany();
  if (!salaries.length) throw new BusinessRuleError('No hay salarios activos para generar nomina en el periodo seleccionado.');

  const paymentRepo = manager.getRepository('PayrollPayment');
  const created = [];
  for (const salary of salaries) {
    const exists = await paymentRepo.findOneBy({ employeeId: salary.employeeId, periodStart: data.periodStart, periodEnd: data.periodEnd, status: 'E' });
    if (exists) continue;
    const baseSalary = Number(salary.baseSalary ?? 0);
    const adjustments = await activeAdjustmentsFor(manager, salary.employeeId, salary.branchId, data.periodStart, data.periodEnd);
    const bonuses = Number(data.defaultBonus ?? 0) + adjustments.filter(item => item.type === 'B').reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
    const deductions = Number(data.defaultDeduction ?? 0) + adjustments.filter(item => item.type === 'D').reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
    const total = baseSalary + bonuses - deductions;
    const saved = await paymentRepo.save(paymentRepo.create({
      employeeId: salary.employeeId,
      branchId: salary.branchId,
      salaryId: salary.id,
      positionId: salary.positionId,
      paymentDate: data.paymentDate,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      baseSalary,
      bonuses,
      deductions,
      total,
      status: 'E',
      notes: data.notes,
      createdBy: userId
    }));
    for (const adjustment of adjustments) {
      adjustment.status = 'A';
      adjustment.payrollPaymentId = saved.id;
      adjustment.updatedBy = userId;
      await manager.getRepository('PayrollAdjustment').save(adjustment);
    }
    await registerPayrollCashMovement(manager, saved, fullName(salary.employee));
    created.push(saved.id);
  }
  return created;
});

export const listAdjustments = async () => (await AppDataSource.getRepository('PayrollAdjustment').createQueryBuilder('item')
  .leftJoin('item.employee', 'employee').addSelect(['employee.id', 'employee.firstName', 'employee.lastName', 'employee.secondLastname'])
  .leftJoin('item.branch', 'branch').addSelect(['branch.id', 'branch.name'])
  .orderBy('item.adjustmentDate', 'DESC').addOrderBy('item.id', 'DESC').getMany()).map(adjustmentDto);

export const createAdjustment = async (data, userId) => {
  const repo = AppDataSource.getRepository('PayrollAdjustment');
  const saved = await repo.save(repo.create({ ...data, status: 'P', createdBy: userId }));
  return saved.id;
};

export const voidPayment = async (id, reason, userId) => (await AppDataSource.getRepository('PayrollPayment').update(id, { status: 'I', notes: reason, updatedBy: userId })).affected > 0;
export const getPaymentById = async id => paymentQuery().where('item.id = :id', { id }).getOne();
export const toPaymentDto = paymentDto;
