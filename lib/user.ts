import type { Frame } from "./schema";

export type User = {
  name: string;
  role: string;
  level: number;
  weeksActive: number;
  skills: Record<number, number>;
  activity: Activity[];
};

export type Activity = {
  build: number;
  trigger: string;
  taken: boolean;
  training: boolean;
  when: string;
  ctx?: { appetite: string; phase: string; situation: string };
  shownLevel?: number;
  result?: Frame;
};

export const NOMI_SEED: User = {
  name: "Nomi",
  role: "Product Manager",
  level: 3,
  weeksActive: 3,
  skills: { 4: 4, 5: 2, 6: 7, 7: 0, 8: 0, 9: 3 },
  activity: [
    { build: 6, trigger: "brief", taken: true, training: false, when: "2 weeks ago" },
    { build: 4, trigger: "discovery", taken: true, training: false, when: "9 days ago" },
    { build: 9, trigger: "stuck", taken: true, training: true, when: "5 days ago" },
    { build: 6, trigger: "brief", taken: false, training: false, when: "4 days ago" },
  ],
};
