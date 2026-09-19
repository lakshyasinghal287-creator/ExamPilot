import { GraduationCap } from 'lucide-react';

interface EdTechNavbarProps {
  activeView: 'dashboard' | 'exam' | 'scorecard';
  serverHealthy: boolean;
  onNavigate: (view: 'dashboard' | 'exam' | 'scorecard') => void;
}

export const EdTechNavbar: React.FC<EdTechNavbarProps> = ({
  activeView,
  serverHealthy,
  onNavigate,
}) => {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
                ExamPilot
              </div>
              <div className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase -mt-0.5">
                CAT Diagnostic Engine
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Dashboard
            </button>
          </div>

          {/* Status & Candidate */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-700 border border-slate-200">
              <span className={`w-2 h-2 rounded-full ${serverHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{serverHealthy ? 'FastAPI Online' : 'Connecting...'}</span>
            </div>

            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                AS
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-semibold text-slate-800">Aarav Sharma</div>
                <div className="text-slate-400 text-[10px]">CAT Aspirant</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
