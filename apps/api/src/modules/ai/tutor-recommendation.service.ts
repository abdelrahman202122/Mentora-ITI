import type { FilterQuery } from 'mongoose';

import { TutorProfileModel } from '../tutor/profile/tutor-profile.model.js';
import { TutorSubjectModel } from '../tutor/subject/tutor-subject.model.js';
import type { TutorRecommendationInput } from '../../validators/ai-recommendation.js';
import { updateAIConversationPreferences } from './ai-conversation.service.js';

type TutorProfileResult = {
  _id: { toString(): string };
  userId: { toString(): string };
  headline: string;
  bio: string;
  hourlyRate: number;
  languages: string[];
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
};

type TutorSubjectResult = {
  _id: { toString(): string };
  tutorId: { toString(): string };
  category: string;
  title: string;
  description?: string | null;
  educationLevel: string;
  curriculum: string;
};

type TutorSubjectFilter = FilterQuery<TutorSubjectResult>;

type TutorRecommendation = {
  tutorProfileId: string;
  tutorId: string;
  score: number;
  matchStrength: 'strong' | 'good' | 'partial' | 'weak';
  scoreBreakdown: {
    subject: number;
    category: number;
    educationLevel: number;
    curriculum: number;
    language: number;
    price: number;
    quality: number;
  };
  reasons: string[];
  profile: {
    headline: string;
    bio: string;
    hourlyRate: number;
    languages: string[];
    rating: number;
    totalReviews: number;
  };
  matchedSubjects: Array<{
    id: string;
    category: string;
    title: string;
    educationLevel: string;
    curriculum: string;
  }>;
};

const SCORE_WEIGHTS = {
  subject: 20,
  category: 20,
  educationLevel: 15,
  curriculum: 15,
  language: 10,
  price: 10,
  quality: 10,
} as const;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getSubjectFilter(input: TutorRecommendationInput) {
  const filter: TutorSubjectFilter = {};

  if (input.category) {
    filter.category = input.category;
  }

  if (input.educationLevel) {
    filter.educationLevel = input.educationLevel;
  }

  if (input.curriculum) {
    filter.curriculum = input.curriculum;
  }

  if (input.query) {
    const pattern = new RegExp(escapeRegex(input.query), 'i');
    filter.$or = [{ title: pattern }, { description: pattern }];
  }

  return filter;
}

function hasSubjectCriteria(input: TutorRecommendationInput) {
  return Boolean(
    input.query || input.category || input.educationLevel || input.curriculum,
  );
}

function getMatchedLanguages(profile: TutorProfileResult, languages?: string[]) {
  if (!languages?.length) {
    return [];
  }

  const requested = languages.map(normalize);
  return profile.languages.filter((language) =>
    requested.includes(normalize(language)),
  );
}

function subjectMatchesQuery(subject: TutorSubjectResult, query?: string) {
  if (!query) {
    return false;
  }

  const normalizedQuery = normalize(query);
  return (
    normalize(subject.title).includes(normalizedQuery) ||
    normalize(subject.description ?? '').includes(normalizedQuery)
  );
}

function getQualityScore(profile: TutorProfileResult) {
  const ratingScore = Math.round((profile.rating / 5) * 8);
  const reviewScore = profile.totalReviews > 0 ? 2 : 0;

  return Math.min(SCORE_WEIGHTS.quality, ratingScore + reviewScore);
}

function getMatchStrength(score: number): TutorRecommendation['matchStrength'] {
  if (score >= 75) {
    return 'strong';
  }

  if (score >= 50) {
    return 'good';
  }

  if (score >= 25) {
    return 'partial';
  }

  return 'weak';
}

