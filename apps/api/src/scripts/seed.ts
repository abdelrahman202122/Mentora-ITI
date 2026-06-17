import mongoose from 'mongoose';

import { env } from '../config/env.js';
import { hashPassword } from '../utils/hashPassword.js';
import { UserRole } from '../modules/users/user.interface.js';
import { UserModel } from '../modules/users/user.model.js';
import { TutorProfileModel } from '../modules/tutor/profile/tutor-profile.model.js';
import { TutorSubjectModel } from '../modules/tutor/subject/tutor-subject.model.js';
import { TutorAvailabilityModel } from '../modules/tutor/availability/tutor-availability.model.js';
import { AIConversationModel } from '../modules/ai/ai-conversation.model.js';

const seedPassword = 'Password123!';

const learnerSeed = {
  name: 'Test Learner',
  email: 'learner@test.com',
  role: UserRole.LEARNER,
};

const tutorSeeds = [
  {
    name: 'Mona Hassan',
    email: 'mona.math@test.com',
    headline: 'IGCSE and secondary mathematics tutor',
    bio: 'I help learners build confidence in algebra, geometry, and exam problem solving.',
    hourlyRate: 250,
    languages: ['English', 'Arabic'],
    rating: 4.8,
    totalReviews: 34,
    subjects: [
      {
        category: 'mathematics',
        title: 'Secondary Mathematics',
        description: 'Algebra, geometry, trigonometry, and exam preparation.',
        educationLevel: 'secondary',
        curriculum: 'igcse',
        gradeNote: 'Grades 9-12',
      },
    ],
  },
  {
    name: 'Ahmed Farouk',
    email: 'ahmed.physics@test.com',
    headline: 'Physics and science tutor',
    bio: 'I explain physics with practical examples and structured revision plans.',
    hourlyRate: 300,
    languages: ['English'],
    rating: 4.6,
    totalReviews: 21,
    subjects: [
      {
        category: 'sciences',
        title: 'Physics',
        description: 'Mechanics, electricity, waves, and secondary science.',
        educationLevel: 'secondary',
        curriculum: 'national_new',
        gradeNote: 'Secondary school',
      },
    ],
  },
  {
    name: 'Sara Nabil',
    email: 'sara.english@test.com',
    headline: 'English language conversation coach',
    bio: 'I work with learners on grammar, speaking fluency, and academic writing.',
    hourlyRate: 180,
    languages: ['English', 'Arabic'],
    rating: 4.9,
    totalReviews: 48,
    subjects: [
      {
        category: 'languages',
        title: 'English Conversation',
        description: 'Speaking, grammar, writing, and interview confidence.',
        educationLevel: 'professional',
        curriculum: 'none',
        gradeNote: 'All levels',
      },
    ],
  },
  {
    name: 'Omar Adel',
    email: 'omar.cs@test.com',
    headline: 'Computer science and programming tutor',
    bio: 'I teach programming fundamentals, web development, and problem solving.',
    hourlyRate: 350,
    languages: ['English', 'Arabic'],
    rating: 4.7,
    totalReviews: 17,
    subjects: [
      {
        category: 'technology',
        title: 'Programming Fundamentals',
        description: 'JavaScript, algorithms, web basics, and computer science foundations.',
        educationLevel: 'university',
        curriculum: 'none',
        gradeNote: 'Beginner friendly',
      },
    ],
  },
] as const;

async function upsertUser(seed: {
  name: string;
  email: string;
  role: UserRole;
}) {
  const password = await hashPassword(seedPassword);

  return UserModel.findOneAndUpdate(
    { email: seed.email },
    {
      $set: {
        name: seed.name,
        email: seed.email,
        role: seed.role,
        isEmailVerified: true,
        isActive: true,
      },
      $setOnInsert: {
        password,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
}

async function seedLearner() {
  const learner = await upsertUser(learnerSeed);

  await AIConversationModel.findOneAndUpdate(
    {
      learnerId: learner._id,
      goal: 'Find a secondary mathematics tutor',
    },
    {
      $set: {
        learnerId: learner._id,
        locale: 'en',
        goal: 'Find a secondary mathematics tutor',
        extractedPreferences: {
          category: 'mathematics',
          educationLevel: 'secondary',
          curriculum: 'igcse',
          languages: ['English'],
          maxHourlyRate: 300,
        },
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  return learner;
}

async function seedTutor(seed: (typeof tutorSeeds)[number]) {
  const tutor = await upsertUser({
    name: seed.name,
    email: seed.email,
    role: UserRole.TUTOR,
  });

  const profile = await TutorProfileModel.findOneAndUpdate(
    { userId: tutor._id },
    {
      $set: {
        userId: tutor._id,
        headline: seed.headline,
        bio: seed.bio,
        hourlyRate: seed.hourlyRate,
        languages: seed.languages,
        experience: [
          {
            title: 'Private Tutor',
            startYear: 2020,
            startMonth: 1,
            isCurrent: true,
          },
        ],
        education: [
          {
            degree: 'Bachelor',
            field: 'Education',
            institution: 'Mentora Demo University',
            graduationYear: 2019,
          },
        ],
        isAvailable: true,
        rating: seed.rating,
        totalReviews: seed.totalReviews,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  await UserModel.findByIdAndUpdate(tutor._id, {
    role: UserRole.TUTOR,
  });

  const session = await mongoose.startSession();

    await session.withTransaction(async () => {
      await TutorSubjectModel.deleteMany({ tutorId: tutor._id }, { session });
      await TutorSubjectModel.insertMany(
        seed.subjects.map((subject) => ({
          tutorId: tutor._id,
          ...subject,
        })),
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  await TutorAvailabilityModel.findOneAndUpdate(
    { tutorId: tutor._id },
    {
      $set: {
        tutorId: tutor._id,
        slots: {
          monday: [{ startTime: '16:00', endTime: '20:00' }],
          wednesday: [{ startTime: '16:00', endTime: '20:00' }],
          saturday: [{ startTime: '10:00', endTime: '14:00' }],
        },
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  return tutor;
}

async function run() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PROD_SEED !== 'true') {
    throw new Error('Refusing to seed production without ALLOW_PROD_SEED=true');
  }
  await mongoose.connect(env.MONGO_URI);

  const learner = await seedLearner();
  const tutors = [];

  for (const tutorSeed of tutorSeeds) {
    tutors.push(await seedTutor(tutorSeed));
  }

  console.log('Seed completed');
  console.log(`Learner: ${learner.email} / ${seedPassword}`);
  console.log(
    `Tutors: ${tutors.map((tutor) => tutor.email).join(', ')} / ${seedPassword}`,
  );

  await mongoose.disconnect();
}

run().catch(async (error: unknown) => {
  console.error('Seed failed', error);
  await mongoose.disconnect();
  process.exit(1);
});
