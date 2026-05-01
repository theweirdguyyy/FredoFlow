import prisma from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';

/**
 * Create a new goal.
 */
export async function createGoal(workspaceId, userId, { title, description, dueDate, milestones }) {
  return await prisma.goal.create({
    data: {
      workspaceId,
      ownerId: userId,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      milestones: {
        create: milestones || [],
      },
    },
    include: {
      milestones: true,
    },
  });
}

/**
 * Get all goals for a workspace.
 */
export async function getWorkspaceGoals(workspaceId) {
  const goals = await prisma.goal.findMany({
    where: { workspaceId },
    include: {
      milestones: true,
      owner: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: {
        select: {
          updates: true,
          actionItems: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate progress for each goal
  return goals.map((goal) => {
    const milestoneCount = goal.milestones.length;
    const progress =
      milestoneCount > 0
        ? Math.round(
            (goal.milestones.reduce((acc, m) => acc + (m.completed ? 100 : m.progress), 0) / (milestoneCount * 100)) * 100
          )
        : 0;

    return {
      ...goal,
      progress,
      milestoneCount,
    };
  });
}

/**
 * Get goal by ID with all details.
 */
export async function getGoalById(goalId) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: {
      milestones: true,
      updates: {
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      actionItems: {
        include: {
          assignee: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
      owner: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  if (!goal) {
    throw new AppError('Goal not found', 404, 'GOAL_NOT_FOUND');
  }

  // Calculate progress
  const milestoneCount = goal.milestones.length;
  const progress =
    milestoneCount > 0
      ? Math.round(
          (goal.milestones.reduce((acc, m) => acc + (m.completed ? 100 : m.progress), 0) / (milestoneCount * 100)) * 100
        )
      : 0;

  return {
    ...goal,
    progress,
    milestoneCount,
  };
}

/**
 * Update a goal.
 */
export async function updateGoal(goalId, data) {
  const { title, description, status, dueDate } = data;

  return await prisma.goal.update({
    where: { id: goalId },
    data: {
      title,
      description,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
  });
}

/**
 * Delete a goal.
 */
export async function deleteGoal(goalId) {
  await prisma.goal.delete({
    where: { id: goalId },
  });
}

/**
 * Post a goal update.
 */
export async function postGoalUpdate(goalId, userId, content) {
  return await prisma.goalUpdate.create({
    data: {
      goalId,
      authorId: userId,
      content,
    },
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });
}
