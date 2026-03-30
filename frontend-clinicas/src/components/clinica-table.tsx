import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Phone, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Clinica } from "@/lib/api";

interface ClinicaTableProps {
  clinicas: Clinica[];
  loading: boolean;
  onSelect: (c: Clinica) => void;
}

export function ClinicaTable({ clinicas, loading, onSelect }: ClinicaTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[280px]">Clínica</TableHead>
              <TableHead className="w-[160px]">CNPJ</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="w-[140px]">Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i} className="animate-pulse">
                <TableCell><div className="h-4 w-48 bg-muted rounded" /></TableCell>
                <TableCell><div className="h-4 w-32 bg-muted rounded" /></TableCell>
                <TableCell><div className="h-4 w-40 bg-muted rounded" /></TableCell>
                <TableCell><div className="h-4 w-24 bg-muted rounded" /></TableCell>
                <TableCell><div className="h-4 w-16 bg-muted rounded" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (clinicas.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 p-12 text-center">
        <p className="text-muted-foreground">Nenhuma clínica encontrada.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[280px]">Clínica</TableHead>
            <TableHead className="w-[160px]">CNPJ</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead className="w-[140px]">Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clinicas.map((c) => (
            <TableRow
              key={c.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => onSelect(c)}
            >
              <TableCell>
                <div>
                  <p className="font-medium text-sm truncate max-w-[260px]">
                    {c.nome_fantasia || c.razao_social || "—"}
                  </p>
                  {c.municipio && (
                    <p className="text-xs text-muted-foreground truncate">
                      {c.municipio}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs text-muted-foreground">
                  {c.cnpj_formatado || c.cnpj}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {c.email && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[200px]">{c.email}</span>
                    </div>
                  )}
                  {c.telefone1 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{c.telefone1}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={c.status_prospeccao} />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(c);
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
