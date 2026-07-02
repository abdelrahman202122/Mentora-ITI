import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { getPrimaryRole, normalizeRoles } from '../modules/users/role.utils.js';
import { UserModel } from '../modules/users/user.model.js';

async function migrateUserRoles() {
  await connectDatabase();

  try {
    const users = await UserModel.find({
      $or: [
        { roles: { $exists: false } },
        { roles: { $size: 0 } },
      ],
    });

    let updatedCount = 0;

    for (const user of users) {
      const roles = normalizeRoles(user);
      user.roles = roles;
      user.role = getPrimaryRole(roles);
      await user.save();
      updatedCount += 1;
    }

    console.log(`Migrated ${updatedCount} user role document(s).`);
  } finally {
    await disconnectDatabase();
  }
}

migrateUserRoles().catch(async (error) => {
  console.error('Failed to migrate user roles', error);
  await disconnectDatabase();
  process.exit(1);
});
