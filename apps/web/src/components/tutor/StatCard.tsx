export default function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
      <div className="p-3 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase text-muted-foreground font-bold">
          {label}
        </p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
    </div>
  );
}