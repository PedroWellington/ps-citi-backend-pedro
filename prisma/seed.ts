import { PrismaClient, Luminosidade } from "@prisma/client";
import process from "process";

const prisma = new PrismaClient();

const plantas = [
    { nome: "Costela-de-adão", especie: "Monstera deliciosa", preco: 8990, estoque: 12, luminosidade: Luminosidade.MEIA_SOMBRA, petFriendly: false, regaACadaDias: 3 },
    { nome: "Samambaia", especie: "Nephrolepis exaltata", preco: 4500, estoque: 8, luminosidade: Luminosidade.SOMBRA, petFriendly: true, regaACadaDias: 2 },
    { nome: "Cacto Mandacaru", especie: "Cereus jamacaru", preco: 3200, estoque: 0, luminosidade: Luminosidade.SOL_PLENO, petFriendly: false, regaACadaDias: 14 },
    { nome: "Jiboia", especie: "Epipremnum aureum", preco: 2990, estoque: 20, luminosidade: Luminosidade.MEIA_SOMBRA, petFriendly: false, regaACadaDias: 5 },
    { nome: "Palmeira-areca", especie: "Dypsis lutescens", preco: 7500, estoque: 6, luminosidade: Luminosidade.MEIA_SOMBRA, petFriendly: true, regaACadaDias: 4 },
    { nome: "Suculenta Echeveria", especie: "Echeveria elegans", preco: 1800, estoque: 30, luminosidade: Luminosidade.SOL_PLENO, petFriendly: true, regaACadaDias: 10 },
    { nome: "Zamioculca", especie: "Zamioculcas zamiifolia", preco: 6490, estoque: 0, luminosidade: Luminosidade.SOMBRA, petFriendly: false, regaACadaDias: 12 },
    { nome: "Orquídea", especie: "Phalaenopsis amabilis", preco: 11990, estoque: 5, luminosidade: Luminosidade.MEIA_SOMBRA, petFriendly: true, regaACadaDias: 7 },
];

async function main() {
    await prisma.planta.deleteMany();
    await prisma.planta.createMany({ data: plantas });
    console.log(`${plantas.length} plantas criadas`);
}

main()
    .catch((erro) => {
        console.error(erro);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());