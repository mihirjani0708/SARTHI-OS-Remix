import { Habit, Task, Goal, HabitCategory, TaskCategory, GoalCategory, GoalTimeframe, Priority } from '../types';
import { getTodayDateString } from './initialData';

export interface ProfileOption {
  id: string;
  title: string;
  emoji: string;
  description: string;
  iconName: string;
  color: string;
}

export const PROFILE_OPTIONS: ProfileOption[] = [
  {
    id: 'student',
    title: 'Student',
    emoji: '🎓',
    description: 'Focus on studies, exam prep, reading & daily physical health',
    iconName: 'GraduationCap',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'working_professional',
    title: 'Working Professional',
    emoji: '👨‍💼',
    description: 'Balance work priorities, inbox zero, daily planning & evening walks',
    iconName: 'Briefcase',
    color: 'from-indigo-500 to-[#1E3A8A]',
  },
  {
    id: 'it_professional',
    title: 'IT Professional',
    emoji: '💻',
    description: 'Deep work blocks, hourly stretches, bug fixes & tech learning',
    iconName: 'Code',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'manager',
    title: 'Manager / Team Leader',
    emoji: '👔',
    description: 'Team check-ins, KPI reviews, approvals & strategic leadership',
    iconName: 'Users',
    color: 'from-purple-600 to-indigo-700',
  },
  {
    id: 'entrepreneur',
    title: 'Entrepreneur',
    emoji: '🚀',
    description: 'Sales follow-ups, cash flow reviews, marketing & business scaling',
    iconName: 'Rocket',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'business_owner',
    title: 'Business Owner',
    emoji: '🏢',
    description: 'Dashboard metrics, vendor relations, customer calls & growth',
    iconName: 'Building2',
    color: 'from-emerald-500 to-teal-700',
  },
  {
    id: 'teacher',
    title: 'Teacher',
    emoji: '👩‍🏫',
    description: 'Lesson planning, student feedback, reading & meditation',
    iconName: 'BookOpen',
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: 'healthcare',
    title: 'Healthcare Professional',
    emoji: '🏥',
    description: 'Hydration, patient care, stretch breaks & documentation',
    iconName: 'HeartPulse',
    color: 'from-teal-500 to-emerald-600',
  },
  {
    id: 'freelancer',
    title: 'Freelancer / Creator',
    emoji: '🎨',
    description: 'Deep work, client communication, invoicing & portfolio building',
    iconName: 'Palette',
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'homemaker',
    title: 'Homemaker',
    emoji: '🏠',
    description: 'Home organization, meal planning, family time & wellness',
    iconName: 'Home',
    color: 'from-orange-500 to-amber-600',
  },
  {
    id: 'skip',
    title: 'Skip for Now',
    emoji: '✨',
    description: 'Start with generic daily productivity, water intake & meditation',
    iconName: 'Sparkles',
    color: 'from-slate-600 to-slate-800',
  },
];

