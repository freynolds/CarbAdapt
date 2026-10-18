import type { AuthService } from "../../auth.service.js";

export function createMockAuthService(): AuthService {
  return { module: "auth" };
}
