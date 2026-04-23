import { BookOpenCheck, Lightbulb, TriangleAlert } from "lucide-react";
import { ExplanationResponse } from "@/types/quiz";

type Props = {
  data: ExplanationResponse;
};

export default function ExplanationCard({ data }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Explanation
          </p>
          <h2 className="mt-1 text-3xl font-semibold text-slate-900">
            Here’s a simpler way to understand it
          </h2>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          <BookOpenCheck className="h-4 w-4" />
          Revision-ready
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <div className="rounded-2xl bg-slate-50 p-5">
          <h3 className="text-base font-semibold text-slate-900">Overview</h3>
          <p className="mt-3 whitespace-pre-wrap text-lg leading-9 text-slate-700">
            {data.overview}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-indigo-600" />
              <h3 className="text-base font-semibold text-slate-900">Key Points</h3>
            </div>

            <ul className="mt-3 list-disc space-y-3 pl-5 text-lg leading-9 text-slate-700">
              {data.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
            <div className="flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-amber-600" />
              <h3 className="text-base font-semibold text-slate-900">
                Common Mistakes
              </h3>
            </div>

            <ul className="mt-3 list-disc space-y-3 pl-5 text-lg leading-9 text-slate-700">
              {data.commonMistakes.map((mistake, index) => (
                <li key={index}>{mistake}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
          <h3 className="text-base font-semibold text-slate-900">
            1-Minute Revision Summary
          </h3>
          <p className="mt-3 whitespace-pre-wrap text-lg leading-9 text-slate-700">
            {data.revisionSummary}
          </p>
        </div>
      </div>
    </section>
  );
}