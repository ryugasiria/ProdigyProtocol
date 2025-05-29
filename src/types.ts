export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export type Domain = 'Physical' | 'Mental' | 'Technical' | 'Creative';

export type Skill = {
  id: string;
  name: string;
  domain: Domain;
  level: number;
  xp: number;
  xpToNextLevel: number;
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
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  dateUnlocked: Date | null;
  requirements: string;
};

export type UserProfile = {
  name: string;
  title: string;
  rank: Rank;
  totalXp: number;
  joinDate: Date;
  streak: number;
  lastActive: Date;
};