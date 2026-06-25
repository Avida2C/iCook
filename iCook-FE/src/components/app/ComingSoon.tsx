export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="grid min-h-full place-items-center px-6 py-16 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-brand">{title}</h1>
        <p className="text-base text-muted">This screen is coming soon.</p>
      </div>
    </div>
  );
}
