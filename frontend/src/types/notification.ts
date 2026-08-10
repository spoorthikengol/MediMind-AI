export type NotificationType =
  | "report_uploaded"
  | "analysis_completed"
  | "high_risk_detected"
  | "score_improved"
  | "score_decreased"
  | "follow_up_reminder"
  | "doctor_recommendation"
  | "system";

export type NotificationPriority = "info" | "warning" | "critical";

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  is_read: boolean;
  created_at: string;
}