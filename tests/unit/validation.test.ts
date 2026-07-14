import { describe, expect, it } from "vitest";
import { adminCourseSchema, publicSubmissionSchema, questionSchema } from "@/lib/validation/schemas";

const id = "550e8400-e29b-41d4-a716-446655440000";
describe("question and answer validation", () => {
  it("accepts a rating question", () => expect(questionSchema.safeParse({ type: "rating", prompt: "The pace was appropriate", isRequired: true }).success).toBe(true));
  it("rejects a single choice question with fewer than two options", () => expect(questionSchema.safeParse({ type: "single_choice", prompt: "Best activity?", isRequired: true, options: ["Examples"] }).success).toBe(false));
  it("rejects ratings outside one to five", () => expect(publicSubmissionSchema.safeParse({ code: "ABCD-2345", answers: [{ question_id: id, rating_value: 6 }] }).success).toBe(false));
  it("rejects written feedback longer than 1,000 characters", () => expect(publicSubmissionSchema.safeParse({ code: "ABCD-2345", answers: [{ question_id: id, text_value: "x".repeat(1001) }] }).success).toBe(false));
});

describe("admin course assignment validation", () => {
  const course = { name: "Software Testing", code: "se-401", departmentId: id, instructorIds: [id] };
  it("accepts an admin-created course with an instructor assignment", () => expect(adminCourseSchema.safeParse(course).success).toBe(true));
  it("requires at least one instructor", () => expect(adminCourseSchema.safeParse({ ...course, instructorIds: [] }).success).toBe(false));
  it("rejects duplicate assignments", () => expect(adminCourseSchema.safeParse({ ...course, instructorIds: [id, id] }).success).toBe(false));
});
