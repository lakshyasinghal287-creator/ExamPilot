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
      <div className="flex-1 flex items-center justify-center text-stone-400 bg-white font-sans text-sm">
        Select a question from the palette.
      </div>
    );
  }

  const isMcq = question.question_type === 'MCQ';
  const correctMarks = 3.0;
  const negativeMarks = isMcq ? 1.0 : 0.0;

  // Split-screen logic for authentic CAT reading comprehension or DILR caselets
  // If the text contains a distinct passage and question prompt, split into left/right panes
  const hasPassageSplit = question.question_text.includes('\n\nQuestion:') || 
                          question.question_text.includes('\n\nQ:') ||
                          (question.question_text.length > 300 && question.question_text.includes('\n\n'));

  let passageText = '';
  let questionPrompt = question.question_text;

  if (hasPassageSplit) {
    const splitIndex = question.question_text.indexOf('\n\nQuestion:') !== -1 
      ? question.question_text.indexOf('\n\nQuestion:') 
      : question.question_text.lastIndexOf('\n\n');

    if (splitIndex !== -1) {
      passageText = question.question_text.substring(0, splitIndex).replace(/^Passage:\s*/i, '').trim();
      questionPrompt = question.question_text.substring(splitIndex).replace(/^\n\n(Question:)?\s*/i, '').trim();
    }
  }

  return (
    <main className="flex-1 flex flex-col h-full bg-[#fcfcfc] select-none text-stone-900 border-r border-stone-300 overflow-hidden font-sans">
      {/* Official CAT Question Bar */}
      <div className="px-4 py-2 border-b border-stone-300 bg-[#f0f4f7] flex items-center justify-between text-xs">
        <div className="font-bold text-stone-800 text-sm tracking-tight">
          Question No. {question.sequence_number}
        </div>
        <div className="flex items-center space-x-3 text-stone-600 font-mono text-[11px]">
          <span>
            Marks for correct answer: <strong className="text-emerald-700 font-bold">+{correctMarks.toFixed(1)}</strong>
          </span>
          <span className="text-stone-300">|</span>
          <span>
            Negative marks: <strong className="text-rose-700 font-bold">-{negativeMarks.toFixed(1)}</strong>
          </span>
        </div>
      </div>

      {/* Question Content Area (Split-Screen when passage is present, just like real CAT) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
        {/* Left Half: Scrollable Passage / Caselet (Authentic CAT VARC / DILR experience) */}
        {passageText ? (
          <div className="md:w-1/2 p-5 border-r border-stone-200 overflow-y-auto bg-[#fafafa] text-xs sm:text-sm leading-relaxed text-stone-800 font-serif">
            <div className="mb-2 text-[11px] font-sans font-bold uppercase tracking-wider text-stone-500 pb-1 border-b border-stone-200">
              Passage / Context
            </div>
            <div className="whitespace-pre-line leading-6">
              {passageText}
            </div>
          </div>
        ) : null}

        {/* Right Half (or Full): Question Prompt and Options */}
        <div className={`${passageText ? 'md:w-1/2' : 'w-full'} p-5 sm:p-6 overflow-y-auto flex flex-col justify-between`}>
          <div>
            {/* Question Text */}
            <div className="text-sm sm:text-base font-medium text-stone-900 leading-relaxed pb-5 border-b border-stone-100">
              {questionPrompt}
            </div>

            {/* Answer Options */}
            <div className="mt-5">
              {isMcq ? (
                <div className="space-y-3">
                  {question.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.option_id;
                    return (
                      <label
                        key={opt.option_id}
                        onClick={() => onSelectOption(opt.option_id)}
                        className={`flex items-start p-3 rounded border transition-colors cursor-pointer text-xs sm:text-sm ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-medium'
                            : 'border-stone-200 hover:bg-stone-50 text-stone-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${question.question_id}`}
                          checked={isSelected}
                          onChange={() => onSelectOption(opt.option_id)}
                          className="mt-0.5 text-blue-600 h-4 w-4 border-stone-300 cursor-pointer focus:ring-0"
                        />
                        <div className="ml-3 flex items-start space-x-2">
                          <span className="font-bold text-stone-600">({opt.key})</span>
                          <span>{opt.text}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 border border-amber-300 bg-amber-50/60 rounded">
                  <div className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">
                    Type In The Answer (TITA)
                  </div>
                  <div className="text-xs text-stone-600 mb-3">
                    Enter the numerical or text answer. Negative marking is 0.0 for this question.
                  </div>
                  <input
                    type="text"
                    value={titaText}
                    onChange={(e) => onChangeTita(e.target.value)}
                    placeholder="Enter answer here..."
                    className="w-full sm:w-64 px-3 py-2 bg-white border border-stone-300 rounded font-mono text-base font-bold text-stone-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Official CAT Bottom Action Toolbar */}
      <div className="px-5 py-2.5 border-t border-stone-300 bg-[#e6ebef] flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <button
            onClick={onMarkForReviewAndNext}
            className="px-3.5 py-1.5 bg-white hover:bg-stone-100 border border-stone-400 text-stone-800 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
          >
            Mark for Review & Next
          </button>
          <button
            onClick={onClearResponse}
            className="px-3.5 py-1.5 bg-white hover:bg-stone-100 border border-stone-400 text-stone-800 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
          >
            Clear Response
          </button>
        </div>

        <div>
          <button
            onClick={onSaveAndNext}
            className="px-5 py-1.5 bg-[#1b74e4] hover:bg-[#155fc0] text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span>Save & Next</span>
          </button>
        </div>
      </div>
    </main>
  );
};
