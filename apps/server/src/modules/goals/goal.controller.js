import * as goalService from './goal.service.js';
import { getIO } from '../../config/socket.js';
import { logAction } from '../audit/audit-log.service.js';

/**
 * POST /api/v1/workspaces/:workspaceId/goals
 */
export async function createGoal(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const goal = await goalService.createGoal(workspaceId, req.user.id, req.body);
    
    await logAction(workspaceId, req.user.id, 'GOAL_CREATED', { goalId: goal.id, title: goal.title });

    res.status(201).json({
      success: true,
      data: { goal },
      message: 'Goal created successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/workspaces/:workspaceId/goals
 */
export async function getWorkspaceGoals(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const goals = await goalService.getWorkspaceGoals(workspaceId);

    res.status(200).json({
      success: true,
      data: { goals },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/workspaces/:workspaceId/goals/:goalId
 */
export async function getGoalById(req, res, next) {
  try {
    const goal = await goalService.getGoalById(req.params.goalId);

    res.status(200).json({
      success: true,
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/workspaces/:workspaceId/goals/:goalId
 */
export async function updateGoal(req, res, next) {
  try {
    const { workspaceId, goalId } = req.params;
    const { status } = req.body;

    const oldGoal = await goalService.getGoalById(goalId);
    const goal = await goalService.updateGoal(goalId, req.body);

    await logAction(workspaceId, req.user.id, 'GOAL_UPDATED', { goalId, updates: req.body });

    // Emit socket event if status changed
    if (status && status !== oldGoal.status) {
      try {
        const io = getIO();
        io.to(`workspace:${workspaceId}`).emit('GOAL_UPDATED', {
          goalId,
          status,
          updatedBy: req.user.id,
        });
      } catch (err) {
        console.error('Socket emission failed:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      data: { goal },
      message: 'Goal updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/workspaces/:workspaceId/goals/:goalId
 */
export async function deleteGoal(req, res, next) {
  try {
    await goalService.deleteGoal(req.params.goalId);
    
    await logAction(req.params.workspaceId, req.user.id, 'GOAL_DELETED', { goalId: req.params.goalId });

    res.status(200).json({
      success: true,
      data: null,
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/workspaces/:workspaceId/goals/:goalId/updates
 */
export async function postGoalUpdate(req, res, next) {
  try {
    const { goalId } = req.params;
    const { content } = req.body;
    const update = await goalService.postGoalUpdate(goalId, req.user.id, content);

    res.status(201).json({
      success: true,
      data: { update },
      message: 'Update posted successfully',
    });
  } catch (error) {
    next(error);
  }
}
