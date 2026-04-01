import { prisma } from "@/lib/prisma";

export async function appendAudit({ entityType, entityId, action, details, userId, collaboratorId }) {
  return prisma.auditLog.create({
    data: {
      entityType,
      entityId,
      action,
      details: details || null,
      userId: userId || null,
      collaboratorId: collaboratorId || null,
    },
  });
}
