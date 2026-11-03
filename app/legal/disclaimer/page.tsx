import type { Metadata } from "next";
import { DISCLAIMER, RULES_AS_OF, SOURCES } from "@/lib/lost";
import { DISCLAIMER_SHORT, HONESTY } from "@/lib/site";

export const metadata: Metadata = { title: "Disclaimer", description: DISCLAIMER_SHORT };

export default function DisclaimerPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Read this</p>
      <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Disclaimer</h1>
      <p className="mt-4 text-lg text-foreground">{DISCLAIMER_SHORT}</p>
      <p className="mt-2 text-muted">{HONESTY}</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-foreground">What this is</h2>
          <p className="mt-2">
            A free educational guide. It turns a dated reading (as of {RULES_AS_OF}) of Japan&apos;s Lost Property Act (遺失物法) and its cabinet order, the National Police Agency lost-property pages, the Immigration Services Agency residence card reissue page (入管法 19条の12) and operators&apos; lost-and-found pages into a list of steps, contacts and estimated dates.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">What it isn&apos;t</h2>
          <p className="mt-2">{DISCLAIMER}</p>
          <p className="mt-2">
            The legal periods run from the day an item is handed in or publicly notified, which can be later than the day you lost it, so the dates here are the earliest (safest) ones. Operators change phone numbers, hours and storage rules; check their page. For theft, call 110; for non-urgent police consultation, #9110. For immigration questions, ask your regional immigration office.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {SOURCES.map((s) => (
              <li key={s}>
                <a href={s} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Your data</h2>
          <p className="mt-2">What you enter stays in your browser (or in a share link you create). No login, no names, no addresses, no database.</p>
        </section>
      </div>
    </div>
  );
}
