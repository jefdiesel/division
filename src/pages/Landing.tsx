import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { SplitBar } from "@/components/ui/SplitBar";

const SAMPLE_SPLITS = [
  { label: "Childcare", value1: 22, value2: 14, label1: "22 hrs", label2: "14 hrs" },
  { label: "Household", value1: 9, value2: 16, label1: "9 hrs", label2: "16 hrs" },
  { label: "Mental load", value1: 18, value2: 7, label1: "18 hrs", label2: "7 hrs" },
];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.animationPlayState = "running";
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return ref;
}

export function Landing() {
  const rootRef = useScrollReveal();

  return (
    <div ref={rootRef} className="min-h-screen bg-warm-50 overflow-x-hidden">
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-20">

        {/* ----------------------------------------------------------------
            HERO
        ---------------------------------------------------------------- */}
        <header className="mb-20 sm:mb-28">
          <h1
            data-reveal
            className="landing-reveal font-display text-5xl sm:text-6xl font-bold text-bark tracking-tight leading-[1.1] mb-5"
          >
            Division
          </h1>

          <p
            data-reveal
            className="landing-reveal landing-delay-1 text-xl sm:text-2xl text-warm-700 font-medium leading-snug mb-5 max-w-md"
          >
            See the labor. Share the load.
          </p>

          <p
            data-reveal
            className="landing-reveal landing-delay-2 text-base text-sand-600 leading-relaxed max-w-lg mb-9"
          >
            Division is a co-parenting tool that makes invisible work visible.
            Both parents agree on the categories, log what they do, and see
            where the split actually lands -- no guessing, no scorekeeping,
            just a clear picture you both can trust.
          </p>

          <div data-reveal className="landing-reveal landing-delay-3">
            <Link to="/auth">
              <Button size="lg">Get Started</Button>
            </Link>
          </div>
        </header>

        {/* ----------------------------------------------------------------
            PREVIEW -- sample split bars
        ---------------------------------------------------------------- */}
        <section className="mb-20 sm:mb-28" aria-label="App preview">
          <div
            data-reveal
            className="landing-reveal landing-delay-1 bg-white rounded-2xl shadow-[0_1px_3px_rgba(61,46,31,0.08)] p-5 sm:p-7 max-w-sm"
          >
            <div className="flex justify-between items-baseline mb-5">
              <p className="text-xs font-semibold tracking-wide text-sand-400 uppercase">
                This week
              </p>
              <div className="flex gap-4 text-xs text-sand-500">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#d4a574" }} />
                  Alex
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#8b9d83" }} />
                  Jordan
                </span>
              </div>
            </div>

            <div className="space-y-5">
              {SAMPLE_SPLITS.map((s, i) => (
                <div key={s.label}>
                  <p className="text-sm font-semibold text-bark mb-1.5">{s.label}</p>
                  <SplitBar
                    value1={s.value1}
                    value2={s.value2}
                    label1={s.label1}
                    label2={s.label2}
                  />
                  {i < SAMPLE_SPLITS.length - 1 && (
                    <div className="border-b border-sand-100 mt-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------
            HOW IT WORKS
        ---------------------------------------------------------------- */}
        <section className="mb-20 sm:mb-28" aria-label="How it works">
          <h2
            data-reveal
            className="landing-reveal font-display text-3xl sm:text-4xl font-bold text-bark tracking-tight mb-12"
          >
            How it works
          </h2>

          <div className="space-y-10">
            {/* Step 1 */}
            <div data-reveal className="landing-reveal landing-delay-1 flex gap-5 sm:gap-7 items-start">
              <span className="font-display text-5xl sm:text-6xl font-bold text-warm-200 leading-none select-none shrink-0 -mt-1">
                1
              </span>
              <div>
                <h3 className="text-lg font-semibold text-bark mb-1.5">
                  Agree on the rules together
                </h3>
                <p className="text-sm text-sand-600 leading-relaxed max-w-sm">
                  Both parents pick the categories and tasks that count.
                  Childcare, household, mental load -- whatever matters to your
                  family. Nobody decides alone.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div data-reveal className="landing-reveal landing-delay-2 flex gap-5 sm:gap-7 items-start pl-4 sm:pl-8">
              <span className="font-display text-5xl sm:text-6xl font-bold text-warm-200 leading-none select-none shrink-0 -mt-1">
                2
              </span>
              <div>
                <h3 className="text-lg font-semibold text-bark mb-1.5">
                  Log what you do
                </h3>
                <p className="text-sm text-sand-600 leading-relaxed max-w-sm">
                  Quick taps, not spreadsheets. Log a diaper change, a grocery
                  run, bedtime -- it takes seconds.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div data-reveal className="landing-reveal landing-delay-3 flex gap-5 sm:gap-7 items-start pl-8 sm:pl-16">
              <span className="font-display text-5xl sm:text-6xl font-bold text-warm-200 leading-none select-none shrink-0 -mt-1">
                3
              </span>
              <div>
                <h3 className="text-lg font-semibold text-bark mb-1.5">
                  See where the split lands
                </h3>
                <p className="text-sm text-sand-600 leading-relaxed max-w-sm">
                  A shared dashboard shows the real breakdown. No judgment,
                  no blame -- just data both of you shaped.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------
            WHAT IT'S NOT
        ---------------------------------------------------------------- */}
        <section className="mb-20 sm:mb-28" aria-label="What Division is not">
          <div
            data-reveal
            className="landing-reveal border-l-2 border-warm-200 pl-5 sm:pl-7 py-1"
          >
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-bark tracking-tight mb-4">
              What it's not
            </h2>
            <p className="text-base text-sand-700 leading-relaxed max-w-md">
              Not a debt tracker. Not a guilt tool. Not one-sided.
            </p>
            <p className="text-sm text-sand-500 leading-relaxed max-w-md mt-3">
              Division doesn't tell anyone they're failing. It gives both parents
              the same picture so the conversation starts from fact, not feeling.
              If something is off, you see it together and decide what to change.
            </p>
          </div>
        </section>

        {/* ----------------------------------------------------------------
            BOTTOM CTA
        ---------------------------------------------------------------- */}
        <footer
          data-reveal
          className="landing-reveal landing-delay-1 pb-12 sm:pb-16"
        >
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-bark tracking-tight mb-4">
            Start with the split,<br />not the argument.
          </h2>
          <Link to="/auth">
            <Button size="lg">Get Started</Button>
          </Link>
          <p className="text-xs text-sand-400 mt-4">
            Free to use. Takes two minutes to set up.
          </p>
        </footer>

      </div>
    </div>
  );
}
