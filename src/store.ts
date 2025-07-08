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
  CommunicationPreferences,
  ShopItem,
  ActiveBoost,
  QuestChain,
  QuestDifficulty
} from './types';

interface ProdigyState {
  user: UserProfile;
  skills: Skill[];
  quests: Quest[];
  questChains: QuestChain[];
  achievements: Achievement[];
  domainRanks: Record<Domain, Rank>;
  shopItems: ShopItem[];
  
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
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addQuest: (quest: Quest) => void;
  completeQuest: (id: string) => void;
  failQuest: (id: string) => void;
  refreshDailyQuests: () => void;
  unlockAchievement: (id: string) => void;
  calculateRank: (domain: Domain) => Rank;
  addProgressEntry: (metrics: Record<string, number>, notes: string) => void;
  purchaseItem: (itemId: string) => boolean;
  activateItem: (itemId: string) => void;
  checkDailyLogin: () => void;
  updateStreaks: () => void;
  initializeShop: () => void;
  createQuestChain: (chain: QuestChain) => void;
  checkQuestChainCompletion: (chainId: string) => void;
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

const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 100) + 1;
};

const getStreakMultiplier = (streak: number): number => {
  if (streak >= 100) return 1.5;
  if (streak >= 30) return 1.25;
  if (streak >= 7) return 1.1;
  return 1;
};

const getCoinReward = (difficulty: QuestDifficulty, streak: number): number => {
  const baseRewards = {
    Easy: 15,
    Medium: 35,
    Hard: 75
  };
  
  const multiplier = getStreakMultiplier(streak);
  return Math.floor(baseRewards[difficulty] * multiplier);
};

const getXpReward = (difficulty: QuestDifficulty): number => {
  const baseRewards = {
    Easy: 25,
    Medium: 50,
    Hard: 100
  };
  
  return baseRewards[difficulty];
};

const generateDailyQuests = (): Quest[] => {
  const questTemplates = [
    // Physical
    { title: "Morning Exercise", description: "Complete 30 minutes of physical activity", domain: "Physical" as Domain, difficulty: "Medium" as QuestDifficulty },
    { title: "Hydration Goal", description: "Drink 8 glasses of water today", domain: "Physical" as Domain, difficulty: "Easy" as QuestDifficulty },
    { title: "Strength Training", description: "Complete a strength workout session", domain: "Physical" as Domain, difficulty: "Hard" as QuestDifficulty },
    
    // Mental
    { title: "Meditation Session", description: "Meditate for 15 minutes", domain: "Mental" as Domain, difficulty: "Easy" as QuestDifficulty },
    { title: "Reading Time", description: "Read for 30 minutes", domain: "Mental" as Domain, difficulty: "Medium" as QuestDifficulty },
    { title: "Problem Solving", description: "Solve 3 challenging puzzles or problems", domain: "Mental" as Domain, difficulty: "Hard" as QuestDifficulty },
    
    // Technical
    { title: "Code Practice", description: "Write code for 1 hour", domain: "Technical" as Domain, difficulty: "Medium" as QuestDifficulty },
    { title: "Learn New Concept", description: "Study a new technical concept", domain: "Technical" as Domain, difficulty: "Easy" as QuestDifficulty },
    { title: "Build Project Feature", description: "Implement a new feature in your project", domain: "Technical" as Domain, difficulty: "Hard" as QuestDifficulty },
    
    // Creative
    { title: "Creative Expression", description: "Spend 30 minutes on creative work", domain: "Creative" as Domain, difficulty: "Medium" as QuestDifficulty },
    { title: "Sketch or Draw", description: "Create a quick sketch or drawing", domain: "Creative" as Domain, difficulty: "Easy" as QuestDifficulty },
    { title: "Complete Art Project", description: "Finish a creative project you've been working on", domain: "Creative" as Domain, difficulty: "Hard" as QuestDifficulty },
  ];
  
  // Select 3-5 random quests for the day
  const shuffled = questTemplates.sort(() => 0.5 - Math.random());
  const selectedQuests = shuffled.slice(0, Math.floor(Math.random() * 3) + 3);
  
  return selectedQuests.map((template, index) => ({
    id: `daily-${Date.now()}-${index}`,
    ...template,
    xpReward: getXpReward(template.difficulty),
    coinReward: getCoinReward(template.difficulty, 0), // Will be recalculated with actual streak
    completed: false,
    isDaily: true,
    refreshDate: new Date(),
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    punishment: {
      type: 'coin_loss' as const,
      amount: Math.floor(getCoinReward(template.difficulty, 0) * 0.5),
      description: `Lose ${Math.floor(getCoinReward(template.difficulty, 0) * 0.5)} coins for not completing this quest`
    }
  }));
};

