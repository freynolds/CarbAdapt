/** Staging and production use this until that environment has a real implementation. */
export function unimplemented(): never {
  throw new Error("not implemented");
}
