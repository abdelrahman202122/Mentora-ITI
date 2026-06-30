import * as adminFinanceRepository from './admin-finance.repository.js';

export async function getFinanceStats(filters: unknown): Promise<unknown> {
  return adminFinanceRepository.getFinanceStats(filters);
}

export async function listWithdrawals(filters: unknown): Promise<unknown> {
  return adminFinanceRepository.listWithdrawals(filters);
}

export async function approveAllWithdrawals(
  params: unknown,
  body: unknown,
): Promise<unknown> {
  return adminFinanceRepository.approveAllWithdrawals(params, body);
}

export async function approveWithdrawal(
  params: unknown,
  body: unknown,
): Promise<unknown> {
  return adminFinanceRepository.approveWithdrawal(params, body);
}

export async function cancelWithdrawal(
  params: unknown,
  body: unknown,
): Promise<unknown> {
  return adminFinanceRepository.cancelWithdrawal(params, body);
}
