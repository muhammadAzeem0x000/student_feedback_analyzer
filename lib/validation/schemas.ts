import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must contain at least 8 characters."),
});

export const courseSchema = z.object({
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(2).max(30).transform((value) => value.toUpperCase()),
  description: z.string().trim().max(1000).optional(),
  departmentId: z.uuid().optional().or(z.literal("")),
});

export const adminCourseSchema = courseSchema.extend({
  departmentId: z.uuid(),
  instructorIds: z.array(z.uuid()).min(1, "Assign at least one instructor.").max(50)
    .refine((ids) => new Set(ids).size === ids.length, "Instructor assignments must be unique."),
});

export const courseAssignmentSchema = z.object({ instructorId: z.uuid() });

export const sessionSchema = z.object({
  courseId: z.uuid(),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1500).optional(),
  expectedResponses: z.coerce.number().int().min(0).max(10000).optional(),
  minimumAnalysisResponses: z.coerce.number().int().min(1).max(1000).default(3),
});

export const questionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("rating"), prompt: z.string().trim().min(3).max(500), isRequired: z.boolean(), options: z.null().optional() }),
  z.object({ type: z.literal("long_text"), prompt: z.string().trim().min(3).max(500), isRequired: z.boolean(), options: z.null().optional() }),
  z.object({ type: z.literal("single_choice"), prompt: z.string().trim().min(3).max(500), isRequired: z.boolean(), options: z.array(z.string().trim().min(1).max(200)).min(2).max(10) }),
]);

export const reflectionSchema = z.object({
  perceivedStrengths: z.string().trim().min(10).max(2000),
  perceivedChallenges: z.string().trim().min(10).max(2000),
  surprises: z.string().trim().min(10).max(2000),
  nextSteps: z.string().trim().min(10).max(2000),
});

export const publicSubmissionSchema = z.object({
  code: z.string().trim().min(4).max(32),
  answers: z.array(z.object({
    question_id: z.uuid(),
    rating_value: z.number().int().min(1).max(5).optional(),
    choice_value: z.string().max(200).optional(),
    text_value: z.string().max(1000).optional(),
  })).max(50),
  turnstileToken: z.string().optional(),
});
