import type { FeedbackResponse } from "@carbadapt/contracts";
import type { z } from "zod";
import type { feedbackBodySchema } from "../../domain/schemas.js";

/** Post-workout feedback, including add intake and last-session feedback. */
export interface QuestionnaireService {
  getFeedback(userId: string, workoutId: string): Promise<FeedbackResponse>;
  submitFeedback(
    userId: string,
    workoutId: string,
    body: z.infer<typeof feedbackBodySchema>,
  ): Promise<{ body: FeedbackResponse; created: boolean }>;
}
