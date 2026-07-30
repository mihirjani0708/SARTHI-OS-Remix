/**
 * userReportService.ts
 * Service for aggregating user account details and activity status for SARTHI Admin Dashboard.
 */
import { AuthService } from '../modules/authService';
import { StorageFactory } from '../storage/StorageFactory';

export interface UserReportRow {
  uid: string;
  name: string;
  email: string;
  mobile: string;
  signupDate: string;
  lastLogin: string;
  device: string;
  storageMode: string;
  accountStatus: 'Active' | 'Pending' | 'Suspended';
}

export class UserReportService {
  private authService = new AuthService();

  public getUserReports(): UserReportRow[] {
    const registry = this.authService.getRegistry();
    const currentMode = StorageFactory.getStorageMode();

    if (!registry || registry.length === 0) {
      // Default fallback account if empty
      return [
        {
          uid: 'mihir-owner',
          name: 'Mihir Jani (Owner)',
          email: 'mihir.jani0708@gmail.com',
          mobile: '+91 9876543210',
          signupDate: new Date().toISOString().split('T')[0],
          lastLogin: new Date().toISOString().split('T')[0],
          device: typeof navigator !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'Web Client',
          storageMode: currentMode.toUpperCase(),
          accountStatus: 'Active',
        },
      ];
    }

    return registry.map((acc) => ({
      uid: acc.uid,
      name: acc.name || 'SARTHI Executive',
      email: acc.email || 'N/A',
      mobile: acc.phone || 'N/A',
      signupDate: acc.createdAt ? acc.createdAt.split('T')[0] : '2026-07-30',
      lastLogin: new Date().toISOString().split('T')[0],
      device: typeof navigator !== 'undefined' ? 'Desktop / Web' : 'Mobile Web',
      storageMode: currentMode.toUpperCase(),
      accountStatus: 'Active',
    }));
  }
}

export const userReportService = new UserReportService();
