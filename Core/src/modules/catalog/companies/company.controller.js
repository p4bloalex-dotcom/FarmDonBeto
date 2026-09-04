import { created, notFound, ok } from '../../../utils/api-response.js';
import { findCompanyByUser, listCompanies, upsertFirstCompany } from './company.repository.js';

export const addCompany = async (req, res) => created(res, await upsertFirstCompany(req.body));

export const getCompanyByUser = async (req, res) => {
  const company = await findCompanyByUser(req.user.id);
  return company ? ok(res, company) : notFound(res);
};

export const getCompanies = async (_req, res) => ok(res, await listCompanies());
