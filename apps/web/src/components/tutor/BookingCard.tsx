import { CheckCircle, Mail} from "lucide-react";

export default function BookingCard({
  title,
  time,
  status,
  statusColor,
  icon,
  actions,
}: {
  title: string;
  time: string;
  status: string;
  statusColor: string;
  icon: "user" | "check";
  actions?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row justify-between gap-4">

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          {icon === "check" ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Mail className="w-5 h-5 text-primary" />
          )}
        </div>

        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {time}
          </p>
          <p className={`text-xs font-bold mt-1 ${statusColor}`}>
            {status}
          </p>
        </div>
      </div>

      {actions && (
        <div className="flex gap-2">
          <button className="btn-primary">Approve</button>
          <button className="btn-outline">Decline</button>
        </div>
      )}
    </div>
  );
}