import { badRequest, created, notFound, ok } from '../../../utils/api-response.js';
import { getPagination, paginationMeta } from '../../../utils/pagination.js';
import { BusinessRuleError, createOrder, findOrderById, getAvailability, listOrderDetails, listOrdersByPhone, paginateOrders, searchMedicines, toOrderDto, updateOrderStatus } from './customer-order.repository.js';

const handleBusiness = (res, error) => error instanceof BusinessRuleError ? badRequest(res, error.message) : Promise.reject(error);

export const checkAvailability = async (req, res) => ok(res, await getAvailability(req.body));
export const findMedicinesForOrder = async (req, res) => ok(res, await searchMedicines(String(req.query.q ?? '').trim()));
export const getCustomerHistory = async (req, res) => ok(res, await listOrdersByPhone(String(req.params.phone ?? '').trim()));

export const addCustomerOrder = async (req, res) => {
  try {
    const id = await createOrder(req.body, req.user?.id ?? null);
    return created(res, toOrderDto(await findOrderById(id)), 'Orden de cliente registrada y reservada correctamente.');
  } catch (error) {
    return handleBusiness(res, error);
  }
};

export const getPagedCustomerOrders = async (req, res) => {
  const pagination = getPagination(req.query);
  const { rows, total } = await paginateOrders(pagination, req.query);
  const meta = paginationMeta({ ...pagination, total });
  res.setHeader('X-Pagination', JSON.stringify(meta));
  return ok(res, { data: rows, meta });
};

export const getCustomerOrderDetail = async (req, res) => {
  const order = await findOrderById(Number(req.params.id));
  if (!order) return notFound(res);
  return ok(res, { ...toOrderDto(order), details: await listOrderDetails(order.id) });
};

export const changeCustomerOrderStatus = async (req, res) => {
  const order = await findOrderById(Number(req.params.id));
  if (!order) return notFound(res);
  try {
    await updateOrderStatus(order, req.body.status, req.user?.id ?? null, req.body.reason ?? null);
    return ok(res, toOrderDto(await findOrderById(order.id)), 'Estado de orden actualizado correctamente.');
  } catch (error) {
    return handleBusiness(res, error);
  }
};
