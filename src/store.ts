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

// Utility function to safely calculate rank
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
  removeSkill: (id: string) => void;
  removeQuest: (id: string) => void;
}

const calculateRankFromXp = (xp: number): Rank => {
  if (typeof xp !== 'number' || isNaN(xp) || xp < 0) return 'E';
  if (xp >= 10000) return 'SSS';
  if (xp >= 7500) return 'SS';
  if (xp >= 5000) return 'S';
  if (xp >= 3000) return 'A';
  if (xp >= 1500) return 'B';
  if (xp >= 750) return 'C';
  if (xp >= 250) return 'D';
  return 'E';
};

// Utility function to safely calculate level progression
const calculateLevelProgression = (currentXp: number, currentLevel: number, xpToNext: number) => {
  if (typeof currentXp !== 'number' || currentXp < 0) return { level: currentLevel, remainingXp: 0, newXpToNext: xpToNext };
  
  const levelUps = Math.floor(currentXp / xpToNext);
  const remainingXp = currentXp % xpToNext;
  const newLevel = currentLevel + levelUps;
  const newXpToNext = Math.floor(xpToNext * Math.pow(1.2, levelUps)); // More balanced progression
  
  return { level: newLevel, remainingXp, newXpToNext };
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
        if (typeof amount !== 'number' || amount <= 0) return;
        
        const state = get();
        const skill = state.skills.find(s => s.id === skillId);
        
        if (!skill) return;
        
        const { level: newLevel, remainingXp, newXpToNext } = calculateLevelProgression(
          skill.xp + amount,
          skill.level,
          skill.xpToNextLevel
        );
        
        // Update skill metrics
        const updatedMetrics = {
          startDate: skill.metrics?.startDate || new Date(),
          lastUpdated: new Date(),
          progressHistory: [
            ...(skill.metrics?.progressHistory || []),
            {
              date: new Date(),
              value: skill.xp + amount,
              notes: `Gained ${amount} XP`
            }
          ],
          relatedQuests: skill.metrics?.relatedQuests || []
        };
        
        state.updateSkill(skillId, {
          xp: remainingXp,
          level: newLevel,
          xpToNextLevel: newXpToNext,
          metrics: updatedMetrics
        });
        
        // Update total XP and user rank
        const newTotalXp = state.user.totalXp + amount;
        state.updateUser({ 
          totalXp: newTotalXp,
          rank: calculateRankFromXp(newTotalXp)
        });
        
        // Recalculate domain ranks
        const domain = skill.domain;
        const updatedSkills = state.skills.map(s => 
          s.id === skillId ? { ...s, xp: remainingXp, level: newLevel } : s
        );
        const domainSkills = updatedSkills.filter(s => s.domain === domain);
        const domainXp = domainSkills.reduce((sum, s) => sum + s.xp, 0) + amount;
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
                startDate: q.metrics?.startDate || new Date(),
                checkpoints: [
                  ...(q.metrics?.checkpoints || []),
                  {
                    date: new Date(),
                    description: 'Quest completed',
                    completed: true
                  }
                ],
                consequences: q.metrics?.consequences
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
      }

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
      },

      removeSkill: (id) =>
        set((state) => ({
          skills: state.skills.filter(skill => skill.id !== id)
        })),

      removeQuest: (id) =>
        set((state) => ({
          quests: state.quests.filter(quest => quest.id !== id)
        }))
    }),
    {
      name: 'prodigy-protocol-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration logic for version 0 to 1
          return {
            ...persistedState,
            user: {
              ...persistedState.user,
              progressHistory: persistedState.user.progressHistory || []
            }
          };
        }
        return persistedState;
      }
    }
  )
);