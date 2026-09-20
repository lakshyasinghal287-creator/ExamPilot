import { Calculator, FileText, Clock } from 'lucide-react';

interface CatHeaderProps {
  examName: string;
  candidateName: string;
  activeSectionCode: string;
  timeRemainingSeconds: number;
  completedSections?: string[];
  onOpenCalculator: () => void;
  onOpenQuestionPaper: () => void;
  onSelectSection?: (sectionCode: string) => void;
}

export const CatHeader: React.FC<CatHeaderProps> = ({
  examName,
  candidateName,
  activeSectionCode,
  timeRemainingSeconds,
  completedSections = [],
  onOpenCalculator,
  onOpenQuestionPaper,
  onSelectSection,
}) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sections = [
    { code: 'VARC', name: 'VARC' },
    { code: 'DILR', name: 'DILR' },
    { code: 'QA', name: 'QA' },
  ];

  return (
    <header className="bg-[#385870] text-white select-none border-b border-[#2d465a] font-sans">
      {/* Top Banner (TCS iON CAT Standard) */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-[#4d6d87]/60">
        <div className="flex items-center space-x-3">
          <div className="px-2 py-0.5 bg-[#253e52] border border-[#4d6d87] text-white font-bold text-xs tracking-wider rounded-xs">
            CAT 2026
          </div>
          <div className="text-xs font-semibold text-white tracking-wide">
            {examName}
          </div>
        </div>

        {/* Right Assessment Tools & Candidate Profile */}
        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={onOpenCalculator}
            className="flex items-center space-x-1 px-2.5 py-1 bg-[#476a85] hover:bg-[#527794] text-white text-xs rounded border border-[#60849f] transition-colors cursor-pointer"
            title="Open On-Screen Scientific Calculator"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-200" />
            <span>Calculator</span>
          </button>

          <button
            onClick={onOpenQuestionPaper}
            className="flex items-center space-x-1 px-2.5 py-1 bg-[#476a85] hover:bg-[#527794] text-white text-xs rounded border border-[#60849f] transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-300" />
            <span>Question Paper</span>
          </button>

          <div className="h-5 w-px bg-[#4d6d87]" />

          {/* Candidate Profile Info */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-sm bg-[#253e52] border border-[#60849f] flex items-center justify-center text-xs font-bold text-white">
              {candidateName.charAt(0)}
            </div>
            <div className="text-right text-[11px] leading-tight">
              <div className="font-semibold text-white">{candidateName}</div>
              <div className="text-[#b5c7d5] font-mono text-[10px]">Roll: 26CAT9041</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Switcher & Remaining Section Timer Bar */}
      <div className="px-4 py-1.5 bg-[#2b4458] flex items-center justify-between text-xs">
        {/* Sections Tabs (Locked CAT CBT Sequential Rule) */}
        <div className="flex items-center space-x-1.5">
          <span className="text-stone-300 text-xs font-semibold mr-1">Sections:</span>
          {sections.map((sec) => {
            const isActive = sec.code === activeSectionCode;
            const isCompleted = completedSections.includes(sec.code);
            const isLocked = !isActive && !isCompleted;

            return (
              <button
                key={sec.code}
                disabled={!isActive}
                onClick={() => {
                  if (isActive) return;
                  if (onSelectSection) {
                    onSelectSection(sec.code);
                  }
                }}
                className={`px-3 py-1 text-xs font-bold transition-all rounded-t-xs flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-[#fcfcfc] text-[#2b4458] shadow-sm border-t-2 border-blue-500 cursor-default'
                    : isCompleted
                    ? 'bg-[#1e2f3d] text-emerald-400 opacity-90 border-t border-emerald-500/40 cursor-not-allowed'
                    : 'bg-[#182733] text-stone-400 opacity-75 cursor-not-allowed border-t border-transparent'
                }`}
                title={
                  isActive
                    ? `Current Active Section: ${sec.name}`
                    : isCompleted
                    ? `Section ${sec.name} submitted & locked`
                    : `Section ${sec.name} locked (Must finish previous section first)`
                }
              >
                <span>{sec.name}</span>
                {isActive && (
                  <span className="text-[10px] text-blue-600 font-semibold">• Active</span>
                )}
                {isCompleted && (
                  <span className="text-[10px] text-emerald-400 font-semibold">✓ Done</span>
                )}
                {isLocked && (
                  <span className="text-[10px] text-stone-500 font-mono">🔒 Locked</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Authoritative Section Countdown Timer */}
        <div className="flex items-center space-x-2 bg-[#1b2b38] px-3 py-1 rounded border border-[#3b556b]">
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-stone-300 text-[11px]">Time Left:</span>
          <span className="font-mono text-sm font-bold text-amber-300 tracking-wider">
            {formatTime(timeRemainingSeconds)}
          </span>
        </div>
      </div>
    </header>
  );
};
