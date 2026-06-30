import Booking from '../../bookings/booking.model.js';
import { BookingStatus } from '../../bookings/booking.types.js';
import Earning from '../../payments/earning.model.js';
import { EarningStatus } from '../../payments/earning.types.js';

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
      paidOut.totalGrossAmount +
      (earningMap[EarningStatus.CANCELED]?.totalGrossAmount ?? 0),
    platformCommissionTotal:
      pending.totalCommissionAmount +
      available.totalCommissionAmount +
      paidOut.totalCommissionAmount +
      (earningMap[EarningStatus.CANCELED]?.totalCommissionAmount ?? 0),
    tutorEarningsTotal:
      pending.totalTutorAmount +
      available.totalTutorAmount +
      paidOut.totalTutorAmount +
      (earningMap[EarningStatus.CANCELED]?.totalTutorAmount ?? 0),
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
): Promise<unknown> {
  throw new Error('Admin finance repository is not implemented yet');
}

export async function approveAllWithdrawals(
  _params: unknown,
  _body: unknown,
): Promise<unknown> {
  throw new Error('Admin finance repository is not implemented yet');
}

export async function approveWithdrawal(
  _params: unknown,
  _body: unknown,
): Promise<unknown> {
  throw new Error('Admin finance repository is not implemented yet');
}

export async function cancelWithdrawal(
  _params: unknown,
  _body: unknown,
): Promise<unknown> {
  throw new Error('Admin finance repository is not implemented yet');
}
