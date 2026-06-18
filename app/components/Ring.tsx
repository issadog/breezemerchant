import { skillProgress, skillLevel } from "@/lib/skills";

export function Ring({ reps, accent }: { reps: number; accent: string }) {
  const C = 2 * Math.PI * 19;
  const p = skillProgress(reps);
  const lvl = skillLevel(reps);
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" className="ring">
      <circle cx="23" cy="23" r="19" fill="none" stroke="var(--line)" strokeWidth="4" />
      <circle
        cx="23" cy="23" r="19" fill="none"
        stroke={accent} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C * (1 - p)}
        transform="rotate(-90 23 23)"
      />
      <text x="23" y="23" textAnchor="middle" dominantBaseline="central" className="ring-n">
        {lvl}
      </text>
    </svg>
  );
}
