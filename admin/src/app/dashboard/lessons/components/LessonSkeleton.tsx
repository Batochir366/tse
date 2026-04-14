export default function LessonSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: "rgba(12,117,111,0.08)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
    >
      <div className="aspect-video bg-black/10" />
      <div className="p-4 space-y-2">
        <div className="h-4 rounded bg-black/10 w-3/4" />
        <div className="h-3 rounded bg-black/5 w-full" />
      </div>
      <div className="flex gap-2 justify-center px-4 pb-4 pt-0">
        <div className="h-9 flex-1 max-w-20 rounded-xl bg-black/10" />
        <div className="h-9 flex-1 max-w-20 rounded-xl bg-black/10" />
        <div className="h-9 flex-1 max-w-20 rounded-xl bg-black/10" />
      </div>
    </div>
  );
}
