export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export type Domain = 'Physical' | 'Mental' | 'Technical' | 'Creative';

export type QuestDifficulty = 'Easy' | 'Medium' | 'Hard';

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'streak_freezer' | 'xp_booster' | 'coin_multiplier' | 'badge' | 'frame';
  duration?: number; // in hours for temporary items
  effect?: {
    multiplier?: number;
    protection?: number; // days for streak freezer
  };
  tier?: 'bronze' | 'silver' | 'gold' | 'legendary';
  owned?: boolean;
  active?: boolean;
  expiresAt?: Date;
};

export type ActiveBoost = {
  id: string;
  type: 'xp_booster' | 'coin_multiplier';
  multiplier: number;
  expiresAt: Date;
};

export type QuestChain = {
  id: string;
  name: string;
  description: string;
  quests: string[]; // quest IDs
  bonusReward: number;
  completed: boolean;
};
export type PersonalProfile = {
  name: string;
  age: number;
  physicalMetrics: {
    height: number;
    weight: number;
    bodyType: string;
  };
  location: string;
  schedule: {
    dailyCommitments: string[];
    preferredStudyHours: string[];
  };
  languages: string[];
};

export type HealthMetrics = {
  exerciseRoutine: string;
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  bodyGoals: string[];
  medicalConditions: string[];
  dietaryPreferences: string[];
  sleepSchedule: {
    bedtime: string;
    wakeTime: string;
    quality: number;
  };
};

export type ProfessionalGoals = {
  currentStatus: string;
  industry: string;
  targetSkills: string[];
  careerGoals: {
    sixMonths: string[];
    oneYear: string[];
    fiveYears: string[];
  };
  workEnvironment: string[];
};

export type LearningPreferences = {
  learningStyle: 'Visual' | 'Auditory' | 'Kinesthetic';
  availableHours: number;
  knowledgeGaps: string[];
  currentResources: string[];
  toolsProficiency: Record<string, number>;
};

export type AccountabilitySettings = {
  checkInFrequency: 'Daily' | 'Weekly' | 'Monthly';
  motivationTriggers: string[];
  consequences: {
    type: 'Financial' | 'Assignment' | 'Social' | 'Physical' | 'Custom';
    details: string;
  }[];
  trackingMethod: string;
  rewards: string[];
};

export type CommunicationPreferences = {
  contactMethod: string;
  updateFrequency: {
    progressReports: 'Daily' | 'Weekly' | 'Monthly';
    learningOpportunities: boolean;
    careerOpenings: boolean;
    fitnessUpdates: boolean;
    achievements: boolean;
  };
  reminderStyle: 'Encouraging' | 'Strict' | 'Neutral';
};

export type Skill = {
  id: string;
  name: string;
  domain: Domain;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins?: number;
  metrics?: {
    startDate: Date;
    lastUpdated: Date;
    progressHistory: {
      date: Date;
      value: number;
      notes: string;
    }[];
    relatedQuests: string[];
  };
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  domain: Domain;
  difficulty: QuestDifficulty;
  xpReward: number;
  coinReward: number;
  completed: boolean;
  isDaily?: boolean;
  refreshDate?: Date;
  deadline?: Date;
  chainId?: string;
  completionCriteria?: string[];
  punishment?: {
    type: 'coin_loss' | 'streak_break' | 'xp_penalty';
    amount: number;
    description: string;
  };
  metrics?: {
    startDate: Date;
    checkpoints: {
      date: Date;
      description: string;
      completed: boolean;
    }[];
    consequences?: {
      type: 'Financial' | 'Assignment' | 'Social' | 'Physical' | 'Custom';
      details: string;
    };
  };
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  dateUnlocked: Date | null;
  requirements: string;
  category?: 'Physical' | 'Mental' | 'Technical' | 'Creative' | 'Special';
  progressMetrics?: {
    current: number;
    target: number;
    history: {
      date: Date;
      value: number;
    }[];
  };
};

export type UserProfile = {
  name: string;
  title: string;
  rank: Rank;
  totalXp: number;
  coins: number;
  level: number;
  joinDate: Date;
  streak: number;
  streakFreezeActive: boolean;
  streakFreezeExpires?: Date;
  lastActive: Date;
  lastQuestRefresh: Date;
  dailyLoginStreak: number;
  lastDailyLogin: Date;
  activeBoosts: ActiveBoost[];
  ownedItems: string[];
  equippedFrame?: string;
  equippedBadges: string[];
  personalProfile?: PersonalProfile;
  healthMetrics?: HealthMetrics;
  professionalGoals?: ProfessionalGoals;
  learningPreferences?: LearningPreferences;
  accountabilitySettings?: AccountabilitySettings;
  communicationPreferences?: CommunicationPreferences;
  progressHistory: {
    date: Date;
    metrics: Record<string, number>;
    notes: string;
  }[];
  milestones: {
    id: string;
    name: string;
    description: string;
    achieved: boolean;
    achievedAt?: Date;
    reward: {
      coins: number;
      items?: string[];
    };
  }[];
};