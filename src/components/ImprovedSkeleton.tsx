import { prefersReducedMotion } from '../utils/accessibility';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Improved Skeleton component with accessibility support
 * Respects user's reduced motion preferences
 */
export default function ImprovedSkeleton({
  variant = 'rectangular',
  width = '100%',
  height = '1rem',
  className = '',
  animation = 'pulse',
}: SkeletonProps) {
  const shouldAnimate = !prefersReducedMotion() && animation !== 'none';

  const baseClasses = 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%]';
  const animationClass = shouldAnimate
    ? animation === 'wave'
      ? 'animate-shimmer'
      : 'animate-pulse'
    : '';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClass} ${className}`}
      style={style}
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Skeleton for card components
 */
export function CardSkeleton() {
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-[#FFD700]/20 rounded-2xl p-6 space-y-4">
      <ImprovedSkeleton variant="rounded" width="60%" height={24} />
      <ImprovedSkeleton variant="text" width="100%" height={16} />
      <ImprovedSkeleton variant="text" width="85%" height={16} />
      <ImprovedSkeleton variant="text" width="70%" height={16} />
      <div className="flex gap-2 mt-4">
        <ImprovedSkeleton variant="rounded" width={80} height={36} />
        <ImprovedSkeleton variant="rounded" width={80} height={36} />
      </div>
    </div>
  );
}

/**
 * Skeleton for table rows
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-800">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <ImprovedSkeleton variant="text" width="80%" height={16} />
        </td>
      ))}
    </tr>
  );
}

/**
 * Skeleton for list items
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-800">
      <ImprovedSkeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <ImprovedSkeleton variant="text" width="40%" height={16} />
        <ImprovedSkeleton variant="text" width="60%" height={14} />
      </div>
    </div>
  );
}

/**
 * Skeleton for dashboard grid
 */
export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
