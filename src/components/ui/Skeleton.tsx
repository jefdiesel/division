interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({
  width = "100%",
  height = "1rem",
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-sand-100 ${className}`}
      style={{ width, height }}
    />
  );
}

/** Three stacked skeleton cards previewing the dashboard layout. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(61,46,31,0.08)] p-4 space-y-3"
        >
          <Skeleton width="6rem" height="0.75rem" />
          <div className="flex justify-between">
            <Skeleton width="4rem" height="0.625rem" />
            <Skeleton width="4rem" height="0.625rem" />
          </div>
          <Skeleton height="0.75rem" className="rounded-full" />
        </div>
      ))}
    </div>
  );
}
