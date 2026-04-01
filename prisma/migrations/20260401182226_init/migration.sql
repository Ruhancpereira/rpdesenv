-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Collaborator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "dailyHours" REAL NOT NULL,
    "weeklyHours" REAL NOT NULL,
    "nominalCapacity" REAL NOT NULL,
    "usefulCapacity" REAL NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "managerName" TEXT,
    "notes" TEXT,
    "cityRegion" TEXT NOT NULL,
    "canTravel" BOOLEAN NOT NULL DEFAULT false,
    "remoteEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Core" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "criticality" TEXT NOT NULL DEFAULT 'MEDIO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BusinessModule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "criticality" TEXT NOT NULL DEFAULT 'MEDIO',
    "minimumCapacitated" INTEGER NOT NULL DEFAULT 1,
    "coreId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BusinessModule_coreId_fkey" FOREIGN KEY ("coreId") REFERENCES "Core" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Submodule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "criticality" TEXT NOT NULL DEFAULT 'MEDIO',
    "moduleId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Submodule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "BusinessModule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CollaboratorSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collaboratorId" TEXT NOT NULL,
    "coreId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CollaboratorSkill_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "Collaborator" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollaboratorSkill_coreId_fkey" FOREIGN KEY ("coreId") REFERENCES "Core" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollaboratorSkill_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "BusinessModule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "corporateName" TEXT NOT NULL,
    "tradeName" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "companySize" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "mainContact" TEXT NOT NULL,
    "executiveSponsor" TEXT,
    "implementationStatus" TEXT NOT NULL DEFAULT 'PLANEJADO',
    "currentRisk" TEXT NOT NULL DEFAULT 'MEDIO',
    "startDate" DATETIME NOT NULL,
    "goLiveForecast" DATETIME NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "csOwnerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANEJADO',
    "currentPhase" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIA',
    "criticality" TEXT NOT NULL DEFAULT 'MEDIO',
    "startDate" DATETIME NOT NULL,
    "targetEndDate" DATETIME NOT NULL,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "projectRisk" TEXT NOT NULL DEFAULT 'MEDIO',
    "clientPending" TEXT,
    "internalPending" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Project_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Collaborator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_csOwnerId_fkey" FOREIGN KEY ("csOwnerId") REFERENCES "Collaborator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectConsultant" (
    "projectId" TEXT NOT NULL,
    "collaboratorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("projectId", "collaboratorId"),
    CONSTRAINT "ProjectConsultant_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectConsultant_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "Collaborator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectPhase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "checklist" TEXT,
    "responsibleId" TEXT NOT NULL,
    "plannedDate" DATETIME NOT NULL,
    "actualDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'NAO_INICIADA',
    "impediments" TEXT,
    "entryCriteria" TEXT,
    "exitCriteria" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectPhase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectPhase_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "Collaborator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Allocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collaboratorId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "coreId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "allocatedHours" REAL NOT NULL,
    "location" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "requester" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIA',
    "agendaStatus" TEXT NOT NULL DEFAULT 'PLANEJADA',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Allocation_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "Collaborator" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Allocation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Allocation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Allocation_coreId_fkey" FOREIGN KEY ("coreId") REFERENCES "Core" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Allocation_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "BusinessModule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "csOwnerId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "escalationRisk" BOOLEAN NOT NULL DEFAULT false,
    "engagement" INTEGER NOT NULL DEFAULT 0,
    "scheduleAdherence" INTEGER NOT NULL DEFAULT 0,
    "meetingPresence" INTEGER NOT NULL DEFAULT 0,
    "openPendencies" INTEGER NOT NULL DEFAULT 0,
    "progressPerception" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HealthScore_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HealthScore_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HealthScore_csOwnerId_fkey" FOREIGN KEY ("csOwnerId") REFERENCES "Collaborator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NpsEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "mainReason" TEXT NOT NULL,
    "reasonCategory" TEXT NOT NULL,
    "treatmentOwnerId" TEXT,
    "actionPlan" TEXT,
    "treatmentStatus" TEXT NOT NULL DEFAULT 'ABERTO',
    "classification" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NpsEntry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NpsEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NpsEntry_treatmentOwnerId_fkey" FOREIGN KEY ("treatmentOwnerId") REFERENCES "Collaborator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "responsibleId" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIA',
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "origin" TEXT NOT NULL,
    "clientId" TEXT,
    "projectId" TEXT,
    "npsId" TEXT,
    "healthScoreId" TEXT,
    "comments" TEXT,
    "attachmentUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "Collaborator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_npsId_fkey" FOREIGN KEY ("npsId") REFERENCES "NpsEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_healthScoreId_fkey" FOREIGN KEY ("healthScoreId") REFERENCES "HealthScore" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AutomationAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "projectId" TEXT,
    "moduleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AutomationAlert_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AutomationAlert_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "BusinessModule" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "userId" TEXT,
    "collaboratorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "Collaborator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Collaborator_email_key" ON "Collaborator"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Core_name_key" ON "Core"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessModule_name_coreId_key" ON "BusinessModule"("name", "coreId");

-- CreateIndex
CREATE UNIQUE INDEX "Submodule_name_moduleId_key" ON "Submodule"("name", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "CollaboratorSkill_collaboratorId_moduleId_key" ON "CollaboratorSkill"("collaboratorId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectPhase_projectId_name_key" ON "ProjectPhase"("projectId", "name");
