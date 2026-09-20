import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, FileText } from 'lucide-react';

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
      <div className="max-w-4xl mx-auto p-12 text-center select-none font-sans">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">No Results Available</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complete a mock examination to see your evaluation report.
        </p>
        <button
          onClick={onBackToDashboard}
          className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs cursor-pointer transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { total_score, sectional_scores, overall_accuracy_percentage, scorecard } = scorecardData;
  const attempted = scorecard?.total_attempted ?? 0;
  const correct = scorecard?.total_correct ?? 0;
  const incorrect = scorecard?.total_incorrect ?? 0;
  const unattempted = scorecard?.total_unattempted ?? 0;

  const rawScore = Number(total_score) || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 font-sans">
      {/* 1. Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Diagnostic Scorecard
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Performance Report
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Candidate: Aarav Sharma • Evaluated under official CAT marking rubric (+3 / -1 / 0)
            </p>
          </div>

          {/* Raw Score */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center min-w-[130px]">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Score</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {rawScore.toFixed(1)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Accuracy: <strong className="text-emerald-600 dark:text-emerald-400">{overall_accuracy_percentage}%</strong>
            </div>
          </div>
        </div>

        {/* 4 Clean Metric Blocks */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Attempted</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{attempted}</div>
            <div className="text-[11px] text-slate-400">of {scorecard?.total_questions ?? 66} Qs</div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Correct</div>
            <div className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">{correct}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400">+{correct * 3} marks</div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
            <div className="text-xs text-rose-700 dark:text-rose-400 font-medium">Incorrect</div>
            <div className="text-xl font-bold text-rose-800 dark:text-rose-300 mt-1">{incorrect}</div>
            <div className="text-[11px] text-rose-600 dark:text-rose-400">-{incorrect * 1} penalty</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Unattempted</div>
            <div className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-1">{unattempted}</div>
            <div className="text-[11px] text-slate-400">0 penalty</div>
          </div>
        </div>
      </div>

      {/* 2. Sectional Scores */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Sectional Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(sectional_scores ?? {}).map(([secCode, score]: any) => {
            const numScore = Number(score) || 0;
            return (
              <div
                key={secCode}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    {secCode}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {numScore.toFixed(1)}
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-mono">+3 / -1</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Action Buttons */}
      <div className="flex justify-end">
        <button
          onClick={onBackToDashboard}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
        >
          <span>Return to Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
