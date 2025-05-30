import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Achievement,
  Domain,
  Quest,
  Rank,
  Skill,
  UserProfile,
  PersonalProfile,
  HealthMetrics,
  ProfessionalGoals,
  LearningPreferences,
  AccountabilitySettings,
  CommunicationPreferences
} from './types';

interface ProdigyState {
  user: UserProfile;
  skills: Skill[];
  quests: Quest[];
  achievements: Achievement[];
  domainRanks: Record<Domain, Rank>;
  
  // Actions
  updateUser: (user: Partial<UserProfile>) => void;
  updatePersonalProfile: (profile: PersonalProfile) => void;
  updateHealthMetrics: (metrics: HealthMetrics) => void;
  updateProfessionalGoals: (goals: ProfessionalGoals) => void;
  updateLearningPreferences: (prefs: LearningPreferences) => void;
  updateAccountabilitySettings: (settings: AccountabilitySettings) => void;
  updateCommunicationPreferences: (prefs: CommunicationPreferences) => void;
  addSkill: (skill: Skill) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  addXp: (skillId: string, amount: number) => void;
  addQuest: (quest: Quest) => void;
  completeQuest: (id: string) => void;
  unlockAchievement: (id: string) => void;
  calculateRank: (domain: Domain) => Rank;
  addProgressEntry: (metrics: Record<string, number>, notes: string) => void;
}

const calculateRankFromXp = (xp: number): Rank => {
  if (xp >= 10000) return 'SSS';
  if (xp >= 7500) return 'SS';
  if (xp >= 5000) return 'S';
  if (xp >= 3000) return 'A';
  if (xp >= 1500) return 'B';
  if (xp >= 750) return 'C';
  if (xp >= 250) return 'D';
  return 'E';
};

export const useProdigyStore = create<ProdigyState>()(
  persist(
    (set, get) => ({
      user: {
        name: 'Hunter',
        title: 'Novice Explorer',
        rank: 'E',
        totalXp: 0,
        joinDate: new Date(),
        streak: 0,
        lastActive: new Date(),
        progressHistory: [],
      },
      skills: [],
      quests: [],
      achievements: [],
      domainRanks: {
        Physical: 'E',
        Mental: 'E',
        Technical: 'E',
        Creative: 'E',
      },

      updateUser: (updates) => 
        set((state) => ({
          user: { ...state.user, ...updates }
        })),

      updatePersonalProfile: (profile) =>
        set((state) => ({
          user: { ...state.user, personalProfile: profile }
        })),

      updateHealthMetrics: (metrics) =>
        set((state) => ({
          user: { ...state.user, healthMetrics: metrics }
        })),

      updateProfessionalGoals: (goals) =>
        set((state) => ({
          user: { ...state.user, professionalGoals: goals }
        })),

      updateLearningPreferences: (prefs) =>
        set((state) => ({
          user: { ...state.user, learningPreferences: prefs }
        })),

      updateAccountabilitySettings: (settings) =>
        set((state) => ({
          user: { ...state.user, accountabilitySettings: settings }
        })),

      updateCommunicationPreferences: (prefs) =>
        set((state) => ({
          user: { ...state.user, communicationPreferences: prefs }
        })),

      addProgressEntry: (metrics, notes) =>
        set((state) => ({
          user: {
            ...state.user,
            progressHistory: [
              ...state.user.progressHistory,
              {
                date: new Date(),
                metrics,
                notes
              }
            ]
          }
        })),

      addSkill: (skill) => 
        set((state) => ({
          skills: [...state.skills, skill]
        })),

      updateSkill: (id, updates) => 
        set((state) => ({
          skills: state.skills.map(skill => 
            skill.id === id ? { ...skill, ...updates } : skill
          )
        })),

      addXp: (skillId, amount) => {
        const state = get();
        const skill = state.skills.find(s => s.id === skillId);
        
        if (!skill) return;
        
        const newXp = skill.xp + amount;
        const levelUps = Math.floor(newXp / skill.xpToNextLevel);
        const remainingXp = newXp % skill.xpToNextLevel;
        const newLevel = skill.level + levelUps;
        const newXpToNextLevel = skill.xpToNextLevel * (levelUps > 0 ? 1.5 : 1);
        
        // Update skill metrics
        const updatedMetrics = {
          ...skill.metrics,
          lastUpdated: new Date(),
          progressHistory: [
            ...(skill.metrics?.progressHistory || []),
            {
              date: new Date(),
              value: newXp,
              notes: `Gained ${amount} XP`
            }
          ]
        };
        
        state.updateSkill(skillId, {
          xp: remainingXp,
          level: newLevel,
          xpToNextLevel: newXpToNextLevel,
          metrics: updatedMetrics
        });
        
        // Update total XP and user rank
        state.updateUser({ 
          totalXp: state.user.totalXp + amount,
          rank: calculateRankFromXp(state.user.totalXp + amount)
        });
        
        // Recalculate domain ranks
        const domain = skill.domain;
        const domainSkills = state.skills.filter(s => s.domain === domain);
        const domainXp = domainSkills.reduce((sum, s) => sum + s.xp, 0);
        const domainRank = calculateRankFromXp(domainXp);
        
        set((state) => ({
          domainRanks: {
            ...state.domainRanks,
            [domain]: domainRank
          }
        }));
      },

      addQuest: (quest) => 
        set((state) => ({
          quests: [...state.quests, {
            ...quest,
            metrics: {
              startDate: new Date(),
              checkpoints: [],
              consequences: quest.metrics?.consequences
            }
          }]
        })),

      completeQuest: (id) => {
        const state = get();
        const quest = state.quests.find(q => q.id === id);
        
        if (!quest || quest.completed) return;
        
        // Mark quest as completed
        set((state) => ({
          quests: state.quests.map(q => 
            q.id === id ? {
              ...q,
              completed: true,
              metrics: {
                ...q.metrics,
                checkpoints: [
                  ...(q.metrics?.checkpoints || []),
                  {
                    date: new Date(),
                    description: 'Quest completed',
                    completed: true
                  }
                ]
              }
            } : q
          )
        }));
        
        // Find a skill in the quest's domain to award XP
        const domainSkills = state.skills.filter(s => s.domain === quest.domain);
        if (domainSkills.length > 0) {
          // Award XP to the first skill in that domain
          state.addXp(domainSkills[0].id, quest.xpReward);
        }
      },

      unlockAchievement: (id) => 
        set((state) => ({
          achievements: state.achievements.map(a => 
            a.id === id && !a.dateUnlocked 
              ? { ...a, dateUnlocked: new Date() } 
              : a
          )
        })),

      calculateRank: (domain) => {
        const state = get();
        const domainSkills = state.skills.filter(s => s.domain === domain);
        const domainXp = domainSkills.reduce((sum, s) => sum + s.xp, 0);
        return calculateRankFromXp(domainXp);
      }
    }),
    {
      name: 'prodigy-protocol-storage',
    }
  )
);