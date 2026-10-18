import { HttpError, HttpErrorCode } from "../../../../http/errors.js";
import { presentLog } from "../../../../http/present.js";
import type { ModuleDeps } from "../../../deps.js";
import type { QuestionnaireService } from "../../questionnaire.service.js";

export function createMockQuestionnaireService(deps: ModuleDeps): QuestionnaireService {
  return {
    async getFeedback(userId, workoutId) {
      const workout = await deps.db.workout.findFirst({
        where: { id: workoutId, userId },
        include: { feedback: true },
      });
      if (!workout) throw new HttpError(HttpErrorCode.WorkoutNotFound);
      return { log: workout.feedback ? presentLog(workout.feedback) : null };
    },
  };
}
