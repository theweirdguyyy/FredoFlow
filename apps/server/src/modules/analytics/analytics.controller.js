import * as analyticsService from './analytics.service.js';

/**
 * GET /api/v1/workspaces/:workspaceId/analytics/stats
 */
export async function getWorkspaceStats(req, res, next) {
  try {
    const stats = await analyticsService.getWorkspaceStats(req.params.workspaceId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/workspaces/:workspaceId/analytics/charts
 */
export async function getGoalCompletionData(req, res, next) {
  try {
    const data = await analyticsService.getGoalCompletionData(req.params.workspaceId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/workspaces/:workspaceId/analytics/export
 */
export async function exportWorkspaceCSV(req, res, next) {
  try {
    const data = await analyticsService.exportWorkspaceCSV(req.params.workspaceId);

    // Returning JSON arrays as requested for conversion on the frontend or elsewhere
    res.status(200).json({
      success: true,
      data,
      message: 'Workspace data exported successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/workspaces/:workspaceId/analytics/audit-log
 */
export async function getAuditLog(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const { actorId, entityType, page, limit } = req.query;

    const data = await analyticsService.getAuditLog(workspaceId, {
      actorId,
      entityType,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