function scoreTutor(
  profile: TutorProfileResult,
  subjects: TutorSubjectResult[],
  input: TutorRecommendationInput,
) {
  const reasons: string[] = [];
  const scoreBreakdown = {
    subject: 0,
    category: 0,
    educationLevel: 0,
    curriculum: 0,
    language: 0,
    price: 0,
    quality: 0,
  };

  if (profile.isAvailable) {
    reasons.push('Tutor is currently available');
  }

  if (input.query && subjects.some((subject) => subjectMatchesQuery(subject, input.query))) {
    scoreBreakdown.subject = SCORE_WEIGHTS.subject;
    reasons.push(`Teaches a subject matching "${input.query}"`);
  }

  if (input.category && subjects.some((subject) => subject.category === input.category)) {
    scoreBreakdown.category = SCORE_WEIGHTS.category;
    reasons.push(`Teaches ${input.category.replaceAll('_', ' ')}`);
  }

  if (
    input.educationLevel &&
    subjects.some((subject) => subject.educationLevel === input.educationLevel)
  ) {
    scoreBreakdown.educationLevel = SCORE_WEIGHTS.educationLevel;
    reasons.push(`Supports ${input.educationLevel.replaceAll('_', ' ')} level`);
  }

  if (
    input.curriculum &&
    subjects.some((subject) => subject.curriculum === input.curriculum)
  ) {
    scoreBreakdown.curriculum = SCORE_WEIGHTS.curriculum;
    reasons.push(`Supports ${input.curriculum.replaceAll('_', ' ')} curriculum`);
  }

  const matchedLanguages = getMatchedLanguages(profile, input.languages);
  if (matchedLanguages.length > 0) {
    scoreBreakdown.language = SCORE_WEIGHTS.language;
    reasons.push(`Matches language: ${matchedLanguages.join(', ')}`);
  }

  if (
    input.maxHourlyRate !== undefined &&
    profile.hourlyRate <= input.maxHourlyRate
  ) {
    scoreBreakdown.price = SCORE_WEIGHTS.price;
    reasons.push('Within requested hourly rate');
  }

  scoreBreakdown.quality = getQualityScore(profile);
  if (profile.rating > 0) {
    reasons.push(`Rated ${profile.rating.toFixed(1)} out of 5`);
  }

  const score = Object.values(scoreBreakdown).reduce(
    (total, value) => total + value,
    0,
  );

  if (reasons.length === 0) {
    reasons.push('Available tutor profile');
  }

  return {
    score,
    matchStrength: getMatchStrength(score),
    scoreBreakdown,
    reasons,
  };
}

export async function recommendTutors(
  learnerId: string,
  input: TutorRecommendationInput,
) {
  const subjectFilter = getSubjectFilter(input);
  const subjectCriteriaExists = hasSubjectCriteria(input);
  const matchingSubjects = (await TutorSubjectModel.find(subjectFilter)
    .limit(200)
    .lean()) as unknown as TutorSubjectResult[];

  if (subjectCriteriaExists && matchingSubjects.length === 0) {
    return {
      recommendations: [],
      criteria: input,
    };
  }

  const subjectsByTutorId = new Map<string, TutorSubjectResult[]>();

  for (const subject of matchingSubjects) {
    const tutorId = subject.tutorId.toString();
    const subjects = subjectsByTutorId.get(tutorId) ?? [];
    subjects.push(subject);
    subjectsByTutorId.set(tutorId, subjects);
  }

  const profileQuery: FilterQuery<TutorProfileResult> = {
    isAvailable: true,
  };

  if (input.maxHourlyRate !== undefined) {
    profileQuery.hourlyRate = { $lte: input.maxHourlyRate };
  }

  if (subjectCriteriaExists) {
    profileQuery.userId = {
      $in: Array.from(subjectsByTutorId.keys()),
    };
  }

  const profiles = (await TutorProfileModel.find(profileQuery)
    .sort({ rating: -1, totalReviews: -1, hourlyRate: 1 })
    .limit(100)
    .lean()) as unknown as TutorProfileResult[];

  const recommendations: TutorRecommendation[] = profiles
    .map((profile) => {
      const tutorId = profile.userId.toString();
      const matchedSubjects = subjectsByTutorId.get(tutorId) ?? [];
      const { score, matchStrength, scoreBreakdown, reasons } = scoreTutor(
        profile,
        matchedSubjects,
        input,
      );

      return {
        tutorProfileId: profile._id.toString(),
        tutorId,
        score,
        matchStrength,
        scoreBreakdown,
        reasons,
        profile: {
          headline: profile.headline,
          bio: profile.bio,
          hourlyRate: profile.hourlyRate,
          languages: profile.languages,
          rating: profile.rating,
          totalReviews: profile.totalReviews,
        },
        matchedSubjects: matchedSubjects.map((subject) => ({
          id: subject._id.toString(),
          category: subject.category,
          title: subject.title,
          educationLevel: subject.educationLevel,
          curriculum: subject.curriculum,
        })),
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, input.limit);

  if (input.conversationId) {
    await updateAIConversationPreferences({
      conversationId: input.conversationId,
      learnerId,
      extractedPreferences: input,
      recommendedTutorIds: recommendations.map(
        (recommendation) => recommendation.tutorProfileId,
      ),
    });
  }

  return {
    recommendations,
    criteria: input,
  };
}
