import { AuditModel } from '../../audit/audit.model.js';
import Booking from '../../bookings/booking.model.js';
import { UserModel } from '../../users/user.model.js';
import type { UserRole } from '../../users/user.interface.js';
import type { ListAdminUsersQuery } from './admin-user.validation.js';
import {formatRelativeTime, formatTime} from '../../../utils/timeHelper.js';
import ReviewModel from '../../reviews/review.model.js';
import { PopulatedReview, UserReviewDto } from './admin-user.interface.js';
import type { ListAuditLogsQuery } from './admin-user.validation.js';

/* ───────── Build a MongoDB filter from the query params ───────── */

const buildFilter = (query: ListAdminUsersQuery) => {
  const filter: Record<string, any> = {};

  // Search across name, email
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  // Filter by role (map frontend label → DB enum value)
  if (query.role) {
    const roleMap: Record<string, string> = {
      Tutor: 'tutor',
      Student: 'learner',
      Admin: 'admin',
    };
    filter.roles = roleMap[query.role] ?? query.role.toLowerCase();
  }


  // Filter by status (use adminStatus field in DB)
  if (query.status) {
    if (query.status === 'Suspended') {
      filter.adminStatus = 'Suspended';
    } else if (query.status === 'Active') {
      filter.adminStatus = 'Active';
    } else if (query.status === 'Pending') {
      filter.adminStatus = 'Pending';
    }
  }

  return filter;
};

/* ───────── GET / — paginated list of users ───────── */

export const findAdminUsers = async (query: ListAdminUsersQuery) => {
  const filter = buildFilter(query);
  const { page, perPage } = query;
  const skip = (page - 1) * perPage;

  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .select(
        'name email role roles avatar isActive adminStatus roleLabel createdAt updatedAt',
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),
    UserModel.countDocuments(filter),
  ]);

  return { users, total };
};

/* ───────── GET /:id — single user with full fields ───────── */

export const findAdminUserById = async (userId: string) => {
  return UserModel.findById(userId)
    .select(
      'name email role roles avatar isActive adminStatus roleLabel createdAt updatedAt',
    )
    .lean();
};

/* ───────── PATCH /:id — update user fields ───────── */

export const updateAdminUserFields = async (
  userId: string,
  updateData: Record<string, any>,
) => {
  return UserModel.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true },
  )
    .select(
      'name email role roles avatar isActive adminStatus roleLabel createdAt updatedAt',
    )
    .lean();
};

/* ───────── PATCH /api/admin/users/:id/status ───────── */

export const updateUserStatusInDb = async (
  userId: string,
  newStatus: 'Active' | 'Pending' | 'Suspended',
) => {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        adminStatus: newStatus,
        isActive: newStatus === 'Active',
      },
    },
    { new: true },
  )
    .select('_id adminStatus isActive')
    .lean();
};

/* ───────── POST / — create a new user ───────── */

export const createAdminUserInDb = async (data: {
  name: string;
  email: string;
  role: string;
  roles?: UserRole[];
  adminStatus: string;
  isActive: boolean;
  password: string;
  roleLabel?: string;
}) => {
  return UserModel.create(data);
};

/* ───────── Helper: check if email exists ───────── */

export const findUserByEmail = async (email: string) => {
  return UserModel.findOne({ email }).lean();
};



export const getUserSessionCount = async (_userId: string): Promise<number> => {

    const result = await Booking.aggregate([
      { $match: { tutorId: _userId, status: 'COMPLETED' } },
      { $count: 'total' },
    ]);
    return result[0]?.total ?? 0;

};

export const getUserAvgRating = async (
  _userId: string,
): Promise<number | null> => {
    const result = await ReviewModel.aggregate([
      { $match: { tutorId: _userId } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    return result[0]?.avg ?? null;
};

export const getUserLastActivity = async (
  _userId: string,
): Promise<string | null> => {

    const latest = await AuditModel.findOne({ _userId })
      .sort({ createdAt: -1 })
      .lean();
    return latest ? formatTime(latest.createdAt) : null;
};


export const getUserReviews = async (
  userId: string,
): Promise<UserReviewDto[]> => {
  const reviews = (await ReviewModel.find({ tutorId: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("learnerId", "name")
    .lean()) as unknown as PopulatedReview[];

  return reviews
    .filter((review) => {
      // Skip reviews where the learner wasn't populated
      // (e.g., learner account was deleted)
      if (!review.learnerId) return false;
      // Skip reviews with no comment text
      if (!review.comment) return false;
      return true;
    })
    .map((review) => ({
      reviewer: review.learnerId!.name,
      rating: review.rating,
      text: review.comment!, // safe — we filtered out nulls above
      relativeTime: formatRelativeTime(review.createdAt),
    }));
};





/*  NEW: Fetch paginated audit logs for a specific user */
export const findUserAuditLogs = async (
  userId: string,
  query: ListAuditLogsQuery,
) => {
  const { page, perPage } = query;
  const skip = (page - 1) * perPage;

  /* The audit log collection stores the target user either in
     metadata.targetUserId OR directly as the userId field.
     We match both patterns so we catch every relevant log. */
  const filter = {
    $or: [
      { userId },
      { 'metadata.targetUserId': userId },
    ],
  };

  const [logs, total] = await Promise.all([
    AuditModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),
    AuditModel.countDocuments(filter),
  ]);

  return { logs, total };
};

