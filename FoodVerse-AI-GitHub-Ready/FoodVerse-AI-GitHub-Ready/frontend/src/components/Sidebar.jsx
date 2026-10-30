import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanEye,
  Activity,
  Apple,
  ShieldCheck,
  ChefHat,
  CalendarDays,
  History,
  Settings,
  Sparkles,
  HeartPulse,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Food Recognition', path: '/recognize', icon: ScanEye },
  { name: 'Nutrition Analyzer', path: '/nutrition', icon: Activity },
  { name: 'Freshness Checker', path: '/freshness', icon: Apple },
  { name: 'Hygiene Monitor', path: '/hygiene', icon: ShieldCheck },
  { name: 'AI Cooking Assistant', path: '/cooking', icon: ChefHat },
  { name: 'Personalized Meal Planner', path: '/meal-plan', icon: CalendarDays },
  { name: 'Analysis History', path: '/history', icon: History },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-forest-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-forest-800/80">
          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400 to-forest-600 p-0.5 flex items-center justify-center shadow-lg shadow-forest-950/40 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-forest-950 rounded-[10px] flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-lime-400" />
              </div>
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight text-white flex items-center space-x-1.5">
                <span>Food Verse</span>
                <span className="text-lime-400 text-xs px-1.5 py-0.5 rounded bg-forest-800/80 font-mono font-semibold">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-forest-300 font-medium">Multimodal Food Intelligence</p>
            </div>
          </NavLink>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-forest-300/80">
            Platform Capabilities
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-lime-500/20 to-lime-500/5 text-lime-300 border border-lime-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-forest-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-lime-400' : 'text-forest-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Feature Pill */}
        <div className="p-4 m-4 rounded-2xl bg-forest-950/60 border border-forest-800/60 text-xs">
          <div className="flex items-center space-x-2 text-lime-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Food Engine v1.0</span>
          </div>
          <p className="text-forest-300 text-[11px] leading-relaxed">
            Computer vision recognition, hygiene video auditing & USDA calibrated nutrition.
          </p>
        </div>
      </aside>
    </>
  );
}
