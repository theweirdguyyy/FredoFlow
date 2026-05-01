export const ROLES = { ADMIN: 'ADMIN', MEMBER: 'MEMBER' };

export const GOAL_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const ACTION_ITEM_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE',
};

export const PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};

export const NOTIFICATION_TYPES = {
  MENTION: 'MENTION',
  GOAL_ASSIGNED: 'GOAL_ASSIGNED',
  ITEM_ASSIGNED: 'ITEM_ASSIGNED',
  WORKSPACE_INVITE: 'WORKSPACE_INVITE',
  GOAL_COMPLETED: 'GOAL_COMPLETED',
  ANNOUNCEMENT_POSTED: 'ANNOUNCEMENT_POSTED',
};

export const SOCKET_EVENTS = {
  NEW_ANNOUNCEMENT: 'new_announcement',
  NEW_REACTION: 'new_reaction',
  NEW_COMMENT: 'new_comment',
  ANNOUNCEMENT_PINNED: 'announcement_pinned',
  GOAL_UPDATED: 'goal_updated',
  PROGRESS_POSTED: 'progress_posted',
  ACTION_ITEM_MOVED: 'action_item_moved',
  ACTION_ITEM_CREATED: 'action_item_created',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  ONLINE_MEMBERS: 'online_members',
  NEW_NOTIFICATION: 'new_notification',
  JOIN_WORKSPACE: 'join_workspace',
  LEAVE_WORKSPACE: 'leave_workspace',
};
