import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, FileText, AlertTriangle } from 'lucide-react';

interface ScorecardViewProps {
  scorecardData: any;
  onBackToDashboard: () => void;
}

export const ScorecardView: React.FC<ScorecardViewProps> = ({
  scorecardData,
  onBackToDashboard,
}) => {
  if (!scorecardData) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center select-none font-sans">
        <p className="text-stone-500">No test results available.</p>
        <button
          onClick={onBackToDashboard}
          className="mt-4 px-4 py-2 bg-stone-900 text-white rounded text-xs font-semibold cursor-pointer"
        >
          Return to Candidate Portal
        </button>
      </div>
    );
  }

  const { total_score, sectional_scores, overall_accuracy_percentage, scorecard } = scorecardData;
  const attempted = scorecard?.total_attempted ?? 0;
  const correct = scorecard?.total_correct ?? 0;
  const incorrect = scorecard?.total_incorrect ?? 0;
  const unattempted = scorecard?.total_unattempted ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 select-none font-sans">
      {/* Official Scorecard Header Box */}
      <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-200">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-stone-500 font-semibold">
              Official Assessment Scorecard • CAT 2026 Simulation
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              Performance Diagnostic Report
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Candidate: <strong>Aarav Sharma</strong> (Roll: 26CAT9041) • Completed with CAT marking rubric (+3 MCQ, -1 MCQ penalty, 0 TITA penalty).
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-300 rounded-lg p-4 text-center min-w-[180px]">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Overall Raw Score</div>
            <div className="text-4xl font-serif font-bold text-stone-900 mt-1">
              {total_score.toFixed(1)}
            </div>
            <div className="text-[11px] text-stone-600 mt-1 font-mono">
              Accuracy: <strong>{overall_accuracy_percentage}%</strong>
            </div>
          </div>
        </div>

        {/* Detailed Metrics Table */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-stone-50 rounded border border-stone-200/80">
            <div className="text-[10px] uppercase font-bold text-stone-500">Attempted</div>
            <div className="text-xl font-bold text-stone-800 mt-1">{attempted}</div>
            <div className="text-[10px] text-stone-400 font-mono">of {scorecard?.total_questions ?? 66} Qs</div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded border border-emerald-200/80">
            <div className="text-[10px] uppercase font-bold text-emerald-800 flex items-center justify-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Correct</span>
            </div>
            <div className="text-xl font-bold text-emerald-900 mt-1">{correct}</div>
            <div className="text-[10px] text-emerald-700 font-mono">+{correct * 3} marks</div>
          </div>

          <div className="p-3 bg-rose-50/60 rounded border border-rose-200/80">
            <div className="text-[10px] uppercase font-bold text-rose-800 flex items-center justify-center space-x-1">
              <XCircle className="w-3 h-3" />
              <span>Incorrect</span>
            </div>
            <div className="text-xl font-bold text-rose-900 mt-1">{incorrect}</div>
            <div className="text-[10px] text-rose-700 font-mono">Negative penalty applied</div>
          </div>

          <div className="p-3 bg-stone-50 rounded border border-stone-200/80">
            <div className="text-[10px] uppercase font-bold text-stone-500">Unattempted</div>
            <div className="text-xl font-bold text-stone-700 mt-1">{unattempted}</div>
            <div className="text-[10px] text-stone-400 font-mono">0 marks (No penalty)</div>
          </div>
        </div>
      </div>

      {/* Section-Wise Scorecard Breakdown */}
      <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-xs">
        <h2 className="text-sm font-bold font-serif text-stone-900 uppercase tracking-wide mb-4">
          Section-Wise Performance Assessment
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(sectional_scores ?? {}).map(([secCode, score]: any) => (
            <div
              key={secCode}
              className="p-4 rounded border border-stone-200 bg-stone-50/60 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-mono font-bold text-stone-500 uppercase">{secCode} Section</span>
                <div className="text-2xl font-serif font-bold text-stone-900 mt-1">
                  {typeof score === 'number' ? score.toFixed(1) : score}
                </div>
              </div>
              <div className="text-right text-[11px] text-stone-500 font-mono">
                <div>+3.0 / -1.0</div>
                <div className="text-stone-400">40 min limit</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnostic Takeaways */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-5 text-xs text-stone-700 space-y-2">
        <div className="font-bold text-stone-900 flex items-center space-x-1.5 uppercase tracking-wide text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Automated Diagnostic Takeaway</span>
        </div>
        <p className="leading-relaxed">
          Your highest net mark yield was in <strong>VARC</strong>. In Quantitative Ability, remember that non-MCQ (TITA) questions carry zero negative penalties—ensure you attempt all accessible TITA items before abandoning them.
        </p>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-end pt-2">
        <button
          onClick={onBackToDashboard}
          className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <span>Return to Candidate Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
