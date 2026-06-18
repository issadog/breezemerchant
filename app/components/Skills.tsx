import { BUILDER, COLLECTIBLE, TIER_NAME } from "@/lib/builder";
import { REPS_PER_LEVEL, skillLabel, skillLevel, recommendSkill } from "@/lib/skills";
import { triggerById, builderToTrigger } from "@/lib/triggers";
import { Ring } from "./Ring";
import type { User } from "@/lib/user";

function SkillCard({ id, recId, nomi }: { id: number; recId: number; nomi: User }) {
  const s = BUILDER[id];
  const reps = nomi.skills[id] || 0;
  const isRec = id === recId;
  return (
    <div className={`skill ${reps > 0 ? "begun" : ""} ${isRec ? "rec-skill" : ""}`}>
      <Ring reps={reps} accent="var(--builder)" />
      <div className="skill-body">
        <span className="skill-name">
          {s.short}
          {isRec && <span className="rec-pip">next</span>}
        </span>
        <span className="skill-line">{s.line}</span>
        <span className="skill-lvl">
          {skillLabel(reps)}
          {reps > 0 && skillLevel(reps) < 4 ? ` · ${reps % REPS_PER_LEVEL}/${REPS_PER_LEVEL} to next` : ""}
        </span>
      </div>
    </div>
  );
}

export function Skills({
  nomi,
  startTrigger,
  startTraining,
  goHistory,
}: {
  nomi: User;
  startTrigger: (id: string) => void;
  startTraining: (id: string) => void;
  goHistory: () => void;
}) {
  const recId = recommendSkill(nomi.skills);
  const recTrigger = triggerById(builderToTrigger[recId]);
  const started = COLLECTIBLE.filter((id) => (nomi.skills[id] || 0) > 0).length;
  const taken = nomi.activity.filter((a) => a.taken).length;

  return (
    <main className="stage wide">
      <p className="eyebrow">Skills</p>
      <h1 className="h1">{nomi.name}&apos;s AI-native skills</h1>
      <p className="lede">
        Each AI-native approach you take adds to a skill. Skills move up a level every{" "}
        {REPS_PER_LEVEL} reps. This is what a chat window can&apos;t give you: progress that
        builds across weeks of real work.
      </p>

      <div className="profile">
        <div className="prof-stat">
          <span className="ps-n">{started}/{COLLECTIBLE.length}</span>
          <span className="ps-l">skills started</span>
        </div>
        <div className="prof-stat">
          <span className="ps-n">{taken}</span>
          <span className="ps-l">moves taken</span>
        </div>
        <div className="prof-stat">
          <span className="ps-n">{nomi.weeksActive}</span>
          <span className="ps-l">weeks active</span>
        </div>
      </div>

      <div className="next-row">
        <div className="next" onClick={() => recTrigger && startTrigger(recTrigger.id)}>
          <div>
            <span className="next-l">Build next · on real work</span>
            <p className="next-name">{BUILDER[recId].short}</p>
            <p className="next-why">
              {recTrigger ? `Start from "${recTrigger.title}".` : "Your least-developed skill."}
            </p>
          </div>
          <span className="next-go">Start →</span>
        </div>
        <div className="next ghost-next" onClick={() => recTrigger && startTraining(recTrigger.id)}>
          <div>
            <span className="next-l">Or practise off-client</span>
            <p className="next-name">Training scenario</p>
            <p className="next-why">Rehearse the same skill against a realistic made-up situation.</p>
          </div>
          <span className="next-go">Generate →</span>
        </div>
      </div>

      <p className="unit-h">{TIER_NAME[2]}</p>
      <div className="skill-grid">
        {[4, 5].map((id) => (
          <SkillCard key={id} id={id} recId={recId} nomi={nomi} />
        ))}
      </div>

      <p className="unit-h">{TIER_NAME[3]}</p>
      <div className="skill-grid">
        {[6, 7, 8, 9].map((id) => (
          <SkillCard key={id} id={id} recId={recId} nomi={nomi} />
        ))}
      </div>

      <p className="unit-h">
        {TIER_NAME[1]}{" "}
        <span className="unit-note">established, tracked in the Valtech framework</span>
      </p>
      <div className="found">
        {[1, 2, 3].map((id) => (
          <span key={id} className="found-chip">{BUILDER[id].short}</span>
        ))}
      </div>

      <div className="see-history" onClick={goHistory}>
        See your full move history →
      </div>
    </main>
  );
}
