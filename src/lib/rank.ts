export type Rank =
  | "RECRUIT"
  | "OPERATOR"
  | "SENTINEL"
  | "GUARDIAN"
  | "SPECIALIST"
  | "REGULATED";

export function rankFromDay(day: number): Rank {
  if (day <= 0) return "RECRUIT";
  if (day <= 6) return "OPERATOR";
  if (day <= 13) return "SENTINEL";
  if (day <= 20) return "GUARDIAN";
  if (day <= 27) return "SPECIALIST";
  return "REGULATED";
}

export const RANK_DESCRIPTIONS: Record<Rank, string> = {
  RECRUIT: "The protocol begins.",
  OPERATOR: "You showed up. That's the whole job.",
  SENTINEL: "You're in the friction window. Most quit here.",
  GUARDIAN: "Past the wall. Your system is rebuilding.",
  SPECIALIST: "Final stretch. The data doesn't lie.",
  REGULATED: "28 days. Mission complete.",
};