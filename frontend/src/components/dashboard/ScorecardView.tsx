import { Award, Target, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

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
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-slate-500">No test results found.</p>
        <button
          onClick={onBackToDashboard}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold"
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 select-none">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase">
              Official CAT Evaluation Complete
            </span>
            <h1 className="text-3xl font-extrabold mt-3 tracking-tight">
              Test Performance Diagnostics
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              Scored via CAT marking rubric (+3 correct MCQ, -1 incorrect MCQ, 0 TITA penalty)
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center min-w-[200px]">
            <div className="text-xs font-medium text-blue-200 uppercase tracking-wider">Total Score</div>
            <div className="text-5xl font-black mt-1 text-white tracking-tight">
              {total_score}
            </div>
            <div className="text-xs text-blue-300 mt-1">
              Overall Accuracy: <strong className="text-white">{overall_accuracy_percentage}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Correct Answers</div>
            <div className="text-2xl font-black text-slate-800">{correct}</div>
            <div className="text-xs text-emerald-600 font-medium">+{correct * 3} marks earned</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Incorrect Attempts</div>
            <div className="text-2xl font-black text-slate-800">{incorrect}</div>
            <div className="text-xs text-rose-600 font-medium">Negative penalty deducted</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Attempted</div>
            <div className="text-2xl font-black text-slate-800">{attempted}</div>
            <div className="text-xs text-slate-500 font-medium">out of {scorecard?.total_questions ?? 66} questions</div>
          </div>
        </div>
      </div>

      {/* Sectional Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
          <Award className="w-5 h-5 text-indigo-600" />
          <span>Section-Wise Score Breakdown</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(sectional_scores ?? {}).map(([secCode, score]: any) => (
            <div
              key={secCode}
              className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">{secCode} Section</span>
                <div className="text-2xl font-extrabold text-slate-800 mt-1">{score}</div>
              </div>
              <div className="px-3 py-1 rounded bg-white text-xs font-bold text-blue-700 border border-slate-200 shadow-xs">
                Raw Marks
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end space-x-4">
        <button
          onClick={onBackToDashboard}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
        >
          <span>Return to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
