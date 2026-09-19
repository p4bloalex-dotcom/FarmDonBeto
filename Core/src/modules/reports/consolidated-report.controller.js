import { ok } from '../../utils/api-response.js';
import { cashFlowReport, fixedAssetReport, inventoryKardexReport, payrollReport, transferReport } from './consolidated-report.repository.js';

export const getCashFlowReport = async (req, res) => ok(res, await cashFlowReport(req.query));
export const getInventoryKardexReport = async (req, res) => ok(res, await inventoryKardexReport(req.query));
export const getTransferReport = async (req, res) => ok(res, await transferReport(req.query));
export const getFixedAssetReport = async (req, res) => ok(res, await fixedAssetReport(req.query));
export const getPayrollReport = async (req, res) => ok(res, await payrollReport(req.query));
