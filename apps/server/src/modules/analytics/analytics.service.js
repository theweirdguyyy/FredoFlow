import prisma from '../../config/db.js';

/**
 * Get aggregated workspace stats.
 */
export async function getWorkspaceStats(workspaceId) {
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

  const [goalsByStatus, weeklyCompletedItems, overdueItems, totalMembers] = await Promise.all([
    // Goals by status
    prisma.goal.groupBy({
      by: ['status'],
      where: { workspaceId },
      _count: true,
    }),

    // Action items completed this week
    prisma.actionItem.count({
      where: {
        workspaceId,
        status: 'DONE',
        updatedAt: { gte: startOfWeek },
      },
    }),

    // Overdue action items
    prisma.actionItem.count({
      where: {
        workspaceId,
        status: { not: 'DONE' },
        dueDate: { lt: now },
      },
    }),

    // Total members
    prisma.workspaceMember.count({
      where: { workspaceId },
    }),
  ]);

  // Format goals by status for easier consumption
  const goalsStats = goalsByStatus.reduce((acc, curr) => {
    acc[curr.status] = curr._count;
    return acc;
  }, {});

  return {
    goalsStats,
    weeklyCompletedItems,
    overdueItems,
    totalMembers,
  };
}

/**
 * Get monthly goal completion data for the last 6 months.
 */
export async function getGoalCompletionData(workspaceId) {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      name: d.toLocaleString('default', { month: 'short' }),
      start: new Date(d.getFullYear(), d.getMonth(), 1),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    });
  }

  const completionHistory = await Promise.all(
    months.map(async (month) => {
      const count = await prisma.goal.count({
        where: {
          workspaceId,
          status: 'COMPLETED',
          updatedAt: {
            gte: month.start,
            lte: month.end,
          },
        },
      });
      return { month: month.name, completed: count };
    })
  );

  return completionHistory;
}

/**
 * Export workspace data.
 */
export async function exportWorkspaceCSV(workspaceId) {
  const [goals, actionItems, members] = await Promise.all([
    prisma.goal.findMany({
      where: { workspaceId },
      select: { title: true, status: true, dueDate: true, createdAt: true },
    }),
    prisma.actionItem.findMany({
      where: { workspaceId },
      select: { title: true, status: true, priority: true, dueDate: true },
    }),
    prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return {
    goals,
    actionItems,
    members: members.map((m) => ({
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
  };
}

/**
 * Get audit logs for a workspace with pagination and filters.
 */
export async function getAuditLog(workspaceId, { actorId, entityType, page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;

  const where = {
    workspaceId,
    ...(actorId && { actorId }),
    ...(entityType && { entityType }),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
