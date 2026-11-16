import React, { useState } from 'react';
import { Play, Clock, BookOpen, CheckCircle, ChevronRight, BarChart2, Shield, Sparkles } from 'lucide-react';
import { ExamInfo } from '../../services/api';
import { AiPracticeModal } from '../practice/AiPracticeModal';

interface DashboardHomeProps {
  onStartExam: (examCode?: string) => void;
  availableExams?: ExamInfo[];
  selectedExamCode?: string;
  onSelectExam?: (code: string) => void;
  serverHealthy: boolean;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  onStartExam,
  availableExams = [],
  selectedExamCode,
  onSelectExam,
  serverHealthy,
}) => {
  const [isAiPracticeOpen, setIsAiPracticeOpen] = useState(false);

  // Active exam details (fall back to first available or default)
  const activeExam =
    availableExams.find((e) => e.code === selectedExamCode) || availableExams[0];

  const examName = activeExam?.name || 'CAT 2026 Mock Test Series';
  const totalQuestions = activeExam?.total_questions || 66;
  const totalDuration = activeExam?.total_duration_minutes || 120;
  const sections = activeExam?.sections || [
    { code: 'VARC', name: 'Verbal Ability & Reading Comprehension', target_question_count: 24, duration_minutes: 40 },
    { code: 'DILR', name: 'Data Interpretation & Logical Reasoning', target_question_count: 20, duration_minutes: 40 },
    { code: 'QA', name: 'Quantitative Ability', target_question_count: 22, duration_minutes: 40 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10 font-sans">
      {/* 1. Hero Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-10 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            <span>{activeExam?.code || 'CAT CBT'} Official Simulation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {examName}
          </h1>

          <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Practice under realistic exam conditions with official sectional timers, authentic TCS iON navigation, and automated diagnostic scoring.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onStartExam(activeExam?.code)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Full Mock Examination</span>
            </button>

            <button
              onClick={() => setIsAiPracticeOpen(true)}
              className="px-5 py-3 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-medium text-sm rounded-xl transition-colors flex items-center space-x-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>AI Practice Drills (Gemini)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Questions</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalQuestions} Questions</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {sections.map((s) => `${s.target_question_count} ${s.code}`).join(' • ')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Time Limit</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalDuration} Minutes</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {sections[0]?.duration_minutes || 40} minutes per section (strict locking)
          </div>
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
          Sectional Structure
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sections.map((sec, idx) => (
            <div
              key={sec.code}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Section {idx + 1}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{sec.duration_minutes} mins</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-2">
                {sec.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {sec.target_question_count} Questions
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Available Full Mocks (Dynamic from Server) */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Available Full Mocks
        </h2>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 shadow-xs overflow-hidden">
          {(availableExams.length > 0 ? availableExams : [activeExam]).filter(Boolean).map((exam, i) => (
            <div
              key={exam.code}
              className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {exam.name}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {exam.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {exam.total_questions} Questions • {exam.total_duration_minutes} Minutes • Full Official CAT CBT Format
                </p>
              </div>

              <button
                onClick={() => onStartExam(exam.code)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <span>Start Test</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Real-Time AI Practice Modal */}
      <AiPracticeModal
        isOpen={isAiPracticeOpen}
        onClose={() => setIsAiPracticeOpen(false)}
      />
    </div>
  );
};
