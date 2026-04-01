const API_BASE = import.meta.env.VITE_API_URL || "";

export interface Clinica {
  id: number;
  cnpj: string;
  cnpj_formatado: string | null;
  razao_social: string | null;
  nome_fantasia: string | null;
  nome: string | null;
  email: string | null;
  telefone1: string | null;
  telefone2: string | null;
  socio_nome: string | null;
  socio_cpf_cnpj: string | null;
  socio_qualificacao: string | null;
  socio_email: string | null;
  socio_telefone: string | null;
  tipo_logradouro: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cep: string | null;
  municipio: string | null;
  uf: string | null;
  cnae_principal: string | null;
  situacao_cadastral: string | null;
  data_abertura: string | null;
  porte: string | null;
  natureza_juridica: string | null;
  status_prospeccao: string | null;
  canal_contato: string | null;
  anotacoes: string | null;
  data_ultimo_contato: string | null;
  responsavel: string | null;
  fonte: string | null;
  criado_em: string | null;
  atualizado_em: string | null;
}

export interface PaginatedResponse {
  data: Clinica[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StatsResponse {
  total: number;
  porStatus: { status: string | null; count: number }[];
  topMunicipios: { municipio: string | null; count: number }[];
}

export interface FetchClinicasParams {
  page?: number;
  limit?: number;
  search?: string;
  municipio?: string;
  status?: string;
  idadeCnpj?: string;
  comEmail?: boolean;
  orderBy?: string;
  order?: "asc" | "desc";
}

export async function fetchClinicas(
  params: FetchClinicasParams = {}
): Promise<PaginatedResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.search) searchParams.set("search", params.search);
  if (params.municipio) searchParams.set("municipio", params.municipio);
  if (params.status) searchParams.set("status", params.status);
  if (params.idadeCnpj) searchParams.set("idadeCnpj", params.idadeCnpj);
  if (params.comEmail) searchParams.set("comEmail", "true");
  if (params.orderBy) searchParams.set("orderBy", params.orderBy);
  if (params.order) searchParams.set("order", params.order);

  const res = await fetch(`${API_BASE}/clinicas?${searchParams.toString()}`);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function fetchClinica(id: number): Promise<{ data: Clinica }> {
  const res = await fetch(`${API_BASE}/clinicas/${id}`);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch(`${API_BASE}/clinicas/stats/overview`);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function fetchCidades(): Promise<{ data: string[] }> {
  const res = await fetch(`${API_BASE}/clinicas/cidades`);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function updateClinica(
  id: number,
  data: {
    status_prospeccao?: string;
    canal_contato?: string;
    anotacoes?: string;
    responsavel?: string;
    data_ultimo_contato?: string;
  }
): Promise<{ data: Clinica }> {
  const res = await fetch(`${API_BASE}/clinicas/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export const STATUS_OPTIONS = [
  { value: "novo", label: "Novo" },
  { value: "contato_feito", label: "Contato Feito" },
  { value: "proposta_enviada", label: "Proposta Enviada" },
  { value: "negociando", label: "Negociando" },
  { value: "cliente", label: "Cliente" },
  { value: "descartado", label: "Descartado" },
] as const;

export const STATUS_COLORS: Record<string, string> = {
  novo: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
  contato_feito: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  proposta_enviada: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  negociando: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  cliente: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  descartado: "bg-red-500/15 text-red-700 dark:text-red-300",
};

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
  clinicaNome: string;
  senderName?: string;
  isHtml?: boolean;
}

export async function sendEmail(
  payload: SendEmailPayload
): Promise<{ success: boolean; messageId?: string; message: string }> {
  const res = await fetch(`${API_BASE}/email/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erro ${res.status}`);
  }
  return res.json();
}
