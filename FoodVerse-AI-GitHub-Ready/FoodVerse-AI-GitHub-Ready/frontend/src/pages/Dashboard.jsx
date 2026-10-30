import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { foodApi } from '../services/api';
import {
  ScanEye,
  Activity,
  Apple,
  ShieldCheck,
  ChefHat,
  CalendarDays,
  Flame,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { CardSkeleton } from '../components/LoadingSkeleton';

export default function Dashboard() {
  const { userProfile, backendStatus } = useApp();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const hist = await foodApi.getHistory(null, 6);
      setHistoryList(hist.items || []);
    } catch (err) {
      console.warn('Dashboard data fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate consumed calories & macros from today's saved nutrition records
  const nutritionRecords = historyList.filter((item) => item.analysis_type === 'nutrition');
  
  let totalCaloriesConsumed = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  if (nutritionRecords.length > 0) {
    nutritionRecords.forEach((r) => {
      if (r.data) {
        totalCaloriesConsumed += Number(r.data.calories || 0);
        totalProtein += Number(r.data.protein_g || 0);
        totalCarbs += Number(r.data.carbs_g || 0);
        totalFat += Number(r.data.fat_g || 0);
      }
    });
  } else {
    // If no recent nutrition analyses, show base illustration values clearly labeled
    totalCaloriesConsumed = 680;
    totalProtein = 38;
    totalCarbs = 72;
    totalFat = 26;
  }

  const isRealData = nutritionRecords.length > 0;
  const targetCals = userProfile.daily_calorie_target || 2000;
  const calPercent = Math.min(Math.round((totalCaloriesConsumed / targetCals) * 100), 100);

  // Macro pie data
  const macroData = [
    { name: 'Protein', value: totalProtein * 4, grams: Math.round(totalProtein), color: '#10b981' },
    { name: 'Carbs', value: totalCarbs * 4, grams: Math.round(totalCarbs), color: '#f59e0b' },
    { name: 'Fat', value: totalFat * 9, grams: Math.round(totalFat), color: '#f97316' },
  ];

  // 7-Day Trend Chart
  const trendData = [
    { day: 'Mon', calories: 1850, target: targetCals },
    { day: 'Tue', calories: 1980, target: targetCals },
    { day: 'Wed', calories: 2050, target: targetCals },
    { day: 'Thu', calories: 1780, target: targetCals },
    { day: 'Fri', calories: 2150, target: targetCals },
    { day: 'Sat', calories: 1920, target: targetCals },
    { day: 'Today', calories: Math.round(totalCaloriesConsumed), target: targetCals },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-soft">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-lime-400 text-xs font-semibold uppercase tracking-wider">
              Food Intelligence Hub
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
            <span className="text-xs text-forest-200">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {userProfile.username}!
          </h2>
          <p className="text-xs sm:text-sm text-forest-200 max-w-xl leading-relaxed">
            Your personal nutrition and culinary assistant is active. Track meals, inspect produce freshness, and monitor kitchen safety with multimodal AI.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/recognize"
            className="px-4 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-forest-950 font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <ScanEye className="w-4 h-4" />
            <span>Scan Food</span>
          </Link>
          <Link
            to="/cooking"
            className="px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs border border-forest-700 transition-colors flex items-center space-x-1.5"
          >
            <ChefHat className="w-4 h-4 text-lime-400" />
            <span>Ask Chef</span>
          </Link>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: 'Food Vision', path: '/recognize', icon: ScanEye, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Nutrition', path: '/nutrition', icon: Activity, color: 'text-lime-700 bg-lime-50' },
          { label: 'Freshness', path: '/freshness', icon: Apple, color: 'text-forest-700 bg-forest-50' },
          { label: 'Hygiene Video', path: '/hygiene', icon: ShieldCheck, color: 'text-amber-700 bg-amber-50' },
          { label: 'AI Recipes', path: '/cooking', icon: ChefHat, color: 'text-orange-700 bg-orange-50' },
          { label: 'Meal Planner', path: '/meal-plan', icon: CalendarDays, color: 'text-purple-700 bg-purple-50' },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.path}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-forest-300 hover:shadow-card transition-all duration-200 flex flex-col items-center text-center space-y-2 group"
            >
              <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-800">{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Metric Cards & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calorie Goal Progress Card */}
        <Card
          title="Daily Caloric Progress"
          subtitle={`Target: ${targetCals} kcal (${userProfile.fitness_goal.replace('_', ' ')})`}
          icon={Flame}
          badge={
            <Badge variant={isRealData ? 'emerald' : 'default'} size="sm">
              {isRealData ? 'Live Data' : 'Sample Data'}
            </Badge>
          }
        >
          <div className="space-y-6">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {Math.round(totalCaloriesConsumed)}
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1.5">/ {targetCals} kcal</span>
              </div>
              <span className="text-sm font-bold text-forest-700">{calPercent}% of target</span>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-lime-500 to-forest-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${calPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Remaining</span>
                <span className="font-bold text-slate-800 text-sm">
                  {Math.max(targetCals - Math.round(totalCaloriesConsumed), 0)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Preference</span>
                <span className="font-bold text-slate-800 text-sm capitalize">
                  {userProfile.dietary_preference}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Logged</span>
                <span className="font-bold text-slate-800 text-sm">{nutritionRecords.length} meals</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Macronutrient Distribution Card */}
        <Card
          title="Macronutrient Split"
          subtitle="Calories from Protein, Carbs, and Fat"
          icon={Activity}
        >
          <div className="h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name, item) => [
                    `${item.payload.grams}g (${Math.round((val / (macroData.reduce((a, b) => a + b.value, 0) || 1)) * 100)}% cals)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100 text-center text-xs">
            {macroData.map((m) => (
              <div key={m.name} className="space-y-0.5">
                <div className="flex items-center justify-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-slate-500 text-[11px] font-medium">{m.name}</span>
                </div>
                <div className="font-bold text-slate-800 text-sm">{m.grams}g</div>
              </div>
            ))}
          </div>
        </Card>

        {/* 7-Day Caloric Trend */}
        <Card
          title="Weekly Calorie Trend"
          subtitle="Recent daily intake vs target threshold"
          icon={TrendingUp}
        >
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="calories" fill="#349974" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-500 text-center mt-2">
            Weekly average: <span className="font-semibold text-slate-700">1,940 kcal/day</span>
          </div>
        </Card>
      </div>

      {/* Recent Analyses & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Analyses List */}
        <div className="lg:col-span-2">
          <Card
            title="Recent Food Analyses"
            subtitle="Inspections across recognition, nutrition, freshness & hygiene"
            icon={Clock}
            action={
              <Link
                to="/history"
                className="text-xs font-semibold text-forest-700 hover:text-lime-600 transition-colors flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {loading ? (
              <div className="space-y-3">
                <CardSkeleton />
              </div>
            ) : historyList.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Info className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">No analysis history logged yet.</p>
                <Link
                  to="/recognize"
                  className="inline-block text-xs text-forest-700 font-semibold hover:underline"
                >
                  Upload your first meal image
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {historyList.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center shrink-0">
                        {item.analysis_type === 'food_recognition' && <ScanEye className="w-4 h-4" />}
                        {item.analysis_type === 'nutrition' && <Activity className="w-4 h-4 text-emerald-600" />}
                        {item.analysis_type === 'freshness' && <Apple className="w-4 h-4 text-lime-600" />}
                        {item.analysis_type === 'hygiene' && <ShieldCheck className="w-4 h-4 text-amber-600" />}
                        {item.analysis_type === 'meal_plan' && <CalendarDays className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-800 truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.summary || 'Completed successfully'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-4">
                      <span className="text-[11px] text-slate-400 block">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {item.confidence && (
                        <span className="text-[10px] font-bold text-forest-700 bg-forest-50 px-1.5 py-0.5 rounded">
                          {item.confidence}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* AI Recommendations Card */}
        <div className="space-y-6">
          <Card
            title="Culinary Intelligence Tip"
            subtitle="Personalized recommendation"
            icon={Sparkles}
          >
            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-forest-50 border border-forest-100/80 text-forest-900 space-y-1.5">
                <span className="font-bold text-xs block text-forest-800 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-lime-600" />
                  <span>Balanced Micronutrients</span>
                </span>
                <p className="text-[11px] text-forest-700">
                  You’ve met 65% of your recommended Vitamin C and dietary fiber today! Consider adding a handful of raw almonds or seeds to your evening snack for healthy monounsaturated fats.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-800 block text-xs">Quick Smart Prompts:</span>
                <Link
                  to="/cooking"
                  className="block p-2.5 rounded-xl border border-slate-200 hover:border-lime-400 hover:bg-slate-50 transition-colors text-slate-700 font-medium text-[11px]"
                >
                  "Suggest a healthy vegetarian high-protein dinner"
                </Link>
                <Link
                  to="/freshness"
                  className="block p-2.5 rounded-xl border border-slate-200 hover:border-lime-400 hover:bg-slate-50 transition-colors text-slate-700 font-medium text-[11px]"
                >
                  "Check if my produce is fresh or starting to spoil"
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
