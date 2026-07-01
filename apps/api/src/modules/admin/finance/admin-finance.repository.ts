import mongoose, { type PipelineStage, type Types } from 'mongoose';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../common/errors/AppError.js';
import Booking from '../../bookings/booking.model.js';
import { BookingStatus } from '../../bookings/booking.types.js';
import Earning from '../../payments/earning.model.js';
import { EarningStatus, type IEarning } from '../../payments/earning.types.js';
import type { AdminWithdrawalListQuery } from './admin-finance.validation.js';

type BookingStats = {
  total: number;
  confirmed: number;
  completed: number;
  canceled: number;
  expired: number;
};

type EarningBucket = {
  count: number;
  amount: number;
};

type FinanceStats = {
  bookings: BookingStats;
  earnings: {
    totalPaidRevenue: number;
    platformCommissionTotal: number;
    tutorEarningsTotal: number;
    pending: EarningBucket;
    available: EarningBucket;
    paidOut: EarningBucket;
  };
};

type WithdrawalsListResult = {
  earnings: IEarning[];
  total: number;
  page: number;
  totalPages: number;
};

type WithdrawalAggregateDoc = IEarning & {
  booking?: {
    bookingStatus?: string;
    learnerId?: Types.ObjectId;
    subjectId?: Types.ObjectId;
    startAt?: Date;
    endAt?: Date;
  };
};

type WithdrawalsBulkApproveResult = {
  approvedCount: number;
  matchedCount: number;
  modifiedCount: number;
};

function parseObjectId(value: string, fieldName: string): Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ValidationError(`Invalid ${fieldName}`);
  }

  return new mongoose.Types.ObjectId(value);
}

function buildSort(sortBy?: string, sortOrder?: string): Record<string, 1 | -1> {
  const field = sortBy?.trim() || 'createdAt';
  const direction = sortOrder === 'asc' ? 1 : -1;
  return { [field]: direction } as Record<string, 1 | -1>;
}

function shouldJoinBooking(filters: AdminWithdrawalListQuery): boolean {
  return Boolean(
    filters.bookingStatus ||
      filters.learnerId ||
      filters.subjectId ||
      (filters.sortBy?.trim() && filters.sortBy.trim().startsWith('booking.')),
  );
}

function emptyBookingStats(): BookingStats {
  return {
    total: 0,
    confirmed: 0,
    completed: 0,
    canceled: 0,
    expired: 0,
  };
}

function asCountMap(
  aggregation: Array<{ _id: string; count: number }>,
): Record<string, number> {
  return aggregation.reduce<Record<string, number>>((acc, item) => {
    acc[item._id] = item.count ?? 0;
    return acc;
  }, {});
}

function asEarningMap(
  aggregation: Array<{
    _id: string;
    count: number;
    totalGrossAmount: number;
    totalCommissionAmount: number;
    totalTutorAmount: number;
  }>,
): Record<
  string,
  {
    count: number;
    totalGrossAmount: number;
    totalCommissionAmount: number;
    totalTutorAmount: number;
  }
> {
  return aggregation.reduce<
    Record<
      string,
      {
        count: number;
        totalGrossAmount: number;
        totalCommissionAmount: number;
        totalTutorAmount: number;
      }
    >
  >((acc, item) => {
    acc[item._id] = {
      count: item.count ?? 0,
      totalGrossAmount: item.totalGrossAmount ?? 0,
      totalCommissionAmount: item.totalCommissionAmount ?? 0,
      totalTutorAmount: item.totalTutorAmount ?? 0,
    };
    return acc;
  }, {});
}

export async function getFinanceStats(
  _filters: unknown,
): Promise<FinanceStats> {
  const [bookingCounts, earningGroups, totalBookings] = await Promise.all([
    Booking.aggregate([
      {
        $group: {
          _id: '$bookingStatus',
          count: { $sum: 1 },
        },
      },
    ]),
    Earning.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalGrossAmount: { $sum: '$grossAmount' },
          totalCommissionAmount: { $sum: '$commissionAmount' },
          totalTutorAmount: { $sum: '$tutorAmount' },
        },
      },
    ]),
    Booking.countDocuments({}),
  ]);

  const bookingMap = asCountMap(bookingCounts);
  const earningMap = asEarningMap(earningGroups);

  const pending = earningMap[EarningStatus.PENDING] ?? {
    count: 0,
    totalGrossAmount: 0,
    totalCommissionAmount: 0,
    totalTutorAmount: 0,
  };
  const available = earningMap[EarningStatus.AVAILABLE] ?? {
    count: 0,
    totalGrossAmount: 0,
    totalCommissionAmount: 0,
    totalTutorAmount: 0,
  };
  const paidOut = earningMap[EarningStatus.PAID_OUT] ?? {
    count: 0,
    totalGrossAmount: 0,
    totalCommissionAmount: 0,
    totalTutorAmount: 0,
  };

  const bookings = emptyBookingStats();
  bookings.total = totalBookings;
  bookings.confirmed = bookingMap[BookingStatus.CONFIRMED] ?? 0;
  bookings.completed = bookingMap[BookingStatus.COMPLETED] ?? 0;
  bookings.canceled = bookingMap[BookingStatus.CANCELED] ?? 0;
  bookings.expired = bookingMap[BookingStatus.EXPIRED] ?? 0;

  const earnings = {
    totalPaidRevenue:
      pending.totalGrossAmount +
      available.totalGrossAmount +
      paidOut.totalGrossAmount,
    platformCommissionTotal:
      pending.totalCommissionAmount +
      available.totalCommissionAmount +
      paidOut.totalCommissionAmount,
    tutorEarningsTotal:
      pending.totalTutorAmount +
      available.totalTutorAmount +
      paidOut.totalTutorAmount,
    pending: {
      count: pending.count,
      amount: pending.totalTutorAmount,
    },
    available: {
      count: available.count,
      amount: available.totalTutorAmount,
    },
    paidOut: {
      count: paidOut.count,
      amount: paidOut.totalTutorAmount,
    },
  };

  return {
    bookings,
    earnings,
  };
}

