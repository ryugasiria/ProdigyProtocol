import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Achievement, Domain, Quest, Rank, Skill, UserProfile } from './types';

interface ProdigyState {
  user: UserProfile;
  skills: Skill[];
  quests: Quest[];
  achievements: Achievement[];
  domainRanks: Record<Domain, Rank>;
  
  // Actions
  updateUser: (user: Partial<UserProfile>) => void;
  addSkill: (skill: Skill) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  addXp: (skillId: string, amount: number) => void;
  addQuest: (quest: Quest) => void;
  completeQuest: (id: string) => void;
  unlockAchievement: (id: string) => void;
  calculateRank: (domain: Domain) => Rank;
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
        
        state.updateSkill(skillId, {
          xp: remainingXp,
          level: newLevel,
          xpToNextLevel: newXpToNextLevel
        });
        
        // Update total XP
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
          quests: [...state.quests, quest]
        })),

      completeQuest: (id) => {
        const state = get();
        const quest = state.quests.find(q => q.id === id);
        
        if (!quest || quest.completed) return;
        
        // Mark quest as completed
        set((state) => ({
          quests: state.quests.map(q => 
            q.id === id ? { ...q, completed: true } : q
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