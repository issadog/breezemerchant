"use client";

import { useState } from "react";
import { NOMI_SEED } from "@/lib/user";
import type { User, Activity } from "@/lib/user";
import { Work } from "./Work";
import { Skills } from "./Skills";
import { History } from "./History";

type Tab = "work" | "skills" | "history";

export function App() {
  const [tab, setTab] = useState<Tab>("work");
  const [homeNonce, setHomeNonce] = useState(0);
  const [nomi, setNomi] = useState<User>(NOMI_SEED);
  const [launch, setLaunch] = useState<{ id: string; training: boolean } | null>(null);

  const addRep = (bid: number) =>
    setNomi((n) => ({ ...n, skills: { ...n.skills, [bid]: (n.skills[bid] || 0) + 1 } }));

  const logActivity = (entry: Activity) =>
    setNomi((n) => ({ ...n, activity: [{ ...entry, when: "just now" }, ...n.activity] }));

  const setLevel = (lvl: number) => setNomi((n) => ({ ...n, level: lvl }));

  const goHome = () => {
    setTab("work");
    setHomeNonce((k) => k + 1);
  };

  const startTrigger = (id: string) => {
    setLaunch({ id, training: false });
    setTab("work");
  };

  const startTraining = (id: string) => {
    setLaunch({ id, training: true });
    setTab("work");
  };

  return (
    <div className="root">
      <header className="topbar">
        <button className="brand" onClick={goHome} title="Back to work moments">
          <span className="dot" /> Product Builder
        </button>
        <div className="who">
          <span className="who-name">{nomi.name} · Product Manager</span>
          <label className="who-level">
            Framework level
            <select
              value={nomi.level}
              onChange={(e) => setLevel(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((l) => (
                <option key={l} value={l}>Level {l}</option>
              ))}
            </select>
          </label>
        </div>
        <nav>
          <button
            className={tab === "skills" ? "on" : ""}
            onClick={() => setTab("skills")}
          >
            Skills
          </button>
          <button
            className={tab === "history" ? "on" : ""}
            onClick={() => setTab("history")}
          >
            History
          </button>
        </nav>
      </header>

      {tab === "work" && (
        <Work
          nomi={nomi}
          addRep={addRep}
          logActivity={logActivity}
          homeNonce={homeNonce}
          launch={launch}
          clearLaunch={() => setLaunch(null)}
          goSkills={() => setTab("skills")}
          startTraining={startTraining}
        />
      )}
      {tab === "skills" && (
        <Skills
          nomi={nomi}
          startTrigger={startTrigger}
          startTraining={startTraining}
          goHistory={() => setTab("history")}
        />
      )}
      {tab === "history" && <History nomi={nomi} />}

      <footer className="foot">
        Prototype · Valtech Product Competency Framework 2024 + Product Builder model v0.1
      </footer>
    </div>
  );
}
