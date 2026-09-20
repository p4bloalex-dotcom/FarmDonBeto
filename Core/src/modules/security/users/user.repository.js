import { AppDataSource } from '../../../config/data-source.js';
import { createHashedPassword, generateRandomPassword } from '../../../utils/password.js';

const users = () => AppDataSource.getRepository('User');

const toDto = item => ({
  idUser: item.id,
  idPersonal: item.idPersonal,
  idRole: item.idRole,
  name: item.name,
  status: item.status,
  lastLogin: item.lastLogin,
  companyId: item.companyId,
  company_id: item.companyId
});

const fullName = employee => [employee.firstName, employee.middleName, employee.lastName, employee.secondLastname]
  .filter(Boolean)
  .join(' ');

const normalizeNamePart = value => (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

const buildBaseUserName = employee => {
  const firstName = normalizeNamePart(employee.firstName).slice(0, 1) || 'u';
  const lastName = normalizeNamePart(employee.lastName) || `user${employee.id}`;
  return `${firstName}${lastName}`.slice(0, 45);
};

const generateUniqueUserName = async employee => {
  const base = buildBaseUserName(employee);
  let candidate = base;
  let suffix = 1;

  while (await users().findOneBy({ name: candidate })) {
    suffix += 1;
    candidate = `${base}${suffix}`.slice(0, 50);
  }

  return candidate;
};

export const createUser = async data => AppDataSource.transaction(async manager => {
  const employee = await manager.getRepository('Employee').findOneBy({ id: data.idPersonal });
  const role = await manager.getRepository('Role').findOneBy({ id: data.idRole });

  if (!employee || !role) {
    return null;
  }

  if (employee.status === 'D' || role.status === 'D') {
    return { deactivated: true };
  }

  const plainPassword = generateRandomPassword();
  const { password, salt } = createHashedPassword(plainPassword);
  const user = await manager.getRepository('User').save(manager.getRepository('User').create({
    name: await generateUniqueUserName(employee),
    password,
    salt,
    hasChangedPass: false,
    idPersonal: employee.id,
    idRole: role.id,
    companyId: employee.companyId,
    status: data.status ?? 'E'
  }));

  return { ...toDto(user), generatedPassword: plainPassword, email: employee.email, fullName: fullName(employee) };
});

export const listUsers = async () => (await users().find({ order: { name: 'ASC' } })).map(item => ({
  idUser: item.id,
  id: item.id,
  name: item.name
}));

export const paginateUsers = async ({ offset, pageSize }) => {
  const [rows, total] = await users().findAndCount({
    order: { createdAt: 'DESC', id: 'DESC' },
    skip: offset,
    take: pageSize
  });
  return { rows: rows.map(toDto), total };
};

export const updateUser = async (id, data) => (await users().update(id, { idRole: data.idRole, status: data.status })).affected > 0;

export const deleteUser = async id => (await users().delete(id)).affected > 0;

export const resetUserPassword = async id => AppDataSource.transaction(async manager => {
  const repository = manager.getRepository('User');
  const user = await repository.findOneBy({ id });

  if (!user) {
    return null;
  }

  const plainPassword = generateRandomPassword();
  const { password, salt } = createHashedPassword(plainPassword);
  await repository.update(id, { password, salt, hasChangedPass: false });
  const employee = user.idPersonal ? await manager.getRepository('Employee').findOneBy({ id: user.idPersonal }) : null;

  return { idUser: id, userName: user.name, generatedPassword: plainPassword, email: employee?.email ?? null, fullName: employee ? fullName(employee) : null };
});
