export default function Field({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-muted-foreground uppercase">
        {label}
      </label>
      <input
        defaultValue={defaultValue}
        className="w-full mt-2 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
