import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CatCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CatCalculator: React.FC<CatCalculatorProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');

  if (!isOpen) return null;

  const handleBtn = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
    } else if (val === '=') {
      try {
        // Safe basic arithmetic eval
        const sanitized = display.replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        setDisplay(String(res));
      } catch {
        setDisplay('Error');
      }
    } else {
      setDisplay((prev) => (prev === '0' || prev === 'Error' ? val : prev + val));
    }
  };

  const buttons = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+'],
    ['C']
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 select-none">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-72 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 text-white px-3 py-2 flex items-center justify-between text-xs font-semibold">
          <span>CAT Scientific Calculator</span>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display */}
        <div className="p-3 bg-gray-100 border-b border-gray-200">
          <div className="bg-white px-3 py-2 rounded border border-gray-300 text-right font-mono text-xl font-bold text-gray-800 tracking-wider overflow-x-auto">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-3 bg-gray-50 space-y-2">
          {buttons.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-4 gap-2">
              {row.map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleBtn(btn)}
                  className={`py-2 text-sm font-semibold rounded shadow-xs border transition-colors ${
                    btn === '='
                      ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 col-span-1'
                      : btn === 'C'
                      ? 'bg-rose-500 text-white border-rose-600 hover:bg-rose-600 col-span-4'
                      : ['+', '-', '*', '/'].includes(btn)
                      ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
