import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useProdigyStore } from '../store';
import { User, Award, Calendar, Zap, Edit2 } from 'lucide-react';
import AchievementCard from '../components/AchievementCard';

const Profile: React.FC = () => {
  const { user, updateUser, achievements } = useProdigyStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editTitle, setEditTitle] = useState(user.title);
  
  const handleSave = () => {
    updateUser({
      name: editName,
      title: editTitle,
    });
    setIsEditing(false);
  };
  
  // Sample achievements if none exist
  const displayAchievements = achievements.length > 0 ? achievements : [
    {
      id: '1',
      title: 'First Steps',
      description: 'Begin your journey to mastery by creating your first skill.',
      icon: 'trophy',
      dateUnlocked: new Date(),
      requirements: 'Create your first skill',
    },
    {
      id: '2',
      title: 'Consistent Hunter',
      description: 'Maintain a 7-day streak of daily activity.',
      icon: 'calendar',
      dateUnlocked: null,
      requirements: 'Maintain a 7-day streak',
    },
    {
      id: '3',
      title: 'Domain Expert',
      description: 'Reach level 10 in any skill within a domain.',
      icon: 'star',
      dateUnlocked: null,
      requirements: 'Reach level 10 in any skill',
    },
  ];
  
  return (
    <Layout currentPage="profile">
      <div className="mb-6">
        <h1 className="text-2xl font-['Orbitron'] font-bold mb-1">HUNTER PROFILE</h1>
        <p className="text-gray-400">Your personal journey and achievements.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg border border-indigo-900 overflow-hidden">
            <div className="bg-indigo-900/30 p-6">
              <div className="flex justify-between items-start">
                <div className="w-20 h-20 rounded-full bg-indigo-700 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="mt-4">
                  <div className="mb-3">
                    <label className="block text-sm text-gray-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-700 text-white px-3 py-1 rounded mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="bg-indigo-700 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-indigo-400">{user.title}</p>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Award className="w-5 h-5 text-yellow-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-400">Current Rank</div>
                  <div className="font-semibold">{user.rank}</div>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <Zap className="w-5 h-5 text-indigo-400 mr-3" />
                <div>
                  <div className="text-sm text-gray-400">Total XP</div>
                  <div className="font-semibold">{user.totalXp.toLocaleString()} points</div>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <Calendar className="w-5 h-5 text-green-400 mr-3" />
                <div>
                  <div className="text-sm text-gray-400">Current Streak</div>
                  <div className="font-semibold">{user.streak} days</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-400 mb-2">Member Since</div>
                <div className="font-semibold">{new Date(user.joinDate).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Achievements */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Achievements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayAchievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
          
          <div className="mt-6 bg-gray-800 rounded-lg p-6 border border-indigo-900">
            <h3 className="text-lg font-semibold mb-3">Hunter Stats</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700 rounded p-3">
                <div className="text-sm text-gray-400">Skills Created</div>
                <div className="text-xl font-semibold">{useProdigyStore.getState().skills.length}</div>
              </div>
              
              <div className="bg-gray-700 rounded p-3">
                <div className="text-sm text-gray-400">Quests Completed</div>
                <div className="text-xl font-semibold">
                  {useProdigyStore.getState().quests.filter(q => q.completed).length}
                </div>
              </div>
              
              <div className="bg-gray-700 rounded p-3">
                <div className="text-sm text-gray-400">Achievements</div>
                <div className="text-xl font-semibold">
                  {displayAchievements.filter(a => a.dateUnlocked !== null).length}
                </div>
              </div>
              
              <div className="bg-gray-700 rounded p-3">
                <div className="text-sm text-gray-400">Highest Level</div>
                <div className="text-xl font-semibold">
                  {Math.max(...useProdigyStore.getState().skills.map(s => s.level), 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;