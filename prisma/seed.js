const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const crypto = require("crypto");

function resolveSqlitePath() {
  const raw = process.env.DATABASE_URL || "file:./dev.db";
  const file = raw.startsWith("file:") ? raw.replace("file:", "") : raw;
  return path.resolve(process.cwd(), file);
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3(
    {
      url: `file:${resolveSqlitePath()}`,
    },
    { timestampFormat: "unixepoch-ms" },
  ),
});

const PHASES = [
  "pré-kickoff",
  "kickoff",
  "discovery",
  "saneamento",
  "parametrização",
  "treinamento",
  "homologação",
  "go-live",
  "estabilização",
  "handover",
];

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function datePlus(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function npsClassification(score) {
  if (score >= 9) return "PROMOTOR";
  if (score >= 7) return "NEUTRO";
  return "DETRATOR";
}

async function main() {
  await prisma.task.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.automationAlert.deleteMany();
  await prisma.npsEntry.deleteMany();
  await prisma.healthScore.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.projectPhase.deleteMany();
  await prisma.projectConsultant.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.collaboratorSkill.deleteMany();
  await prisma.submodule.deleteMany();
  await prisma.businessModule.deleteMany();
  await prisma.core.deleteMany();
  await prisma.collaborator.deleteMany();
  await prisma.user.deleteMany();

  const users = await prisma.$transaction([
    prisma.user.create({
      data: {
        name: "Ana Paula Admin",
        email: "admin@agrosys.com.br",
        passwordHash: hashPassword("agrosys123"),
        role: "ADMIN",
      },
    }),
    prisma.user.create({
      data: {
        name: "Carlos Coordenador",
        email: "coordenador@agrosys.com.br",
        passwordHash: hashPassword("agrosys123"),
        role: "COORDENADOR",
      },
    }),
    prisma.user.create({
      data: {
        name: "Gabriela Gerente",
        email: "gerente@agrosys.com.br",
        passwordHash: hashPassword("agrosys123"),
        role: "GERENTE",
      },
    }),
    prisma.user.create({
      data: {
        name: "Rafael Consultor",
        email: "consultor@agrosys.com.br",
        passwordHash: hashPassword("agrosys123"),
        role: "CONSULTOR",
      },
    }),
    prisma.user.create({
      data: {
        name: "Marina CS",
        email: "cs@agrosys.com.br",
        passwordHash: hashPassword("agrosys123"),
        role: "CS",
      },
    }),
    prisma.user.create({
      data: {
        name: "Diretoria Agrosys",
        email: "diretoria@agrosys.com.br",
        passwordHash: hashPassword("agrosys123"),
        role: "DIRETORIA",
      },
    }),
  ]);

  const [coreGraos, corePecuaria, coreFinanceiro] = await prisma.$transaction([
    prisma.core.create({
      data: { name: "Grãos", description: "Operações agrícolas de grãos", criticality: "ALTO" },
    }),
    prisma.core.create({
      data: { name: "Pecuária", description: "Operações de bovinocultura", criticality: "MEDIO" },
    }),
    prisma.core.create({
      data: { name: "Financeiro", description: "Controladoria e gestão financeira", criticality: "CRITICO" },
    }),
  ]);

  const [modPlanejamento, modEstoque, modConfinamento, modFiscal] = await prisma.$transaction([
    prisma.businessModule.create({
      data: { name: "Planejamento Agrícola", coreId: coreGraos.id, criticality: "ALTO", minimumCapacitated: 2 },
    }),
    prisma.businessModule.create({
      data: { name: "Estoque e Armazém", coreId: coreGraos.id, criticality: "MEDIO", minimumCapacitated: 2 },
    }),
    prisma.businessModule.create({
      data: { name: "Confinamento", coreId: corePecuaria.id, criticality: "ALTO", minimumCapacitated: 2 },
    }),
    prisma.businessModule.create({
      data: { name: "Fiscal e Faturamento", coreId: coreFinanceiro.id, criticality: "CRITICO", minimumCapacitated: 3 },
    }),
  ]);

  await prisma.submodule.createMany({
    data: [
      { name: "Safra", moduleId: modPlanejamento.id, criticality: "ALTO" },
      { name: "Insumos", moduleId: modPlanejamento.id, criticality: "MEDIO" },
      { name: "WMS", moduleId: modEstoque.id, criticality: "MEDIO" },
      { name: "Rastreabilidade", moduleId: modEstoque.id, criticality: "ALTO" },
      { name: "Lotes", moduleId: modConfinamento.id, criticality: "ALTO" },
      { name: "Tributação", moduleId: modFiscal.id, criticality: "CRITICO" },
    ],
  });

  const [colGerente, colCS, colConsultor1, colConsultor2, colConsultor3] = await prisma.$transaction([
    prisma.collaborator.create({
      data: {
        name: "Gabriela Gerente",
        roleTitle: "Gerente de Implantação",
        dailyHours: 8,
        weeklyHours: 40,
        nominalCapacity: 160,
        usefulCapacity: 128,
        email: "gabriela.gerente@agrosys.com.br",
        phone: "(11) 98888-1000",
        managerName: "Diretoria Agrosys",
        cityRegion: "Ribeirão Preto/SP",
        canTravel: true,
        remoteEnabled: true,
      },
    }),
    prisma.collaborator.create({
      data: {
        name: "Marina CS",
        roleTitle: "Customer Success de Implantação",
        dailyHours: 8,
        weeklyHours: 40,
        nominalCapacity: 160,
        usefulCapacity: 120,
        email: "marina.cs@agrosys.com.br",
        phone: "(11) 98888-1001",
        managerName: "Gabriela Gerente",
        cityRegion: "Campinas/SP",
        canTravel: true,
        remoteEnabled: true,
      },
    }),
    prisma.collaborator.create({
      data: {
        name: "Rafael Consultor",
        roleTitle: "Consultor de Implantação",
        dailyHours: 8,
        weeklyHours: 40,
        nominalCapacity: 160,
        usefulCapacity: 132,
        email: "rafael.consultor@agrosys.com.br",
        phone: "(16) 99111-1111",
        managerName: "Gabriela Gerente",
        cityRegion: "Uberlândia/MG",
        canTravel: true,
        remoteEnabled: true,
      },
    }),
    prisma.collaborator.create({
      data: {
        name: "Fernanda Consultora",
        roleTitle: "Consultora de Implantação",
        dailyHours: 8,
        weeklyHours: 40,
        nominalCapacity: 160,
        usefulCapacity: 130,
        email: "fernanda.consultora@agrosys.com.br",
        phone: "(34) 99222-2222",
        managerName: "Gabriela Gerente",
        cityRegion: "Goiânia/GO",
        canTravel: true,
        remoteEnabled: false,
      },
    }),
    prisma.collaborator.create({
      data: {
        name: "Leandro Especialista",
        roleTitle: "Consultor Sênior",
        dailyHours: 8,
        weeklyHours: 40,
        nominalCapacity: 160,
        usefulCapacity: 125,
        email: "leandro.especialista@agrosys.com.br",
        phone: "(65) 99333-3333",
        managerName: "Gabriela Gerente",
        cityRegion: "Cuiabá/MT",
        canTravel: true,
        remoteEnabled: true,
      },
    }),
  ]);

  await prisma.collaboratorSkill.createMany({
    data: [
      { collaboratorId: colConsultor1.id, coreId: coreGraos.id, moduleId: modPlanejamento.id, level: 4 },
      { collaboratorId: colConsultor1.id, coreId: coreFinanceiro.id, moduleId: modFiscal.id, level: 2 },
      { collaboratorId: colConsultor2.id, coreId: coreGraos.id, moduleId: modEstoque.id, level: 3 },
      { collaboratorId: colConsultor3.id, coreId: corePecuaria.id, moduleId: modConfinamento.id, level: 4 },
      { collaboratorId: colGerente.id, coreId: coreFinanceiro.id, moduleId: modFiscal.id, level: 3 },
      { collaboratorId: colCS.id, coreId: coreGraos.id, moduleId: modPlanejamento.id, level: 1 },
    ],
  });

  const [cli1, cli2, cli3] = await prisma.$transaction([
    prisma.client.create({
      data: {
        corporateName: "Fazenda Boa Safra LTDA",
        tradeName: "Boa Safra",
        segment: "Soja e Milho",
        companySize: "Grande",
        city: "Sorriso",
        state: "MT",
        mainContact: "João Carlos",
        executiveSponsor: "Diretor Operacional",
        implementationStatus: "EM_ANDAMENTO",
        currentRisk: "MEDIO",
        startDate: datePlus(-50),
        goLiveForecast: datePlus(30),
      },
    }),
    prisma.client.create({
      data: {
        corporateName: "Agro Vale Verde S.A.",
        tradeName: "Vale Verde",
        segment: "Pecuária",
        companySize: "Médio",
        city: "Rondonópolis",
        state: "MT",
        mainContact: "Fernanda Lima",
        executiveSponsor: "CEO",
        implementationStatus: "ATRASADO",
        currentRisk: "ALTO",
        startDate: datePlus(-70),
        goLiveForecast: datePlus(20),
      },
    }),
    prisma.client.create({
      data: {
        corporateName: "Grupo Agronorte Participações",
        tradeName: "Agronorte",
        segment: "Multisegmento",
        companySize: "Grande",
        city: "Luziânia",
        state: "GO",
        mainContact: "Patrícia Mota",
        executiveSponsor: "CFO",
        implementationStatus: "PLANEJADO",
        currentRisk: "BAIXO",
        startDate: datePlus(-10),
        goLiveForecast: datePlus(70),
      },
    }),
  ]);

  const [proj1, proj2, proj3] = await prisma.$transaction([
    prisma.project.create({
      data: {
        name: "Implantação ERP Agro - Boa Safra",
        clientId: cli1.id,
        managerId: colGerente.id,
        csOwnerId: colCS.id,
        status: "EM_ANDAMENTO",
        currentPhase: "homologação",
        priority: "ALTA",
        criticality: "ALTO",
        startDate: datePlus(-50),
        targetEndDate: datePlus(30),
        progressPercent: 67,
        projectRisk: "MEDIO",
        clientPending: "Validação de integração bancária",
        internalPending: "Ajuste fiscal de ICMS-ST",
      },
    }),
    prisma.project.create({
      data: {
        name: "Implantação Confinamento - Vale Verde",
        clientId: cli2.id,
        managerId: colGerente.id,
        csOwnerId: colCS.id,
        status: "ATRASADO",
        currentPhase: "parametrização",
        priority: "CRITICA",
        criticality: "CRITICO",
        startDate: datePlus(-70),
        targetEndDate: datePlus(20),
        progressPercent: 42,
        projectRisk: "ALTO",
        clientPending: "Disponibilizar base de dados de lotes",
        internalPending: "Falta consultor backup em módulo fiscal",
      },
    }),
    prisma.project.create({
      data: {
        name: "Rollout Financeiro - Agronorte",
        clientId: cli3.id,
        managerId: colGerente.id,
        csOwnerId: colCS.id,
        status: "PLANEJADO",
        currentPhase: "kickoff",
        priority: "MEDIA",
        criticality: "MEDIO",
        startDate: datePlus(-10),
        targetEndDate: datePlus(70),
        progressPercent: 18,
        projectRisk: "BAIXO",
      },
    }),
  ]);

  await prisma.projectConsultant.createMany({
    data: [
      { projectId: proj1.id, collaboratorId: colConsultor1.id },
      { projectId: proj1.id, collaboratorId: colConsultor2.id },
      { projectId: proj2.id, collaboratorId: colConsultor3.id },
      { projectId: proj2.id, collaboratorId: colConsultor1.id },
      { projectId: proj3.id, collaboratorId: colConsultor2.id },
    ],
  });

  for (const project of [proj1, proj2, proj3]) {
    for (let idx = 0; idx < PHASES.length; idx += 1) {
      const phaseName = PHASES[idx];
      const completed = idx < 4 && project.id !== proj3.id;
      const current = phaseName === project.currentPhase;

      await prisma.projectPhase.create({
        data: {
          projectId: project.id,
          name: phaseName,
          checklist: "Checklist padrão da fase",
          responsibleId: idx % 2 === 0 ? colGerente.id : colConsultor1.id,
          plannedDate: datePlus(-45 + idx * 10),
          actualDate: completed ? datePlus(-43 + idx * 10) : null,
          status: completed ? "CONCLUIDA" : current ? "EM_ANDAMENTO" : "NAO_INICIADA",
          impediments: current && project.status === "ATRASADO" ? "Cliente sem disponibilidade de usuários-chave" : null,
          entryCriteria: "Fase anterior concluída",
          exitCriteria: "Entregáveis validados",
        },
      });
    }
  }

  await prisma.allocation.createMany({
    data: [
      {
        collaboratorId: colConsultor1.id,
        clientId: cli1.id,
        projectId: proj1.id,
        coreId: coreGraos.id,
        moduleId: modPlanejamento.id,
        activityType: "IMPLANTACAO_PRODUTIVA",
        date: datePlus(1),
        startTime: "08:00",
        endTime: "12:00",
        allocatedHours: 4,
        location: "REMOTO",
        city: "Sorriso/MT",
        requester: "Gabriela Gerente",
        priority: "ALTA",
        agendaStatus: "CONFIRMADA",
      },
      {
        collaboratorId: colConsultor1.id,
        clientId: cli2.id,
        projectId: proj2.id,
        coreId: corePecuaria.id,
        moduleId: modConfinamento.id,
        activityType: "REUNIAO_CLIENTE",
        date: datePlus(1),
        startTime: "11:00",
        endTime: "13:00",
        allocatedHours: 2,
        location: "REMOTO",
        city: "Rondonópolis/MT",
        requester: "Gabriela Gerente",
        priority: "ALTA",
        agendaStatus: "PLANEJADA",
        notes: "Conflito proposital para demonstrar alerta",
      },
      {
        collaboratorId: colConsultor2.id,
        clientId: cli1.id,
        projectId: proj1.id,
        coreId: coreGraos.id,
        moduleId: modEstoque.id,
        activityType: "TREINAMENTO",
        date: datePlus(2),
        startTime: "09:00",
        endTime: "17:00",
        allocatedHours: 8,
        location: "PRESENCIAL",
        city: "Sorriso/MT",
        requester: "Gabriela Gerente",
        priority: "MEDIA",
        agendaStatus: "CONFIRMADA",
      },
      {
        collaboratorId: colConsultor3.id,
        clientId: cli2.id,
        projectId: proj2.id,
        coreId: corePecuaria.id,
        moduleId: modConfinamento.id,
        activityType: "IMPLANTACAO_PRODUTIVA",
        date: datePlus(3),
        startTime: "08:00",
        endTime: "18:00",
        allocatedHours: 10,
        location: "PRESENCIAL",
        city: "Rondonópolis/MT",
        requester: "Gabriela Gerente",
        priority: "CRITICA",
        agendaStatus: "CONFIRMADA",
      },
      {
        collaboratorId: colConsultor3.id,
        clientId: cli3.id,
        projectId: proj3.id,
        coreId: coreFinanceiro.id,
        moduleId: modFiscal.id,
        activityType: "FOLLOW_UP",
        date: datePlus(4),
        startTime: "14:00",
        endTime: "18:00",
        allocatedHours: 4,
        location: "REMOTO",
        city: "Luziânia/GO",
        requester: "Marina CS",
        priority: "MEDIA",
        agendaStatus: "PLANEJADA",
      },
    ],
  });

  const hs1 = await prisma.healthScore.create({
    data: {
      clientId: cli1.id,
      projectId: proj1.id,
      csOwnerId: colCS.id,
      score: 74,
      status: "MEDIO",
      escalationRisk: false,
      engagement: 78,
      scheduleAdherence: 70,
      meetingPresence: 82,
      openPendencies: 4,
      progressPerception: 75,
      notes: "Cliente engajado, mas com pendências de integração.",
    },
  });

  const hs2 = await prisma.healthScore.create({
    data: {
      clientId: cli2.id,
      projectId: proj2.id,
      csOwnerId: colCS.id,
      score: 49,
      status: "ALTO",
      escalationRisk: true,
      engagement: 52,
      scheduleAdherence: 40,
      meetingPresence: 60,
      openPendencies: 9,
      progressPerception: 45,
      notes: "Risco de escalada por atrasos e retrabalho.",
    },
  });

  const npsData = [
    {
      clientId: cli1.id,
      projectId: proj1.id,
      phase: "meio da implantação",
      score: 8,
      mainReason: "Boa condução técnica",
      reasonCategory: "Atendimento",
      comment: "Time técnico muito prestativo.",
      treatmentOwnerId: colCS.id,
    },
    {
      clientId: cli2.id,
      projectId: proj2.id,
      phase: "meio da implantação",
      score: 5,
      mainReason: "Atraso no cronograma",
      reasonCategory: "Prazo",
      comment: "Perdemos confiança no prazo combinado.",
      treatmentOwnerId: colGerente.id,
      actionPlan: "Plano de recuperação com ritos semanais de status.",
    },
    {
      clientId: cli3.id,
      projectId: proj3.id,
      phase: "pós-kickoff",
      score: 10,
      mainReason: "Kickoff excelente",
      reasonCategory: "Experiência",
      comment: "Expectativas bem alinhadas.",
      treatmentOwnerId: colCS.id,
    },
  ];

  for (const item of npsData) {
    const classification = npsClassification(item.score);
    await prisma.npsEntry.create({
      data: {
        ...item,
        date: datePlus(-3),
        classification,
        treatmentStatus: classification === "DETRATOR" ? "EM_TRATAMENTO" : "ABERTO",
      },
    });
  }

  await prisma.automationAlert.createMany({
    data: [
      {
        type: "CAPACIDADE",
        severity: "ALTO",
        message: "Consultor Leandro acima de 100% da capacidade útil na semana.",
        projectId: proj2.id,
      },
      {
        type: "SINGLE_POINT_OF_FAILURE",
        severity: "CRITICO",
        message: "Módulo Fiscal e Faturamento com apenas 1 especialista nível 4.",
        moduleId: modFiscal.id,
      },
      {
        type: "GO_LIVE_PROXIMO",
        severity: "MEDIO",
        message: "Projeto Boa Safra com go-live previsto em 30 dias.",
        projectId: proj1.id,
      },
    ],
  });

  const npsDetrator = await prisma.npsEntry.findFirst({
    where: { classification: "DETRATOR" },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Replanejar cronograma da Vale Verde",
        description: "Revisar marcos críticos e plano de recuperação",
        responsibleId: colGerente.id,
        dueDate: datePlus(5),
        priority: "CRITICA",
        status: "EM_ANDAMENTO",
        origin: "RISCO",
        clientId: cli2.id,
        projectId: proj2.id,
      },
      {
        title: "Plano de melhoria para NPS neutro",
        description: "Formalizar plano para elevar satisfação no próximo marco",
        responsibleId: colCS.id,
        dueDate: datePlus(7),
        priority: "ALTA",
        status: "ABERTA",
        origin: "NPS",
        clientId: cli1.id,
        projectId: proj1.id,
      },
      {
        title: "Caso de recuperação de detrator",
        description: "Conduzir plano de ação de recuperação em até 48h",
        responsibleId: colGerente.id,
        dueDate: datePlus(2),
        priority: "CRITICA",
        status: "EM_ANDAMENTO",
        origin: "AUTOMACAO",
        clientId: cli2.id,
        projectId: proj2.id,
        npsId: npsDetrator ? npsDetrator.id : null,
        healthScoreId: hs2.id,
      },
      {
        title: "Follow-up de engajamento Agronorte",
        description: "Confirmar participantes-chave das próximas reuniões",
        responsibleId: colCS.id,
        dueDate: datePlus(6),
        priority: "MEDIA",
        status: "ABERTA",
        origin: "HEALTH_SCORE",
        clientId: cli3.id,
        projectId: proj3.id,
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        entityType: "ALLOCATION",
        entityId: "seed",
        action: "CREATE",
        details: "Carga inicial de agenda criada com conflito proposital",
        userId: users[0].id,
      },
      {
        entityType: "NPS",
        entityId: "seed",
        action: "CREATE",
        details: "Registros de NPS criados para marcos de implantação",
        userId: users[4].id,
      },
      {
        entityType: "HEALTH_SCORE",
        entityId: hs1.id,
        action: "UPDATE",
        details: "Health score recalculado automaticamente",
        userId: users[4].id,
      },
    ],
  });

  console.log("Seed Agrosys concluído com sucesso.");
  console.log("Usuários de acesso: admin@agrosys.com.br / senha: agrosys123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
