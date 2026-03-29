import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, STATUS_OPTIONS } from "@/lib/api";

interface StatusBadgeProps {
  status: string | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label =
    STATUS_OPTIONS.find((s) => s.value === status)?.label || status || "—";
  const color = STATUS_COLORS[status || ""] || STATUS_COLORS.novo;

  return (
    <Badge variant="secondary" className={`${color} font-medium text-xs`}>
      {label}
    </Badge>
  );
}