const defaultShopItems: ShopItem[] = [
  // Streak Freezers
  {
    id: 'streak-freeze-1',
    name: 'Streak Shield (1 Day)',
    description: 'Protects your streak for 1 day if you miss your quests',
    cost: 500,
    type: 'streak_freezer',
    effect: { protection: 1 }
  },
  {
    id: 'streak-freeze-7',
    name: 'Streak Shield (7 Days)',
    description: 'Protects your streak for 7 days if you miss your quests',
    cost: 2000,
    type: 'streak_freezer',
    effect: { protection: 7 }
  },
  
  // XP Boosters
  {
    id: 'xp-boost-2x-1h',
    name: '2x XP Booster (1 Hour)',
    description: 'Double XP gains for 1 hour',
    cost: 300,
    type: 'xp_booster',
    duration: 1,
    effect: { multiplier: 2 }
  },
  {
    id: 'xp-boost-3x-1h',
    name: '3x XP Booster (1 Hour)',
    description: 'Triple XP gains for 1 hour',
    cost: 800,
    type: 'xp_booster',
    duration: 1,
    effect: { multiplier: 3 }
  },
  {
    id: 'xp-boost-2x-24h',
    name: '2x XP Booster (24 Hours)',
    description: 'Double XP gains for 24 hours',
    cost: 1500,
    type: 'xp_booster',
    duration: 24,
    effect: { multiplier: 2 }
  },
  
  // Coin Multipliers
  {
    id: 'coin-mult-1.5x-1h',
    name: '1.5x Coin Multiplier (1 Hour)',
    description: 'Increase coin earnings by 50% for 1 hour',
    cost: 400,
    type: 'coin_multiplier',
    duration: 1,
    effect: { multiplier: 1.5 }
  },
  {
    id: 'coin-mult-2x-1h',
    name: '2x Coin Multiplier (1 Hour)',
    description: 'Double coin earnings for 1 hour',
    cost: 1000,
    type: 'coin_multiplier',
    duration: 1,
    effect: { multiplier: 2 }
  },
  {
    id: 'coin-mult-1.5x-24h',
    name: '1.5x Coin Multiplier (24 Hours)',
    description: 'Increase coin earnings by 50% for 24 hours',
    cost: 2000,
    type: 'coin_multiplier',
    duration: 24,
    effect: { multiplier: 1.5 }
  },
  
  // Badges
  {
    id: 'badge-bronze-warrior',
    name: 'Bronze Warrior Badge',
    description: 'Show your dedication with this bronze achievement badge',
    cost: 1000,
    type: 'badge',
    tier: 'bronze'
  },
  {
    id: 'badge-silver-champion',
    name: 'Silver Champion Badge',
    description: 'Display your prowess with this silver achievement badge',
    cost: 3000,
    type: 'badge',
    tier: 'silver'
  },
  {
    id: 'badge-gold-legend',
    name: 'Gold Legend Badge',
    description: 'Showcase your mastery with this gold achievement badge',
    cost: 5000,
    type: 'badge',
    tier: 'gold'
  },
  
  // Profile Frames
  {
    id: 'frame-basic-glow',
    name: 'Basic Glow Frame',
    description: 'Add a subtle animated glow to your profile',
    cost: 800,
    type: 'frame',
    tier: 'bronze'
  },
  {
    id: 'frame-premium-pulse',
    name: 'Premium Pulse Frame',
    description: 'Premium animated frame with pulsing effects',
    cost: 2500,
    type: 'frame',
    tier: 'silver'
  },
  {
    id: 'frame-legendary-storm',
    name: 'Legendary Storm Frame',
    description: 'Exclusive seasonal frame with storm effects',
    cost: 5000,
    type: 'frame',
    tier: 'legendary'
  }
];

