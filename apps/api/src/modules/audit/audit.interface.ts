export enum AuditAction {
  USER_REGISTER = 'USER_REGISTER',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_UPDATE = 'USER_UPDATE',
  ADMIN_VIEW_USER = 'ADMIN_VIEW_USER',
  ADMIN_VIEW_USERS = 'ADMIN_VIEW_USERS',
}

export interface IAudit {
  userId: string;
  action: AuditAction;
  resource?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
}