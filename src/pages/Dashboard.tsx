import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useProdigyStore } from '../store';
import ProgressBar from '../components/ProgressBar';
import QuestCard from '../components/QuestCard';
import SkillCard from '../components/SkillCard';
import { Award, Zap, TrendingUp, Calendar, Coins, Timer, Flame, Target, Clock, Gift } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const Dashboard: React.FC = () => {
  const { 
    user, 
    skills, 
    quests, 
    addSkill, 
    addQuest, 
    updateUser,
    refreshDailyQuests,
    checkDailyLogin,
    addCoins
  } = useProdigyStore();
  
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<string>('');
  const [showMilestoneReward, setShowMilestoneReward] = useState<string | null>(null);
  
  // Initialize with sample data if empty
  useEffect(() => {
    if (skills.length === 0) {
      // Add sample skills
      addSkill({
        id: uuidv4(),
        name: 'Strength Training',
        domain: 'Physical',
        level: 1,
        xp: 50,
        xpToNextLevel: 100,
      });
      
      addSkill({
        id: uuidv4(),
        name: 'Meditation',
        domain: 'Mental',
        level: 2,
        xp: 75,
        xpToNextLevel: 150,
      });
      
      addSkill({
        id: uuidv4(),
        name: 'React Development',
        domain: 'Technical',
        level: 3,
        xp: 120,
        xpToNextLevel: 200,
      });
      
      addSkill({
        id: uuidv4(),
        name: 'Digital Art',
        domain: 'Creative',
        level: 1,
        xp: 30,
        xpToNextLevel: 100,
      });
    }
    
    // Check for daily login bonus
    checkDailyLogin();
    
    // Refresh daily quests if needed
    refreshDailyQuests();
    
    // Update streak if it's a new day
    const today = new Date().toDateString();
    const lastActive = new Date(user.lastActive).toDateString();
    
    if (today !== lastActive) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = yesterday.toDateString() === lastActive;
      
      updateUser({
        lastActive: new Date(),
        streak: wasYesterday ? user.streak + 1 : 1,
      });
    }
  }, []);
  
  // Timer for quest refresh countdown
  useEffect(() => {
    const updateRefreshTimer = () => {
      const now = new Date();
      const lastRefresh = new Date(user.lastQuestRefresh);
      const nextRefresh = new Date(lastRefresh.getTime() + 24 * 60 * 60 * 1000);
      const timeLeft = nextRefresh.getTime() - now.getTime();
      
      if (timeLeft > 0) {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        setTimeUntilRefresh(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeUntilRefresh('Ready to refresh!');
        refreshDailyQuests();
      }
    };
    
    updateRefreshTimer();
    const interval = setInterval(updateRefreshTimer, 1000);
    
    return () => clearInterval(interval);
  }, [user.lastQuestRefresh, refreshDailyQuests]);
  
  // Check for milestone achievements
  useEffect(() => {
    const newlyAchievedMilestones = user.milestones.filter(m => 
      m.achieved && m.achievedAt && 
      new Date(m.achievedAt).getTime() > Date.now() - 5000 // Within last 5 seconds
    );
    
    if (newlyAchievedMilestones.length > 0) {
      setShowMilestoneReward(newlyAchievedMilestones[0].id);
      setTimeout(() => setShowMilestoneReward(null), 5000);
    }
  }, [user.milestones]);
  
  // Get active daily quests
  const dailyQuests = quests.filter(quest => quest.isDaily && !quest.completed);
  const completedDailyQuests = quests.filter(quest => quest.isDaily && quest.completed);
  const regularQuests = quests.filter(quest => !quest.isDaily && !quest.completed).slice(0, 2);
  
  // Get top skills
  const topSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 4);
  
  // Calculate next rank requirements
  const currentRank = user.rank;
  const nextRank = 
    currentRank === 'E' ? 'D' :
    currentRank === 'D' ? 'C' :
    currentRank === 'C' ? 'B' :
    currentRank === 'B' ? 'A' :
    currentRank === 'A' ? 'S' :
    currentRank === 'S' ? 'SS' :
    currentRank === 'SS' ? 'SSS' : 'MAX';
  
  const xpForNextRank = 
    nextRank === 'D' ? 250 :
    nextRank === 'C' ? 750 :
    nextRank === 'B' ? 1500 :
    nextRank === 'A' ? 3000 :
    nextRank === 'S' ? 5000 :
    nextRank === 'SS' ? 7500 :
    nextRank === 'SSS' ? 10000 : user.totalXp;
  
  // Calculate daily/weekly/monthly progress
  const dailyProgress = (completedDailyQuests.length / (dailyQuests.length + completedDailyQuests.length)) * 100 || 0;
  const weeklyProgress = Math.min((user.streak / 7) * 100, 100);
  const monthlyProgress = Math.min((user.streak / 30) * 100, 100);
  
  // Get next milestone
  const nextMilestone = user.milestones.find(m => !m.achieved);
  const nextMilestoneProgress = nextMilestone ? 
    (nextMilestone.id === 'streak-7' ? (user.streak / 7) * 100 :
     nextMilestone.id === 'streak-30' ? (user.streak / 30) * 100 :
     nextMilestone.id === 'streak-100' ? (user.streak / 100) * 100 : 0) : 100;
  
  const getStreakMultiplier = (streak: number): number => {
    if (streak >= 100) return 1.5;
    if (streak >= 30) return 1.25;
    if (streak >= 7) return 1.1;
    return 1;
  };
  
  const streakMultiplier = getStreakMultiplier(user.streak);
  
  return (
    <Layout currentPage="dashboard">
      {/* Milestone Achievement Popup */}
      {showMilestoneReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg p-6 max-w-md mx-4 text-center animate-pulse">
            <Gift className="w-12 h-12 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Milestone Achieved!</h2>
            <p className="text-yellow-100 mb-4">
              {user.milestones.find(m => m.id === showMilestoneReward)?.name}
            </p>
            <div className="flex items-center justify-center space-x-4 text-white">
              <div className="flex items-center">
                <Coins className="w-5 h-5 mr-1" />
                <span>+{user.milestones.find(m => m.id === showMilestoneReward)?.reward?.coins || 0}</span>
              </div>
              {user.milestones.find(m => m.id === showMilestoneReward)?.reward?.items && (
                <div className="text-sm">+ Special Items</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <h1 className="text-2xl font-['Orbitron'] font-bold mb-1">HUNTER DASHBOARD</h1>
        <p className="text-gray-400">Your journey to mastery continues, Hunter.</p>
      </div>
      
      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 border border-indigo-900 relative overflow-hidden">
          <div className="flex items-center mb-2">
            <Award className="w-5 h-5 text-indigo-400 mr-2" />
            <h3 className="font-semibold">Current Rank</h3>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-indigo-900 flex items-center justify-center mr-3 glow">
              <span className="font-bold text-xl">{user.rank}</span>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-400">Next: {nextRank}</div>
              <ProgressBar 
                current={user.totalXp} 
                max={xpForNextRank} 
                showText={false}
                height={4}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-amber-900 relative overflow-hidden">
          <div className="flex items-center mb-2">
            <Coins className="w-5 h-5 text-amber-400 mr-2" />
            <h3 className="font-semibold">Coins</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-amber-400">{user.coins.toLocaleString()}</div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Level {user.level}</div>
              {streakMultiplier > 1 && (
                <div className="text-xs text-green-400">+{Math.round((streakMultiplier - 1) * 100)}% bonus</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-orange-900 relative overflow-hidden">
          <div className="flex items-center mb-2">
            <Flame className="w-5 h-5 text-orange-400 mr-2" />
            <h3 className="font-semibold">Streak</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-orange-400">{user.streak}</div>
            <div className="text-right">
              <div className="text-xs text-gray-400">days</div>
              {user.streakFreezeActive && (
                <div className="text-xs text-blue-400">Protected</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-green-900 relative overflow-hidden">
          <div className="flex items-center mb-2">
            <Target className="w-5 h-5 text-green-400 mr-2" />
            <h3 className="font-semibold">Daily Progress</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-green-400">{Math.round(dailyProgress)}%</div>
            <div className="text-right">
              <div className="text-xs text-gray-400">{completedDailyQuests.length}/{dailyQuests.length + completedDailyQuests.length}</div>
            </div>
          </div>
          <ProgressBar 
            current={dailyProgress} 
            max={100} 
            color="green"
            showText={false}
            height={3}
          />
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-purple-900 relative overflow-hidden">
          <div className="flex items-center mb-2">
            <Timer className="w-5 h-5 text-purple-400 mr-2" />
            <h3 className="font-semibold">Quest Refresh</h3>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400">{timeUntilRefresh}</div>
            <div className="text-xs text-gray-400">until new quests</div>
          </div>
        </div>
      </div>
      
      {/* Progress Bars Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 border border-indigo-900/30">
          <h3 className="font-semibold mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-blue-400" />
            Daily Goals
          </h3>
          <ProgressBar 
            current={dailyProgress} 
            max={100} 
            color="blue"
            height={8}
          />
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-indigo-900/30">
          <h3 className="font-semibold mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-purple-400" />
            Weekly Streak
          </h3>
          <ProgressBar 
            current={weeklyProgress} 
            max={100} 
            color="purple"
            height={8}
          />
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-indigo-900/30">
          <h3 className="font-semibold mb-3 flex items-center">
            <Award className="w-4 h-4 mr-2 text-yellow-400" />
            Monthly Challenge
          </h3>
          <ProgressBar 
            current={monthlyProgress} 
            max={100} 
            color="yellow"
            height={8}
          />
        </div>
      </div>
      
      {/* Next Milestone */}
      {nextMilestone && (
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 mb-8 border border-purple-700/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center">
              <Gift className="w-5 h-5 mr-2 text-purple-400" />
              Next Milestone: {nextMilestone.name}
            </h3>
            <div className="text-sm text-purple-400">{Math.round(nextMilestoneProgress)}%</div>
          </div>
          <p className="text-gray-400 text-sm mb-3">{nextMilestone.description}</p>
          <ProgressBar 
            current={nextMilestoneProgress} 
            max={100} 
            color="purple"
            height={6}
            showText={false}
          />
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <span>Reward: {nextMilestone.reward?.coins || 0} coins</span>
            {nextMilestone.reward?.items && <span>+ Special Items</span>}
          </div>
        </div>
      )}
      
      {/* Today's Active Quests */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Timer className="w-5 h-5 mr-2 text-yellow-400" />
            Today's Quests
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>Completed: {completedDailyQuests.length}</span>
            <span>Remaining: {dailyQuests.length}</span>
          </div>
        </div>
        
        {dailyQuests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dailyQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        ) : completedDailyQuests.length > 0 ? (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 text-center">
            <Award className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-400 mb-2">All Daily Quests Complete!</h3>
            <p className="text-green-300">Great work! New quests will be available in {timeUntilRefresh}</p>
            {dailyQuests.length + completedDailyQuests.length > 0 && (
              <div className="mt-4 text-sm text-green-400">
                Completionist Bonus: +{Math.floor(completedDailyQuests.reduce((sum, q) => sum + q.coinReward, 0) * 0.2)} coins
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">New daily quests will be available in {timeUntilRefresh}</p>
          </div>
        )}
      </div>
      
      {/* Regular Quests */}
      {regularQuests.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Active Quests</h2>
            <a href="/quests" className="text-indigo-400 text-sm hover:underline">View All</a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regularQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </div>
      )}
      
      {/* Skills Overview */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Skills</h2>
          <a href="/skills" className="text-indigo-400 text-sm hover:underline">View All</a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topSkills.map(skill => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;