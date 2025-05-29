import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import { useProdigyStore } from '../store';
import ProgressBar from '../components/ProgressBar';
import QuestCard from '../components/QuestCard';
import SkillCard from '../components/SkillCard';
import { Award, Zap, TrendingUp, Calendar } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const Dashboard: React.FC = () => {
  const { 
    user, 
    skills, 
    quests, 
    addSkill, 
    addQuest, 
    updateUser 
  } = useProdigyStore();
  
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
    
    if (quests.length === 0) {
      // Add sample quests
      addQuest({
        id: uuidv4(),
        title: 'Complete 30 Minutes of Cardio',
        description: 'Perform any cardio exercise for at least 30 minutes to improve your endurance.',
        domain: 'Physical',
        difficulty: 'Medium',
        xpReward: 50,
        completed: false,
        deadline: new Date(Date.now() + 86400000), // Tomorrow
      });
      
      addQuest({
        id: uuidv4(),
        title: 'Read a Book Chapter',
        description: 'Read at least one chapter from a non-fiction book to expand your knowledge.',
        domain: 'Mental',
        difficulty: 'Easy',
        xpReward: 30,
        completed: false,
      });
      
      addQuest({
        id: uuidv4(),
        title: 'Build a React Component',
        description: 'Create a reusable React component with proper TypeScript typing.',
        domain: 'Technical',
        difficulty: 'Hard',
        xpReward: 80,
        completed: false,
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
        streak: wasYesterday ? user.streak + 1 : 1,
      });
    }
  }, []);
  
  // Get active quests
  const activeQuests = quests.filter(quest => !quest.completed).slice(0, 3);
  
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
  
  return (
    <Layout currentPage="dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-['Orbitron'] font-bold mb-1">HUNTER DASHBOARD</h1>
        <p className="text-gray-400">Your journey to mastery continues, Hunter.</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 border border-indigo-900">
          <div className="flex items-center mb-2">
            <Award className="w-5 h-5 text-indigo-400 mr-2" />
            <h3 className="font-semibold">Current Rank</h3>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-indigo-900 flex items-center justify-center mr-3">
              <span className="font-bold text-xl">{user.rank}</span>
            </div>
            <div>
              <div className="text-sm text-gray-400">Next Rank: {nextRank}</div>
              <ProgressBar 
                current={user.totalXp} 
                max={xpForNextRank} 
                showText={false}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-indigo-900">
          <div className="flex items-center mb-2">
            <Zap className="w-5 h-5 text-yellow-400 mr-2" />
            <h3 className="font-semibold">Total XP</h3>
          </div>
          <div className="flex items-center">
            <div className="text-2xl font-bold">{user.totalXp.toLocaleString()}</div>
            <div className="text-sm text-gray-400 ml-2">points</div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Lifetime experience accumulated
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-indigo-900">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
            <h3 className="font-semibold">Active Skills</h3>
          </div>
          <div className="flex items-center">
            <div className="text-2xl font-bold">{skills.length}</div>
            <div className="text-sm text-gray-400 ml-2">skills</div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Across {Object.keys(new Set(skills.map(s => s.domain))).length} domains
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-indigo-900">
          <div className="flex items-center mb-2">
            <Calendar className="w-5 h-5 text-blue-400 mr-2" />
            <h3 className="font-semibold">Current Streak</h3>
          </div>
          <div className="flex items-center">
            <div className="text-2xl font-bold">{user.streak}</div>
            <div className="text-sm text-gray-400 ml-2">days</div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Last active: {new Date(user.lastActive).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      {/* Active Quests */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Active Quests</h2>
          <a href="/quests" className="text-indigo-400 text-sm hover:underline">View All</a>
        </div>
        
        {activeQuests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-400">No active quests. Complete your journey or add new quests!</p>
          </div>
        )}
      </div>
      
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