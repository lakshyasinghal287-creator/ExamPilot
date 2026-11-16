import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Minus, Clock, Target, TrendingUp, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface QuestionEval {
  question_id: string;
  section_code: string;
  topic_code: string;
  question_type: string;
  is_attempted: boolean;
  is_correct: boolean;
  marks_awarded: number;
  time_spent_seconds: number;
}

interface SectionSummary {
  section_code: string;
  total_questions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  net_score: number;
  accuracy_percentage: number;
  total_time_spent_seconds: number;
}

interface TopicMetric {
  topic_code: string;
  topic_name: string;
  section_code: string;
  accuracy_percentage: number;
  questions_attempted: number;
  questions_correct: number;
  avg_time_spent_seconds: number;
  quadrant: string;
  quadrant_label: string;
}

interface Recommendation {
  subtopic_name: string;
  topic_name: string;
  section_code: string;
  accuracy_percentage: number;
  questions_attempted: number;
  priority_score: number;
  rationale: string;
  quadrant_label: string;
}

interface ScorecardViewProps {
  scorecardData: any;
  candidateName?: string;
  onBackToDashboard: () => void;
}

const SECTION_COLORS: Record<string, string> = {
  VARC: 'indigo',
  DILR: 'violet',
  QA: 'emerald',
};

const QUADRANT_COLORS: Record<string, string> = {
  Q1_FAST_ACCURATE: 'emerald',
  Q2_SLOW_ACCURATE: 'amber',
  Q3_FAST_INACCURATE: 'orange',
  Q4_SLOW_INACCURATE: 'rose',
};

function QuadrantBadge({ quadrant, label }: { quadrant: string; label: string }) {
  const color = QUADRANT_COLORS[quadrant] || 'slate';
  const baseClasses = `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold`;
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };
  return <span className={`${baseClasses} ${colorMap[color]}`}>{label}</span>;
}

