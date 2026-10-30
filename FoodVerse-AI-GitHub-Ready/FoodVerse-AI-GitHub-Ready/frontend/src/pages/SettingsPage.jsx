import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { foodApi } from '../services/api';
import {
  Settings,
  Key,
  User,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Info,
  Save,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';

export default function SettingsPage() {
  const { userProfile, setUserProfile, addToast } = useApp();

  const [username, setUsername] = useState(userProfile.username || 'Culinary Explorer');
  const [calorieTarget, setCalorieTarget] = useState(userProfile.daily_calorie_target || 2000);
  const [dietaryPref, setDietaryPref] = useState(userProfile.dietary_preference || 'vegetarian');
  const [goal, setGoal] = useState(userProfile.fitness_goal || 'general_wellness');
  const [allergiesText, setAllergiesText] = useState((userProfile.allergies || []).join(', '));
  const [geminiKey, setGeminiKey] = useState('');
  const [usdaKey, setUsdaKey] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUsername(userProfile.username);
    setCalorieTarget(userProfile.daily_calorie_target);
    setDietaryPref(userProfile.dietary_preference);
    setGoal(userProfile.fitness_goal);
    setAllergiesText((userProfile.allergies || []).join(', '));
  }, [userProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const allergiesList = allergiesText
      .split(',')
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean);

    try {
      const payload = {
        username: username.trim(),
        daily_calorie_target: Number(calorieTarget),
        dietary_preference: dietaryPref,
        fitness_goal: goal,
        allergies: allergiesList,
      };

      if (geminiKey.trim()) payload.gemini_api_key = geminiKey.trim();
      if (usdaKey.trim()) payload.usda_api_key = usdaKey.trim();

      const updated = await foodApi.updateSettings(payload);
      setUserProfile(updated);
      setGeminiKey('');
      setUsdaKey('');
      addToast('Profile & configuration settings saved successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Error updating settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
          <Settings className="w-3.5 h-3.5" />
          <span>Profile & API Integrations</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Settings & Dietary Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Configure daily metabolic targets, dietary rules, food allergy restrictions, and optional external API keys for live cloud LLM queries.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Profile Card */}
        <Card title="Nutritional Profile & Calorie Goals" icon={User}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Display Name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-forest-600 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>Daily Caloric Target</span>
                <span className="text-forest-700 font-bold">{calorieTarget} kcal</span>
              </label>
              <input
                type="number"
                min="1200"
                max="4500"
                step="50"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-forest-600 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Default Dietary Preference</label>
              <select
                value={dietaryPref}
                onChange={(e) => setDietaryPref(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-forest-600 font-medium capitalize"
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan (100% Plant-Based)</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="non-vegetarian">Non-Vegetarian</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Primary Wellness Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-forest-600 font-medium"
              >
                <option value="general_wellness">General Wellness & Vitality</option>
                <option value="weight_management">Weight Management (Deficit)</option>
                <option value="muscle_gain">Muscle Synthesis (High Protein)</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5 pt-2">
              <label className="font-bold text-slate-700">Allergies & Excluded Ingredients</label>
              <input
                type="text"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="e.g. peanuts, dairy, gluten, shellfish (comma separated)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-forest-600 font-medium"
              />
              <p className="text-[11px] text-slate-400">
                The AI cooking assistant and meal planner will actively respect these exclusions.
              </p>
            </div>
          </div>
        </Card>

        {/* Optional External APIs Card */}
        <Card title="Optional Cloud Intelligence API Keys" subtitle="Keys are stored securely in memory or .env" icon={Key}>
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-forest-50/70 border border-forest-100 text-forest-900 leading-relaxed text-[11px]">
              <span className="font-bold block mb-1">Genuine Fallback Architecture:</span>
              Food Verse AI is completely operational out-of-the-box using local USDA calibrated datasets and structured culinary engines. Optional API keys can be supplied below or via <code className="bg-white px-1.5 py-0.5 rounded font-mono text-forest-950 font-semibold border border-forest-200">.env</code>.
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Google Gemini API Key</label>
                  <Badge variant={userProfile.gemini_key_configured ? 'emerald' : 'default'} size="sm">
                    {userProfile.gemini_key_configured ? 'Active' : 'Using Offline Engine'}
                  </Badge>
                </div>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder={userProfile.gemini_key_configured ? '•••••••••••••••••••••••• (Configured)' : 'Enter GEMINI_API_KEY...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-forest-600 font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">USDA FoodData Central API Key</label>
                  <Badge variant={userProfile.usda_key_configured ? 'emerald' : 'default'} size="sm">
                    {userProfile.usda_key_configured ? 'Active' : 'Using Verified Local USDA DB'}
                  </Badge>
                </div>
                <input
                  type="password"
                  value={usdaKey}
                  onChange={(e) => setUsdaKey(e.target.value)}
                  placeholder={userProfile.usda_key_configured ? '•••••••••••••••••••••••• (Configured)' : 'Enter USDA_API_KEY...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-forest-600 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Single User Demo Note */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed flex items-start space-x-3">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-700 block">Local Development & Demo Environment:</span>
            This installation is configured for local single-user execution with SQLite database persistence. No external cloud account or tracking is required.
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all disabled:opacity-50"
        >
          {saving ? (
            <span>Saving Settings...</span>
          ) : (
            <>
              <Save className="w-4 h-4 text-lime-400" />
              <span>Save System Settings & Profile</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
