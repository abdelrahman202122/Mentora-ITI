import type { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../../utils/api-response.js';
import * as adminFinanceService from './admin-finance.service.js';
import type {
  AdminEarningIdParams,
  AdminWithdrawalListQuery,
} from './admin-finance.validation.js';

export async function getFinanceStats(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminFinanceService.getFinanceStats(req.query);
    sendSuccess(res, 200, 'Finance stats retrieved successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function listWithdrawals(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminFinanceService.listWithdrawals(
      req.query as unknown as AdminWithdrawalListQuery,
    );
    sendSuccess(res, 200, 'Withdrawals retrieved successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function approveAllWithdrawals(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminFinanceService.approveAllWithdrawals();
    sendSuccess(res, 200, 'Withdrawals approved successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function approveWithdrawal(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminFinanceService.approveWithdrawal(
      req.params as AdminEarningIdParams,
    );
    sendSuccess(res, 200, 'Withdrawal approved successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function cancelWithdrawal(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminFinanceService.cancelWithdrawal(
      req.params as AdminEarningIdParams,
    );
    sendSuccess(res, 200, 'Withdrawal canceled successfully', result);
  } catch (error) {
    next(error);
  }
}
