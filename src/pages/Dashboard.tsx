import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import { useProdigyStore } from '../store';
import ProgressBar from '../components/ProgressBar';
import EnhancedQuestCard from '../components/EnhancedQuestCard';
import SkillCard from '../components/SkillCard';
import StreakCounter from '../components/StreakCounter';
import ProgressRings from '../components/ProgressRings';
import RadialProgressChart from '../components/RadialProgressChart';
import { Award, Zap, TrendingUp, Calendar, Coins, Clock, Target } from 'lucide-react';
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
    getDomainProgress,
    initializeShop
  } = useProdigyStore();
  
  // Initialize with sample data if empty
  useEffect(() => {
    // Initialize shop items
    initializeShop();
    
    // Refresh daily quests
    refreshDailyQuests();
    
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
    
    // Update streak if it's a new day
    const today = new Date().toDateString();
    const lastActive = new Date(user.lastActive).toDateString();
    
    if (today !== lastActive) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = yesterday.toDateString() === lastActive;
      
      updateUser({
        lastActive: new Date(),
        streak: {
          ...user.streak,
          current: wasYesterday ? user.streak.current + 1 : 1,
          lastUpdated: new Date()
        }
      });
    }
  }, []);
  
  // Get today's active quests
  const todayQuests = quests.filter(quest => 
    quest.type === 'daily' && 
    quest.status === 'active' && 
    !quest.completed
  );
  
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

  // Calculate time until daily reset
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const timeUntilReset = tomorrow.getTime() - now.getTime();
  const hoursUntilReset = Math.floor(timeUntilReset / (1000 * 60 * 60));
  const minutesUntilReset = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));

  // Get domain progress data
  const domainProgressData = {
    Physical: getDomainProgress('Physical'),
    Mental: getDomainProgress('Mental'),
    Technical: getDomainProgress('Technical'),
    Creative: getDomainProgress('Creative')
  };
  
  return (
    <Layout currentPage="dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-['Orbitron'] font-bold mb-1">HUNTER DASHBOARD</h1>
        <p className="text-gray-400">Your journey to mastery continues, Hunter.</p>
      </div>
      
      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 border border-indigo-900">
          <div className="flex items-center mb-2">
            <Award className="w-5 h-5 text-indigo-400 mr-2" />
            <h3 className="font-semibold">Current Rank</h3>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-indigo-900 flex items-center justify-center mr-3 glow">
              <span className="font-bold text-xl">{user.rank}</span>
            </div>
            <div>
              <div className="text-sm text-gray-400">Level {user.level}</div>
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
        
        <div className="bg-gray-800 rounded-lg p-4 border border-yellow-900">
          <div className="flex items-center mb-2">
            <Coins className="w-5 h-5 text-yellow-400 mr-2 animate-spin" />
            <h3 className="font-semibold">Coin Balance</h3>
          </div>
          <div className="flex items-center">
            <div className="text-2xl font-bold text-yellow-400">{user.coins.toLocaleString()}</div>
            <div className="text-sm text-gray-400 ml-2">coins</div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {user.activeBoosts.length > 0 && (
              <span className="text-green-400">Boosts active!</span>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-green-900">
          <div className="flex items-center mb-2">
            <Target className="w-5 h-5 text-green-400 mr-2" />
            <h3 className="font-semibold">Daily Progress</h3>
          </div>
          <div className="flex items-center">
            <div className="text-2xl font-bold text-green-400">
              {user.progressRings.daily.current}/{user.progressRings.daily.target}
            </div>
            <div className="text-sm text-gray-400 ml-2">quests</div>
          </div>
          <ProgressBar 
            current={user.progressRings.daily.current} 
            max={user.progressRings.daily.target} 
            color="green"
            showText={false}
            height={4}
          />
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-blue-900">
          <div className="flex items-center mb-2">
            <Clock className="w-5 h-5 text-blue-400 mr-2" />
            <h3 className="font-semibold">Quest Reset</h3>
          </div>
          <div className="flex items-center">
            <div className="text-lg font-bold text-blue-400">
              {hoursUntilReset}h {minutesUntilReset}m
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Until new daily quests
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Streak Counter */}
        <StreakCounter streak={user.streak} />
        
        {/* Progress Rings */}
        <div className="bg-gray-800 rounded-lg p-4 border border-indigo-900/30">
          <h3 className="text-lg font-semibold mb-4 text-center">Quest Progress</h3>
          <div className="flex justify-center">
            <ProgressRings rings={user.progressRings} size={180} />
          </div>
        </div>
      </div>

      {/* Domain Progress Charts */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Domain Mastery</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(domainProgressData).map(([domain, progress]) => (
            <div key={domain} className="bg-gray-800 rounded-lg p-4 border border-indigo-900/30">
              <h3 className="text-sm font-medium text-center mb-3">{domain}</h3>
              <div className="flex justify-center">
                <RadialProgressChart
                  domain={domain as any}
                  progress={progress.averageScore}
                  level={progress.level}
                  xp={progress.xp}
                  size={100}
                />
              </div>
              <div className="text-center mt-2">
                <div className="text-xs text-gray-400">
                  {progress.completedQuests}/{progress.totalQuests} quests
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Today's Active Quests */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Today's Quests</h2>
          <div className="flex items-center text-sm text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            <span>Resets in {hoursUntilReset}h {minutesUntilReset}m</span>
          </div>
        </div>
        
        {todayQuests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayQuests.map(quest => (
              <EnhancedQuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-6 text-center border border-green-900/30">
            <Award className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-400 font-medium mb-2">All daily quests completed!</p>
            <p className="text-gray-400 text-sm">Great work! New quests will be available tomorrow.</p>
          </div>
        )}
      </div>

      {/* Active Boosts */}
      {user.activeBoosts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Boosts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.activeBoosts.map(boost => (
              <div key={boost.id} className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-4 border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-purple-300">{boost.name}</h3>
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-sm text-gray-300 mb-2">{boost.description}</p>
                {boost.expiresAt && (
                  <div className="text-xs text-purple-400">
                    Expires: {new Date(boost.expiresAt).toLocaleString()}
                  </div>
                )}
              </div>
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