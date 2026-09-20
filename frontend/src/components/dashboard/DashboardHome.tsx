import React from 'react';
import { Play, Clock, BookOpen, CheckCircle, ChevronRight, BarChart2, Shield } from 'lucide-react';

interface DashboardHomeProps {
  onStartExam: () => void;
  onOpenPractice: (topicName: string) => void;
  serverHealthy: boolean;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  onStartExam,
  onOpenPractice,
  serverHealthy,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10 font-sans">
      {/* 1. Clean Hero / Welcome Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-10 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            <span>Official CAT Simulation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            CAT 2026 Mock Test Series
          </h1>

          <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Practice under realistic exam conditions with official sectional timers, authentic TCS iON navigation, and automatic scoring.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartExam}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Full Mock Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Three Clean Stat Badges (No clutter) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Questions</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">66 Questions</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">24 VARC • 20 DILR • 22 QA</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Time Limit</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">120 Minutes</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">40 minutes per section</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Scoring Scheme</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">+3 / -1 / 0</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">No penalty on TITA questions</div>
        </div>
      </div>

      {/* 3. Section Overview */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Exam Structure
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Section 1</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">40 mins</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-2">
              Verbal Ability & RC
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              24 Questions (Reading Comprehension, Para-Jumbles, Summary)
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Section 2</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">40 mins</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-2">
              Data Interpretation & LR
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              20 Questions (Logic Games, Puzzles, Tabular Sets)
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Section 3</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">40 mins</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-2">
              Quantitative Ability
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              22 Questions (Arithmetic, Algebra, Geometry, Numbers)
            </p>
          </div>
        </div>
      </div>

      {/* 4. Mock Tests Available */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Available Full Mocks
        </h2>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 shadow-xs overflow-hidden">
          {/* Mock 1 */}
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  CAT 2026: Benchmark National Mock 01
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Slot 1 Pattern
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                66 Questions • 120 Minutes • Standard Difficulty
              </p>
            </div>

            <button
              onClick={onStartExam}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <span>Start Test</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mock 2 */}
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  CAT 2026: Advanced Diagnostic Mock 02
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Slot 2 Pattern
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                66 Questions • 120 Minutes • Advanced Constraints
              </p>
            </div>

            <button
              onClick={onStartExam}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-medium text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span>Start Test</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
