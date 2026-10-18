import type { ContainerList, ContainerResponse } from "@carbadapt/contracts";

/** Bottles, flasks, and bladders, including sip calibration rows. */
export interface GearService {
  listContainers(userId: string): Promise<ContainerList>;
  getContainer(userId: string, id: string): Promise<ContainerResponse>;
}
