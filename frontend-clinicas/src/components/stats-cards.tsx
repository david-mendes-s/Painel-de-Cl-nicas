import {
  Building2,
  UserCheck,
  UserX,
  Users,
  Mail,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StatsResponse } from "@/lib/api";

interface StatsCardsProps {
  stats: StatsResponse | null;
  loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="animate-pulse bg-muted/50"
          >
            <CardContent className="p-4">
              <div className="h-4 w-20 bg-muted rounded mb-2" />
              <div className="h-8 w-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getCount = (statusKey: string) =>
    stats.porStatus.find((s) => s.status === statusKey)?.count || 0;

  const cards = [
    {
      label: "Total",
      value: stats.total,
      icon: Building2,
      color: "text-foreground",
    },
    {
      label: "Novos",
      value: getCount("novo"),
      icon: Users,
      color: "text-zinc-500",
    },
    {
      label: "Contato Feito",
      value: getCount("contato_feito"),
      icon: Mail,
      color: "text-blue-500",
    },
    {
      label: "Negociando",
      value: getCount("negociando"),
      icon: TrendingUp,
      color: "text-orange-500",
    },
    {
      label: "Clientes",
      value: getCount("cliente"),
      icon: UserCheck,
      color: "text-emerald-500",
    },
    {
      label: "Descartados",
      value: getCount("descartado"),
      icon: UserX,
      color: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <Card
          key={c.label}
          className="transition-shadow hover:shadow-md border-border/50"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium">
                {c.label}
              </span>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold tracking-tight">
              {c.value.toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
