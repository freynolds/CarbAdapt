import type { SweatTestList, SweatTestResponse } from "@carbadapt/contracts";

/** Sweat-test protocol rows. The rate formula is not recomputed on read. */
export interface SweatTestsService {
  listSweatTests(userId: string): Promise<SweatTestList>;
  getSweatTest(userId: string, id: string): Promise<SweatTestResponse>;
}
