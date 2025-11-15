/**
 * 🌟 SmartFlow Systems - Premium Component Library
 *
 * Beautiful glassmorphism components with gold accents
 * Part of the SFS Family Theme - Gold on Dark Marble
 *
 * Design System:
 * - Primary: Sparkling Gold (#FFD700)
 * - Background: Dark Marble Black (#0D0D0D)
 * - Accent: Brown Tint (#1A1A1A)
 * - Text: Beige/White for contrast
 */

import { ReactNode, useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

// ============================================================================
// Glass Card Components
// ============================================================================

interface SFSCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'premium' | 'dark';
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function SFSCard({
  children,
  className,
  variant = 'default',
  hover = false,
  glow = false,
  onClick
}: SFSCardProps) {
  const baseStyles = "rounded-2xl border backdrop-blur-2xl transition-all duration-500 ease-out p-6";

  const variantStyles = {
    default: "bg-gradient-to-br from-black/40 via-black/30 to-black/40 border-[#FFD700]/20",
    elevated: "bg-gradient-to-br from-black/60 via-[#1A1A1A]/50 to-black/60 border-[#FFD700]/30 shadow-xl shadow-[#FFD700]/5",
    premium: "bg-gradient-to-br from-black/70 via-[#1A1A1A]/60 to-black/70 border-[#FFD700]/50 shadow-2xl shadow-[#FFD700]/10 relative overflow-hidden",
    dark: "bg-black/80 border-white/10"
  };

  const hoverStyles = hover
    ? "hover:border-[#FFD700]/70 hover:shadow-2xl hover:shadow-[#FFD700]/30 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer"
    : "";

  const glowStyles = glow
    ? "animate-glow-pulse"
    : "";

  return (
    <div
      className={clsx(
        baseStyles,
        variantStyles[variant],
        hoverStyles,
        glowStyles,
        className
      )}
      onClick={onClick}
    >
      {variant === 'premium' && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-[#FFA500]/5 pointer-events-none" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Button Components
// ============================================================================

interface SFSButtonProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function SFSButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button'
}: SFSButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

  const variantStyles = {
    primary: "bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] bg-[length:200%_100%] text-black hover:shadow-xl hover:shadow-[#FFD700]/60 hover:scale-105 hover:bg-[position:100%_0] border border-[#FFD700]/50",
    secondary: "bg-gradient-to-br from-black/80 to-[#1A1A1A]/80 text-[#FFD700] border-2 border-[#FFD700]/40 hover:bg-[#FFD700]/10 hover:border-[#FFD700]/70 hover:shadow-lg hover:shadow-[#FFD700]/30",
    outline: "bg-transparent text-[#FFD700] border-2 border-[#FFD700]/50 hover:bg-[#FFD700]/10 hover:border-[#FFD700]/80 hover:shadow-lg hover:shadow-[#FFD700]/20",
    ghost: "bg-transparent text-[#FFD700] hover:bg-[#FFD700]/10 hover:shadow-lg",
    danger: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-xl hover:shadow-red-500/50 hover:scale-105 border border-red-500/50"
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-5 py-2.5 text-base gap-2",
    lg: "px-7 py-3.5 text-lg gap-2.5",
    xl: "px-10 py-4 text-xl gap-3"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthStyle,
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <LoadingSpinner size={size === 'sm' ? 'sm' : 'md'} />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
}

// ============================================================================
// Badge Components
// ============================================================================

interface SFSBadgeProps {
  children: ReactNode;
  variant?: 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'premium';
  glow?: boolean;
  pulse?: boolean;
  className?: string;
  icon?: ReactNode;
}

export function SFSBadge({ children, variant = 'gold', glow = false, pulse = false, className, icon }: SFSBadgeProps) {
  const baseStyles = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md transition-all duration-300 border";

  const variantStyles = {
    gold: "bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/50 shadow-lg shadow-[#FFD700]/20",
    success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/20",
    warning: "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/20",
    danger: "bg-red-500/20 text-red-300 border-red-500/50 shadow-lg shadow-red-500/20",
    info: "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-lg shadow-cyan-500/20",
    premium: "bg-gradient-to-r from-[#FFD700]/30 to-[#FFA500]/30 text-[#FFD700] border-[#FFD700]/70 shadow-xl shadow-[#FFD700]/40"
  };

  const glowStyles = glow ? "shadow-2xl" : "";
  const pulseStyles = pulse ? "animate-pulse" : "";

  return (
    <span className={clsx(baseStyles, variantStyles[variant], glowStyles, pulseStyles, className)}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

// ============================================================================
// Score Display Components
// ============================================================================

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  animated?: boolean;
}

export function ScoreCircle({ score, size = 'md', showLabel = true, animated = true }: ScoreCircleProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (animated) {
      const duration = 1500;
      const steps = 60;
      const increment = score / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= score) {
          setDisplayScore(score);
          clearInterval(timer);
        } else {
          setDisplayScore(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayScore(score);
    }
  }, [score, animated]);

  const getColor = (score: number) => {
    if (score >= 90) return { from: '#10b981', to: '#059669', glow: '#10b981' };
    if (score >= 75) return { from: '#3b82f6', to: '#2563eb', glow: '#3b82f6' };
    if (score >= 60) return { from: '#f59e0b', to: '#d97706', glow: '#f59e0b' };
    return { from: '#ef4444', to: '#dc2626', glow: '#ef4444' };
  };

  const getLabel = (score: number) => {
    if (score >= 90) return '🔥 Viral';
    if (score >= 75) return '✨ Excellent';
    if (score >= 60) return '👍 Good';
    return '⚠️ Needs Work';
  };

  const colors = getColor(score);
  const sizeClasses = {
    sm: 'w-16 h-16 text-sm',
    md: 'w-24 h-24 text-xl',
    lg: 'w-32 h-32 text-2xl',
    xl: 'w-40 h-40 text-3xl'
  };

  const strokeWidth = {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 10
  };

  const radius = {
    sm: 28,
    md: 42,
    lg: 56,
    xl: 70
  };

  const circumference = 2 * Math.PI * radius[size];
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Background circle */}
        <svg className={clsx(sizeClasses[size], "transform -rotate-90")}>
          <circle
            cx="50%"
            cy="50%"
            r={radius[size]}
            stroke="rgba(255, 215, 0, 0.1)"
            strokeWidth={strokeWidth[size]}
            fill="none"
          />
          {/* Progress circle with gradient */}
          <circle
            cx="50%"
            cy="50%"
            r={radius[size]}
            stroke={`url(#gradient-${score})`}
            strokeWidth={strokeWidth[size]}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${colors.glow})`
            }}
          />
          <defs>
            <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
          </defs>
        </svg>

        {/* Score number */}
        <div className={clsx(
          "absolute inset-0 flex items-center justify-center font-black",
          sizeClasses[size]
        )}>
          <span className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
            {displayScore}
          </span>
        </div>
      </div>

      {showLabel && (
        <span className="text-sm font-bold text-[#F5F5DC]/90">{getLabel(score)}</span>
      )}
    </div>
  );
}

// ============================================================================
// Progress Bar
// ============================================================================

interface SFSProgressBarProps {
  value: number;
  max?: number;
  variant?: 'default' | 'gradient' | 'striped' | 'animated';
  showLabel?: boolean;
  showPercentage?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SFSProgressBar({
  value,
  max = 100,
  variant = 'gradient',
  showLabel = true,
  showPercentage = true,
  label,
  size = 'md',
  className
}: SFSProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const barStyles = {
    default: "bg-gradient-to-r from-[#FFD700] to-[#FFA500]",
    gradient: "bg-gradient-to-r from-[#FFD700] via-[#FFED4E] to-[#FFA500]",
    striped: "bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-stripe",
    animated: "bg-gradient-to-r from-[#FFD700] via-[#FFED4E] to-[#FFA500] bg-[length:200%_100%] animate-shimmer"
  };

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className={clsx("w-full", className)}>
      {(showLabel || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {showLabel && label && (
            <span className="text-sm font-semibold text-[#F5F5DC]/90">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-bold text-[#FFD700]">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={clsx(
        "w-full bg-black/60 rounded-full overflow-hidden border border-[#FFD700]/20 shadow-inner",
        heightStyles[size]
      )}>
        <div
          className={clsx(
            "h-full transition-all duration-700 ease-out shadow-lg shadow-[#FFD700]/50",
            barStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Alert/Toast Components
// ============================================================================

interface SFSAlertProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
  className?: string;
}

export function SFSAlert({ children, variant = 'info', title, onClose, className }: SFSAlertProps) {
  const baseStyles = "rounded-xl p-4 backdrop-blur-xl border-2 shadow-xl relative";

  const variantStyles = {
    info: "bg-cyan-500/10 border-cyan-500/50 text-cyan-100",
    success: "bg-emerald-500/10 border-emerald-500/50 text-emerald-100",
    warning: "bg-amber-500/10 border-amber-500/50 text-amber-100",
    error: "bg-red-500/10 border-red-500/50 text-red-100"
  };

  const icons = {
    info: <Info className="w-5 h-5" />,
    success: <CheckCircle2 className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />
  };

  return (
    <div className={clsx(baseStyles, variantStyles[variant], className)}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[variant]}</div>
        <div className="flex-1">
          {title && <p className="font-bold mb-1">{title}</p>}
          <div className="text-sm opacity-90">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Input Components
// ============================================================================

interface SFSInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'url';
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  error?: string;
  success?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function SFSInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  iconPosition = 'left',
  error,
  success,
  disabled,
  fullWidth = true,
  className
}: SFSInputProps) {
  const baseStyles = "px-4 py-3 rounded-xl bg-black/60 border-2 transition-all duration-300 text-[#F5F5DC] placeholder-[#F5F5DC]/40 focus:outline-none backdrop-blur-xl";

  const stateStyles = error
    ? "border-red-500/50 focus:border-red-500 focus:shadow-lg focus:shadow-red-500/20"
    : success
    ? "border-emerald-500/50 focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/20"
    : "border-[#FFD700]/30 focus:border-[#FFD700]/70 focus:shadow-xl focus:shadow-[#FFD700]/20";

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <div className={clsx("relative", widthStyle, className)}>
      {icon && iconPosition === 'left' && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFD700]/60">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={clsx(
          baseStyles,
          stateStyles,
          icon && iconPosition === 'left' && "pl-12",
          icon && iconPosition === 'right' && "pr-12",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
      {icon && iconPosition === 'right' && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FFD700]/60">
          {icon}
        </div>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Select Component
// ============================================================================

interface SFSSelectProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
  className?: string;
}

export function SFSSelect({ options, value, onChange, placeholder, fullWidth = true, className }: SFSSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={clsx(
        "px-4 py-3 rounded-xl bg-black/60 border-2 border-[#FFD700]/30 focus:border-[#FFD700]/70 transition-all duration-300 text-[#F5F5DC] focus:outline-none focus:shadow-xl focus:shadow-[#FFD700]/20 backdrop-blur-xl cursor-pointer",
        fullWidth && "w-full",
        className
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(option => (
        <option key={option.value} value={option.value} className="bg-[#1A1A1A] text-[#F5F5DC]">
          {option.label}
        </option>
      ))}
    </select>
  );
}

// ============================================================================
// Loading Spinner
// ============================================================================

export function LoadingSpinner({ size = 'md', className = '', color = 'gold' }: { size?: 'sm' | 'md' | 'lg', className?: string, color?: 'gold' | 'white' }) {
  const sizeStyles = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const colorStyles = {
    gold: 'border-[#FFD700]/20 border-t-[#FFD700]',
    white: 'border-white/20 border-t-white'
  };

  return (
    <div className={clsx("animate-spin rounded-full", sizeStyles[size], colorStyles[color], className)} />
  );
}

// ============================================================================
// Stat Card
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ title, value, change, icon, trend, className }: StatCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-[#F5F5DC]/60';
  };

  return (
    <SFSCard variant="elevated" hover className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#F5F5DC]/70 mb-2">{title}</p>
          <p className="text-3xl font-black bg-gradient-to-br from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent mb-2">
            {value}
          </p>
          {change !== undefined && (
            <div className={clsx("flex items-center gap-1 text-sm font-bold", getTrendColor())}>
              <TrendingUp className={clsx("w-4 h-4", trend === 'down' && "rotate-180")} />
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30">
            {icon}
          </div>
        )}
      </div>
    </SFSCard>
  );
}

// ============================================================================
// Empty State
// ============================================================================

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="mb-4 p-4 rounded-2xl bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-[#F5F5DC] mb-2">{title}</h3>
      {description && (
        <p className="text-[#F5F5DC]/60 mb-6 max-w-md">{description}</p>
      )}
      {action}
    </div>
  );
}
