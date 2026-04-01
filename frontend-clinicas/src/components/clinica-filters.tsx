import { Search, Filter, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { STATUS_OPTIONS } from "@/lib/api";

interface ClinicaFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  municipioFilter: string;
  onMunicipioFilterChange: (v: string) => void;
  idadeCnpjFilter: string;
  onIdadeCnpjFilterChange: (v: string) => void;
  cidades: string[];
  comEmail: boolean;
  onComEmailChange: (v: boolean) => void;
  onSearch: () => void;
}

export function ClinicaFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  municipioFilter,
  onMunicipioFilterChange,
  idadeCnpjFilter,
  onIdadeCnpjFilterChange,
  cidades,
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
        <SelectTrigger className="w-full sm:w-[170px]">
          <Filter className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
          <span className="truncate flex-1 text-left">
            {statusFilter === "all" ? "Todos os Status" : STATUS_OPTIONS.find(s => s.value === statusFilter)?.label || "Status"}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro de Idade CNPJ */}
      <Select value={idadeCnpjFilter} onValueChange={(v) => onIdadeCnpjFilterChange(v ?? "all")}>
        <SelectTrigger className="w-full sm:w-[170px]">
          <Filter className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
          <span className="truncate flex-1 text-left">
            {idadeCnpjFilter === "all" ? "Qualquer Idade" : 
             idadeCnpjFilter === "menos_1_ano" ? "Menos de 1 ano" : 
             idadeCnpjFilter === "de_1_a_3_anos" ? "De 1 a 3 anos" : 
             idadeCnpjFilter === "mais_3_anos" ? "Mais de 3 anos" : "Idade"}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Qualquer Idade</SelectItem>
          <SelectItem value="menos_1_ano">Menos de 1 ano</SelectItem>
          <SelectItem value="de_1_a_3_anos">De 1 a 3 anos</SelectItem>
          <SelectItem value="mais_3_anos">Mais de 3 anos</SelectItem>
        </SelectContent>
      </Select>

      {/* Filtro de Cidades */}
      <Select value={municipioFilter} onValueChange={(v) => onMunicipioFilterChange(v ?? "all")}>
        <SelectTrigger className="w-full sm:w-[170px]">
          <Filter className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
          <span className="truncate flex-1 text-left">
            {municipioFilter === "all" ? "Todas as Cidades" : municipioFilter}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Cidades</SelectItem>
          {cidades.map((cidade) => (
            <SelectItem key={cidade} value={cidade}>
              {cidade}
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
