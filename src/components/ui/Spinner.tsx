export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-6 h-6 border-2 border-sand-300 border-t-warm-500 rounded-full animate-spin" />
    </div>
  );
}
