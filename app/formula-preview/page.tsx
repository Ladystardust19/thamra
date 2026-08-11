import FormulaMap from "@/components/quiz/FormulaMap";
import ResultsTimeline from "@/components/sections/ResultsTimeline";

// Standalone preview of the quiz-result sections (pending copy block #2).
// Not linked anywhere; for review only.
export default function FormulaPreviewPage() {
  return (
    <main className="min-h-screen bg-cream">
      <FormulaMap />
      <ResultsTimeline />
      {/* Preview-only scroll room so the last timeline row can reach the
          50% activation line (production has content below it). */}
      <div aria-hidden className="h-[50vh]" />
    </main>
  );
}
