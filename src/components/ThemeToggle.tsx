import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../themeContext';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = false,
  className = '',
  size = 'md',
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-8 px-2.5 text-xs gap-1.5',
    md: 'h-9 px-3 text-xs gap-2',
    lg: 'h-10 px-4 text-sm gap-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  };

  return (
    <button
      id="theme-mode-toggle"
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 select-none ${
        isDark
          ? 'bg-slate-900/90 hover:bg-slate-800 text-blue-300 border border-blue-900/60 shadow-xs shadow-blue-950/40'
          : 'bg-white/90 hover:bg-slate-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 shadow-xs shadow-slate-200/50'
      } ${sizeClasses[size]} ${className}`}
      title={isDark ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي (الأزرق الملكي)'}
      aria-label={isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Moon className={`${iconSizes[size]} text-blue-400 animate-in fade-in zoom-in-75 duration-200`} />
        ) : (
          <Sun className={`${iconSizes[size]} text-amber-500 animate-in fade-in zoom-in-75 duration-200`} />
        )}
      </div>

      {showLabel && (
        <span className="font-semibold whitespace-nowrap">
          {isDark ? 'الوضع الليلي' : 'الوضع النهاري'}
        </span>
      )}

      {/* Royal blue indicator pip */}
      <span
        className={`w-1.5 h-1.5 rounded-full transition-colors ${
          isDark ? 'bg-blue-400 shadow-xs shadow-blue-400' : 'bg-amber-400'
        }`}
      />
    </button>
  );
};
