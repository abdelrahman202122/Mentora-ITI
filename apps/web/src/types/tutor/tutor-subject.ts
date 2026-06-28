import { Category } from "../metaData/category";
import { Curriculum } from "../metaData/curriculum";
import { EducationLevel } from "../metaData/educationLevel";

export interface TutorSubject {
 __v: number;
    _id: string;
    category: Category;
    createdAt: string;
    curriculum: Curriculum;
    description: string;
    educationLevel: EducationLevel;
    gradeNote: string | null;
    title: string;
    tutorId: string;
    updatedAt: string;
}
