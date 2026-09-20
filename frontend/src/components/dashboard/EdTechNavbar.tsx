import React from 'react';
import { BookOpen, User, CheckCircle, Server, BarChart2 } from 'lucide-react';

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
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Institution / Brand Identity */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-3 cursor-pointer select-none"
          >
            <div className="h-9 w-9 rounded border border-stone-800 bg-stone-900 text-white flex items-center justify-center font-serif font-bold text-base shadow-xs">
              EP
            </div>
            <div>
              <div className="text-base font-bold text-stone-900 tracking-tight flex items-center space-x-1.5">
                <span>ExamPilot</span>
                <span className="text-[11px] font-mono px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded border border-stone-200">
                  CAT 2026
                </span>
              </div>
              <div className="text-[11px] text-stone-500 font-medium">
                National Aptitude Assessment Platform
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-stone-100 text-stone-900 border border-stone-300'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Candidate Portal
            </button>
          </div>

          {/* System & Candidate Status */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-stone-500">
              <span className={`w-2 h-2 rounded-full ${serverHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="font-mono">{serverHealthy ? 'Engine Connected' : 'Engine Offline'}</span>
            </div>

            <div className="flex items-center space-x-2 pl-3 border-l border-stone-200">
              <div className="w-7 h-7 rounded-full bg-stone-100 border border-stone-300 text-stone-700 flex items-center justify-center font-serif text-xs font-bold">
                A
              </div>
              <div className="text-left text-xs">
                <div className="font-semibold text-stone-800 leading-tight">Aarav Sharma</div>
                <div className="text-[10px] text-stone-400 font-mono">Reg: 26CAT9041</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
