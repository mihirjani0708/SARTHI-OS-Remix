import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { UserProfile, Task, Habit, Meeting, Note, JournalEntry, Goal } from '../types';
import { dataService, IDataService } from '../services/dataService';
import { createFreshHabitCollection } from '../data/initialData';
import { generateOnboardingData } from '../data/onboardingProfiles';
import { analyticsService } from '../services/analytics/analyticsService';
import { firebaseAuthService } from '../services/firebase/firebaseAuthService';

// Default User ID
export const MOCK_CURRENT_USER_ID = 'mansi';

export interface UserAccount {
  uid: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  createdAt: string;
}

export interface UserContextType {
  // Central User Object
  currentUser: UserProfile;
  currentUserId: string;
  updateProfile: (updatedProfile: Partial<UserProfile>) => void;

  // Scoped User Planner & OS Data
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  meetings: Meeting[];
  setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  journal: Record<string, JournalEntry>;
  setJournal: React.Dispatch<React.SetStateAction<Record<string, JournalEntry>>>;
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;

  // OS Settings
  settings: Record<string, any>;
  updateSettings: (newSettings: Record<string, any>) => void;

  // Authentication & Multi-user operations
  login: (emailOrPhone: string, pass: string, rememberMe?: boolean) => { success: boolean; error?: string };
  loginWithGoogle: (googleProfile: { email: string; name?: string; uid?: string }, rememberMe?: boolean) => { success: boolean; error?: string };
  loginWithApple: (appleProfile: { email: string; name?: string; uid?: string }, rememberMe?: boolean) => { success: boolean; error?: string };
  loginDemoUser: () => { success: boolean };
  register: (data: { fullName: string; phone: string; email?: string; password: string }) => { success: boolean; error?: string };
  completeOnboarding: (profileIds: string | string[]) => void;
  logout: () => void;
  switchUser: (userOrId: UserProfile | string) => void;
  resetUserData: () => void;
  isAuthenticated: boolean;

  // Direct reference to DataService for advanced operations
  dataService: IDataService;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const REGISTRY_KEY = 'sarthi_user_registry_v1';

const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    uid: 'mansi',
    name: 'Mansi Sharma',
    email: 'mansi@sarthi.ai',
    phone: '+919876543210',
    password: 'password123',
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'mihir',
    name: 'Mihir Jani',
    email: 'mihir.jani0708@gmail.com',
    phone: '+919876543211',
    password: 'mihir123',
    createdAt: new Date().toISOString(),
  },
  {
    uid: 'demo_user',
    name: 'Executive Demo User',
    email: 'demo@sarthi.ai',
    phone: '+919800000000',
    password: 'demo123',
    createdAt: new Date().toISOString(),
  },
];

