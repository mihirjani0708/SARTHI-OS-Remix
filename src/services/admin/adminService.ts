/**
 * adminService.ts
 * Core Admin Service handling authentication checks, authorization, and dashboard data aggregation.
 */
import { UserProfile } from '../../types';
import { adminAnalyticsService, AdminDashboardMetrics } from './adminAnalyticsService';
import { userReportService, UserReportRow } from './userReportService';

export interface AdminDataSummary {
  metrics: AdminDashboardMetrics;
  users: UserReportRow[];
  timestamp: string;
}

export class AdminService {
  /** Check whether a given email or profile has owner/admin privileges */
  public isAdminUser(userOrEmail?: string | UserProfile | null): boolean {
    if (!userOrEmail) return false;

    let email = '';
    let role = '';

    if (typeof userOrEmail === 'string') {
      email = userOrEmail.toLowerCase();
    } else {
      email = (userOrEmail.email || '').toLowerCase();
      role = (userOrEmail.role || '').toLowerCase();
    }

    if (
      email === 'mihir.jani0708@gmail.com' ||
      email === 'mihir@sarthi.os' ||
      email.includes('admin') ||
      role === 'admin' ||
      role.includes('owner')
    ) {
      return true;
    }

    return false;
  }

  /** Aggregate complete Admin Dashboard Dataset */
  public getAdminDashboardData(): AdminDataSummary {
    return {
      metrics: adminAnalyticsService.calculateDashboardMetrics(),
      users: userReportService.getUserReports(),
      timestamp: new Date().toISOString(),
    };
  }
}

export const adminService = new AdminService();
