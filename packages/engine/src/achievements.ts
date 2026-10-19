/** A higher tolerated g/h is the only achievement (#143). */
export function ghIncrease(input: {
  previousMaxGh: number | null;
  toleratedGh: number;
}): { type: "GH_INCREASE"; valueGh: number } | null {
  if (input.previousMaxGh != null && input.toleratedGh <= input.previousMaxGh) return null;
  if (input.previousMaxGh == null && input.toleratedGh <= 0) return null;
  return { type: "GH_INCREASE", valueGh: input.toleratedGh };
}
