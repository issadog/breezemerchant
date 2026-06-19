"use client";

import { useState, useEffect, useMemo } from "react";
import { BUILDER, TIER_NAME, builderId } from "@/lib/builder";
import { VALTECH } from "@/lib/valtech";
import { TRIGGERS, triggerById, builderToTrigger, APPETITE } from "@/lib/triggers";
import { skillLabel, recommendSkill, REPS_PER_LEVEL } from "@/lib/skills";
import { PromptBox } from "./PromptBox";
import type { User, Activity } from "@/lib/user";
import type { Frame } from "@/lib/schema";

type Ctx = { appetite: string; phase: string; situation: string };

export function Work({
  nomi,
  addRep,
  logActivity,
  homeNonce,
  launch,
  clearLaunch,
  goSkills,
  startTraining,
}: {
  nomi: User;
  addRep: (bid: number) => void;
  logActivity: (entry: Activity) => void;
  homeNonce: number;
  launch: { id: string; training: boolean } | null;
  clearLaunch: () => void;
  goSkills: () => void;
  startTraining: (id: string) => void;
}) {
  const [view, setView] = useState<"home" | "setup" | "gen" | "result">("home");
  const [trigger, setTrigger] = useState<string | null>(null);
  const [ctx, setCtx] = useState<Ctx>({ appetite: "pragmatic", phase: "discovery", situation: "" });
  const [training, setTraining] = useState(false);
  const [fileNote, setFileNote] = useState("");
  const [result, setResult] = useState<Frame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shownLevel, setShownLevel] = useState(nomi.level);

  useEffect(() => {
    setView("home");
    setTrigger(null);
    setResult(null);
    setError(null);
  }, [homeNonce]);

  useEffect(() => {
    if (!launch) return;
    const t = triggerById(launch.id);
    setTrigger(launch.id);
    setTraining(!!launch.training);
    if (launch.training && t) {
      setCtx({
        appetite: t.scenAppetite || "pragmatic",
        phase: t.scenPhase || "discovery",
        situation: t.scenario || "",
      });
    } else {
      setCtx({ appetite: "pragmatic", phase: "discovery", situation: "" });
    }
    setFileNote("");
    setView("setup");
    clearLaunch();
  }, [launch]); // eslint-disable-line react-hooks/exhaustive-deps

  const recId = useMemo(() => recommendSkill(nomi.skills), [nomi.skills]);
  const recTrigger = triggerById(builderToTrigger[recId]);

  function beginTrigger(id: string) {
    setTrigger(id);
    setTraining(false);
    setFileNote("");
    setCtx({ appetite: "pragmatic", phase: "discovery", situation: "" });
    setView("setup");
  }

  function beginTraining() {
    const id = builderToTrigger[recId];
    const t = triggerById(id);
    setTrigger(id);
    setTraining(true);
    setFileNote("");
    setCtx({
      appetite: t?.scenAppetite || "pragmatic",
      phase: t?.scenPhase || "discovery",
      situation: t?.scenario || "",
    });
    setView("setup");
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const isText = /\.(txt|md|csv|json)$/i.test(f.name);
    if (isText) {
      const r = new FileReader();
      r.onload = () => {
        const txt = String(r.result || "").slice(0, 6000);
        setCtx((c) => ({
          ...c,
          situation: (c.situation ? c.situation + "\n\n" : "") + "[" + f.name + "]\n" + txt,
        }));
        setFileNote("Loaded " + f.name + " into the situation.");
      };
      r.readAsText(f);
    } else {
      setFileNote(
        f.name +
          " attached. PDF / Word parsing runs server-side in the real build — for now, add a one-line gist above."
      );
    }
  }

  async function generate() {
    if (!trigger) return;
    setView("gen");
    setShownLevel(nomi.level);
    setError(null);
    try {
      const res = await fetch("/api/frame", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          trigger,
          appetite: ctx.appetite,
          phase: ctx.phase,
          situation: ctx.situation,
          level: nomi.level,
          training,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { frame: Frame };
      setResult(data.frame);
    } catch (err) {
      setError("Could not reach the server. Check your connection and try again.");
      setView("setup");
      return;
    }
    setView("result");
  }

  function log(taken: boolean) {
    if (!result || !trigger) return;
    const bid = builderId(result.competency);
    if (taken) addRep(bid);
    logActivity({
      build: bid,
      trigger,
      taken,
      training,
      when: "just now",
      ctx: { ...ctx },
      shownLevel,
      result: { ...result },
    });
    setView("home");
    setTrigger(null);
    setResult(null);
    setTraining(false);
    setCtx({ appetite: "pragmatic", phase: "discovery", situation: "" });
    goSkills();
  }

  // ----- home -----
  if (view === "home")
    return (
      <main className="stage">
        <p className="eyebrow">What are you working on?</p>
        <h1 className="hero">Pick the work moment you&apos;re at.</h1>
        <p className="lede">
          For each one, you&apos;ll see what most PMs do and the AI-native alternative, with the
          steps to do it. Choosing the AI-native option builds the matching skill.
        </p>
        <div className="triggers">
          {TRIGGERS.map((t) => (
            <button key={t.id} className="trig" onClick={() => beginTrigger(t.id)}>
              <span className="trig-title">{t.title}</span>
              <span className="trig-sub">{t.sub}</span>
              <span className="trig-arrow">→</span>
            </button>
          ))}
        </div>

        <div className="train" onClick={beginTraining}>
          <div>
            <span className="train-l">Practise off-client</span>
            <p className="train-name">Generate a training scenario</p>
            <p className="train-why">
              A realistic, made-up situation for {BUILDER[recId].short.toLowerCase()} — your
              least-developed skill. Rehearse the move before it&apos;s in front of a client.
            </p>
          </div>
          <span className="train-go">Generate →</span>
        </div>

        <div className="rec" onClick={goSkills}>
          <span className="rec-l">Recommended next</span>
          Your least-developed AI skill is {BUILDER[recId].short.toLowerCase()}.
          {recTrigger ? ` "${recTrigger.title}" would build it.` : ""}
        </div>
      </main>
    );

  // ----- setup -----
  if (view === "setup") {
    const t = triggerById(trigger!);
    if (!t) return null;
    return (
      <main className="stage">
        <button className="back" onClick={() => setView("home")}>
          ← all moments
        </button>
        <p className="eyebrow">
          {t.title}
          {training && <span className="train-tag">Training scenario</span>}
        </p>
        <h2 className="h2">Some context, so the options fit the situation.</h2>

        {training && (
          <p className="train-banner">
            Off-client practice. You&apos;re rehearsing <b>{BUILDER[t.build].short}</b> against a
            realistic scenario — taking the move logs a practice rep.
          </p>
        )}

        {error && <p className="fb" style={{ color: "var(--skip)" }}>{error}</p>}

        <p className="label">How does this client feel about new ways of working?</p>
        <div className="choices three">
          {APPETITE.map(([k, tl, d]) => (
            <button
              key={k}
              className={`choice ${ctx.appetite === k ? "sel" : ""}`}
              onClick={() => setCtx({ ...ctx, appetite: k })}
            >
              <span className="choice-t">{tl}</span>
              <span className="choice-d">{d}</span>
            </button>
          ))}
        </div>

        <p className="label">Where are you in delivery?</p>
        <div className="seg">
          {["discovery", "definition", "delivery"].map((p) => (
            <button
              key={p}
              className={ctx.phase === p ? "on" : ""}
              onClick={() => setCtx({ ...ctx, phase: p })}
            >
              {p}
            </button>
          ))}
        </div>

        <p className="label">
          What&apos;s the situation?{" "}
          <span className="opt">a line is plenty, or attach a document below</span>
        </p>
        <textarea
          className="ta"
          placeholder="e.g. retail client, brief is vague about what 'AI-powered search' should do"
          value={ctx.situation}
          onChange={(e) => setCtx({ ...ctx, situation: e.target.value })}
        />

        <div className="upload">
          <label className="upload-btn">
            <input
              type="file"
              accept=".txt,.md,.csv,.json,.pdf,.docx,.doc"
              onChange={onFile}
            />
            Attach an RFP, SOW, or brief
          </label>
          {fileNote && <span className="upload-note">{fileNote}</span>}
        </div>

        <button className="primary" onClick={generate}>
          Show the two options
        </button>
      </main>
    );
  }

  // ----- generating -----
  if (view === "gen")
    return (
      <main className="stage center">
        <div className="spinner" />
        <p className="eyebrow">One moment</p>
        <h2 className="h2">Putting together the two options for this situation.</h2>
      </main>
    );

  // ----- result -----
  const t = triggerById(trigger!);
  if (!t || !result) return null;
  const v = VALTECH[t.trad];
  const skip = result.verdict === "skip-it";
  const bid = builderId(result.competency);
  const b = BUILDER[bid];
  const reps = nomi.skills[bid] || 0;

  return (
    <main className="stage wide">
      <button className="back" onClick={() => setView("setup")}>
        ← change context
      </button>
      {training && (
        <p className="train-banner">Training scenario · practising {b.short}.</p>
      )}

      {skip && (
        <div className="verdict-skip">
          <span className="vs-tag">Not worth it for this client</span>
          <p>{result.skip || "The AI-native move would not serve this client right now."}</p>
        </div>
      )}

      <div className={`fork ${skip ? "muted-builder" : ""}`}>
        <div className="path old">
          <span className="path-l">What most PMs do</span>
          <p className="path-action">{result.traditional}</p>
          <div className="src">
            <span className="src-l">Valtech framework · {v.theme}</span>
            <span className="src-name">{t.trad}</span>
            <div className="lvl-row">
              <span>at level</span>
              {[1, 2, 3, 4, 5].map((l) => (
                <button
                  key={l}
                  className={`lvl-pip ${shownLevel === l ? "on" : ""}`}
                  onClick={() => setShownLevel(l)}
                >
                  {l}
                </button>
              ))}
            </div>
            <p className="src-stmt">{v.levels[shownLevel - 1]}</p>
          </div>
        </div>

        <div className="fork-arrow">→</div>

        <div className="path builder">
          <span className="path-l">The AI-native approach</span>
          <p className="path-action">{result.builder}</p>
          <div className="src">
            <span className="src-l">
              Product Builder model · {TIER_NAME[b.tier as 1 | 2 | 3]}
            </span>
            <span className="src-name">{b.short}</span>
            <p className="skill-now">
              Your level here: <b>{skillLabel(reps)}</b>
              {!skip && (
                <span className="skill-gain">
                  {" "}· taking this adds a {training ? "practice " : ""}rep
                </span>
              )}
            </p>
          </div>
          {!skip && (
            <p className="phase-note">In the {ctx.phase} phase: {result.phaseNote}</p>
          )}
        </div>
      </div>

      <div className="why">
        <span className="why-l">Why it&apos;s worth doing for the client</span>
        <p>{result.whyClientValues}</p>
      </div>

      {!skip && (
        <section className="move">
          <div className="move-head">
            <p className="eyebrow nm">How to do it</p>
            <span className="timebox">{result.timebox}</span>
          </div>
          <ol className="steps">
            {(result.steps || []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <PromptBox text={result.prompt} />
        </section>
      )}

      <div className="actions">
        <button className="primary" onClick={() => log(true)}>
          {skip ? "Did the standard move" : "Log as done"}
        </button>
        <button className="ghost" onClick={() => log(false)}>
          Skip this time
        </button>
      </div>
    </main>
  );
}
