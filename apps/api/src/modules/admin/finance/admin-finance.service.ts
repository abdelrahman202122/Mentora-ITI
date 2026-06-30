import * as adminFinanceRepository from './admin-finance.repository.js';
import type {
  AdminEarningIdParams,
  AdminWithdrawalListQuery,
} from './admin-finance.validation.js';

export async function getFinanceStats(filters: unknown): Promise<unknown> {
  return adminFinanceRepository.getFinanceStats(filters);
}

export async function listWithdrawals(
  filters: AdminWithdrawalListQuery,
): Promise<unknown> {
  return adminFinanceRepository.listWithdrawals(filters);
}

export async function approveAllWithdrawals(): Promise<unknown> {
  return adminFinanceRepository.approveAllWithdrawals();
}

export async function approveWithdrawal(
  params: AdminEarningIdParams,
): Promise<unknown> {
  return adminFinanceRepository.approveWithdrawal(params);
}

export async function cancelWithdrawal(
  params: AdminEarningIdParams,
): Promise<unknown> {
  return adminFinanceRepository.cancelWithdrawal(params);
}
