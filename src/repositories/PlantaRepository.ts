import { Prisma } from "@prisma/client";
import prisma from "@database";

export const createPlanta = async (data: Prisma.PlantaCreateInput) => {
    return await prisma.planta.create({ data });
};

export const findAllPlantas = async (where: Prisma.PlantaWhereInput = {}) => {
    return await prisma.planta.findMany({ where });
};

export const findPlantaById = async (id: number) => {
    return await prisma.planta.findUnique({ where: { id } });
};

export const updatePlanta = async (id: number, data: Prisma.PlantaUpdateInput) => {
    return await prisma.planta.update({ where: { id }, data });
};

export const deletePlanta = async (id: number) => {
    return await prisma.planta.delete({ where: { id } });
};

export const decrementEstoque = async (id: number, quantidade: number) => {
    return await prisma.planta.update({
        where: { id },
        data: { estoque: { decrement: quantidade } },
    });
};

export const findPlantasEstoqueEPreco = async () => {
    return await prisma.planta.findMany({ select: { preco: true, estoque: true } });
};