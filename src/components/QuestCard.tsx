import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Award, Coins, AlertTriangle, Timer, Flame } from 'lucide-react';
import { Quest } from '../types';
import { useProdigyStore } from '../store';

type QuestCardProps = {
  quest: Quest;
};

const QuestCard: React.FC<QuestCardProps> = ({ quest }) => {
  const { completeQuest, user } = useProdigyStore();
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  useEffect(() => {
    if (quest.deadline) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const deadline = new Date(quest.deadline!).getTime();
        const difference = deadline - now;
        
        if (difference > 0) {
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft('Expired');
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      
      return () => clearInterval(interval);
    }
  }, [quest.deadline]);
  
  const handleComplete = () => {
    completeQuest(quest.id);
  };
  
  const difficultyColors = {
    Easy: 'bg-green-900 text-green-300 border-green-700',
    Medium: 'bg-blue-900 text-blue-300 border-blue-700',
    Hard: 'bg-purple-900 text-purple-300 border-purple-700',
  };
  
  const domainColors = {
    Physical: 'border-l-blue-500 bg-blue-900/10',
    Mental: 'border-l-purple-500 bg-purple-900/10',
    Technical: 'border-l-cyan-500 bg-cyan-900/10',
    Creative: 'border-l-pink-500 bg-pink-900/10',
  };
  
  const getStreakMultiplier = (streak: number): number => {
    if (streak >= 100) return 1.5;
    if (streak >= 30) return 1.25;
    if (streak >= 7) return 1.1;
    return 1;
  };
  
  const streakMultiplier = getStreakMultiplier(user.streak);
  const finalCoinReward = Math.floor(quest.coinReward * streakMultiplier);
  
  return (
    <div className={`bg-gray-800 rounded-lg p-4 shadow-lg border-l-4 ${domainColors[quest.domain]} relative overflow-hidden`}>
      {quest.isDaily && (
        <div className="absolute top-2 right-2">
          <div className="bg-yellow-600 text-yellow-100 text-xs px-2 py-1 rounded-full flex items-center">
            <Timer className="w-3 h-3 mr-1" />
            Daily
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg pr-16">{quest.title}</h3>
        <span className={`text-xs px-2 py-1 rounded border ${difficultyColors[quest.difficulty]}`}>
          {quest.difficulty}
        </span>
      </div>
      
      <p className="text-gray-400 text-sm mb-4">{quest.description}</p>
      
      {quest.completionCriteria && quest.completionCriteria.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Completion Criteria:</h4>
          <ul className="space-y-1">
            {quest.completionCriteria.map((criteria, index) => (
              <li key={index} className="text-xs text-gray-400 flex items-center">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2 flex-shrink-0" />
                {criteria}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Award className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-sm text-yellow-400">{quest.xpReward} XP</span>
          </div>
          
          <div className="flex items-center">
            <Coins className="w-4 h-4 text-amber-400 mr-1" />
            <span className="text-sm text-amber-400">
              {finalCoinReward}
              {streakMultiplier > 1 && (
                <span className="text-xs text-green-400 ml-1">
                  ({streakMultiplier}x)
                </span>
              )}
            </span>
          </div>
          
          {user.streak >= 7 && (
            <div className="flex items-center">
              <Flame className="w-4 h-4 text-orange-400 mr-1" />
              <span className="text-xs text-orange-400">{user.streak} streak</span>
            </div>
          )}
        </div>
        
        {quest.deadline && timeLeft && (
          <div className={`flex items-center text-xs ${
            timeLeft === 'Expired' ? 'text-red-400' : 
            timeLeft.includes('0h') ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            <Clock className="w-3 h-3 mr-1" />
            <span>{timeLeft}</span>
          </div>
        )}
      </div>
      
      {quest.punishment && (
        <div className="mb-4 p-2 bg-red-900/20 border border-red-800 rounded">
          <div className="flex items-center text-red-400 text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            <span className="font-medium">Failure Penalty:</span>
          </div>
          <p className="text-red-300 text-xs mt-1">{quest.punishment.description}</p>
        </div>
      )}
      
      <div className="flex justify-end">
        {quest.completed ? (
          <div className="flex items-center text-green-400">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">Completed</span>
          </div>
        ) : (
          <button
            onClick={handleComplete}
            className="bg-indigo-700 hover:bg-indigo-600 text-white px-4 py-2 rounded text-sm transition-all duration-300 transform hover:scale-105 flex items-center"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Complete Quest
          </button>
        )}
      </div>
      
      {quest.chainId && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600"></div>
      )}
    </div>
  );
};

export default QuestCard;