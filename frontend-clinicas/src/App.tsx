import { useCallback, useEffect, useState } from "react";
import { Stethoscope } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { StatsCards } from "@/components/stats-cards";
import { ClinicaFilters } from "@/components/clinica-filters";
import { ClinicaTable } from "@/components/clinica-table";
import { ClinicaDialog } from "@/components/clinica-dialog";
import { EmailDialog } from "@/components/email-dialog";
import { Pagination } from "@/components/pagination";
import {
  fetchClinicas,
  fetchStats,
  type Clinica,
  type StatsResponse,
  type PaginatedResponse,
} from "@/lib/api";

function Dashboard() {
  // Data
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [result, setResult] = useState<PaginatedResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [comEmail, setComEmail] = useState(false);
  const [page, setPage] = useState(1);

  // Dialog
  const [selectedClinica, setSelectedClinica] = useState<Clinica | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Email Dialog
  const [emailClinica, setEmailClinica] = useState<Clinica | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await fetchStats();
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadClinicas = useCallback(async () => {
    setTableLoading(true);
    try {
      const data = await fetchClinicas({
        page,
        limit: 15,
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        comEmail,
      });
      setResult(data);
    } catch (err) {
      console.error("Erro ao carregar clínicas:", err);
    } finally {
      setTableLoading(false);
    }
  }, [page, search, statusFilter, comEmail]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadClinicas();
  }, [loadClinicas]);

  const handleSearch = () => {
    setPage(1);
    loadClinicas();
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleComEmailChange = (value: boolean) => {
    setComEmail(value);
    setPage(1);
  };

  const handleSelect = (clinica: Clinica) => {
    setSelectedClinica(clinica);
    setDialogOpen(true);
  };

  const handleDialogOpen = (open: boolean) => {
    setDialogOpen(open);
    if (open && selectedClinica) {
      // Re-fetch to get latest data
      // Already handled in dialog reset
    }
  };

  const handleUpdated = () => {
    loadClinicas();
    loadStats();
  };

  const handleSendEmail = (clinica: Clinica) => {
    setEmailClinica(clinica);
    setEmailDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Painel de Prospecção
              </h1>
              <p className="text-xs text-muted-foreground">
                Clínicas Odontológicas — Ceará
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Stats */}
        <StatsCards stats={stats} loading={statsLoading} />

        {/* Filters */}
        <ClinicaFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          comEmail={comEmail}
          onComEmailChange={handleComEmailChange}
          onSearch={handleSearch}
        />

        {/* Table */}
        <ClinicaTable
          clinicas={result?.data || []}
          loading={tableLoading}
          onSelect={handleSelect}
          onSendEmail={handleSendEmail}
        />

        {/* Pagination */}
        {result && (
          <Pagination
            page={page}
            totalPages={result.pagination.totalPages}
            total={result.pagination.total}
            onPageChange={setPage}
          />
        )}
      </main>

      {/* Dialog */}
      <ClinicaDialog
        clinica={selectedClinica}
        open={dialogOpen}
        onOpenChange={handleDialogOpen}
        onUpdated={handleUpdated}
      />

      {/* Email Dialog */}
      {emailClinica?.email && (
        <EmailDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          toEmail={emailClinica.email}
          clinicaNome={emailClinica.nome_fantasia || emailClinica.razao_social || "Clínica"}
          clinicaCidade={emailClinica.municipio || "sua região"}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;