export function getSingleProfileData(profileId: string) {
  const todayStr = getTodayDateString();

  let habits: Habit[] = [];
  let tasks: Task[] = [];
  let goals: Goal[] = [];

  switch (profileId) {
    case 'student':
      habits = [
        {
          id: 'h-std-1',
          name: 'Study 2 Hours',
          category: 'Mind',
          routine: 'morning',
          iconName: 'BookOpen',
          description: 'Dedicated focus block for core academic subjects.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-std-2',
          name: 'Drink 2L Water',
          category: 'Body',
          routine: 'morning',
          iconName: 'Droplet',
          description: 'Hydrate well throughout the study day.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-std-3',
          name: 'Exercise 30 Minutes',
          category: 'Body',
          routine: 'morning',
          iconName: 'Activity',
          description: 'Keep your energy high with daily physical exercise.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-std-4',
          name: 'Read 20 Pages',
          category: 'Mind',
          routine: 'evening',
          iconName: 'Sparkles',
          description: 'Read educational literature or self-improvement books.',
          completedDates: {},
          streak: 0,
        },
      ];

      tasks = [
        {
          id: 't-std-1',
          title: 'Complete Assignment',
          priority: 'High',
          category: 'Personal',
          status: 'todo',
          dueDate: todayStr,
          time: '10:00 AM',
          notes: 'Finish pending coursework assignment and review before submission.',
        },
        {
          id: 't-std-2',
          title: 'Revise Notes',
          priority: 'Medium',
          category: 'Personal',
          status: 'todo',
          dueDate: todayStr,
          time: '02:00 PM',
          notes: 'Go through today’s class notes and summarize key points.',
        },
        {
          id: 't-std-3',
          title: 'Practice Questions',
          priority: 'Medium',
          category: 'Personal',
          status: 'todo',
          dueDate: todayStr,
          time: '04:30 PM',
          notes: 'Solve mock exam practice problems.',
        },
        {
          id: 't-std-4',
          title: 'Plan Tomorrow',
          priority: 'Low',
          category: 'Personal',
          status: 'todo',
          dueDate: todayStr,
          time: '08:00 PM',
          notes: 'Prepare books, schedule, and goals for tomorrow.',
        },
      ];

      goals = [
        {
          id: 'g-std-1',
          title: 'Score Excellent Marks',
          category: 'Personal',
          timeframe: 'Yearly',
          targetDate: '2026-12-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Maintain top academic standing and excel in exams.',
          milestones: [
            { id: 'm-std-1-1', title: 'Complete Term 1 Syllabus', completed: false },
            { id: 'm-std-1-2', title: 'Score 90%+ in Midterms', completed: false },
            { id: 'm-std-1-3', title: 'Final Exam Preparation', completed: false },
          ],
        },
        {
          id: 'g-std-2',
          title: 'Build Daily Study Habit',
          category: 'Mindset',
          timeframe: 'Q3 2026',
          targetDate: '2026-09-30',
          currentProgress: 0,
          targetProgress: 30,
          unit: 'days',
          status: 'active',
          description: 'Sustain a consistent 30-day streak of uninterrupted study time.',
          milestones: [
            { id: 'm-std-2-1', title: '7 Days Consistent Streak', completed: false },
            { id: 'm-std-2-2', title: '15 Days Milestone', completed: false },
            { id: 'm-std-2-3', title: '30 Days Master Streak', completed: false },
          ],
        },
        {
          id: 'g-std-3',
          title: 'Stay Healthy',
          category: 'Health',
          timeframe: 'Monthly',
          targetDate: '2026-08-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Maintain daily physical exercise, proper sleep, and hydration.',
          milestones: [
            { id: 'm-std-3-1', title: 'Drink 2L Water Daily', completed: false },
            { id: 'm-std-3-2', title: 'Workout 5 Days a Week', completed: false },
          ],
        },
      ];
      break;

    case 'working_professional':
      habits = [
        {
          id: 'h-wp-1',
          name: 'Morning Planning',
          category: 'Discipline',
          routine: 'morning',
          iconName: 'Zap',
          description: 'Review day priorities before starting work.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-wp-2',
          name: 'Drink Water',
          category: 'Body',
          routine: 'morning',
          iconName: 'Droplet',
          description: 'Stay active and hydrated throughout office hours.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-wp-3',
          name: 'Inbox Zero',
          category: 'Discipline',
          routine: 'morning',
          iconName: 'CheckCircle2',
          description: 'Process urgent emails and clear backlog daily.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-wp-4',
          name: 'Evening Walk',
          category: 'Body',
          routine: 'evening',
          iconName: 'Footprints',
          description: 'Unwind after work with a relaxing 30-min walk.',
          completedDates: {},
          streak: 0,
        },
      ];

      tasks = [
        {
          id: 't-wp-1',
          title: 'Complete Priority Work',
          priority: 'High',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '09:30 AM',
          notes: 'Focus on top deliverable for the week.',
        },
        {
          id: 't-wp-2',
          title: 'Follow-up Emails',
          priority: 'High',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '11:00 AM',
          notes: 'Respond to pending client and internal inquiries.',
        },
        {
          id: 't-wp-3',
          title: 'Team Update',
          priority: 'Medium',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '02:00 PM',
          notes: 'Share progress sync with team members.',
        },
        {
          id: 't-wp-4',
          title: 'Review Calendar',
          priority: 'Low',
          category: 'Personal',
          status: 'todo',
          dueDate: todayStr,
          time: '05:30 PM',
          notes: 'Prepare agenda for upcoming meetings tomorrow.',
        },
      ];

      goals = [
        {
          id: 'g-wp-1',
          title: 'Career Growth',
          category: 'Business',
          timeframe: 'Yearly',
          targetDate: '2026-12-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Achieve promotion / key milestone in career track.',
          milestones: [
            { id: 'm-wp-1-1', title: 'Complete Professional Certification', completed: false },
            { id: 'm-wp-1-2', title: 'Deliver Key High-Impact Project', completed: false },
          ],
        },
        {
          id: 'g-wp-2',
          title: 'Improve Productivity',
          category: 'Personal',
          timeframe: 'Q3 2026',
          targetDate: '2026-09-30',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Optimize workflow to complete work during business hours.',
          milestones: [
            { id: 'm-wp-2-1', title: 'Implement Time-Blocking System', completed: false },
            { id: 'm-wp-2-2', title: 'Eliminate Daily Distractions', completed: false },
          ],
        },
        {
          id: 'g-wp-3',
          title: 'Maintain Work-Life Balance',
          category: 'Personal',
          timeframe: 'Monthly',
          targetDate: '2026-08-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Ensure dedicated personal & family time every evening.',
          milestones: [
            { id: 'm-wp-3-1', title: 'Disconnect Electronics by 9 PM', completed: false },
            { id: 'm-wp-3-2', title: 'Weekend Work-Free Commitment', completed: false },
          ],
        },
      ];
      break;

    case 'it_professional':
      habits = [
        {
          id: 'h-it-1',
          name: 'Deep Work',
          category: 'Discipline',
          routine: 'morning',
          iconName: 'Zap',
          description: 'Block 2 hours of distraction-free coding/architecture focus.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-it-2',
          name: 'Stretch Every Hour',
          category: 'Body',
          routine: 'morning',
          iconName: 'Activity',
          description: 'Prevent posture fatigue with quick 1-min stretches.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-it-3',
          name: 'Learn Something New',
          category: 'Mind',
          routine: 'evening',
          iconName: 'BookOpen',
          description: 'Read tech blogs, docs, or practice system design.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-it-4',
          name: 'Exercise',
          category: 'Body',
          routine: 'morning',
          iconName: 'Activity',
          description: 'Cardio or weight training to maintain physical stamina.',
          completedDates: {},
          streak: 0,
        },
      ];

      tasks = [
        {
          id: 't-it-1',
          title: 'Fix High Priority Bug',
          priority: 'High',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '09:00 AM',
          notes: 'Debug issue reported in production logs and submit hotfix.',
        },
        {
          id: 't-it-2',
          title: 'Code Review',
          priority: 'High',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '11:30 AM',
          notes: 'Review pending Pull Requests from teammates.',
        },
        {
          id: 't-it-3',
          title: 'Update Documentation',
          priority: 'Medium',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '02:30 PM',
          notes: 'Document new API endpoints and system architecture.',
        },
        {
          id: 't-it-4',
          title: 'Sprint Planning',
          priority: 'Medium',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '04:00 PM',
          notes: 'Estimate user stories for upcoming sprint.',
        },
      ];

      goals = [
        {
          id: 'g-it-1',
          title: 'Learn New Technology',
          category: 'Mindset',
          timeframe: 'Q3 2026',
          targetDate: '2026-09-30',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Master cloud architecture or AI development tools.',
          milestones: [
            { id: 'm-it-1-1', title: 'Complete Online Course Modules', completed: false },
            { id: 'm-it-1-2', title: 'Build Proof-of-Concept App', completed: false },
          ],
        },
        {
          id: 'g-it-2',
          title: 'Complete Current Sprint',
          category: 'Business',
          timeframe: 'Monthly',
          targetDate: '2026-08-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Deliver all assigned user stories on schedule with zero critical bugs.',
          milestones: [
            { id: 'm-it-2-1', title: 'Finish Core Feature Branch', completed: false },
            { id: 'm-it-2-2', title: 'Pass Automated Tests', completed: false },
          ],
        },
        {
          id: 'g-it-3',
          title: 'Improve Coding Skills',
          category: 'Personal',
          timeframe: 'Yearly',
          targetDate: '2026-12-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Refactor legacy modules and optimize algorithm performance.',
          milestones: [
            { id: 'm-it-3-1', title: 'Solve 50 LeetCode / System Design Problems', completed: false },
            { id: 'm-it-3-2', title: 'Contribute to Open Source or Tech Blog', completed: false },
          ],
        },
      ];
      break;

    case 'manager':
      habits = [
        {
          id: 'h-mgr-1',
          name: 'Team Check-in',
          category: 'Business',
          routine: 'morning',
          iconName: 'Users',
          description: 'Morning sync to unblock team members.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-mgr-2',
          name: 'KPI Review',
          category: 'Business',
          routine: 'morning',
          iconName: 'Target',
          description: 'Monitor key team performance metrics daily.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-mgr-3',
          name: 'Exercise',
          category: 'Body',
          routine: 'morning',
          iconName: 'Activity',
          description: 'Physical workout to maintain executive stamina.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-mgr-4',
          name: 'Read Business News',
          category: 'Mind',
          routine: 'evening',
          iconName: 'BookOpen',
          description: 'Stay updated with market trends & industry insights.',
          completedDates: {},
          streak: 0,
        },
      ];

      tasks = [
        {
          id: 't-mgr-1',
          title: 'Review KPI',
          priority: 'High',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '09:00 AM',
          notes: 'Analyze weekly performance dashboards and team throughput.',
        },
        {
          id: 't-mgr-2',
          title: 'Team Meeting',
          priority: 'High',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '10:30 AM',
          notes: 'Conduct daily standup & address operational bottlenecks.',
        },
        {
          id: 't-mgr-3',
          title: 'Approve Pending Items',
          priority: 'Medium',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '02:00 PM',
          notes: 'Sign off on pending requests, budgets, and leave approvals.',
        },
        {
          id: 't-mgr-4',
          title: 'Business Review',
          priority: 'High',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '04:00 PM',
          notes: 'Prepare executive summary for leadership board.',
        },
      ];

      goals = [
        {
          id: 'g-mgr-1',
          title: 'Build High Performance Team',
          category: 'Business',
          timeframe: 'Q3 2026',
          targetDate: '2026-09-30',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Empower team members and achieve top employee satisfaction.',
          milestones: [
            { id: 'm-mgr-1-1', title: 'Conduct 1-on-1 Coaching Sessions', completed: false },
            { id: 'm-mgr-1-2', title: 'Optimize Team Workflow Process', completed: false },
          ],
        },
        {
          id: 'g-mgr-2',
          title: 'Improve Leadership',
          category: 'Mindset',
          timeframe: 'Yearly',
          targetDate: '2026-12-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Enhance strategic communication and decision-making skills.',
          milestones: [
            { id: 'm-mgr-2-1', title: 'Complete Executive Leadership Seminar', completed: false },
            { id: 'm-mgr-2-2', title: 'Read 5 Management Books', completed: false },
          ],
        },
        {
          id: 'g-mgr-3',
          title: 'Deliver Monthly Targets',
          category: 'Business',
          timeframe: 'Monthly',
          targetDate: '2026-08-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Hit 100% of team key metrics on time.',
          milestones: [
            { id: 'm-mgr-3-1', title: 'Mid-Month Milestone Audit', completed: false },
            { id: 'm-mgr-3-2', title: 'Final Deliverable Sign-off', completed: false },
          ],
        },
      ];
      break;

    case 'entrepreneur':
      habits = [
        {
          id: 'h-ent-1',
          name: 'Sales Follow-up',
          category: 'Business',
          routine: 'morning',
          iconName: 'TrendingUp',
          description: 'Connect with prospective high-ticket leads daily.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-ent-2',
          name: 'Exercise',
          category: 'Body',
          routine: 'morning',
          iconName: 'Activity',
          description: 'Morning workout for founder endurance.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-ent-3',
          name: 'Read 10 Pages',
          category: 'Mind',
          routine: 'evening',
          iconName: 'BookOpen',
          description: 'Read growth, marketing or strategy literature.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-ent-4',
          name: 'Gratitude Journal',
          category: 'Spirit',
          routine: 'evening',
          iconName: 'Sun',
          description: 'Write 3 daily wins and gratitude notes.',
          completedDates: {},
          streak: 0,
        },
      ];

      tasks = [
        {
          id: 't-ent-1',
          title: 'Meet Customers',
          priority: 'High',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '10:00 AM',
          notes: 'Key client demo & discovery call.',
        },
        {
          id: 't-ent-2',
          title: 'Marketing Plan',
          priority: 'High',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '11:30 AM',
          notes: 'Review campaign metrics and customer acquisition cost.',
        },
        {
          id: 't-ent-3',
          title: 'Cash Flow Review',
          priority: 'High',
          category: 'Finance',
          status: 'todo',
          dueDate: todayStr,
          time: '02:30 PM',
          notes: 'Audit monthly revenues, expenses, and burn rate.',
        },
        {
          id: 't-ent-4',
          title: 'Team Review',
          priority: 'Medium',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '04:30 PM',
          notes: 'Sync with core team leads on product delivery.',
        },
      ];

      goals = [
        {
          id: 'g-ent-1',
          title: 'Increase Revenue',
          category: 'Finance',
          timeframe: 'Q3 2026',
          targetDate: '2026-09-30',
          currentProgress: 0,
          targetProgress: 50000,
          unit: '$',
          status: 'active',
          description: 'Scale monthly recurring revenue by acquiring new accounts.',
          milestones: [
            { id: 'm-ent-1-1', title: 'Close First 10 Enterprise Deals', completed: false },
            { id: 'm-ent-1-2', title: 'Launch Upsell Campaign', completed: false },
          ],
        },
        {
          id: 'g-ent-2',
          title: 'Build Strong Team',
          category: 'Business',
          timeframe: 'Yearly',
          targetDate: '2026-12-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Recruit key talent for growth, sales, and engineering.',
          milestones: [
            { id: 'm-ent-2-1', title: 'Hire Head of Marketing', completed: false },
            { id: 'm-ent-2-2', title: 'Establish Performance Culture', completed: false },
          ],
        },
        {
          id: 'g-ent-3',
          title: 'Scale Business',
          category: 'Business',
          timeframe: 'Yearly',
          targetDate: '2026-12-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Expand company presence into new geographic regions.',
          milestones: [
            { id: 'm-ent-3-1', title: 'Complete Market Analysis', completed: false },
            { id: 'm-ent-3-2', title: 'Secure Growth Capital', completed: false },
          ],
        },
      ];
      break;

    case 'business_owner':
      habits = [
        {
          id: 'h-bo-1',
          name: 'Dashboard Review',
          category: 'Business',
          routine: 'morning',
          iconName: 'Target',
          description: 'Check store/business sales and stock performance early.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-bo-2',
          name: 'Customer Calls',
          category: 'Business',
          routine: 'morning',
          iconName: 'Phone',
          description: 'Speak to VIP clients for feedback and relationship building.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-bo-3',
          name: 'Vendor Follow-up',
          category: 'Business',
          routine: 'morning',
          iconName: 'CheckCircle2',
          description: 'Ensure timely delivery of supplier shipments.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-bo-4',
          name: 'Exercise',
          category: 'Body',
          routine: 'morning',
          iconName: 'Activity',
          description: 'Daily morning exercise for vitality and clear focus.',
          completedDates: {},
          streak: 0,
        },
      ];

      tasks = [
        {
          id: 't-bo-1',
          title: 'Inventory Review',
          priority: 'High',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '09:30 AM',
          notes: 'Audit stock movement and restock fast-moving inventory.',
        },
        {
          id: 't-bo-2',
          title: 'Vendor Follow-up',
          priority: 'Medium',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '11:00 AM',
          notes: 'Confirm dispatch dates for new merchandise.',
        },
        {
          id: 't-bo-3',
          title: 'Payment Collection',
          priority: 'High',
          category: 'Finance',
          status: 'todo',
          dueDate: todayStr,
          time: '02:00 PM',
          notes: 'Follow up on pending invoices and receivables.',
        },
        {
          id: 't-bo-4',
          title: 'Sales Review',
          priority: 'High',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '05:00 PM',
          notes: 'Review end-of-day sales totals across outlets.',
        },
      ];

      goals = [
        {
          id: 'g-bo-1',
          title: 'Grow Business',
          category: 'Business',
          timeframe: 'Q3 2026',
          targetDate: '2026-09-30',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Expand sales volume across core retail & online channels.',
          milestones: [
            { id: 'm-bo-1-1', title: 'Open 1 New Store / Channel', completed: false },
            { id: 'm-bo-1-2', title: 'Increase Monthly Footfall by 25%', completed: false },
          ],
        },
        {
          id: 'g-bo-2',
          title: 'Improve Customer Satisfaction',
          category: 'Personal',
          timeframe: 'Monthly',
          targetDate: '2026-08-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Maintain 95%+ positive customer feedback rating.',
          milestones: [
            { id: 'm-bo-2-1', title: 'Implement Loyalty Rewards Program', completed: false },
            { id: 'm-bo-2-2', title: 'Train Staff on Hospitality Excellence', completed: false },
          ],
        },
        {
          id: 'g-bo-3',
          title: 'Increase Profitability',
          category: 'Finance',
          timeframe: 'Yearly',
          targetDate: '2026-12-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Reduce operating overheads and optimize supplier margins.',
          milestones: [
            { id: 'm-bo-3-1', title: 'Renegotiate Vendor Pricing', completed: false },
            { id: 'm-bo-3-2', title: 'Achieve Net Margin Target', completed: false },
          ],
        },
      ];
      break;

    case 'teacher':
      habits = [
        {
          id: 'h-tch-1',
          name: 'Lesson Planning',
          category: 'Mind',
          routine: 'morning',
          iconName: 'BookOpen',
          description: 'Prepare interactive teaching materials for classes.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-tch-2',
          name: 'Reading',
          category: 'Mind',
          routine: 'evening',
          iconName: 'BookOpen',
          description: 'Read academic literature and pedagogical insights.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-tch-3',
          name: 'Walking',
          category: 'Body',
          routine: 'evening',
          iconName: 'Footprints',
          description: 'Evening brisk walk to decompress after teaching.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-tch-4',
          name: 'Meditation',
          category: 'Spirit',
          routine: 'morning',
          iconName: 'HeartHandshake',
          description: '10 minutes of mindfulness before starting the school day.',
          completedDates: {},
          streak: 0,
        },
      ];

      tasks = [
        {
          id: 't-tch-1',
          title: 'Prepare Lecture',
          priority: 'High',
          category: 'Personal',
          status: 'todo',
          dueDate: todayStr,
          time: '08:00 AM',
          notes: 'Organize slides, handouts, and class discussion topics.',
        },
        {
          id: 't-tch-2',
          title: 'Check Assignments',
          priority: 'High',
          category: 'Personal',
          status: 'todo',
          dueDate: todayStr,
          time: '11:30 AM',
          notes: 'Grade student papers and provide constructive notes.',
        },
        {
          id: 't-tch-3',
          title: 'Student Feedback',
          priority: 'Medium',
          category: 'Personal',
          status: 'todo',
          dueDate: todayStr,
          time: '02:00 PM',
          notes: 'Schedule 1-on-1 guidance for students needing assistance.',
        },
        {
          id: 't-tch-4',
          title: 'Parent Communication',
          priority: 'Medium',
          category: 'Personal',
          status: 'todo',
          dueDate: todayStr,
          time: '04:00 PM',
          notes: 'Send weekly updates to parents regarding progress.',
        },
      ];

      goals = [
        {
          id: 'g-tch-1',
          title: 'Better Student Outcomes',
          category: 'Personal',
          timeframe: 'Q3 2026',
          targetDate: '2026-09-30',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Improve class average performance and subject engagement.',
          milestones: [
            { id: 'm-tch-1-1', title: 'Introduce Interactive Quizzes', completed: false },
            { id: 'm-tch-1-2', title: 'Achieve 90%+ Class Mastery', completed: false },
          ],
        },
        {
          id: 'g-tch-2',
          title: 'Continuous Learning',
          category: 'Mindset',
          timeframe: 'Yearly',
          targetDate: '2026-12-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Attend educational workshops and adopt modern teaching techniques.',
          milestones: [
            { id: 'm-tch-2-1', title: 'Complete Teaching Certification Course', completed: false },
            { id: 'm-tch-2-2', title: 'Publish Educational Article', completed: false },
          ],
        },
        {
          id: 'g-tch-3',
          title: 'Work-Life Balance',
          category: 'Health',
          timeframe: 'Monthly',
          targetDate: '2026-08-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Finish lesson grading during school hours to keep evenings free.',
          milestones: [
            { id: 'm-tch-3-1', title: 'Set Evening Off-Limits Time', completed: false },
            { id: 'm-tch-3-2', title: 'Daily Evening Walk Streak', completed: false },
          ],
        },
      ];
      break;

    case 'healthcare':
      habits = [
        {
          id: 'h-hc-1',
          name: 'Hydration',
          category: 'Body',
          routine: 'morning',
          iconName: 'Droplet',
          description: 'Drink water regularly during busy hospital/clinic shifts.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-hc-2',
          name: 'Stretch Break',
          category: 'Body',
          routine: 'morning',
          iconName: 'Activity',
          description: 'Quick body stretch between patient consultations.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-hc-3',
          name: 'Exercise',
          category: 'Body',
          routine: 'morning',
          iconName: 'Activity',
          description: 'Cardio or workout for physical endurance.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-hc-4',
          name: 'Reading',
          category: 'Mind',
          routine: 'evening',
          iconName: 'BookOpen',
          description: 'Read medical updates or personal development literature.',
          completedDates: {},
          streak: 0,
        },
      ];

      tasks = [
        {
          id: 't-hc-1',
          title: 'Review Patient Schedule',
          priority: 'High',
          category: 'Health',
          status: 'todo',
          dueDate: todayStr,
          time: '08:00 AM',
          notes: 'Audit today’s appointments, surgeries, or rounds.',
        },
        {
          id: 't-hc-2',
          title: 'Complete Documentation',
          priority: 'High',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '11:00 AM',
          notes: 'Update medical records and patient charts accurately.',
        },
        {
          id: 't-hc-3',
          title: 'Team Handover',
          priority: 'Medium',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '03:00 PM',
          notes: 'Brief incoming shift doctors/nurses on critical cases.',
        },
        {
          id: 't-hc-4',
          title: 'Medication Review',
          priority: 'High',
          category: 'Health',
          status: 'todo',
          dueDate: todayStr,
          time: '05:00 PM',
          notes: 'Verify treatment protocols and prescription supplies.',
        },
      ];

      goals = [
        {
          id: 'g-hc-1',
          title: 'Better Patient Care',
          category: 'Health',
          timeframe: 'Q3 2026',
          targetDate: '2026-09-30',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Provide empathetic, high-precision healthcare to all patients.',
          milestones: [
            { id: 'm-hc-1-1', title: 'Implement Patient Feedback System', completed: false },
            { id: 'm-hc-1-2', title: 'Zero Clinical Documentation Delay', completed: false },
          ],
        },
        {
          id: 'g-hc-2',
          title: 'Professional Development',
          category: 'Mindset',
          timeframe: 'Yearly',
          targetDate: '2026-12-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Attend medical conferences and earn specialty credits.',
          milestones: [
            { id: 'm-hc-2-1', title: 'Complete Continuing Education Credits', completed: false },
            { id: 'm-hc-2-2', title: 'Present Research Case Study', completed: false },
          ],
        },
        {
          id: 'g-hc-3',
          title: 'Personal Wellness',
          category: 'Health',
          timeframe: 'Monthly',
          targetDate: '2026-08-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Prioritize restorative sleep and physical rest.',
          milestones: [
            { id: 'm-hc-3-1', title: '7+ Hours Sleep Target', completed: false },
            { id: 'm-hc-3-2', title: 'Weekly Wellness Day', completed: false },
          ],
        },
      ];
      break;

    case 'freelancer':
      habits = [
        {
          id: 'h-fl-1',
          name: 'Deep Work',
          category: 'Discipline',
          routine: 'morning',
          iconName: 'Zap',
          description: 'Uninterrupted creative/client project focus block.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-fl-2',
          name: 'Client Follow-up',
          category: 'Business',
          routine: 'morning',
          iconName: 'Mail',
          description: 'Check in with existing and potential clients daily.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-fl-3',
          name: 'Learning',
          category: 'Mind',
          routine: 'evening',
          iconName: 'BookOpen',
          description: 'Upgrade creative skills, tools, or industry craft.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-fl-4',
          name: 'Exercise',
          category: 'Body',
          routine: 'morning',
          iconName: 'Activity',
          description: 'Stay active to avoid sedentary desk fatigue.',
          completedDates: {},
          streak: 0,
        },
      ];

      tasks = [
        {
          id: 't-fl-1',
          title: 'Finish Client Project',
          priority: 'High',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '10:00 AM',
          notes: 'Complete milestone deliverable and send preview link.',
        },
        {
          id: 't-fl-2',
          title: 'Send Invoice',
          priority: 'High',
          category: 'Finance',
          status: 'todo',
          dueDate: todayStr,
          time: '12:00 PM',
          notes: 'Issue invoice for completed project phase.',
        },
        {
          id: 't-fl-3',
          title: 'Follow-up Client',
          priority: 'Medium',
          category: 'Business',
          status: 'todo',
          dueDate: todayStr,
          time: '03:00 PM',
          notes: 'Ping prospective client on proposal decision.',
        },
        {
          id: 't-fl-4',
          title: 'Portfolio Update',
          priority: 'Low',
          category: 'Personal',
          status: 'todo',
          dueDate: todayStr,
          time: '05:30 PM',
          notes: 'Add recent work case study to personal website.',
        },
      ];

      goals = [
        {
          id: 'g-fl-1',
          title: 'Grow Client Base',
          category: 'Business',
          timeframe: 'Q3 2026',
          targetDate: '2026-09-30',
          currentProgress: 0,
          targetProgress: 10,
          unit: 'clients',
          status: 'active',
          description: 'Secure retainers with 10 high-value recurring clients.',
          milestones: [
            { id: 'm-fl-1-1', title: 'Pitch 20 Targeted Leads', completed: false },
            { id: 'm-fl-1-2', title: 'Sign First 5 Retainers', completed: false },
          ],
        },
        {
          id: 'g-fl-2',
          title: 'Increase Income',
          category: 'Finance',
          timeframe: 'Yearly',
          targetDate: '2026-12-31',
          currentProgress: 0,
          targetProgress: 35000,
          unit: '$',
          status: 'active',
          description: 'Scale annual freelance revenue by raising rates.',
          milestones: [
            { id: 'm-fl-2-1', title: 'Update Pricing Package Sheet', completed: false },
            { id: 'm-fl-2-2', title: 'Achieve $3K Monthly Income Mark', completed: false },
          ],
        },
        {
          id: 'g-fl-3',
          title: 'Learn New Skills',
          category: 'Mindset',
          timeframe: 'Monthly',
          targetDate: '2026-08-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Master advanced software tools or AI workflows.',
          milestones: [
            { id: 'm-fl-3-1', title: 'Complete Masterclass Series', completed: false },
            { id: 'm-fl-3-2', title: 'Apply Skill to Live Client Work', completed: false },
          ],
        },
      ];
      break;

    case 'homemaker':
      habits = [
        {
          id: 'h-hm-1',
          name: 'Morning Planning',
          category: 'Discipline',
          routine: 'morning',
          iconName: 'Zap',
          description: 'Organize household tasks & family schedule.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-hm-2',
          name: 'Walk',
          category: 'Body',
          routine: 'morning',
          iconName: 'Footprints',
          description: '30 minutes morning walk for fitness.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-hm-3',
          name: 'Water Intake',
          category: 'Body',
          routine: 'morning',
          iconName: 'Droplet',
          description: 'Drink 2+ Litres of water throughout the day.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-hm-4',
          name: 'Family Time',
          category: 'Spirit',
          routine: 'evening',
          iconName: 'HeartHandshake',
          description: 'Dedicated evening quality time with loved ones.',
          completedDates: {},
          streak: 0,
        },
      ];

      tasks = [
        {
          id: 't-hm-1',
          title: 'Grocery Shopping',
          priority: 'Medium',
          category: 'Personal',
          status: 'todo',
          dueDate: todayStr,
          time: '09:30 AM',
          notes: 'Purchase fresh vegetables, fruits, and essentials.',
        },
        {
          id: 't-hm-2',
          title: 'Home Cleaning',
          priority: 'Medium',
          category: 'Personal',
          status: 'todo',
          dueDate: todayStr,
          time: '11:00 AM',
          notes: 'Complete morning home organization.',
        },
        {
          id: 't-hm-3',
          title: 'Meal Planning',
          priority: 'High',
          category: 'Personal',
          status: 'todo',
          dueDate: todayStr,
          time: '02:00 PM',
          notes: 'Plan healthy dinner menu and prep ingredients.',
        },
        {
          id: 't-hm-4',
          title: 'Family Budget',
          priority: 'High',
          category: 'Finance',
          status: 'todo',
          dueDate: todayStr,
          time: '05:00 PM',
          notes: 'Log monthly household expenditures.',
        },
      ];

      goals = [
        {
          id: 'g-hm-1',
          title: 'Healthy Family',
          category: 'Health',
          timeframe: 'Q3 2026',
          targetDate: '2026-09-30',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Provide balanced nutrition and wellness for all family members.',
          milestones: [
            { id: 'm-hm-1-1', title: 'Prepare Balanced Daily Meal Plan', completed: false },
            { id: 'm-hm-1-2', title: 'Schedule Family Health Checkups', completed: false },
          ],
        },
        {
          id: 'g-hm-2',
          title: 'Better Daily Routine',
          category: 'Personal',
          timeframe: 'Monthly',
          targetDate: '2026-08-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Create a smooth, stress-free household schedule.',
          milestones: [
            { id: 'm-hm-2-1', title: 'Establish Morning Routine', completed: false },
            { id: 'm-hm-2-2', title: 'Organize Storage & Pantry', completed: false },
          ],
        },
        {
          id: 'g-hm-3',
          title: 'Personal Growth',
          category: 'Mindset',
          timeframe: 'Yearly',
          targetDate: '2026-12-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Dedicate 1 hour daily to reading, hobbies, or skill building.',
          milestones: [
            { id: 'm-hm-3-1', title: 'Read 12 Personal Growth Books', completed: false },
            { id: 'm-hm-3-2', title: 'Master a New Creative Skill', completed: false },
          ],
        },
      ];
      break;

    case 'skip':
    default:
      habits = [
        {
          id: 'h-skp-1',
          name: 'Drink Water',
          category: 'Body',
          routine: 'morning',
          iconName: 'Droplet',
          description: 'Hydrate well throughout the day.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-skp-2',
          name: 'Exercise',
          category: 'Body',
          routine: 'morning',
          iconName: 'Activity',
          description: '30 minutes of physical activity.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-skp-3',
          name: 'Healthy Food',
          category: 'Body',
          routine: 'morning',
          iconName: 'Sparkles',
          description: 'Eat clean, wholesome meals.',
          completedDates: {},
          streak: 0,
        },
        {
          id: 'h-skp-4',
          name: 'Meditation',
          category: 'Spirit',
          routine: 'morning',
          iconName: 'HeartHandshake',
          description: '10 minutes of morning mindfulness.',
          completedDates: {},
          streak: 0,
        },
      ];

      tasks = [
        {
          id: 't-skp-1',
          title: 'Plan Your Day',
          priority: 'High',
          category: 'Personal',
          status: 'todo',
          dueDate: todayStr,
          time: '09:00 AM',
          notes: 'Identify top 3 priorities for today.',
        },
        {
          id: 't-skp-2',
          title: 'Complete Priority Work',
          priority: 'High',
          category: 'Personal',
          status: 'todo',
          dueDate: todayStr,
          time: '11:00 AM',
          notes: 'Focus on your most important task.',
        },
        {
          id: 't-skp-3',
          title: 'Exercise',
          priority: 'Medium',
          category: 'Health',
          status: 'todo',
          dueDate: todayStr,
          time: '05:00 PM',
          notes: 'Walk, gym, or home workout.',
        },
        {
          id: 't-skp-4',
          title: 'Read 20 Minutes',
          priority: 'Medium',
          category: 'Personal',
          status: 'todo',
          dueDate: todayStr,
          time: '09:00 PM',
          notes: 'Read a book before going to bed.',
        },
      ];

      goals = [
        {
          id: 'g-skp-1',
          title: 'Become More Productive',
          category: 'Personal',
          timeframe: 'Q3 2026',
          targetDate: '2026-09-30',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Build daily systems for task completion and clarity.',
          milestones: [
            { id: 'm-skp-1-1', title: 'Complete Daily Planner for 14 Days', completed: false },
            { id: 'm-skp-1-2', title: 'Review Weekly Outcomes', completed: false },
          ],
        },
        {
          id: 'g-skp-2',
          title: 'Stay Healthy',
          category: 'Health',
          timeframe: 'Monthly',
          targetDate: '2026-08-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Maintain regular workouts and positive habits.',
          milestones: [
            { id: 'm-skp-2-1', title: 'Workout 4 Days a Week', completed: false },
            { id: 'm-skp-2-2', title: 'Drink 2L Water Daily', completed: false },
          ],
        },
        {
          id: 'g-skp-3',
          title: 'Achieve Personal Growth',
          category: 'Mindset',
          timeframe: 'Yearly',
          targetDate: '2026-12-31',
          currentProgress: 0,
          targetProgress: 100,
          unit: '%',
          status: 'active',
          description: 'Develop mindset, resilience, and personal clarity.',
          milestones: [
            { id: 'm-skp-3-1', title: 'Read 6 Self-Improvement Books', completed: false },
            { id: 'm-skp-3-2', title: 'Journal Reflections Weekly', completed: false },
          ],
        },
      ];
      break;
  }

  return { habits, tasks, goals };
}

