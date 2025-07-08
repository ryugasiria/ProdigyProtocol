import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useProdigyStore } from '../store';
import { 
  ShoppingCart, 
  Coins, 
  Zap, 
  Shield, 
  Award, 
  Frame, 
  Clock, 
  Check,
  Star,
  Flame,
  Gift
} from 'lucide-react';
import { ShopItem } from '../types';

const Shop: React.FC = () => {
  const { 
    user, 
    shopItems, 
    purchaseItem, 
    activateItem, 
    initializeShop 
  } = useProdigyStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [purchaseAnimation, setPurchaseAnimation] = useState<string | null>(null);
  
  useEffect(() => {
    initializeShop();
  }, []);
  
  // Clean up expired boosts
  useEffect(() => {
    const now = new Date();
    const expiredBoosts = user.activeBoosts.filter(boost => boost.expiresAt <= now);
    if (expiredBoosts.length > 0) {
      // Remove expired boosts (this would be handled in the store)
    }
  }, [user.activeBoosts]);
  
  const categories = [
    { id: 'all', name: 'All Items', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'streak_freezer', name: 'Streak Protection', icon: <Shield className="w-4 h-4" /> },
    { id: 'xp_booster', name: 'XP Boosters', icon: <Zap className="w-4 h-4" /> },
    { id: 'coin_multiplier', name: 'Coin Multipliers', icon: <Coins className="w-4 h-4" /> },
    { id: 'badge', name: 'Badges', icon: <Award className="w-4 h-4" /> },
    { id: 'frame', name: 'Profile Frames', icon: <Frame className="w-4 h-4" /> },
  ];
  
  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.type === selectedCategory);
  
  const handlePurchase = (item: ShopItem) => {
    if (purchaseItem(item.id)) {
      setPurchaseAnimation(item.id);
      setTimeout(() => setPurchaseAnimation(null), 1000);
      
      // Auto-activate consumable items
      if (['xp_booster', 'coin_multiplier', 'streak_freezer'].includes(item.type)) {
        setTimeout(() => activateItem(item.id), 500);
      }
    }
  };
  
  const handleActivate = (item: ShopItem) => {
    activateItem(item.id);
  };
  
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'streak_freezer': return <Shield className="w-6 h-6" />;
      case 'xp_booster': return <Zap className="w-6 h-6" />;
      case 'coin_multiplier': return <Coins className="w-6 h-6" />;
      case 'badge': return <Award className="w-6 h-6" />;
      case 'frame': return <Frame className="w-6 h-6" />;
      default: return <Gift className="w-6 h-6" />;
    }
  };
  
  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 border-amber-600';
      case 'silver': return 'text-gray-400 border-gray-400';
      case 'gold': return 'text-yellow-400 border-yellow-400';
      case 'legendary': return 'text-purple-400 border-purple-400';
      default: return 'text-blue-400 border-blue-400';
    }
  };
  
  const isItemActive = (item: ShopItem) => {
    if (item.type === 'xp_booster' || item.type === 'coin_multiplier') {
      return user.activeBoosts.some(boost => 
        boost.id === item.id && boost.expiresAt > new Date()
      );
    }
    if (item.type === 'streak_freezer') {
      return user.streakFreezeActive;
    }
    if (item.type === 'frame') {
      return user.equippedFrame === item.id;
    }
    if (item.type === 'badge') {
      return user.equippedBadges.includes(item.id);
    }
    return false;
  };
  
  const getActiveBoostTimeLeft = (item: ShopItem) => {
    const boost = user.activeBoosts.find(b => b.id === item.id);
    if (!boost) return null;
    
    const timeLeft = boost.expiresAt.getTime() - new Date().getTime();
    if (timeLeft <= 0) return null;
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };
  
  return (
    <Layout currentPage="shop">
      <div className="mb-6">
        <h1 className="text-2xl font-['Orbitron'] font-bold mb-1">PRODIGY SHOP</h1>
        <p className="text-gray-400">Enhance your journey with powerful items and upgrades.</p>
      </div>
      
      {/* User Stats */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-indigo-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Coins className="w-5 h-5 text-amber-400 mr-2" />
              <span className="text-lg font-semibold text-amber-400">{user.coins.toLocaleString()}</span>
              <span className="text-sm text-gray-400 ml-1">coins</span>
            </div>
            
            <div className="flex items-center">
              <Flame className="w-5 h-5 text-orange-400 mr-2" />
              <span className="text-lg font-semibold text-orange-400">{user.streak}</span>
              <span className="text-sm text-gray-400 ml-1">day streak</span>
            </div>
            
            {user.activeBoosts.length > 0 && (
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-sm text-green-400">{user.activeBoosts.length} active boost{user.activeBoosts.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-400">Level {user.level}</div>
            <div className="text-sm text-indigo-400">Rank {user.rank}</div>
          </div>
        </div>
      </div>
      
      {/* Active Boosts */}
      {user.activeBoosts.length > 0 && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-400 mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Active Boosts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {user.activeBoosts.map(boost => {
              const item = shopItems.find(i => i.id === boost.id);
              const timeLeft = getActiveBoostTimeLeft(item!);
              
              return (
                <div key={boost.id} className="bg-green-800/30 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    {getItemIcon(boost.type)}
                    <div className="ml-2">
                      <div className="text-sm font-medium text-green-300">{item?.name}</div>
                      <div className="text-xs text-green-400">{boost.multiplier}x multiplier</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-400">{timeLeft}</div>
                    <div className="text-xs text-gray-400">remaining</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6 bg-gray-800/50 p-2 rounded-lg">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
              selectedCategory === category.id
                ? 'bg-indigo-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            {category.icon}
            <span className="ml-2 hidden sm:inline">{category.name}</span>
          </button>
        ))}
      </div>
      
      {/* Shop Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => {
          const isOwned = user.ownedItems.includes(item.id);
          const isActive = isItemActive(item);
          const canAfford = user.coins >= item.cost;
          const timeLeft = getActiveBoostTimeLeft(item);
          
          return (
            <div 
              key={item.id} 
              className={`bg-gray-800 rounded-lg p-6 border transition-all duration-300 hover:transform hover:scale-105 ${
                item.tier ? `border-${getTierColor(item.tier).split(' ')[0].split('-')[1]}-600` : 'border-gray-700'
              } ${purchaseAnimation === item.id ? 'animate-pulse bg-green-800' : ''}`}
            >
              {/* Item Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  item.tier === 'legendary' ? 'bg-purple-900/50' :
                  item.tier === 'gold' ? 'bg-yellow-900/50' :
                  item.tier === 'silver' ? 'bg-gray-700/50' :
                  'bg-blue-900/50'
                }`}>
                  <div className={getTierColor(item.tier)}>
                    {getItemIcon(item.type)}
                  </div>
                </div>
                
                <div className="text-right">
                  {item.tier && (
                    <div className={`text-xs px-2 py-1 rounded border ${getTierColor(item.tier)} mb-1`}>
                      {item.tier.toUpperCase()}
                    </div>
                  )}
                  {isActive && (
                    <div className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">
                      ACTIVE
                    </div>
                  )}
                </div>
              </div>
              
              {/* Item Info */}
              <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{item.description}</p>
              
              {/* Item Effects */}
              {item.effect && (
                <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                  <div className="text-sm text-gray-300">
                    {item.type === 'xp_booster' && `${item.effect.multiplier}x XP for ${item.duration}h`}
                    {item.type === 'coin_multiplier' && `${item.effect.multiplier}x Coins for ${item.duration}h`}
                    {item.type === 'streak_freezer' && `Protects streak for ${item.effect.protection} day${item.effect.protection! > 1 ? 's' : ''}`}
                  </div>
                  {timeLeft && (
                    <div className="text-xs text-green-400 mt-1">Time remaining: {timeLeft}</div>
                  )}
                </div>
              )}
              
              {/* Price and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Coins className="w-4 h-4 text-amber-400 mr-1" />
                  <span className={`font-semibold ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>
                    {item.cost.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  {isOwned ? (
                    <>
                      <div className="flex items-center text-green-400 text-sm">
                        <Check className="w-4 h-4 mr-1" />
                        Owned
                      </div>
                      {(['frame', 'badge'].includes(item.type) && !isActive) && (
                        <button
                          onClick={() => handleActivate(item)}
                          className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Equip
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded text-sm font-medium transition-all duration-300 ${
                        canAfford
                          ? 'bg-indigo-700 hover:bg-indigo-600 text-white transform hover:scale-105'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Purchase' : 'Insufficient Coins'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-gray-400">Try selecting a different category.</p>
        </div>
      )}
    </Layout>
  );
};

export default Shop;