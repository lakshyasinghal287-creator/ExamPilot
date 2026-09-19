import React from 'react';
import { ClientQuestion } from '../../types/exam';

interface CatQuestionPaneProps {
  question: ClientQuestion | undefined;
  selectedOptionId: string | null;
  titaText: string;
  onSelectOption: (optionId: string) => void;
  onChangeTita: (text: string) => void;
  onSaveAndNext: () => void;
  onClearResponse: () => void;
  onMarkForReviewAndNext: () => void;
}

export const CatQuestionPane: React.FC<CatQuestionPaneProps> = ({
  question,
  selectedOptionId,
  titaText,
  onSelectOption,
  onChangeTita,
  onSaveAndNext,
  onClearResponse,
  onMarkForReviewAndNext,
}) => {
  if (!question) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-white">
        Select a question from the palette.
      </div>
    );
  }

  const isMcq = question.question_type === 'MCQ';
  const correctMarks = 3.0;
  const negativeMarks = isMcq ? 1.0 : 0.0;

  return (
    <main className="flex-1 flex flex-col h-full bg-white select-none">
      {/* Question Header: Number & Marks */}
      <div className="px-6 py-2.5 border-b border-gray-200 bg-slate-50/70 flex items-center justify-between text-xs">
        <div className="font-bold text-gray-800 text-sm">
          Question No. {question.sequence_number}
        </div>
        <div className="flex items-center space-x-3 text-gray-600">
          <span>
            Marks for correct answer: <strong className="text-emerald-600">+{correctMarks}</strong>
          </span>
          <span className="text-gray-300">|</span>
          <span>
            Negative marks: <strong className="text-rose-600">-{negativeMarks}</strong>
          </span>
        </div>
      </div>

      {/* Main Question Body & Options */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Question Statement */}
        <div className="text-sm md:text-base text-gray-900 leading-relaxed font-normal mb-8 pb-4 border-b border-gray-100">
          {question.question_text}
        </div>

        {/* Options (MCQ) or Text Box (TITA) */}
        {isMcq ? (
          <div className="space-y-3 max-w-2xl">
            {question.options.map((opt) => {
              const isSelected = selectedOptionId === opt.option_id;
              return (
                <label
                  key={opt.option_id}
                  onClick={() => onSelectOption(opt.option_id)}
                  className={`flex items-start p-3.5 rounded border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${question.question_id}`}
                    checked={isSelected}
                    onChange={() => onSelectOption(opt.option_id)}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300 cursor-pointer"
                  />
                  <div className="ml-3 flex items-start space-x-2 text-sm text-gray-800">
                    <span className="font-bold text-gray-500">({opt.key})</span>
                    <span>{opt.text}</span>
                  </div>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="max-w-md p-4 bg-amber-50/50 border border-amber-200 rounded">
            <div className="text-xs font-semibold text-amber-800 mb-2 uppercase tracking-wide">
              Type In The Answer (TITA) - Non-MCQ
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Enter your answer using the keyboard below. Negative marking does not apply.
            </p>
            <input
              type="text"
              value={titaText}
              onChange={(e) => onChangeTita(e.target.value)}
              placeholder="Enter numerical/text answer"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-base font-semibold"
            />
          </div>
        )}
      </div>

      {/* Official CAT Bottom Action Toolbar */}
      <div className="px-6 py-3 border-t border-gray-200 bg-slate-50 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <button
            onClick={onMarkForReviewAndNext}
            className="px-4 py-1.5 border border-purple-500 text-purple-700 hover:bg-purple-50 text-xs font-semibold rounded shadow-xs transition-colors"
          >
            Mark for Review & Next
          </button>
          <button
            onClick={onClearResponse}
            className="px-4 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-100 text-xs font-semibold rounded shadow-xs transition-colors"
          >
            Clear Response
          </button>
        </div>

        <div>
          <button
            onClick={onSaveAndNext}
            className="px-6 py-2 bg-[#1b74e4] hover:bg-blue-700 text-white text-xs font-bold rounded shadow transition-colors flex items-center space-x-1"
          >
            <span>Save & Next</span>
          </button>
        </div>
      </div>
    </main>
  );
};
