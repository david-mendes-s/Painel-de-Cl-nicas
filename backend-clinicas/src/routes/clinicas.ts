import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /clinicas/com-email
 * Lista clínicas que possuem email (não nulo e não vazio)
 */
router.get("/com-email", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const orderBy = (req.query.orderBy as string) || "id";
    const order = (req.query.order as string) === "desc" ? "desc" : "asc";

    const where = {
      AND: [
        { email: { not: null } },
        { email: { not: "" } },
      ],
    };

    const [clinicas, total] = await Promise.all([
      prisma.clinicas_odonto_ce.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
      }),
      prisma.clinicas_odonto_ce.count({ where }),
    ]);

    return res.json({
      data: clinicas,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Erro ao listar clínicas com email:", error);
    return res.status(500).json({
      error: "Erro interno ao listar clínicas com email",
      message: error instanceof Error ? error.message : "unknown",
    });
  }
});

/**
 * GET /clinicas/stats/overview
 * Retorna estatísticas gerais
 * ⚠️  Precisa vir ANTES de /:id para não ser capturado como parâmetro
 */
router.get("/stats/overview", async (_req, res) => {
  try {
    const [total, porStatus, porMunicipio] = await Promise.all([
      prisma.clinicas_odonto_ce.count(),
      prisma.clinicas_odonto_ce.groupBy({
        by: ["status_prospeccao"],
        _count: true,
        orderBy: { _count: { status_prospeccao: "desc" } },
      }),
      prisma.clinicas_odonto_ce.groupBy({
        by: ["municipio"],
        _count: true,
        orderBy: { _count: { municipio: "desc" } },
        take: 10,
      }),
    ]);

    return res.json({
      total,
      porStatus: porStatus.map((s) => ({
        status: s.status_prospeccao,
        count: s._count,
      })),
      topMunicipios: porMunicipio.map((m) => ({
        municipio: m.municipio,
        count: m._count,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return res.status(500).json({
      error: "Erro interno ao buscar estatísticas",
      message: error instanceof Error ? error.message : "unknown",
    });
  }
});

/**
 * GET /clinicas
 * Lista clínicas com paginação, busca e filtros
 *
 * Query params:
 *   page      - página (default: 1)
 *   limit     - itens por página (default: 20, max: 100)
 *   search    - busca em nome_fantasia, razao_social, cnpj, email
 *   municipio - filtro por município
 *   status    - filtro por status_prospeccao
 *   orderBy   - campo de ordenação (default: id)
 *   order     - asc|desc (default: asc)
 */
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || "";
    const municipio = (req.query.municipio as string) || "";
    const status = (req.query.status as string) || "";
    const comEmail = req.query.comEmail === "true";
    const orderBy = (req.query.orderBy as string) || "id";
    const order = (req.query.order as string) === "desc" ? "desc" : "asc";

    // Monta filtro dinâmico
    const where: any = {};

    if (search) {
      where.OR = [
        { nome_fantasia: { contains: search, mode: "insensitive" } },
        { razao_social: { contains: search, mode: "insensitive" } },
        { cnpj: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
        { telefone1: { contains: search } },
      ];
    }

    if (municipio) {
      where.municipio = { equals: municipio, mode: "insensitive" };
    }

    if (status) {
      where.status_prospeccao = status;
    }

    if (comEmail) {
      where.AND = [
        ...(where.AND || []),
        { email: { not: null } },
        { email: { not: "" } },
      ];
    }

    const [clinicas, total] = await Promise.all([
      prisma.clinicas_odonto_ce.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
      }),
      prisma.clinicas_odonto_ce.count({ where }),
    ]);

    return res.json({
      data: clinicas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao listar clínicas:", error);
    return res.status(500).json({
      error: "Erro interno ao listar clínicas",
      message: error instanceof Error ? error.message : "unknown",
    });
  }
});

/**
 * GET /clinicas/:id
 * Busca uma clínica por ID
 */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const clinica = await prisma.clinicas_odonto_ce.findUnique({ where: { id } });
    if (!clinica) {
      return res.status(404).json({ error: "Clínica não encontrada" });
    }

    return res.json({ data: clinica });
  } catch (error) {
    console.error("Erro ao buscar clínica:", error);
    return res.status(500).json({
      error: "Erro interno ao buscar clínica",
      message: error instanceof Error ? error.message : "unknown",
    });
  }
});

/**
 * PATCH /clinicas/:id
 * Atualiza dados de prospecção de uma clínica
 */
router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    // Campos que podem ser atualizados via API
    const allowedFields = [
      "status_prospeccao",
      "canal_contato",
      "anotacoes",
      "responsavel",
      "data_ultimo_contato",
    ];

    const data: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        error: "Nenhum campo válido para atualização",
        allowedFields,
      });
    }

    data.atualizado_em = new Date();

    const clinica = await prisma.clinicas_odonto_ce.update({
      where: { id },
      data,
    });

    return res.json({ data: clinica });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Clínica não encontrada" });
    }
    console.error("Erro ao atualizar clínica:", error);
    return res.status(500).json({
      error: "Erro interno ao atualizar clínica",
      message: error instanceof Error ? error.message : "unknown",
    });
  }
});

export default router;
