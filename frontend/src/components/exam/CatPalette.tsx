import React from 'react';
import { ClientQuestion, PaletteState } from '../../types/exam';

interface CatPaletteProps {
  questions: ClientQuestion[];
  currentQuestionIndex: number;
  candidateName: string;
  onSelectQuestion: (index: number) => void;
  onSubmitExam: () => void;
}

export const CatPalette: React.FC<CatPaletteProps> = ({
  questions,
  currentQuestionIndex,
  candidateName,
  onSelectQuestion,
  onSubmitExam,
}) => {
  // Compute counts for each status
  const counts = {
    answered: questions.filter((q) => q.palette_state === 'ANSWERED').length,
    notAnswered: questions.filter((q) => q.palette_state === 'NOT_ANSWERED').length,
    notVisited: questions.filter((q) => q.palette_state === 'NOT_VISITED').length,
    review: questions.filter((q) => q.palette_state === 'MARKED_REVIEW').length,
    reviewMarked: questions.filter((q) => q.palette_state === 'ANSWERED_AND_MARKED').length,
  };

  const getButtonClass = (state: PaletteState, isCurrent: boolean) => {
    let base = 'w-9 h-8 text-xs font-semibold flex items-center justify-center transition-all shadow-sm ';
    if (isCurrent) {
      base += 'ring-2 ring-blue-500 ring-offset-1 font-bold ';
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

  return (
    <aside className="w-80 bg-[#eef2f5] border-l border-gray-300 flex flex-col h-full select-none text-gray-800">
      {/* Candidate Profile Box */}
      <div className="p-3 bg-white border-b border-gray-300 flex items-center space-x-3 shadow-xs">
        <div className="w-12 h-12 rounded border border-gray-300 bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-lg shadow-inner">
          {candidateName.charAt(0)}
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium">Candidate Name:</div>
          <div className="text-sm font-bold text-blue-900">{candidateName}</div>
          <div className="text-[11px] text-gray-500">Subject: General Aptitude</div>
        </div>
      </div>

      {/* Official 5-State Legend Counters */}
      <div className="p-3 bg-white border-b border-gray-200 text-[11px] space-y-1.5">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 cat-btn-answered flex items-center justify-center text-[10px] font-bold">
              {counts.answered}
            </span>
            <span className="text-gray-700">Answered</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 cat-btn-notanswered flex items-center justify-center text-[10px] font-bold">
              {counts.notAnswered}
            </span>
            <span className="text-gray-700">Not Answered</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 cat-btn-unvisited flex items-center justify-center text-[10px] font-bold">
              {counts.notVisited}
            </span>
            <span className="text-gray-700">Not Visited</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 cat-btn-review flex items-center justify-center text-[10px] font-bold">
              {counts.review}
            </span>
            <span className="text-gray-700">Marked for Review</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 pt-1">
          <span className="w-5 h-5 cat-btn-reviewmarked flex items-center justify-center text-[10px] font-bold">
            {counts.reviewMarked}
          </span>
          <span className="text-gray-700 text-[10px] leading-tight">
            Answered & Marked for Review (will be evaluated)
          </span>
        </div>
      </div>

      {/* Palette Title Banner */}
      <div className="bg-[#1b74e4] text-white px-3 py-1 text-xs font-semibold flex items-center justify-between">
        <span>Question Palette</span>
        <span className="text-[10px] font-normal opacity-90">Total: {questions.length}</span>
      </div>

      {/* 66-Question Palette Grid */}
      <div className="flex-1 p-3 overflow-y-auto bg-slate-50">
        <div className="grid grid-cols-4 gap-2.5">
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

      {/* Bottom Final Submit Button */}
      <div className="p-3 bg-white border-t border-gray-300">
        <button
          onClick={onSubmitExam}
          className="w-full py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-bold rounded shadow transition-colors flex items-center justify-center space-x-1"
        >
          <span>Submit Exam</span>
        </button>
      </div>
    </aside>
  );
};
