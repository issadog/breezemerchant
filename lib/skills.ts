export const REPS_PER_LEVEL = 3;

export const LEVEL_NAME = ["Unaware", "Aware", "Competent", "Proficient", "Master"];

export function skillLevel(reps: number): number {
  const level = Math.floor(reps / REPS_PER_LEVEL);
  return Math.min(level, 4);
}

export function skillProgress(reps: number): number {
  const level = skillLevel(reps);
  if (level === 4) return 1;
  const repsInLevel = reps % REPS_PER_LEVEL;
  return repsInLevel / REPS_PER_LEVEL;
}

export function skillLabel(reps: number): string {
  if (reps === 0) return "Not started";
  if (reps < REPS_PER_LEVEL) return "Started";
  const level = skillLevel(reps);
  return `Level ${level}`;
}

export function recommendSkill(skills: Record<number, number>): number {
  const order = [8, 7, 9, 5, 4, 6];

  // Find the minimum reps value
  const minReps = Math.min(...Object.values(skills));

  // Return the first skill in the tie-break order that has the minimum reps
  return order.find(skillId => skills[skillId] === minReps)!;
}
