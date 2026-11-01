import { Request, Response } from "express";
import { Luminosidade } from "@prisma/client";
import * as PlantaRepository from "../repositories/PlantaRepository";

const lerId = (valor: string) => {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
};

// Valida só os campos enviados. No cadastro, todos são obrigatórios.
const validarCampos = (body: any, todosObrigatorios: boolean): string | null => {
    const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = body;

    if (todosObrigatorios) {
        const campos = { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias };
        for (const [chave, valor] of Object.entries(campos)) {
            if (valor === undefined) return `O campo ${chave} é obrigatório`;
        }
    }
    if (nome !== undefined && (typeof nome !== "string" || nome.trim() === "")) {
        return "nome deve ser um texto não vazio";
    }
    if (especie !== undefined && (typeof especie !== "string" || especie.trim() === "")) {
        return "especie deve ser um texto não vazio";
    }
    if (preco !== undefined && (!Number.isInteger(preco) || preco <= 0)) {
        return "preco deve ser um inteiro maior que zero (em centavos)";
    }
    if (estoque !== undefined && (!Number.isInteger(estoque) || estoque < 0)) {
        return "estoque deve ser um inteiro maior ou igual a zero";
    }
    if (luminosidade !== undefined && !Object.values(Luminosidade).includes(luminosidade)) {
        return "luminosidade deve ser SOMBRA, MEIA_SOMBRA ou SOL_PLENO";
    }
    if (petFriendly !== undefined && typeof petFriendly !== "boolean") {
        return "petFriendly deve ser true ou false";
    }
    if (regaACadaDias !== undefined && (!Number.isInteger(regaACadaDias) || regaACadaDias < 1)) {
        return "regaACadaDias deve ser um inteiro maior ou igual a 1";
    }
    return null;
};

export const createPlanta = async (req: Request, res: Response) => {
    try {
        const body = req.body ?? {};
        const erro = validarCampos(body, true);
        if (erro) return res.status(400).json({ message: erro });

        const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = body;
        const planta = await PlantaRepository.createPlanta({
            nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias,
        });
        return res.status(201).json(planta);
    } catch (error) {
        return res.status(500).json({ message: "Erro interno do servidor" });
    }
};

export const listPlantas = async (req: Request, res: Response) => {
    try {
        const { luminosidade, petFriendly, nome, ordem } = req.query;

        if (luminosidade !== undefined &&
            !Object.values(Luminosidade).includes(luminosidade as Luminosidade)) {
            return res.status(400).json({ message: "Filtro luminosidade inválido" });
        }
        if (petFriendly !== undefined && petFriendly !== "true" && petFriendly !== "false") {
            return res.status(400).json({ message: "Filtro petFriendly deve ser true ou false" });
        }
        if (ordem !== undefined && ordem !== "preco" && ordem !== "nome") {
            return res.status(400).json({ message: "ordem deve ser preco ou nome" });
        }
        if (nome !== undefined && typeof nome !== "string") {
            return res.status(400).json({ message: "nome deve ser um texto" });
        }

        const plantas = await PlantaRepository.findAllPlantas(
            {
                luminosidade: luminosidade as Luminosidade | undefined,
                petFriendly: petFriendly === undefined ? undefined : petFriendly === "true",
                nome: nome ? { contains: nome, mode: "insensitive" } : undefined,
            },
            ordem ? { [ordem as string]: "asc" } : undefined,
        );
        return res.status(200).json(plantas);
    } catch (error) {
        return res.status(500).json({ message: "Erro interno do servidor" });
    }
};

export const getPlanta = async (req: Request, res: Response) => {
    try {
        const id = lerId(req.params.id);
        if (id === null) return res.status(400).json({ message: "id inválido" });

        const planta = await PlantaRepository.findPlantaById(id);
        if (!planta) return res.status(404).json({ message: "Planta não encontrada" });

        return res.status(200).json(planta);
    } catch (error) {
        return res.status(500).json({ message: "Erro interno do servidor" });
    }
};

export const updatePlanta = async (req: Request, res: Response) => {
    try {
        const id = lerId(req.params.id);
        if (id === null) return res.status(400).json({ message: "id inválido" });

        const body = req.body ?? {};
        const erro = validarCampos(body, false);
        if (erro) return res.status(400).json({ message: erro });

        const existente = await PlantaRepository.findPlantaById(id);
        if (!existente) return res.status(404).json({ message: "Planta não encontrada" });

        // campos não enviados ficam undefined e o Prisma ignora
        const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = body;
        const planta = await PlantaRepository.updatePlanta(id, {
            nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias,
        });
        return res.status(200).json(planta);
    } catch (error) {
        return res.status(500).json({ message: "Erro interno do servidor" });
    }
};

export const deletePlanta = async (req: Request, res: Response) => {
    try {
        const id = lerId(req.params.id);
        if (id === null) return res.status(400).json({ message: "id inválido" });

        const existente = await PlantaRepository.findPlantaById(id);
        if (!existente) return res.status(404).json({ message: "Planta não encontrada" });

        await PlantaRepository.deletePlanta(id);
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: "Erro interno do servidor" });
    }
};

export const venderPlanta = async (req: Request, res: Response) => {
    try {
        const id = lerId(req.params.id);
        if (id === null) return res.status(400).json({ message: "id inválido" });

        const quantidade = req.body?.quantidade;
        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            return res.status(400).json({ message: "quantidade deve ser um inteiro maior que zero" });
        }

        const planta = await PlantaRepository.findPlantaById(id);
        if (!planta) return res.status(404).json({ message: "Planta não encontrada" });

        if (planta.estoque < quantidade) {
            return res.status(400).json({ message: `Temos só ${planta.estoque} vasos` });
        }

        const atualizada = await PlantaRepository.decrementEstoque(id, quantidade);
        return res.status(200).json(atualizada);
    } catch (error) {
        return res.status(500).json({ message: "Erro interno do servidor" });
    }
};

export const valorTotalEstoque = async (req: Request, res: Response) => {
    try {
        const plantas = await PlantaRepository.findPlantasEstoqueEPreco();
        const valorTotalEmCentavos = plantas.reduce((soma, p) => soma + p.preco * p.estoque, 0);
        const totalDeVasos = plantas.reduce((soma, p) => soma + p.estoque, 0);
        return res.status(200).json({ valorTotalEmCentavos, totalDeVasos });
    } catch (error) {
        return res.status(500).json({ message: "Erro interno do servidor" });
    }
};

export const listEsgotadas = async (req: Request, res: Response) => {
    try {
        const plantas = await PlantaRepository.findAllPlantas({ estoque: 0 });
        return res.status(200).json(plantas);
    } catch (error) {
        return res.status(500).json({ message: "Erro interno do servidor" });
    }
};