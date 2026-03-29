import { Search, Filter, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_OPTIONS } from "@/lib/api";

interface ClinicaFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  comEmail: boolean;
  onComEmailChange: (v: boolean) => void;
  onSearch: () => void;
}

export function ClinicaFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  comEmail,
  onComEmailChange,
  onSearch,
}: ClinicaFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Busca */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, CNPJ, email ou telefone..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="pl-9"
        />
      </div>

      {/* Filtro de Status */}
      <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v ?? "all")}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Todos os status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Toggle com email */}
      <Button
        variant={comEmail ? "default" : "outline"}
        size="default"
        onClick={() => onComEmailChange(!comEmail)}
        className="gap-2"
      >
        <Mail className="h-4 w-4" />
        <span className="hidden sm:inline">Com Email</span>
      </Button>

      {/* Botão buscar */}
      <Button onClick={onSearch} className="gap-2">
        <Search className="h-4 w-4" />
        Buscar
      </Button>
    </div>
  );
}
