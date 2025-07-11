import React from 'react';
import { Sparkles, User, Award, Dumbbell, Brain, Code, Palette, Menu, X, Briefcase, ShoppingBag } from 'lucide-react';
import { useProdigyStore } from '../store';
import UserMenu from './UserMenu';
import { useState } from 'react';

type LayoutProps = {
  children: React.ReactNode;
  currentPage: string;
};

const Layout: React.FC<LayoutProps> = ({ children, currentPage }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, domainRanks, authUser, isAuthenticated } = useProdigyStore();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navItems = [
    { name: 'Dashboard', icon: <Sparkles className="w-5 h-5" />, path: '/' },
    { name: 'Profile', icon: <User className="w-5 h-5" />, path: '/profile' },
    { name: 'Quests', icon: <Award className="w-5 h-5" />, path: '/quests' },
    { name: 'Shop', icon: <ShoppingBag className="w-5 h-5" />, path: '/shop' },
    { name: 'Professional', icon: <Briefcase className="w-5 h-5" />, path: '/professional' },
    { 
      name: 'Physical', 
      icon: <Dumbbell className="w-5 h-5" />, 
      path: '/domain/physical',
      rank: domainRanks.Physical
    },
    { 
      name: 'Mental', 
      icon: <Brain className="w-5 h-5" />, 
      path: '/domain/mental',
      rank: domainRanks.Mental
    },
    { 
      name: 'Technical', 
      icon: <Code className="w-5 h-5" />, 
      path: '/domain/technical',
      rank: domainRanks.Technical
    },
    { 
      name: 'Creative', 
      icon: <Palette className="w-5 h-5" />, 
      path: '/domain/creative',
      rank: domainRanks.Creative
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900/20 to-gray-900 text-white font-['Rajdhani']">
      {/* Mobile Header */}
      <header className="lg:hidden flex justify-between items-center p-4 bg-gray-800/80 backdrop-blur-md border-b border-indigo-900/50">
        <div className="flex items-center">
          <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse-glow" />
          <h1 className="text-xl font-['Orbitron'] font-bold magical-text">PRODIGY</h1>
        </div>
        <button onClick={toggleMenu} className="text-white hover:text-indigo-400 transition-colors">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-gray-800/50 backdrop-blur-md border-r border-indigo-900/50 min-h-screen">
          <div className="p-4 border-b border-indigo-900/50">
            <div className="flex items-center mb-4">
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse-glow" />
              <h1 className="text-xl font-['Orbitron'] font-bold magical-text ml-2">PRODIGY</h1>
            </div>
            
            {isAuthenticated ? (
              <div className="flex flex-col anime-card p-3">
                <span className="text-sm text-gray-400">Welcome back,</span>
                <span className="text-lg font-semibold sparkle">{authUser?.profile?.full_name || user.name}</span>
                <div className="flex items-center mt-1">
                  <span className="text-xs bg-indigo-900/50 px-2 py-0.5 rounded mr-2 energy-aura">{user.title}</span>
                  <span className="text-xs bg-purple-900/50 px-2 py-0.5 rounded energy-aura">Lv.{user.level}</span>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-xs bg-yellow-900/50 px-2 py-0.5 rounded energy-aura">
                    💰 {user.coins.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col anime-card p-3">
                <span className="text-sm text-gray-400">Guest Mode</span>
                <span className="text-lg font-semibold sparkle">Explorer</span>
                <div className="flex items-center mt-1">
                  <span className="text-xs bg-gray-900/50 px-2 py-0.5 rounded mr-2 energy-aura">Limited Access</span>
                </div>
                <a 
                  href="/auth" 
                  className="text-xs bg-indigo-900/50 px-2 py-0.5 rounded energy-aura mt-2 text-center hover:bg-indigo-800/50 transition-colors"
                >
                  Sign In for Full Access
                </a>
              </div>
            )}
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.path} 
                    className={`flex items-center p-2 rounded-lg transition-all duration-300 energy-aura ${
                      currentPage === item.name.toLowerCase() 
                        ? 'bg-indigo-900/50 text-white glow' 
                        : 'text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                    {item.rank && (
                      <span className="ml-auto bg-gray-700/50 px-2 py-0.5 rounded text-xs power-level">
                        {item.rank}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t border-indigo-900/50">
            {isAuthenticated ? (
              <div className="flex items-center justify-between anime-card p-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-700/50 flex items-center justify-center glow">
                    <span className="font-bold">{user.rank}</span>
                  </div>
                  <div className="ml-2">
                    <div className="text-xs text-gray-400">Total XP</div>
                    <div className="text-sm font-semibold magical-text">{user.totalXp.toLocaleString()}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Streak</div>
                  <div className="text-sm font-semibold text-center magical-text">{user.streak.current} days</div>
                </div>
              </div>
            ) : (
              <UserMenu />
            )}
          </div>
        </aside>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-md">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-indigo-900/50 flex justify-between items-center">
                <div className="flex items-center">
                  <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse-glow" />
                  <h1 className="text-xl font-['Orbitron'] font-bold magical-text ml-2">PRODIGY</h1>
                </div>
                <button onClick={toggleMenu}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {isAuthenticated ? (
                <div className="p-4 border-b border-indigo-900/50">
                  <div className="flex flex-col anime-card p-3">
                    <span className="text-sm text-gray-400">Welcome back,</span>
                    <span className="text-lg font-semibold sparkle">{authUser?.profile?.full_name || user.name}</span>
                    <div className="flex items-center mt-1">
                      <span className="text-xs bg-indigo-900/50 px-2 py-0.5 rounded mr-2 energy-aura">{user.title}</span>
                      <span className="text-xs bg-purple-900/50 px-2 py-0.5 rounded energy-aura">Lv.{user.level}</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <span className="text-xs bg-yellow-900/50 px-2 py-0.5 rounded energy-aura">
                        💰 {user.coins.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-b border-indigo-900/50">
                  <div className="flex flex-col anime-card p-3">
                    <span className="text-sm text-gray-400">Guest Mode</span>
                    <span className="text-lg font-semibold sparkle">Explorer</span>
                    <a 
                      href="/auth" 
                      className="text-xs bg-indigo-900/50 px-2 py-0.5 rounded energy-aura mt-2 text-center hover:bg-indigo-800/50 transition-colors"
                      onClick={toggleMenu}
                    >
                      Sign In for Full Access
                    </a>
                  </div>
                </div>
              )}
              
              <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-4">
                  {navItems.map((item) => (
                    <li key={item.name}>
                      <a 
                        href={item.path} 
                        className={`flex items-center p-3 rounded-lg transition-all duration-300 energy-aura ${
                          currentPage === item.name.toLowerCase() 
                            ? 'bg-indigo-900/50 text-white glow' 
                            : 'text-gray-300 hover:bg-gray-700/50'
                        }`}
                        onClick={toggleMenu}
                      >
                        {item.icon}
                        <span className="ml-3 text-lg">{item.name}</span>
                        {item.rank && (
                          <span className="ml-auto bg-gray-700/50 px-2 py-0.5 rounded text-xs power-level">
                            {item.rank}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="p-4 border-t border-indigo-900/50">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between anime-card p-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-700/50 flex items-center justify-center glow">
                        <span className="font-bold">{user.rank}</span>
                      </div>
                      <div className="ml-2">
                        <div className="text-xs text-gray-400">Total XP</div>
                        <div className="text-sm font-semibold magical-text">{user.totalXp.toLocaleString()}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Streak</div>
                      <div className="text-sm font-semibold text-center magical-text">{user.streak.current} days</div>
                    </div>
                  </div>
                ) : (
                  <UserMenu />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 relative">
          <div className="absolute inset-0 bg-gradient-radial from-indigo-900/10 via-transparent to-transparent pointer-events-none"></div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;