export default function Field({
  id,
  label,
  defaultValue,
}: {
  id?: string;
  label: string;
  defaultValue: string;
}) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={inputId} className="text-xs font-bold text-muted-foreground uppercase">
        {label}
      </label>
      <input
        id={inputId}
        defaultValue={defaultValue}
        className="w-full mt-2 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}