export const useProdigyStore = create<ProdigyState>()(
  persist(
    (set, get) => ({
      user: {
        name: 'Hunter',
        title: 'Novice Explorer',
        rank: 'E',
        totalXp: 0,
        coins: 100, // Starting coins
        level: 1,
        joinDate: new Date(),
        streak: 0,
        streakFreezeActive: false,
        lastActive: new Date(),
        lastQuestRefresh: new Date(),
        dailyLoginStreak: 0,
        lastDailyLogin: new Date(),
        activeBoosts: [],
        ownedItems: [],
        equippedBadges: [],
        progressHistory: [],
        milestones: [
          {
            id: 'streak-7',
            name: '7-Day Streak',
            description: 'Complete quests for 7 consecutive days',
            achieved: false,
            reward: { coins: 100, items: ['xp-boost-2x-1h'] }
          },
          {
            id: 'streak-30',
            name: '30-Day Streak',
            description: 'Complete quests for 30 consecutive days',
            achieved: false,
            reward: { coins: 500, items: ['badge-silver-champion'] }
          },
          {
            id: 'streak-100',
            name: '100-Day Streak',
            description: 'Complete quests for 100 consecutive days',
            achieved: false,
            reward: { coins: 2000, items: ['frame-legendary-storm'] }
          }
        ]
      },
      skills: [],
      quests: [],
      questChains: [],
      achievements: [],
      domainRanks: {
        Physical: 'E',
        Mental: 'E',
        Technical: 'E',
        Creative: 'E',
      },
      shopItems: defaultShopItems,

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

      addCoins: (amount) => {
        const state = get();
        const coinMultiplier = state.user.activeBoosts
          .filter(boost => boost.type === 'coin_multiplier' && boost.expiresAt > new Date())
          .reduce((max, boost) => Math.max(max, boost.multiplier), 1);
        
        const finalAmount = Math.floor(amount * coinMultiplier);
        
        set((state) => ({
          user: { ...state.user, coins: state.user.coins + finalAmount }
        }));
      },

      spendCoins: (amount) => {
        const state = get();
        if (state.user.coins >= amount) {
          set((state) => ({
            user: { ...state.user, coins: state.user.coins - amount }
          }));
          return true;
        }
        return false;
      },

      addXp: (skillId, amount) => {
        const state = get();
        const skill = state.skills.find(s => s.id === skillId);
        
        if (!skill) return;
        
        // Apply XP multiplier from active boosts
        const xpMultiplier = state.user.activeBoosts
          .filter(boost => boost.type === 'xp_booster' && boost.expiresAt > new Date())
          .reduce((max, boost) => Math.max(max, boost.multiplier), 1);
        
        const finalAmount = Math.floor(amount * xpMultiplier);
        
        const newXp = skill.xp + finalAmount;
        const levelUps = Math.floor(newXp / skill.xpToNextLevel);
        const remainingXp = newXp % skill.xpToNextLevel;
        const newLevel = skill.level + levelUps;
        const newXpToNextLevel = Math.floor(skill.xpToNextLevel * Math.pow(1.2, levelUps));
        
        // Update skill metrics
        const updatedMetrics = {
          startDate: skill.metrics?.startDate || new Date(),
          lastUpdated: new Date(),
          progressHistory: [
            ...(skill.metrics?.progressHistory || []),
            {
              date: new Date(),
              value: newXp,
              notes: `Gained ${finalAmount} XP${xpMultiplier > 1 ? ` (${xpMultiplier}x boost)` : ''}`
            }
          ],
          relatedQuests: skill.metrics?.relatedQuests || []
        };
        
        state.updateSkill(skillId, {
          xp: remainingXp,
          level: newLevel,
          xpToNextLevel: newXpToNextLevel,
          metrics: updatedMetrics
        });
        
        // Update total XP and user rank
        const newTotalXp = state.user.totalXp + finalAmount;
        state.updateUser({ 
          totalXp: newTotalXp,
          rank: calculateRankFromXp(newTotalXp),
          level: calculateLevel(newTotalXp)
        });
        
        // Recalculate domain ranks
        const domain = skill.domain;
        const updatedSkills = state.skills.map(s => 
          s.id === skillId ? { ...s, xp: remainingXp, level: newLevel } : s
        );
        const domainSkills = updatedSkills.filter(s => s.domain === domain);
        const domainXp = domainSkills.reduce((sum, s) => sum + s.xp, 0) + finalAmount;
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
        
        // Award coins with streak multiplier
        const coinReward = Math.floor(quest.coinReward * getStreakMultiplier(state.user.streak));
        state.addCoins(coinReward);
        
        // Find a skill in the quest's domain to award XP
        const domainSkills = state.skills.filter(s => s.domain === quest.domain);
        if (domainSkills.length > 0) {
          state.addXp(domainSkills[0].id, quest.xpReward);
        }
        
        // Check quest chain completion
        if (quest.chainId) {
          state.checkQuestChainCompletion(quest.chainId);
        }
        
        // Update streak if it's a daily quest
        if (quest.isDaily) {
          state.updateStreaks();
        }
      },

      failQuest: (id) => {
        const state = get();
        const quest = state.quests.find(q => q.id === id);
        
        if (!quest || quest.completed) return;
        
        // Apply punishment
        if (quest.punishment) {
          switch (quest.punishment.type) {
            case 'coin_loss':
              set((state) => ({
                user: { 
                  ...state.user, 
                  coins: Math.max(0, state.user.coins - quest.punishment!.amount) 
                }
              }));
              break;
            case 'streak_break':
              if (!state.user.streakFreezeActive) {
                set((state) => ({
                  user: { ...state.user, streak: 0 }
                }));
              }
              break;
            case 'xp_penalty':
              // Remove XP from a random skill in the quest's domain
              const domainSkills = state.skills.filter(s => s.domain === quest.domain);
              if (domainSkills.length > 0) {
                const randomSkill = domainSkills[Math.floor(Math.random() * domainSkills.length)];
                const newXp = Math.max(0, randomSkill.xp - quest.punishment.amount);
                state.updateSkill(randomSkill.id, { xp: newXp });
              }
              break;
          }
        }
        
        // Remove the quest
        set((state) => ({
          quests: state.quests.filter(q => q.id !== id)
        }));
      },

      refreshDailyQuests: () => {
        const state = get();
        const now = new Date();
        const lastRefresh = new Date(state.user.lastQuestRefresh);
        
        // Check if it's been 24 hours since last refresh
        if (now.getTime() - lastRefresh.getTime() >= 24 * 60 * 60 * 1000) {
          // Apply punishments for incomplete daily quests
          const incompleteDailyQuests = state.quests.filter(q => q.isDaily && !q.completed);
          incompleteDailyQuests.forEach(quest => {
            state.failQuest(quest.id);
          });
          
          // Generate new daily quests
          const newDailyQuests = generateDailyQuests();
          
          // Update coin rewards based on current streak
          const updatedQuests = newDailyQuests.map(quest => ({
            ...quest,
            coinReward: getCoinReward(quest.difficulty, state.user.streak)
          }));
          
          set((state) => ({
            quests: [
              ...state.quests.filter(q => !q.isDaily), // Keep non-daily quests
              ...updatedQuests
            ],
            user: {
              ...state.user,
              lastQuestRefresh: now
            }
          }));
        }
      },

      updateStreaks: () => {
        const state = get();
        const now = new Date();
        const lastActive = new Date(state.user.lastActive);
        
        // Check if all daily quests are completed
        const dailyQuests = state.quests.filter(q => q.isDaily);
        const completedDailyQuests = dailyQuests.filter(q => q.completed);
        
        if (dailyQuests.length > 0 && completedDailyQuests.length === dailyQuests.length) {
          // All daily quests completed, increment streak
          const daysSinceLastActive = Math.floor((now.getTime() - lastActive.getTime()) / (24 * 60 * 60 * 1000));
          
          if (daysSinceLastActive <= 1) {
            set((state) => ({
              user: {
                ...state.user,
                streak: state.user.streak + 1,
                lastActive: now
              }
            }));
            
            // Check milestone achievements
            state.checkMilestones();
          }
        }
      },

      checkMilestones: () => {
        const state = get();
        const updatedMilestones = state.user.milestones.map(milestone => {
          if (!milestone.achieved) {
            let shouldAchieve = false;
            
            switch (milestone.id) {
              case 'streak-7':
                shouldAchieve = state.user.streak >= 7;
                break;
              case 'streak-30':
                shouldAchieve = state.user.streak >= 30;
                break;
              case 'streak-100':
                shouldAchieve = state.user.streak >= 100;
                break;
            }
            
            if (shouldAchieve) {
              // Award milestone rewards
              state.addCoins(milestone.reward.coins);
              if (milestone.reward.items) {
                set((state) => ({
                  user: {
                    ...state.user,
                    ownedItems: [...state.user.ownedItems, ...milestone.reward.items!]
                  }
                }));
              }
              
              return {
                ...milestone,
                achieved: true,
                achievedAt: new Date()
              };
            }
          }
          return milestone;
        });
        
        set((state) => ({
          user: {
            ...state.user,
            milestones: updatedMilestones
          }
        }));
      },

      checkDailyLogin: () => {
        const state = get();
        const now = new Date();
        const lastLogin = new Date(state.user.lastDailyLogin);
        const daysSinceLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (24 * 60 * 60 * 1000));
        
        if (daysSinceLogin >= 1) {
          const newStreak = daysSinceLogin === 1 ? state.user.dailyLoginStreak + 1 : 1;
          const loginBonus = Math.min(10 + (newStreak * 5), 100); // Scaling bonus, max 100
          
          state.addCoins(loginBonus);
          
          set((state) => ({
            user: {
              ...state.user,
              dailyLoginStreak: newStreak,
              lastDailyLogin: now
            }
          }));
        }
      },

      purchaseItem: (itemId) => {
        const state = get();
        const item = state.shopItems.find(i => i.id === itemId);
        
        if (!item || state.user.coins < item.cost) return false;
        
        if (state.spendCoins(item.cost)) {
          set((state) => ({
            user: {
              ...state.user,
              ownedItems: [...state.user.ownedItems, itemId]
            },
            shopItems: state.shopItems.map(i => 
              i.id === itemId ? { ...i, owned: true } : i
            )
          }));
          return true;
        }
        return false;
      },

      activateItem: (itemId) => {
        const state = get();
        const item = state.shopItems.find(i => i.id === itemId);
        
        if (!item || !state.user.ownedItems.includes(itemId)) return;
        
        const now = new Date();
        
        switch (item.type) {
          case 'streak_freezer':
            set((state) => ({
              user: {
                ...state.user,
                streakFreezeActive: true,
                streakFreezeExpires: new Date(now.getTime() + (item.effect!.protection! * 24 * 60 * 60 * 1000))
              }
            }));
            break;
            
          case 'xp_booster':
          case 'coin_multiplier':
            const newBoost: ActiveBoost = {
              id: itemId,
              type: item.type,
              multiplier: item.effect!.multiplier!,
              expiresAt: new Date(now.getTime() + (item.duration! * 60 * 60 * 1000))
            };
            
            set((state) => ({
              user: {
                ...state.user,
                activeBoosts: [...state.user.activeBoosts, newBoost]
              }
            }));
            break;
            
          case 'frame':
            set((state) => ({
              user: {
                ...state.user,
                equippedFrame: itemId
              }
            }));
            break;
            
          case 'badge':
            if (!state.user.equippedBadges.includes(itemId) && state.user.equippedBadges.length < 3) {
              set((state) => ({
                user: {
                  ...state.user,
                  equippedBadges: [...state.user.equippedBadges, itemId]
                }
              }));
            }
            break;
        }
      },

      createQuestChain: (chain) =>
        set((state) => ({
          questChains: [...state.questChains, chain]
        })),

      checkQuestChainCompletion: (chainId) => {
        const state = get();
        const chain = state.questChains.find(c => c.id === chainId);
        
        if (!chain || chain.completed) return;
        
        const chainQuests = state.quests.filter(q => q.chainId === chainId);
        const completedChainQuests = chainQuests.filter(q => q.completed);
        
        if (chainQuests.length > 0 && completedChainQuests.length === chainQuests.length) {
          // Chain completed, award bonus
          state.addCoins(chain.bonusReward);
          
          set((state) => ({
            questChains: state.questChains.map(c =>
              c.id === chainId ? { ...c, completed: true } : c
            )
          }));
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
      },

      initializeShop: () => {
        set((state) => ({
          shopItems: defaultShopItems.map(item => ({
            ...item,
            owned: state.user.ownedItems.includes(item.id)
          }))
        }));
      }
    }),
    {
      name: 'prodigy-protocol-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return {
            ...persistedState,
            user: {
              ...persistedState.user,
              coins: persistedState.user.coins || 100,
              level: persistedState.user.level || 1,
              streakFreezeActive: false,
              lastQuestRefresh: new Date(),
              dailyLoginStreak: 0,
              lastDailyLogin: new Date(),
              activeBoosts: [],
              ownedItems: [],
              equippedBadges: [],
              milestones: [
                {
                  id: 'streak-7',
                  name: '7-Day Streak',
                  description: 'Complete quests for 7 consecutive days',
                  achieved: false,
                  reward: { coins: 100, items: ['xp-boost-2x-1h'] }
                },
                {
                  id: 'streak-30',
                  name: '30-Day Streak',
                  description: 'Complete quests for 30 consecutive days',
                  achieved: false,
                  reward: { coins: 500, items: ['badge-silver-champion'] }
                },
                {
                  id: 'streak-100',
                  name: '100-Day Streak',
                  description: 'Complete quests for 100 consecutive days',
                  achieved: false,
                  reward: { coins: 2000, items: ['frame-legendary-storm'] }
                }
              ]
            },
            questChains: [],
            shopItems: defaultShopItems
          };
        }
        return persistedState;
      }
    }
  )
);