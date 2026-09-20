import React from 'react';
import { ClientQuestion, PaletteState } from '../../types/exam';

interface CatPaletteProps {
  questions: ClientQuestion[];
  currentQuestionIndex: number;
  candidateName: string;
  activeSectionCode?: string;
  onSelectQuestion: (index: number) => void;
  onSubmitSection?: () => void;
  onSubmitExam: () => void;
}

export const CatPalette: React.FC<CatPaletteProps> = ({
  questions,
  currentQuestionIndex,
  candidateName,
  activeSectionCode,
  onSelectQuestion,
  onSubmitSection,
  onSubmitExam,
}) => {
  const counts = {
    answered: questions.filter((q) => q.palette_state === 'ANSWERED').length,
    notAnswered: questions.filter((q) => q.palette_state === 'NOT_ANSWERED').length,
    notVisited: questions.filter((q) => q.palette_state === 'NOT_VISITED').length,
    review: questions.filter((q) => q.palette_state === 'MARKED_REVIEW').length,
    reviewMarked: questions.filter((q) => q.palette_state === 'ANSWERED_AND_MARKED').length,
  };

  const getButtonClass = (state: PaletteState, isCurrent: boolean) => {
    let base = 'w-8 h-8 text-xs font-semibold flex items-center justify-center transition-all cursor-pointer select-none ';
    if (isCurrent) {
      base += 'ring-2 ring-blue-600 ring-offset-1 font-bold ';
    }

    switch (state) {
      case 'ANSWERED':
        return base + 'cat-btn-answered';
      case 'NOT_ANSWERED':
        return base + 'cat-btn-notanswered';
      case 'MARKED_REVIEW':
        return base + 'cat-btn-review';
      case 'ANSWERED_AND_MARKED':
        return base + 'cat-btn-reviewmarked';
      case 'NOT_VISITED':
      default:
        return base + 'cat-btn-unvisited';
    }
  };

  const isFinalSection = activeSectionCode === 'QA';
  const buttonLabel = isFinalSection
    ? 'Submit CAT Examination'
    : activeSectionCode === 'VARC'
    ? 'Save & Proceed to DILR'
    : 'Save & Proceed to QA';

  const handleAction = isFinalSection ? onSubmitExam : (onSubmitSection || onSubmitExam);

  return (
    <aside className="w-72 sm:w-80 bg-[#edf2f6] border-l border-stone-300 flex flex-col h-full select-none text-stone-800 font-sans">
      {/* Candidate Profile Box (TCS iON Standard) */}
      <div className="p-3 bg-white border-b border-stone-300 flex items-center space-x-3">
        <div className="w-11 h-11 border border-stone-300 bg-stone-100 flex items-center justify-center font-bold text-stone-700 text-base">
          {candidateName.charAt(0)}
        </div>
        <div>
          <div className="text-[10px] text-stone-400 uppercase font-semibold">Candidate</div>
          <div className="text-xs font-bold text-[#1b3b55] leading-tight">{candidateName}</div>
          <div className="text-[10px] text-stone-500 font-mono">Roll No: 26CAT9041</div>
        </div>
      </div>

      {/* Official 5-State Legend Counters */}
      <div className="p-3 bg-white border-b border-stone-200 text-[11px] space-y-1.5">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-1.5">
            <span className="w-5 h-5 cat-btn-answered flex items-center justify-center text-[10px] font-bold">
              {counts.answered}
            </span>
            <span className="text-stone-700">Answered</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-5 h-5 cat-btn-notanswered flex items-center justify-center text-[10px] font-bold">
              {counts.notAnswered}
            </span>
            <span className="text-stone-700">Not Answered</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-5 h-5 cat-btn-unvisited flex items-center justify-center text-[10px] font-bold">
              {counts.notVisited}
            </span>
            <span className="text-stone-700">Not Visited</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-5 h-5 cat-btn-review flex items-center justify-center text-[10px] font-bold">
              {counts.review}
            </span>
            <span className="text-stone-700">Marked for Review</span>
          </div>
        </div>
        <div className="flex items-start space-x-2 pt-1 border-t border-stone-100">
          <span className="w-5 h-5 cat-btn-reviewmarked flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
            {counts.reviewMarked}
          </span>
          <span className="text-stone-600 text-[10px] leading-tight">
            Answered & Marked for Review (will be evaluated)
          </span>
        </div>
      </div>

      {/* Section Title Banner */}
      <div className="bg-[#385870] text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between">
        <span>Question Palette</span>
        <span className="text-[10px] font-mono opacity-80">{questions.length} Items</span>
      </div>

      {/* 66-Question Palette Grid (TCS iON 4-column layout) */}
      <div className="flex-1 p-3 overflow-y-auto bg-[#f8fafc]">
        <div className="grid grid-cols-4 gap-2">
          {questions.map((q, idx) => (
            <button
              key={q.question_id}
              onClick={() => onSelectQuestion(idx)}
              className={getButtonClass(q.palette_state, idx === currentQuestionIndex)}
            >
              {q.sequence_number}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Submit Button */}
      <div className="p-3 bg-[#e6ebef] border-t border-stone-300">
        <button
          onClick={handleAction}
          className={`w-full py-2.5 text-white text-xs font-bold uppercase tracking-wider rounded shadow-xs transition-colors cursor-pointer ${
            isFinalSection ? 'bg-[#22c55e] hover:bg-[#16a34a]' : 'bg-[#1b74e4] hover:bg-[#155fc0]'
          }`}
        >
          {buttonLabel}
        </button>
      </div>
    </aside>
  );
};
