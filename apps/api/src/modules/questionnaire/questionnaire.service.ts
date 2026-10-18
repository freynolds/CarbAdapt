import type { FeedbackResponse } from "@carbadapt/contracts";

/** Post-workout feedback, including add intake and last-session feedback. */
export interface QuestionnaireService {
  getFeedback(userId: string, workoutId: string): Promise<FeedbackResponse>;
}
