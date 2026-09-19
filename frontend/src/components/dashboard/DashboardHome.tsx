import { Play, Sparkles, Zap, Clock, ShieldCheck, ChevronRight, BarChart3 } from 'lucide-react';

interface DashboardHomeProps {
  onStartExam: () => void;
  onOpenPractice: () => void;
  serverHealthy: boolean;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  onStartExam,
  onOpenPractice,
  serverHealthy,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-10 text-white shadow-xl overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI-Driven & Deterministically Verified CAT Prep {serverHealthy ? '(Engine Online)' : ''}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Master the Common Admission Test with Authentic CBT Simulation
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Practice under official CAT conditions with exact TCS iON palette mechanics, or target weak subtopics with adaptive drills verified by symbolic math.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={onStartExam}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2.5 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Full CAT Mock Test</span>
            </button>

            <button
              onClick={onOpenPractice}
              className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center space-x-2 active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Target Weak Subtopics</span>
            </button>
          </div>
        </div>

        {/* Decorative Background Element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Highlights / Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Official CAT Format */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Authentic 3-Section Simulation</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Strict sequential section order (VARC $\to$ DILR $\to$ QA) with 40-minute hard lockouts and the standardized 5-color TCS iON question palette.
          </p>
        </div>

        {/* Card 2: Deterministic Validation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Zero AI Math Hallucination</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Every Quantitative Ability question is verified by Python's SymPy symbolic math engine in an AST sandbox before entering the question bank.
          </p>
        </div>

        {/* Card 3: Diagnostic Feedback */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Cognitive & Pacing Analytics</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Identifies "Critical Time Sinks" (questions taking &gt; 3 mins resulting in mark deduction) and categorizes speed vs. accuracy tradeoffs.
          </p>
        </div>
      </div>

      {/* Available Exam Series */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Standardized Mock Test Series</h2>
            <p className="text-xs text-slate-500 mt-0.5">Calibrated to the official CAT question distribution and marking rubric.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                C1
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-slate-800">CAT 2026: Official Pattern Mock 1</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Validated Bank
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center space-x-3">
                  <span>66 Questions (24 VARC, 20 DILR, 22 QA)</span>
                  <span>•</span>
                  <span>120 Minutes</span>
                  <span>•</span>
                  <span>+3 / -1 Scoring</span>
                </div>
              </div>
            </div>

            <button
              onClick={onStartExam}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 self-start sm:self-auto"
            >
              <span>Take Test</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
