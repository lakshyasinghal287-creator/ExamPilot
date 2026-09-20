import React from 'react';
import { Play, BookOpen, Clock, CheckCircle2, ChevronRight, AlertCircle, FileText, ArrowUpRight } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      {/* Editorial Academic Welcome Bar */}
      <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-mono uppercase tracking-widest text-stone-500 font-semibold mb-1">
              Indian Institute of Management • CAT 2026 Assessment Simulation
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              Standardized Examination Candidate Portal
            </h1>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              Welcome back, Aarav. This system simulates the official 120-minute, 3-section computer-based test (CBT) with authoritative server timing, TCS iON question navigation, and deterministic verification.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onStartExam}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded font-medium text-sm transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch CAT Mock Test</span>
            </button>
          </div>
        </div>

        {/* Status Highlights */}
        <div className="mt-6 pt-6 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-stone-400 font-medium block">Examination Format</span>
            <strong className="text-stone-800 text-sm font-semibold">66 Questions • 120 Mins</strong>
          </div>
          <div>
            <span className="text-stone-400 font-medium block">Sectional Allocation</span>
            <strong className="text-stone-800 text-sm font-semibold">40m VARC • 40m DILR • 40m QA</strong>
          </div>
          <div>
            <span className="text-stone-400 font-medium block">Scoring Metric</span>
            <strong className="text-stone-800 text-sm font-semibold">+3 / -1 (MCQ) • +3 / 0 (TITA)</strong>
          </div>
          <div>
            <span className="text-stone-400 font-medium block">Deterministic Solver</span>
            <strong className="text-emerald-700 text-sm font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SymPy Active</span>
            </strong>
          </div>
        </div>
      </div>

      {/* Sectional Performance & Syllabus Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-stone-900 font-serif">
            Sectional Performance & Readiness Overview
          </h2>
          <span className="text-xs text-stone-500">Official CAT Syllabus Ratios</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* VARC Section Card */}
          <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-stone-500 uppercase">Section 1</span>
                <span className="text-[11px] px-2 py-0.5 bg-stone-100 text-stone-600 font-medium rounded">
                  24 Questions • 40 Min
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mt-2">
                Verbal Ability & Reading Comprehension
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                4 Reading Comprehension Passages (~16 MCQs) + Verbal Ability (Para-Jumbles, Para-Summary, Odd Sentence).
              </p>

              <div className="mt-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>RC Inference & Tone:</span>
                  <strong className="text-stone-800">High Accuracy (78%)</strong>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>TITA Para-Jumbles:</span>
                  <strong className="text-amber-700">Practice Recommended</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenPractice('VARC')}
              className="mt-5 pt-3 border-t border-stone-100 text-xs font-semibold text-stone-800 hover:text-stone-950 flex items-center justify-between"
            >
              <span>Practice VARC Drills</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* DILR Section Card */}
          <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-stone-500 uppercase">Section 2</span>
                <span className="text-[11px] px-2 py-0.5 bg-stone-100 text-stone-600 font-medium rounded">
                  20 Questions • 40 Min
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mt-2">
                Data Interpretation & Logical Reasoning
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                4 Caselets (Matrix arrangement, Truth-Tellers/Liars, Tournaments, Missing Data Tables).
              </p>

              <div className="mt-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Arrangements & Logic:</span>
                  <strong className="text-stone-800">Mastery (85%)</strong>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Games & Tournaments:</span>
                  <strong className="text-rose-600">Pacing Bottleneck (3.8 min/Q)</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenPractice('DILR')}
              className="mt-5 pt-3 border-t border-stone-100 text-xs font-semibold text-stone-800 hover:text-stone-950 flex items-center justify-between"
            >
              <span>Practice DILR Caselets</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* QA Section Card */}
          <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-stone-500 uppercase">Section 3</span>
                <span className="text-[11px] px-2 py-0.5 bg-stone-100 text-stone-600 font-medium rounded">
                  22 Questions • 40 Min
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mt-2">
                Quantitative Ability
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Arithmetic (~35%), Algebra (~30%), Geometry (~15%), Number Systems (~10%), Modern Math (~10%).
              </p>

              <div className="mt-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Arithmetic (TSD/Work):</span>
                  <strong className="text-stone-800">Consistent (82%)</strong>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Number Systems & Remainders:</span>
                  <strong className="text-rose-600">Mark Leakage (-1.0/attempt)</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenPractice('QA')}
              className="mt-5 pt-3 border-t border-stone-100 text-xs font-semibold text-stone-800 hover:text-stone-950 flex items-center justify-between"
            >
              <span>Practice QA Math Drills</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Official CAT Full-Length Mock Exams Table */}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 font-serif">
              Standardized Computer-Based Test Series
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Strictly adheres to official CAT sectional timers and scoring rubrics.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-6">Mock Title</th>
                <th className="py-3 px-4">Pattern</th>
                <th className="py-3 px-4">Questions</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Validation Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              <tr className="hover:bg-stone-50/70 transition-colors">
                <td className="py-4 px-6 font-medium text-stone-900">
                  <div className="font-semibold text-sm">CAT 2026: Benchmark National Mock 01</div>
                  <div className="text-[11px] text-stone-400">Slot 1 Simulation • Standard Difficulty (L3)</div>
                </td>
                <td className="py-4 px-4 font-mono">VARC-DILR-QA</td>
                <td className="py-4 px-4">66 Questions</td>
                <td className="py-4 px-4">120 Minutes (40m/sec)</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    100% SymPy Verified
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={onStartExam}
                    className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded font-medium text-xs transition-colors cursor-pointer"
                  >
                    Take Exam
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-stone-50/70 transition-colors">
                <td className="py-4 px-6 font-medium text-stone-900">
                  <div className="font-semibold text-sm">CAT 2026: Advanced Diagnostic Mock 02</div>
                  <div className="text-[11px] text-stone-400">Slot 2 Simulation • Multi-Concept Constraints (L4)</div>
                </td>
                <td className="py-4 px-4 font-mono">VARC-DILR-QA</td>
                <td className="py-4 px-4">66 Questions</td>
                <td className="py-4 px-4">120 Minutes (40m/sec)</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                    Calibrated Benchmark
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={onStartExam}
                    className="px-4 py-1.5 border border-stone-300 hover:bg-stone-100 text-stone-800 rounded font-medium text-xs transition-colors cursor-pointer"
                  >
                    Take Exam
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
