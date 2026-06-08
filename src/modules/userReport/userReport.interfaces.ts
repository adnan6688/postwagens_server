export interface ReportedUser {
  id: string;
  type: string;
  report: string;
  blockedId?: string;
  userId?: string;
  userInfo?: Record<string, any>;
}
