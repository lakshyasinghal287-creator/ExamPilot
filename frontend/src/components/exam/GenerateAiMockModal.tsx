import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, RefreshCw, X, ShieldCheck, ArrowRight, Layers, FileCheck } from 'lucide-react';
import { examApi } from '../../services/api';

interface GenerateAiMockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExamCreated: (newExamCode: string) => void;
}

const GENERATION_STAGES = [
  'Initializing CAT Blueprint & Section Taxonomies...',
  'Synthesizing Section 1: 4 RC Passages & 8 Verbal Ability Questions...',
  'Synthesizing Section 2: 4 Complex DILR Caselets & Logic Puzzles...',
  'Synthesizing Section 3: 22 QA Problems & Verifying SymPy Math...',
  'Finalizing & Banking 66 Questions into Test Engine DB...',
];

export const GenerateAiMockModal: React.FC<GenerateAiMockModalProps> = ({
  isOpen,
  onClose,
  onExamCreated,
}) => {
  const [customTitle, setCustomTitle] = useState<string>('CAT 2026: AI Generated Benchmark Mock');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [generatedExam, setGeneratedExam] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isGenerating && currentStageIdx < GENERATION_STAGES.length - 1) {
      interval = setInterval(() => {
        setCurrentStageIdx((prev) => (prev < GENERATION_STAGES.length - 1 ? prev + 1 : prev));
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [isGenerating, currentStageIdx]);

  if (!isOpen) return null;

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setError(null);
    setCurrentStageIdx(0);
    setGeneratedExam(null);

    try {
      const result = await examApi.generateAiMock(customTitle.trim() || undefined);
      setGeneratedExam(result);
      setCurrentStageIdx(GENERATION_STAGES.length - 1);
    } catch (err: any) {
      console.error('Failed to generate full AI mock:', err);
      setError(
        err?.response?.data?.detail ||
          'Failed to generate complete AI mock. Please check your Gemini API key and network connection.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLaunchExam = () => {
    if (generatedExam?.exam_code) {
      onExamCreated(generatedExam.exam_code);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Generate Full CAT Mock Exam
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Author complete unseen 66-question paper via Gemini AI
              </p>
            </div>
          </div>
          {!isGenerating && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="py-5 space-y-4">
          {!generatedExam ? (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Examination Title:
                </label>
                <input
                  type="text"
                  disabled={isGenerating}
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. CAT 2026: AI National Mock 02"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>

              {/* Blueprint Summary */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Official CAT Blueprint Generated:</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-slate-100">24 Questions</div>
                    <div className="text-slate-500">VARC (4 RCs + VA)</div>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-slate-100">20 Questions</div>
                    <div className="text-slate-500">DILR (4 Caselets)</div>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-slate-100">22 Questions</div>
                    <div className="text-slate-500">QA (SymPy Verified)</div>
                  </div>
                </div>
              </div>

              {/* Live Progress Bar when generating */}
              {isGenerating && (
                <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-xl space-y-2.5">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                    <span>{GENERATION_STAGES[currentStageIdx]}</span>
                  </div>
                  <div className="w-full h-1.5 bg-indigo-200/60 dark:bg-indigo-900/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                      style={{ width: `${((currentStageIdx + 1) / GENERATION_STAGES.length) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
                    Synthesizing authentic questions • Deterministic SymPy validation active
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              {!isGenerating && (
                <button
                  onClick={handleStartGeneration}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize Complete 66-Question Paper Now</span>
                </button>
              )}
            </>
          ) : (
            /* Success State */
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Full AI Examination Ready!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {generatedExam.exam_name} ({generatedExam.exam_code})
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Questions:</span>
                  <strong className="text-slate-900 dark:text-slate-100">{generatedExam.total_questions} Questions</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <strong className="text-slate-900 dark:text-slate-100">120 Minutes (40m / section)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Math Verification:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">100% Deterministic (SymPy)</strong>
                </div>
              </div>

              <button
                onClick={handleLaunchExam}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Launch & Attempt This Mock Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
