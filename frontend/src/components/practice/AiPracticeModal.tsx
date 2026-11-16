import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, RefreshCw, X, ShieldCheck, HelpCircle } from 'lucide-react';
import { examApi } from '../../services/api';

interface AiPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SECTION_TOPICS: Record<string, string[]> = {
  QA: ['Number Systems & Remainders', 'Percentages & Profit Loss', 'Time Speed & Distance', 'Algebra & Quadratic Equations', 'Geometry & Mensuration'],
  VARC: ['Critical Reasoning & Assumptions', 'Reading Comprehension Analysis', 'Paragraph Summary', 'Para-Jumbles Logic'],
  DILR: ['Linear & Circular Arrangements', 'Tabular Matrix & Missing Data', 'Set Theory & Venn Diagrams', 'Games & Tournaments'],
};

export const AiPracticeModal: React.FC<AiPracticeModalProps> = ({ isOpen, onClose }) => {
  const [sectionCode, setSectionCode] = useState<'QA' | 'VARC' | 'DILR'>('QA');
  const [topicName, setTopicName] = useState<string>('Number Systems & Remainders');
  const [difficulty, setDifficulty] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Generated question state
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [selectedOptionKey, setSelectedOptionKey] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedData(null);
    setSelectedOptionKey(null);
    setIsAnswerSubmitted(false);

    try {
      const response = await examApi.generateLiveQuestion({
        section_code: sectionCode,
        topic_name: topicName,
        difficulty_level: difficulty,
        question_type: 'MCQ',
      });
      setGeneratedData(response);
    } catch (err: any) {
      console.error('Failed to generate live question:', err);
      setError(
        err?.response?.data?.detail ||
          'Failed to generate question from Gemini AI. Please ensure your API key is valid.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const question = generatedData?.question;
  const isCorrect = selectedOptionKey === question?.correct_answer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <span>Real-Time AI Practice Drill</span>
                <span className="text-[10px] uppercase font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  Gemini Live
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fresh questions synthesized on-demand with deterministic SymPy validation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Controls */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            {/* Section Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Target Section:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['QA', 'VARC', 'DILR'] as const).map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      setSectionCode(sec);
                      setTopicName(SECTION_TOPICS[sec][0]);
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      sectionCode === sec
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                    }`}
                  >
                    {sec === 'QA' ? 'Quant (QA)' : sec === 'VARC' ? 'Verbal (VARC)' : 'DILR'}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Dropdown */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Focus Topic:
              </label>
              <select
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {SECTION_TOPICS[sectionCode]?.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Level */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Difficulty Level:
              </span>
              <div className="flex space-x-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`w-7 h-7 text-xs font-semibold rounded-md border transition-all ${
                      difficulty === lvl
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing with Gemini AI & Verifying with SymPy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate New Question Now</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start space-x-2">
              <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Generated Question Display */}
          {question && (
            <div className="space-y-4 pt-2">
              {/* Verification Badge */}
              <div className="flex items-center justify-between text-[11px] bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {generatedData.math_verified
                      ? 'SymPy Deterministically Verified'
                      : 'AI Structural Schema Verified'}
                  </span>
                </div>
                <span className="text-slate-500 font-mono">
                  Difficulty: {question.difficulty_level}/5
                </span>
              </div>

              {/* Question Statement */}
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                {question.question_text}
              </div>

              {/* MCQ Options */}
              {question.options && question.options.length > 0 && (
                <div className="space-y-2">
                  {question.options.map((opt: any) => {
                    const isSelected = selectedOptionKey === opt.option_key;
                    let optionStyle =
                      'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-400';

                    if (isAnswerSubmitted) {
                      if (opt.option_key === question.correct_answer) {
                        optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-600 font-semibold';
                      } else if (isSelected && !isCorrect) {
                        optionStyle = 'bg-rose-50 border-rose-500 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-600';
                      }
                    } else if (isSelected) {
                      optionStyle = 'bg-indigo-50 border-indigo-600 text-indigo-900 dark:bg-indigo-950/50 dark:border-indigo-500 dark:text-indigo-200 font-semibold';
                    }

                    return (
                      <button
                        key={opt.option_key}
                        type="button"
                        disabled={isAnswerSubmitted}
                        onClick={() => setSelectedOptionKey(opt.option_key)}
                        className={`w-full p-3 text-left text-xs rounded-xl border flex items-center space-x-3 transition-colors ${optionStyle}`}
                      >
                        <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {opt.option_key}
                        </span>
                        <span className="flex-1">{opt.option_text}</span>
                        {isAnswerSubmitted && opt.option_key === question.correct_answer && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {isAnswerSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Action: Check Answer */}
              {!isAnswerSubmitted && selectedOptionKey && (
                <button
                  onClick={() => setIsAnswerSubmitted(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Verify My Answer
                </button>
              )}

              {/* Solution / Explanation Box */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Solution & Analytical Rationale</span>
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {isCorrect ? 'Correct (+3 marks)' : 'Incorrect (-1 penalty)'}
                    </span>
                  </div>

                  {generatedData.derivation && (
                    <div className="p-2 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-lg text-[11px] font-mono text-indigo-700 dark:text-indigo-300">
                      <strong>SymPy Proof:</strong> {generatedData.derivation}
                    </div>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