export const ScorecardView: React.FC<ScorecardViewProps> = ({
  scorecardData,
  candidateName,
  onBackToDashboard,
}) => {
  const [showAllQuestions, setShowAllQuestions] = useState(false);

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

  const { total_score, sectional_scores, overall_accuracy_percentage, scorecard, diagnostics } = scorecardData;
  const attempted = scorecard?.total_attempted ?? 0;
  const correct = scorecard?.total_correct ?? 0;
  const incorrect = scorecard?.total_incorrect ?? 0;
  const unattempted = scorecard?.total_unattempted ?? 0;
  const rawScore = Number(total_score) || 0;

  const questionEvals: QuestionEval[] = scorecard?.question_evaluations ?? [];
  const sectionalSummaries: Record<string, SectionSummary> = scorecard?.sectional_summaries ?? {};
  const topicMetrics: TopicMetric[] = diagnostics?.topic_metrics ?? [];
  const recommendations: Recommendation[] = diagnostics?.recommendations ?? [];

  const displayedQuestions = showAllQuestions ? questionEvals : questionEvals.slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 font-sans">

      {/* ── 1. Header Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Diagnostic Scorecard
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Performance Report
            </h1>
            {candidateName && (
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">
                Candidate: {candidateName}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Evaluated under official CAT marking rubric (+3 / -1 / 0)
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center min-w-[130px]">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Score</div>
            <div className={`text-3xl font-bold mt-0.5 ${rawScore >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400'}`}>
              {rawScore.toFixed(1)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Accuracy: <strong className="text-emerald-600 dark:text-emerald-400">{overall_accuracy_percentage}%</strong>
            </div>
          </div>
        </div>

        {/* 4 Metric Blocks */}
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
            <div className="text-[11px] text-rose-600 dark:text-rose-400">-{incorrect} penalty</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Unattempted</div>
            <div className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-1">{unattempted}</div>
            <div className="text-[11px] text-slate-400">0 penalty</div>
          </div>
        </div>
      </div>

      {/* ── 2. Sectional Breakdown ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Sectional Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(sectional_scores ?? {}).map(([secCode, score]: any) => {
            const summary: SectionSummary | undefined = sectionalSummaries[secCode];
            const numScore = Number(score) || 0;
            return (
              <div key={secCode} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{secCode}</span>
                  <span className={`text-2xl font-bold ${numScore >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400'}`}>
                    {numScore.toFixed(1)}
                  </span>
                </div>
                {summary && (
                  <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px]">
                    <div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-semibold">{summary.correct}</div>
                      <div className="text-slate-400">correct</div>
                    </div>
                    <div>
                      <div className="text-rose-600 dark:text-rose-400 font-semibold">{summary.incorrect}</div>
                      <div className="text-slate-400">wrong</div>
                    </div>
                    <div>
                      <div className="text-slate-600 dark:text-slate-300 font-semibold">{summary.unattempted}</div>
                      <div className="text-slate-400">skipped</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Topic Performance Heatmap ── */}
      {topicMetrics.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Topic-Wise Performance</h2>
          </div>
          <div className="space-y-3">
            {topicMetrics.map((m, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">{m.section_code}</span>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{m.topic_name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <QuadrantBadge quadrant={m.quadrant} label={m.quadrant_label} />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {m.accuracy_percentage.toFixed(0)}% acc · {m.avg_time_spent_seconds}s avg
                    </span>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      m.accuracy_percentage >= 70 ? 'bg-emerald-500' :
                      m.accuracy_percentage >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.max(m.accuracy_percentage, 2)}%` }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-slate-400">
                  {m.questions_correct}/{m.questions_attempted} correct
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Recommendations ── */}
      {recommendations.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-rose-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Adaptive Recommendations
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ranked by remediation urgency. Focus on these areas in your next practice session.
          </p>
          <div className="space-y-3">
            {recommendations.map((r, i) => (
              <div key={i} className="p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">{r.section_code}</span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{r.subtopic_name}</span>
                      <QuadrantBadge quadrant={r.quadrant_label.replace(/ & /g,'_').replace(/ /g,'_').toUpperCase()} label={r.quadrant_label} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{r.rationale}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400">Priority</div>
                    <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
                      {(r.priority_score * 100).toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. Per-Question Breakdown ── */}
      {questionEvals.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Question-by-Question Review</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-left">
                  <th className="pb-2 pr-3 text-slate-400 font-medium">#</th>
                  <th className="pb-2 pr-3 text-slate-400 font-medium">Section</th>
                  <th className="pb-2 pr-3 text-slate-400 font-medium">Type</th>
                  <th className="pb-2 pr-3 text-slate-400 font-medium">Result</th>
                  <th className="pb-2 pr-3 text-slate-400 font-medium text-right">Marks</th>
                  <th className="pb-2 text-slate-400 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {displayedQuestions.map((ev, i) => (
                  <tr key={ev.question_id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-2 pr-3 text-slate-500 font-mono">{i + 1}</td>
                    <td className="py-2 pr-3">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">{ev.section_code}</span>
                    </td>
                    <td className="py-2 pr-3 text-slate-500">{ev.question_type}</td>
                    <td className="py-2 pr-3">
                      {!ev.is_attempted ? (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Minus className="w-3 h-3" /> Skipped
                        </span>
                      ) : ev.is_correct ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                          <XCircle className="w-3 h-3" /> Wrong
                        </span>
                      )}
                    </td>
                    <td className={`py-2 pr-3 text-right font-mono font-semibold ${
                      ev.marks_awarded > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                      ev.marks_awarded < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
                    }`}>
                      {ev.marks_awarded > 0 ? '+' : ''}{ev.marks_awarded}
                    </td>
                    <td className="py-2 text-right text-slate-400 font-mono flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" /> {ev.time_spent_seconds}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {questionEvals.length > 10 && (
            <button
              onClick={() => setShowAllQuestions(!showAllQuestions)}
              className="w-full py-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center justify-center gap-1 hover:text-indigo-700 transition-colors"
            >
              {showAllQuestions ? (
                <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
              ) : (
                <><ChevronDown className="w-3.5 h-3.5" /> Show all {questionEvals.length} questions</>
              )}
            </button>
          )}
        </div>
      )}

      {/* ── 6. Action ── */}
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
