import React from 'react';
import { Sun, Moon, CheckCircle2, User } from 'lucide-react';

interface EdTechNavbarProps {
  activeView: 'dashboard' | 'exam' | 'scorecard';
  serverHealthy: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNavigate: (view: 'dashboard' | 'exam' | 'scorecard') => void;
}

export const EdTechNavbar: React.FC<EdTechNavbarProps> = ({
  activeView,
  serverHealthy,
  theme,
  onToggleTheme,
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95 backdrop-blur-sm transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            EP
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-base tracking-tight">
              ExamPilot
            </span>
            <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              CAT 2026
            </span>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className={`w-2 h-2 rounded-full ${serverHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>{serverHealthy ? 'Engine Connected' : 'Engine Offline'}</span>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-2 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300 flex items-center justify-center font-medium text-xs">
              AS
            </div>
            <span className="hidden md:inline text-xs font-medium text-slate-700 dark:text-slate-300">
              Aarav Sharma
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