export async function listWithdrawals(
  _filters: unknown,
): Promise<WithdrawalsListResult> {
  const filters = _filters as AdminWithdrawalListQuery;
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const skip = (page - 1) * limit;

  const earningFilters: Record<string, unknown> = {};

  if (filters.status) {
    earningFilters.status = filters.status;
  }

  if (filters.tutorId) {
    earningFilters.tutorId = parseObjectId(filters.tutorId, 'tutorId');
  }

  if (filters.createdAtFrom || filters.createdAtTo) {
    earningFilters.createdAt = {};

    if (filters.createdAtFrom) {
      (earningFilters.createdAt as Record<string, unknown>).$gte = new Date(
        filters.createdAtFrom,
      );
    }

    if (filters.createdAtTo) {
      (earningFilters.createdAt as Record<string, unknown>).$lte = new Date(
        filters.createdAtTo,
      );
    }
  }

  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    earningFilters.tutorAmount = {};

    if (filters.minAmount !== undefined) {
      (earningFilters.tutorAmount as Record<string, unknown>).$gte =
        filters.minAmount;
    }

    if (filters.maxAmount !== undefined) {
      (earningFilters.tutorAmount as Record<string, unknown>).$lte =
        filters.maxAmount;
    }
  }

  const pipeline: PipelineStage[] = [
    { $match: earningFilters as PipelineStage.Match['$match'] },
  ];

  if (shouldJoinBooking(filters)) {
    const bookingMatch: PipelineStage.Match['$match'] = {};

    if (filters.bookingStatus) {
      bookingMatch['booking.bookingStatus'] = filters.bookingStatus;
    }

    if (filters.learnerId) {
      bookingMatch['booking.learnerId'] = parseObjectId(
        filters.learnerId,
        'learnerId',
      );
    }

    if (filters.subjectId) {
      bookingMatch['booking.subjectId'] = parseObjectId(
        filters.subjectId,
        'subjectId',
      );
    }

    pipeline.push(
      {
        $lookup: {
          from: Booking.collection.name,
          localField: 'bookingId',
          foreignField: '_id',
          as: 'booking',
        },
      },
      {
        $unwind: {
          path: '$booking',
          preserveNullAndEmptyArrays: false,
        },
      },
      { $match: bookingMatch },
    );
  }

  const sort = buildSort(filters.sortBy, filters.sortOrder);
  pipeline.push({ $sort: sort });

  const aggregation = await Earning.aggregate([
    ...pipeline,
    {
      $facet: {
        earnings: [
          { $skip: skip },
          { $limit: limit },
          { $project: { booking: 0 } },
        ],
        metadata: [{ $count: 'total' }],
      },
    },
  ]).exec();

  const [result] = aggregation as Array<{
    earnings: WithdrawalAggregateDoc[];
    metadata: Array<{ total: number }>;
  }>;

  const earnings = (result?.earnings ?? []) as IEarning[];
  const total = result?.metadata?.[0]?.total ?? 0;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return {
    earnings,
    total,
    page,
    totalPages,
  };
}

export async function approveAllWithdrawals(): Promise<WithdrawalsBulkApproveResult> {
  const now = new Date();
  const result = await Earning.updateMany(
    { status: EarningStatus.AVAILABLE },
    {
      $set: {
        status: EarningStatus.PAID_OUT,
        paidOutAt: now,
      },
    },
    { runValidators: true },
  ).exec();

  return {
    approvedCount: result.modifiedCount ?? 0,
    matchedCount: result.matchedCount ?? 0,
    modifiedCount: result.modifiedCount ?? 0,
  };
}

export async function approveWithdrawal(params: {
  earningId: string;
}): Promise<IEarning> {
  const earningId = parseObjectId(params.earningId, 'earningId');
  const now = new Date();

  const updated = await Earning.findOneAndUpdate(
    { _id: earningId, status: EarningStatus.AVAILABLE },
    {
      $set: {
        status: EarningStatus.PAID_OUT,
        paidOutAt: now,
      },
    },
    { new: true, runValidators: true },
  ).exec();

  if (updated) {
    return updated;
  }

  const existing = await Earning.findById(earningId).exec();

  if (!existing) {
    throw new NotFoundError('Earning not found');
  }

  throw new ConflictError('Only available earnings can be approved');
}

export async function cancelWithdrawal(params: {
  earningId: string;
}): Promise<IEarning> {
  const earningId = parseObjectId(params.earningId, 'earningId');

  const updated = await Earning.findOneAndUpdate(
    { _id: earningId, status: EarningStatus.AVAILABLE },
    {
      $set: {
        status: EarningStatus.CANCELED,
      },
    },
    { new: true, runValidators: true },
  ).exec();

  if (updated) {
    return updated;
  }

  const existing = await Earning.findById(earningId).exec();

  if (!existing) {
    throw new NotFoundError('Earning not found');
  }

  throw new ConflictError('Only available earnings can be canceled');
}
