import { ok } from '../../utils/api-response.js';
import { getDashboardSummary } from './dashboard.repository.js';

export const getSummary = async (_req, res) => ok(res, await getDashboardSummary());
