import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, Wifi, WifiOff, Sparkles, User, Flame } from 'lucide-react';
import Badge from './Badge';

const PAGE_TITLES = {
  '/': 'Welcome to Food Verse AI',
  '/dashboard': 'Intelligence Dashboard',
  '/recognize': 'Food Recognition',
  '/nutrition': 'Nutrition Analyzer',
  '/freshness': 'Produce Freshness Checker',
  '/hygiene': 'Kitchen Hygiene Monitor',
  '/cooking': 'AI Cooking Assistant',
  '/meal-plan': 'Personalized Meal Planner',
  '/history': 'Food Analysis History',
  '/settings': 'System & Dietary Settings',
};

export default function Navbar({ setMobileOpen }) {
  const location = useLocation();
  const { backendStatus, userProfile } = useApp();

  const currentTitle = PAGE_TITLES[location.pathname] || 'Food Verse AI';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {currentTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Backend Connectivity Status */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200">
          {backendStatus === 'online' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600">FastAPI Online</span>
            </>
          ) : backendStatus === 'checking' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-500">Connecting...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-rose-700 font-semibold">Offline</span>
            </>
          )}
        </div>

        {/* Daily Target Pill */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs bg-forest-50 border border-forest-200 text-forest-800 font-semibold">
          <Flame className="w-3.5 h-3.5 text-accent-orange" />
          <span>Target: {userProfile.daily_calorie_target} kcal</span>
        </div>

        {/* User Pill */}
        <Link
          to="/settings"
          className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-forest-700 to-forest-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {userProfile.username.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-slate-700 max-w-[120px] truncate">
            {userProfile.username}
          </span>
        </Link>
      </div>
    </header>
  );
}
