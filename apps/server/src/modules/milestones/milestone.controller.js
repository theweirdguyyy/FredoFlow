import * as milestoneService from './milestone.service.js';
import { getIO } from '../../config/socket.js';

/**
 * POST /api/v1/workspaces/:workspaceId/goals/:goalId/milestones
 */
export async function createMilestone(req, res, next) {
  try {
    const { goalId } = req.params;
    const milestone = await milestoneService.createMilestone(goalId, req.body);

    res.status(201).json({
      success: true,
      data: { milestone },
      message: 'Milestone created successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/workspaces/:workspaceId/goals/:goalId/milestones/:milestoneId
 */
export async function updateMilestone(req, res, next) {
  try {
    const { workspaceId, goalId, milestoneId } = req.params;
    const { progress } = req.body;

    const milestone = await milestoneService.updateMilestone(milestoneId, req.body);

    // Emit socket event for progress update
    if (progress !== undefined) {
      try {
        const io = getIO();
        io.to(`workspace:${workspaceId}`).emit('PROGRESS_POSTED', {
          workspaceId,
          goalId,
          milestoneId,
          progress,
          updatedBy: req.user.id,
        });
      } catch (err) {
        console.error('Socket emission failed:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      data: { milestone },
      message: 'Milestone updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/workspaces/:workspaceId/goals/:goalId/milestones/:milestoneId
 */
export async function deleteMilestone(req, res, next) {
  try {
    await milestoneService.deleteMilestone(req.params.milestoneId);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Milestone deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
