import { describe, expect, it } from 'vitest';

import {
  getPrimaryRole,
  hasAnyRole,
  hasRole,
  normalizeRoles,
} from '../../src/modules/users/role.utils.js';
import { UserRole } from '../../src/modules/users/user.interface.js';

describe('role utils', () => {
  it('normalizes legacy learner, tutor, and admin roles', () => {
    expect(normalizeRoles({ role: UserRole.LEARNER })).toEqual([
      UserRole.LEARNER,
    ]);
    expect(normalizeRoles({ role: UserRole.TUTOR })).toEqual([
      UserRole.LEARNER,
      UserRole.TUTOR,
    ]);
    expect(normalizeRoles({ role: UserRole.ADMIN })).toEqual([UserRole.ADMIN]);
  });

  it('checks canonical multi-role payloads', () => {
    const user = { roles: [UserRole.LEARNER, UserRole.TUTOR] };

    expect(hasRole(user, UserRole.LEARNER)).toBe(true);
    expect(hasRole(user, UserRole.TUTOR)).toBe(true);
    expect(hasRole(user, UserRole.ADMIN)).toBe(false);
    expect(hasAnyRole(user, [UserRole.ADMIN, UserRole.TUTOR])).toBe(true);
    expect(getPrimaryRole(user.roles)).toBe(UserRole.TUTOR);
  });
});
