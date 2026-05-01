import prisma from '../../config/db.js';

/**
 * Create a new milestone for a goal.
 */
export async function createMilestone(goalId, { title, progress, dueDate }) {
  return await prisma.milestone.create({
    data: {
      goalId,
      title,
      progress: progress || 0,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
}

/**
 * Update a milestone.
 */
export async function updateMilestone(milestoneId, data) {
  const { title, progress, completed, dueDate } = data;

  return await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      title,
      progress,
      completed,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
  });
}

/**
 * Delete a milestone.
 */
export async function deleteMilestone(milestoneId) {
  await prisma.milestone.delete({
    where: { id: milestoneId },
  });
}
