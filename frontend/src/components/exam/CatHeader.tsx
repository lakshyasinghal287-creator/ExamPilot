import { Calculator, FileText, Clock } from 'lucide-react';

interface CatHeaderProps {
  examName: string;
  candidateName: string;
  activeSectionCode: string;
  timeRemainingSeconds: number;
  onOpenCalculator: () => void;
  onOpenQuestionPaper: () => void;
}

export const CatHeader: React.FC<CatHeaderProps> = ({
  examName,
  candidateName,
  activeSectionCode,
  timeRemainingSeconds,
  onOpenCalculator,
  onOpenQuestionPaper,
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
    <header className="bg-[#2b3940] text-white border-b border-gray-700 select-none">
      {/* Top Banner */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-600/50">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center font-bold text-sm tracking-wider">
            CAT
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-gray-100">{examName}</h1>
            <p className="text-xs text-gray-400">Computer Based Test (CBT) Simulation</p>
          </div>
        </div>

        {/* Right Tools & Candidate info */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenCalculator}
            className="flex items-center space-x-1 px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-xs rounded border border-gray-500 transition-colors shadow-sm"
            title="Open Scientific Calculator"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-400" />
            <span>Calculator</span>
          </button>

          <button
            onClick={onOpenQuestionPaper}
            className="flex items-center space-x-1 px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-xs rounded border border-gray-500 transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Question Paper</span>
          </button>

          <div className="h-6 w-px bg-gray-600" />

          {/* Candidate Profile */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-slate-400 flex items-center justify-center text-slate-800 text-xs font-bold">
              {candidateName.charAt(0)}
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-gray-200">{candidateName}</div>
              <div className="text-[10px] text-gray-400 font-mono">Roll: CAT26-9041</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Switcher & Remaining Timer Strip */}
      <div className="px-4 py-1.5 bg-[#1f292e] flex items-center justify-between text-xs">
        {/* Sections Tabs */}
        <div className="flex items-center space-x-1">
          <span className="text-gray-400 font-medium mr-2">Sections:</span>
          {sections.map((sec) => {
            const isActive = sec.code === activeSectionCode;
            return (
              <div
                key={sec.code}
                className={`px-3 py-1 rounded font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-inner'
                    : 'bg-gray-800 text-gray-400 opacity-60 cursor-not-allowed'
                }`}
              >
                {sec.name} {isActive && <span className="text-[10px] ml-1 opacity-90">(Active)</span>}
              </div>
            );
          })}
        </div>

        {/* Section Countdown Timer */}
        <div className="flex items-center space-x-2 bg-black/40 px-3 py-1 rounded border border-gray-700">
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-gray-300">Time Left:</span>
          <span className="font-mono text-sm font-bold text-amber-400 tracking-wider">
            {formatTime(timeRemainingSeconds)}
          </span>
        </div>
      </div>
    </header>
  );
};
