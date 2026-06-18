import { BUILDER } from "@/lib/builder";
import { triggerById } from "@/lib/triggers";
import type { User } from "@/lib/user";

export function History({ nomi }: { nomi: User }) {
  const list = nomi.activity;
  return (
    <main className="stage wide">
      <p className="eyebrow">History</p>
      <h1 className="h1">Every move, and the advice at the time</h1>
      <p className="lede">
        A record of the moments you brought here, what the tool advised, and whether you took it.
        Open any entry to see the two options exactly as they were.
      </p>

      <div className="hlist">
        {list.map((a, i) => {
          const t = triggerById(a.trigger);
          const b = BUILDER[a.build];
          const hasDetail = !!a.result;
          return (
            <details key={`${a.when}-${a.trigger}-${i}`} className="hentry" open={i === 0 && hasDetail}>
              <summary>
                <span className={`logdot ${a.taken ? "ok" : "skip"}`} />
                <span className="h-when">{a.when}</span>
                <span className="h-trig">{t ? t.title : a.trigger}</span>
                <span className="h-tags">
                  {a.training && <span className="h-tag training">practice</span>}
                  <span className="h-tag comp">{b.short}</span>
                  <span className={`h-tag status ${a.taken ? "ok" : "skip"}`}>
                    {a.taken ? "took it" : "skipped"}
                  </span>
                </span>
              </summary>
              {hasDetail ? (
                <div className="hbody">
                  {a.ctx && (
                    <p className="h-ctx">
                      <b>Context:</b> {a.ctx.appetite} client · {a.ctx.phase} phase
                      {a.ctx.situation ? ` — ${a.ctx.situation.slice(0, 180)}` : ""}
                    </p>
                  )}
                  {a.result!.verdict === "skip-it" && (
                    <p className="h-skip">
                      Verdict at the time: not worth it for this client. {a.result!.skip || "The AI-native move would not serve this client right now."}
                    </p>
                  )}
                  <div className="h-fork">
                    <div className="h-opt">
                      <span className="h-opt-l">What most PMs do</span>
                      <p>{a.result!.traditional}</p>
                    </div>
                    <div className="h-opt builder">
                      <span className="h-opt-l">The AI-native approach</span>
                      <p>{a.result!.builder}</p>
                    </div>
                  </div>
                  {a.result!.whyClientValues && (
                    <p className="h-why"><b>Why for the client:</b> {a.result!.whyClientValues}</p>
                  )}
                  {a.result!.steps && a.result!.verdict !== "skip-it" && (
                    <ol className="h-steps">
                      {a.result!.steps.map((s, j) => <li key={j}>{s}</li>)}
                    </ol>
                  )}
                  {a.result!.prompt && a.result!.verdict !== "skip-it" && (
                    <code className="h-prompt">{a.result!.prompt}</code>
                  )}
                </div>
              ) : (
                <div className="hbody">
                  <p className="h-nodetail">
                    This move predates advice capture — only the outcome was recorded.
                  </p>
                </div>
              )}
            </details>
          );
        })}
      </div>
    </main>
  );
}
