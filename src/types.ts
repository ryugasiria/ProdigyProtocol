export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export type Domain = 'Physical' | 'Mental' | 'Technical' | 'Creative';

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
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  xpReward: number;
  completed: boolean;
  deadline?: Date;
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
  joinDate: Date;
  streak: number;
  lastActive: Date;
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
};