function getUserRegistry(): UserAccount[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (raw) {
      const parsed: UserAccount[] = JSON.parse(raw);
      let updated = false;
      for (const defAcc of DEFAULT_ACCOUNTS) {
        if (!parsed.some((a) => a.uid === defAcc.uid || (a.email && a.email.toLowerCase() === defAcc.email.toLowerCase()))) {
          parsed.push(defAcc);
          updated = true;
        }
      }
      if (updated) {
        saveUserRegistry(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error reading user registry', e);
  }
  saveUserRegistry(DEFAULT_ACCOUNTS);
  return DEFAULT_ACCOUNTS;
}

function saveUserRegistry(accounts: UserAccount[]): void {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Error saving user registry', e);
  }
}

/** Verify and retrieve valid active user session on startup */
function getInitialActiveUserSession(): { userId: string; isAuthenticated: boolean } {
  try {
    const registry = getUserRegistry();

    // 1. Check sessionStorage (Active tab session)
    const sessionUser = sessionStorage.getItem('sarthi_auth_user') || sessionStorage.getItem('sarthi_active_session');
    if (sessionUser && sessionUser.trim() !== '') {
      const uid = sessionUser.trim();
      if (uid === 'demo_user') {
        return { userId: 'demo_user', isAuthenticated: true };
      }
      const acc = registry.find((a) => a.uid === uid || (a.email && a.email.toLowerCase() === uid.toLowerCase()));
      if (acc) {
        return { userId: acc.uid, isAuthenticated: true };
      }
    }

    // 2. Check localStorage (Remember Me session)
    const localUser = localStorage.getItem('sarthi_auth_user') || localStorage.getItem('sarthi_active_session');
    if (localUser && localUser.trim() !== '') {
      const uid = localUser.trim();
      // PART 8 REQUIREMENT: "Never automatically log in as Demo"
      if (uid === 'demo_user') {
        localStorage.removeItem('sarthi_auth_user');
        localStorage.removeItem('sarthi_active_session');
        localStorage.removeItem('sarthi_remember_me');
        return { userId: '', isAuthenticated: false };
      }

      const acc = registry.find((a) => a.uid === uid || (a.email && a.email.toLowerCase() === uid.toLowerCase()));
      if (acc) {
        return { userId: acc.uid, isAuthenticated: true };
      }
    }
  } catch (e) {
    console.error('Error checking active session:', e);
  }

  // Clear stale invalid storage keys
  localStorage.removeItem('sarthi_auth_user');
  localStorage.removeItem('sarthi_active_session');
  localStorage.removeItem('sarthi_remember_me');
  sessionStorage.removeItem('sarthi_auth_user');
  sessionStorage.removeItem('sarthi_active_session');

  return { userId: '', isAuthenticated: false };
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialSession = getInitialActiveUserSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialSession.isAuthenticated);
  const [currentUserId, setCurrentUserId] = useState<string>(initialSession.userId);

  // Track the user ID corresponding to the currently loaded in-memory state
  const loadedUserIdRef = useRef<string>(currentUserId);

  // Load user profile for current user ID
  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    dataService.getCurrentUser(currentUserId)
  );

  // Load user-scoped data via DataService strictly requiring currentUserId
  const [tasks, setTasks] = useState<Task[]>(() => dataService.getTasks(currentUserId));
  const [habits, setHabits] = useState<Habit[]>(() => dataService.getHabits(currentUserId));
  const [meetings, setMeetings] = useState<Meeting[]>(() => dataService.getMeetings(currentUserId));
  const [notes, setNotes] = useState<Note[]>(() => dataService.getNotes(currentUserId));
  const [journal, setJournal] = useState<Record<string, JournalEntry>>(() =>
    dataService.getJournalEntries(currentUserId)
  );
  const [goals, setGoals] = useState<Goal[]>(() => dataService.getGoals(currentUserId));
  const [settings, setSettings] = useState<Record<string, any>>(() =>
    dataService.getSettings(currentUserId)
  );

  // Helper function to synchronously load all application state for a user ID
  const loadUserData = (userId: string) => {
    const profile = dataService.getCurrentUser(userId);
    const userTasks = dataService.getTasks(userId);
    const userHabits = dataService.getHabits(userId);
    const userMeetings = dataService.getMeetings(userId);
    const userNotes = dataService.getNotes(userId);
    const userJournal = dataService.getJournalEntries(userId);
    const userGoals = dataService.getGoals(userId);
    const userSettings = dataService.getSettings(userId);

    setCurrentUser(profile);
    setTasks(userTasks);
    setHabits(userHabits);
    setMeetings(userMeetings);
    setNotes(userNotes);
    setJournal(userJournal);
    setGoals(userGoals);
    setSettings(userSettings);

    loadedUserIdRef.current = userId;
  };

  // Reload data if currentUserId changes and wasn't manually preloaded
  useEffect(() => {
    if (loadedUserIdRef.current !== currentUserId) {
      loadUserData(currentUserId);
    }
  }, [currentUserId]);

  // Sync state changes via DataService ONLY when the state belongs to active currentUserId
  useEffect(() => {
    if (loadedUserIdRef.current === currentUserId && currentUser.uid === currentUserId) {
      dataService.saveCurrentUser(currentUserId, currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    if (loadedUserIdRef.current === currentUserId) {
      dataService.saveTasks(currentUserId, tasks);
    }
  }, [tasks]);

  useEffect(() => {
    if (loadedUserIdRef.current === currentUserId) {
      dataService.saveHabits(currentUserId, habits);
    }
  }, [habits]);

  useEffect(() => {
    if (loadedUserIdRef.current === currentUserId) {
      dataService.saveMeetings(currentUserId, meetings);
    }
  }, [meetings]);

  useEffect(() => {
    if (loadedUserIdRef.current === currentUserId) {
      dataService.saveNotes(currentUserId, notes);
    }
  }, [notes]);

  useEffect(() => {
    if (loadedUserIdRef.current === currentUserId) {
      dataService.saveJournalEntries(currentUserId, journal);
    }
  }, [journal]);

  useEffect(() => {
    if (loadedUserIdRef.current === currentUserId) {
      dataService.saveGoals(currentUserId, goals);
    }
  }, [goals]);

  useEffect(() => {
    if (loadedUserIdRef.current === currentUserId) {
      dataService.saveSettings(currentUserId, settings);
    }
  }, [settings]);

  const updateProfile = (updatedFields: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      dataService.saveCurrentUser(currentUserId, updated);
      analyticsService.trackEvent('PROFILE_UPDATED', 'Profile', currentUserId, updatedFields);
      return updated;
    });
  };

  const updateSettings = (newSettings: Record<string, any>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      dataService.saveSettings(currentUserId, updated);
      analyticsService.trackEvent('SETTINGS_CHANGED', 'Settings', currentUserId);
      if (newSettings.theme && newSettings.theme !== prev.theme) {
        analyticsService.trackEvent('THEME_CHANGED', 'Settings', currentUserId, { theme: newSettings.theme });
      }
      if (newSettings.language && newSettings.language !== prev.language) {
        analyticsService.trackEvent('LANGUAGE_CHANGED', 'Settings', currentUserId, { language: newSettings.language });
      }
      return updated;
    });
  };

  const login = (
    emailOrPhone: string,
    pass: string,
    rememberMe: boolean = true
  ): { success: boolean; error?: string } => {
    const cleanInput = emailOrPhone.trim().toLowerCase();
    const inputDigits = emailOrPhone.replace(/\D/g, '');

    if (!cleanInput) {
      return { success: false, error: 'Please enter your email address or mobile number.' };
    }
    if (!pass || pass.trim().length === 0) {
      return { success: false, error: 'Please enter your password.' };
    }

    const registry = getUserRegistry();
    const account = registry.find((acc) => {
      const accEmail = (acc.email || '').toLowerCase();
      const accDigits = acc.phone.replace(/\D/g, '');
      const isEmailMatch = accEmail !== '' && accEmail === cleanInput;
      const isPhoneMatch =
        acc.phone.trim() === emailOrPhone.trim() ||
        (inputDigits.length >= 7 && (accDigits === inputDigits || accDigits.endsWith(inputDigits) || inputDigits.endsWith(accDigits)));
      return isEmailMatch || isPhoneMatch;
    });

    if (!account) {
      return {
        success: false,
        error: 'No account found matching this email or mobile number. Please check your details or create an account.',
      };
    }

    if (account.password && account.password !== pass) {
      return {
        success: false,
        error: 'Incorrect password. Please verify your password and try again.',
      };
    }

    if (rememberMe) {
      localStorage.setItem('sarthi_auth_user', account.uid);
      localStorage.setItem('sarthi_active_session', account.uid);
      sessionStorage.removeItem('sarthi_auth_user');
      sessionStorage.removeItem('sarthi_active_session');
    } else {
      sessionStorage.setItem('sarthi_auth_user', account.uid);
      sessionStorage.setItem('sarthi_active_session', account.uid);
      localStorage.removeItem('sarthi_auth_user');
      localStorage.removeItem('sarthi_active_session');
    }

    // Explicitly load new account data synchronously BEFORE updating state
    const profile = dataService.getCurrentUser(account.uid);
    const userTasks = dataService.getTasks(account.uid);
    const userHabits = dataService.getHabits(account.uid);
    const userMeetings = dataService.getMeetings(account.uid);
    const userNotes = dataService.getNotes(account.uid);
    const userJournal = dataService.getJournalEntries(account.uid);
    const userGoals = dataService.getGoals(account.uid);
    const userSettings = dataService.getSettings(account.uid);

    loadedUserIdRef.current = account.uid;
    setCurrentUser(profile);
    setTasks(userTasks);
    setHabits(userHabits);
    setMeetings(userMeetings);
    setNotes(userNotes);
    setJournal(userJournal);
    setGoals(userGoals);
    setSettings(userSettings);
    setCurrentUserId(account.uid);
    setIsAuthenticated(true);

    // Track Session & Login Event
    analyticsService.startSession(account.uid);
    analyticsService.trackEvent('LOGIN', 'Auth', account.uid);

    return { success: true };
  };

  const loginWithGoogle = (
    googleProfile: { email: string; name?: string; uid?: string },
    rememberMe: boolean = true
  ): { success: boolean; error?: string } => {
    const cleanEmail = (googleProfile.email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Invalid Google account email.' };
    }

    const registry = getUserRegistry();
    let account = registry.find((acc) => (acc.email || '').toLowerCase() === cleanEmail);

    if (!account) {
      const uid = googleProfile.uid || 'google_' + Date.now();
      account = {
        uid,
        name: googleProfile.name || cleanEmail.split('@')[0] || 'Google User',
        email: cleanEmail,
        phone: '+91 98765 00000',
        password: 'google_oauth_authenticated',
        createdAt: new Date().toISOString(),
      };
      registry.push(account);
      saveUserRegistry(registry);

      const newProfile: UserProfile = {
        uid,
        name: account.name,
        role: 'Executive Member',
        email: cleanEmail,
        phone: account.phone,
        currentStreak: 1,
        bestStreak: 1,
        totalHabitsCompleted: 0,
        avatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
        themeColor: 'indigo',
        joinDate: new Date().toISOString().split('T')[0],
        targetDailyHabits: 5,
        location: 'Global',
        theme: 'light',
        language: 'english',
        notificationsEnabled: true,
        needsOnboarding: false,
      };
      dataService.saveCurrentUser(uid, newProfile);
    }

    if (rememberMe) {
      localStorage.setItem('sarthi_auth_user', account.uid);
      localStorage.setItem('sarthi_active_session', account.uid);
      sessionStorage.removeItem('sarthi_auth_user');
      sessionStorage.removeItem('sarthi_active_session');
    } else {
      sessionStorage.setItem('sarthi_auth_user', account.uid);
      sessionStorage.setItem('sarthi_active_session', account.uid);
      localStorage.removeItem('sarthi_auth_user');
      localStorage.removeItem('sarthi_active_session');
    }

    loadUserData(account.uid);
    setCurrentUserId(account.uid);
    setIsAuthenticated(true);

    analyticsService.startSession(account.uid);
    analyticsService.trackEvent('LOGIN_GOOGLE', 'Auth', account.uid);

    return { success: true };
  };

  const loginWithApple = (
    appleProfile: { email: string; name?: string; uid?: string },
    rememberMe: boolean = true
  ): { success: boolean; error?: string } => {
    const cleanEmail = (appleProfile.email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Invalid Apple ID email.' };
    }

    const registry = getUserRegistry();
    let account = registry.find((acc) => (acc.email || '').toLowerCase() === cleanEmail);

    if (!account) {
      const uid = appleProfile.uid || 'apple_' + Date.now();
      account = {
        uid,
        name: appleProfile.name || cleanEmail.split('@')[0] || 'Apple User',
        email: cleanEmail,
        phone: '+91 98765 00000',
        password: 'apple_oauth_authenticated',
        createdAt: new Date().toISOString(),
      };
      registry.push(account);
      saveUserRegistry(registry);

      const newProfile: UserProfile = {
        uid,
        name: account.name,
        role: 'Executive Member',
        email: cleanEmail,
        phone: account.phone,
        currentStreak: 1,
        bestStreak: 1,
        totalHabitsCompleted: 0,
        avatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        themeColor: 'indigo',
        joinDate: new Date().toISOString().split('T')[0],
        targetDailyHabits: 5,
        location: 'Global',
        theme: 'light',
        language: 'english',
        notificationsEnabled: true,
        needsOnboarding: false,
      };
      dataService.saveCurrentUser(uid, newProfile);
    }

    if (rememberMe) {
      localStorage.setItem('sarthi_auth_user', account.uid);
      localStorage.setItem('sarthi_active_session', account.uid);
      sessionStorage.removeItem('sarthi_auth_user');
      sessionStorage.removeItem('sarthi_active_session');
    } else {
      sessionStorage.setItem('sarthi_auth_user', account.uid);
      sessionStorage.setItem('sarthi_active_session', account.uid);
      localStorage.removeItem('sarthi_auth_user');
      localStorage.removeItem('sarthi_active_session');
    }

    loadUserData(account.uid);
    setCurrentUserId(account.uid);
    setIsAuthenticated(true);

    analyticsService.startSession(account.uid);
    analyticsService.trackEvent('LOGIN_APPLE', 'Auth', account.uid);

    return { success: true };
  };

  const loginDemoUser = (): { success: boolean } => {
    const demoUid = 'demo_user';
    sessionStorage.setItem('sarthi_auth_user', demoUid);
    sessionStorage.setItem('sarthi_active_session', demoUid);
    localStorage.removeItem('sarthi_auth_user');
    localStorage.removeItem('sarthi_active_session');

    loadUserData(demoUid);
    setCurrentUserId(demoUid);
    setIsAuthenticated(true);

    analyticsService.startSession(demoUid);
    analyticsService.trackEvent('LOGIN_DEMO', 'Auth', demoUid);

    return { success: true };
  };

  const register = (data: {
    fullName: string;
    phone: string;
    email?: string;
    password: string;
  }): { success: boolean; error?: string } => {
    const fullName = data.fullName.trim();
    const phone = data.phone.trim();
    const email = (data.email || '').trim().toLowerCase();
    const password = data.password;

    if (!fullName || fullName.length < 2) {
      return { success: false, error: 'Please enter your full name.' };
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone || phoneDigits.length < 7) {
      return { success: false, error: 'Please enter a valid mobile number.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const registry = getUserRegistry();
    const existingByPhone = registry.find((acc) => {
      const accDigits = acc.phone.replace(/\D/g, '');
      return accDigits === phoneDigits || (phoneDigits.length >= 8 && accDigits.endsWith(phoneDigits));
    });

    if (existingByPhone) {
      return {
        success: false,
        error: 'An account with this mobile number already exists. Please sign in.',
      };
    }

    if (email) {
      const existingByEmail = registry.find((acc) => acc.email && acc.email.toLowerCase() === email);
      if (existingByEmail) {
        return {
          success: false,
          error: 'An account with this email address already exists. Please sign in.',
        };
      }
    }

    const uid = 'usr_' + Date.now();
    const newAccount: UserAccount = {
      uid,
      name: fullName,
      phone,
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    registry.push(newAccount);
    saveUserRegistry(registry);

    // Create user profile
    const newProfile: UserProfile = {
      uid,
      name: fullName,
      role: 'Executive Member',
      email,
      phone,
      currentStreak: 0,
      bestStreak: 0,
      totalHabitsCompleted: 0,
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      themeColor: 'indigo',
      joinDate: new Date().toISOString().split('T')[0],
      targetDailyHabits: 5,
      location: 'Global / Mumbai',
      theme: 'light',
      language: 'english',
      notificationsEnabled: true,
      needsOnboarding: true,
    };

    const freshHabits = createFreshHabitCollection();
    dataService.saveCurrentUser(uid, newProfile);
    dataService.saveTasks(uid, []);
    dataService.saveMeetings(uid, []);
    dataService.saveNotes(uid, []);
    dataService.saveGoals(uid, []);
    dataService.saveJournalEntries(uid, {});
    dataService.saveHabits(uid, freshHabits);

    localStorage.setItem('sarthi_auth_user', uid);
    localStorage.setItem('sarthi_active_session', uid);
    sessionStorage.removeItem('sarthi_auth_user');
    sessionStorage.removeItem('sarthi_active_session');

    loadedUserIdRef.current = uid;
    setCurrentUser(newProfile);
    setTasks([]);
    setMeetings([]);
    setNotes([]);
    setGoals([]);
    setJournal({});
    setHabits(freshHabits);
    setSettings(dataService.getSettings(uid));
    setCurrentUserId(uid);
    setIsAuthenticated(true);

    // Track Session & Signup Event
    analyticsService.startSession(uid);
    analyticsService.trackEvent('SIGNUP', 'Auth', uid);

    return { success: true };
  };

  const completeOnboarding = (input: string | string[]) => {
    const profileIds = Array.isArray(input) ? input : [input];
    const { habits: onboardingHabits, tasks: onboardingTasks, goals: onboardingGoals } = generateOnboardingData(profileIds);

    const ROLE_MAP: Record<string, string> = {
      student: 'Student',
      working_professional: 'Working Professional',
      it_professional: 'IT Professional',
      manager: 'Manager / Team Leader',
      entrepreneur: 'Entrepreneur',
      business_owner: 'Business Owner',
      teacher: 'Teacher',
      healthcare: 'Healthcare Professional',
      freelancer: 'Freelancer / Creator',
      homemaker: 'Homemaker',
      skip: 'Executive Member',
    };

    const selectedTitles = profileIds
      .map((id) => ROLE_MAP[id])
      .filter(Boolean);

    const newRole = selectedTitles.length > 0 ? selectedTitles.join(' & ') : 'Executive Member';

    const updatedProfile: UserProfile = {
      ...currentUser,
      profileType: profileIds[0] || 'skip',
      profileTypes: selectedTitles,
      role: newRole,
      needsOnboarding: false,
    };

    setCurrentUser(updatedProfile);
    setHabits(onboardingHabits);
    setTasks(onboardingTasks);
    setGoals(onboardingGoals);

    dataService.saveCurrentUser(currentUserId, updatedProfile);
    dataService.saveHabits(currentUserId, onboardingHabits);
    dataService.saveTasks(currentUserId, onboardingTasks);
    dataService.saveGoals(currentUserId, onboardingGoals);
  };

  const logout = () => {
    if (currentUserId) {
      analyticsService.trackEvent('LOGOUT', 'Auth', currentUserId);
      analyticsService.endSession().catch(() => {});
    }
    firebaseAuthService.logout().catch(() => {});
    localStorage.removeItem('sarthi_auth_user');
    localStorage.removeItem('sarthi_active_session');
    localStorage.removeItem('sarthi_remember_me');
    sessionStorage.removeItem('sarthi_auth_user');
    sessionStorage.removeItem('sarthi_active_session');
    setIsAuthenticated(false);
    setCurrentUserId('');
  };

  const switchUser = (userOrId: UserProfile | string) => {
    const targetId = typeof userOrId === 'string' ? userOrId : userOrId.uid;
    setCurrentUserId(targetId);
    loadUserData(targetId);
  };

  const resetUserData = () => {
    dataService.resetUserData(currentUserId);
    loadUserData(currentUserId);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        currentUserId,
        updateProfile,
        tasks,
        setTasks,
        habits,
        setHabits,
        meetings,
        setMeetings,
        notes,
        setNotes,
        journal,
        setJournal,
        goals,
        setGoals,
        settings,
        updateSettings,
        login,
        loginWithGoogle,
        loginWithApple,
        loginDemoUser,
        register,
        completeOnboarding,
        logout,
        switchUser,
        resetUserData,
        isAuthenticated,
        dataService,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
