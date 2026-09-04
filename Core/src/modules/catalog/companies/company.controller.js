import { created, ok } from '../../../utils/api-response.js';
import { findFirstCompany, listCompanies, upsertFirstCompany } from './company.repository.js';

export const addCompany = async (req, res) => created(res, await upsertFirstCompany(req.body));

export const getCompanyByUser = async (req, res) => {
  return ok(res, await findFirstCompany());
};

export const getCompanies = async (_req, res) => ok(res, await listCompanies());