export function generateOnboardingData(input: string | string[]) {
  const profileIds = Array.isArray(input) ? input : [input];

  const rawHabits: Habit[] = [];
  const rawTasks: Task[] = [];
  const rawGoals: Goal[] = [];

  for (const id of profileIds) {
    const data = getSingleProfileData(id);
    rawHabits.push(...data.habits);
    rawTasks.push(...data.tasks);
    rawGoals.push(...data.goals);
  }

  // Deduplicate habits by name
  const habitMap = new Map<string, Habit>();
  for (const h of rawHabits) {
    const key = h.name.trim().toLowerCase();
    if (!habitMap.has(key)) {
      habitMap.set(key, h);
    }
  }

  // Deduplicate tasks by title
  const taskMap = new Map<string, Task>();
  for (const t of rawTasks) {
    const key = t.title.trim().toLowerCase();
    if (!taskMap.has(key)) {
      taskMap.set(key, t);
    }
  }

  // Deduplicate goals by title
  const goalMap = new Map<string, Goal>();
  for (const g of rawGoals) {
    const key = g.title.trim().toLowerCase();
    if (!goalMap.has(key)) {
      goalMap.set(key, g);
    }
  }

  // Capped: Habits max 6, Tasks max 6, Goals max 4
  const habits = Array.from(habitMap.values()).slice(0, 6).map((h, i) => ({
    ...h,
    id: `h-onb-${i + 1}`,
  }));

  const tasks = Array.from(taskMap.values()).slice(0, 6).map((t, i) => ({
    ...t,
    id: `t-onb-${i + 1}`,
  }));

  const goals = Array.from(goalMap.values()).slice(0, 4).map((g, i) => ({
    ...g,
    id: `g-onb-${i + 1}`,
  }));

  return { habits, tasks, goals };
}
