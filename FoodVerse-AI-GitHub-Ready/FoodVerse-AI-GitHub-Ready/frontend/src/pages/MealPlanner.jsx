import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { foodApi } from '../services/api';
import {
  CalendarDays,
  Sparkles,
  Printer,
  Bookmark,
  CheckCircle2,
  DollarSign,
  Flame,
  Activity,
  ShoppingBag,
  Info,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';

export default function MealPlanner() {
  const { userProfile, addToast } = useApp();

  const [dietaryPref, setDietaryPref] = useState(userProfile.dietary_preference || 'vegetarian');
  const [goal, setGoal] = useState(userProfile.fitness_goal || 'general_wellness');
  const [duration, setDuration] = useState('daily');
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [budgetTier, setBudgetTier] = useState('medium');
  const [allergiesText, setAllergiesText] = useState((userProfile.allergies || []).join(', '));
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  const handleGeneratePlan = async () => {
    setLoading(true);

    const allergiesList = allergiesText
      .split(',')
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean);

    try {
      const data = await foodApi.generateMealPlan({
        age: userProfile.age || 26,
        dietary_preference: dietaryPref,
        goal: goal,
        allergies: allergiesList,
        daily_budget_tier: budgetTier,
        meals_per_day: Number(mealsPerDay),
        duration: duration,
      });

      setPlan(data);
      addToast(`Generated ${data.duration} plan successfully!`, 'success');
    } catch (err) {
      addToast(err.message || 'Could not generate meal plan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!plan) return;
    try {
      await foodApi.saveMealPlan(plan);
      addToast('Meal plan saved to your profile!', 'success');
    } catch (err) {
      addToast('Error saving meal plan.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1.5 print:hidden">
        <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Dietary Optimization Pipeline</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Personalized Meal Planner
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Design goal-aligned, allergy-safe meal schedules with calibrated macronutrients, homestyle cooking recipes, and categorized grocery shopping lists.
        </p>
      </div>

      {/* Planner Controls Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-6 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Dietary Preference */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Dietary Preference</label>
            <select
              value={dietaryPref}
              onChange={(e) => setDietaryPref(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium focus:ring-1 focus:ring-forest-600 capitalize text-xs"
            >
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan (100% Plant-Based)</option>
              <option value="eggetarian">Eggetarian</option>
              <option value="non-vegetarian">Non-Vegetarian</option>
            </select>
          </div>

          {/* Fitness Goal */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Target Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium focus:ring-1 focus:ring-forest-600 text-xs"
            >
              <option value="general_wellness">General Wellness & Balance</option>
              <option value="weight_management">Weight Management (Caloric Deficit)</option>
              <option value="muscle_gain">Muscle Synthesis (High Protein)</option>
            </select>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Schedule Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium focus:ring-1 focus:ring-forest-600 text-xs"
            >
              <option value="daily">Single Day Plan</option>
              <option value="weekly">Full 7-Day Weekly Schedule</option>
            </select>
          </div>

          {/* Meals Per Day */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Meals Per Day</label>
            <select
              value={mealsPerDay}
              onChange={(e) => setMealsPerDay(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-medium focus:ring-1 focus:ring-forest-600 text-xs"
            >
              <option value={3}>3 Meals (Breakfast, Lunch, Dinner)</option>
              <option value={4}>4 Meals (Includes Evening Snack)</option>
            </select>
          </div>
        </div>

        {/* Second Row: Allergies & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Allergies & Exclusions</label>
            <input
              type="text"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              placeholder="e.g. peanuts, dairy, gluten, soy (comma separated)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Budget Tier</label>
            <div className="grid grid-cols-3 gap-2">
              {['budget', 'medium', 'premium'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudgetTier(b)}
                  className={`py-2 rounded-xl border font-semibold capitalize text-xs transition-colors ${
                    budgetTier === b
                      ? 'border-forest-700 bg-forest-50 text-forest-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGeneratePlan}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Synthesizing Meal Schedule & Macros...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-lime-400" />
              <span>Generate Personalized Meal Plan</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Meal Plan View */}
      {plan && (
        <div className="space-y-6">
          {/* Plan Header */}
          <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="lime" size="sm">
                  {plan.dietary_preference.toUpperCase()}
                </Badge>
                <Badge variant="forest" size="sm">
                  {plan.goal.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {plan.title}
              </h3>
              <p className="text-xs text-forest-200">
                Average Daily Energy: <span className="text-lime-300 font-bold">{plan.average_daily_calories} kcal/day</span> • Estimated Grocery Cost: <span className="text-white font-bold">${plan.estimated_total_cost}</span>
              </p>
            </div>

            <div className="flex items-center space-x-3 print:hidden">
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-semibold text-xs border border-forest-700 transition-colors flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Schedule</span>
              </button>
              <button
                onClick={handleSavePlan}
                className="px-4 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-forest-950 font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <Bookmark className="w-4 h-4" />
                <span>Save Plan</span>
              </button>
            </div>
          </div>

          {/* Days Breakdown */}
          <div className="space-y-6">
            {plan.days.map((dayPlan, dIdx) => (
              <div
                key={dIdx}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-forest-700" />
                    <h4 className="font-extrabold text-slate-900 text-lg">{dayPlan.day}</h4>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-semibold text-slate-700">
                    <span>{dayPlan.total_calories} kcal</span>
                    <span>•</span>
                    <span className="text-emerald-700">{dayPlan.total_protein_g}g Protein</span>
                    <span>•</span>
                    <span className="text-slate-500">${dayPlan.approximate_daily_cost}</span>
                  </div>
                </div>

                {/* Meals Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {/* Breakfast */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">
                      Breakfast
                    </span>
                    <div className="font-bold text-slate-900 text-sm leading-snug">
                      {dayPlan.breakfast.name}
                    </div>
                    <div className="text-[11px] text-forest-700 font-semibold">
                      {dayPlan.breakfast.calories} kcal • {dayPlan.breakfast.protein_g}g P
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {dayPlan.breakfast.prep_instructions}
                    </p>
                  </div>

                  {/* Lunch */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">
                      Lunch
                    </span>
                    <div className="font-bold text-slate-900 text-sm leading-snug">
                      {dayPlan.lunch.name}
                    </div>
                    <div className="text-[11px] text-forest-700 font-semibold">
                      {dayPlan.lunch.calories} kcal • {dayPlan.lunch.protein_g}g P
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {dayPlan.lunch.prep_instructions}
                    </p>
                  </div>

                  {/* Evening Snack */}
                  {dayPlan.evening_snack && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <span className="text-slate-400 font-bold text-[10px] uppercase block">
                        Evening Snack
                      </span>
                      <div className="font-bold text-slate-900 text-sm leading-snug">
                        {dayPlan.evening_snack.name}
                      </div>
                      <div className="text-[11px] text-forest-700 font-semibold">
                        {dayPlan.evening_snack.calories} kcal • {dayPlan.evening_snack.protein_g}g P
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {dayPlan.evening_snack.prep_instructions}
                      </p>
                    </div>
                  )}

                  {/* Dinner */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">
                      Dinner
                    </span>
                    <div className="font-bold text-slate-900 text-sm leading-snug">
                      {dayPlan.dinner.name}
                    </div>
                    <div className="text-[11px] text-forest-700 font-semibold">
                      {dayPlan.dinner.calories} kcal • {dayPlan.dinner.protein_g}g P
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {dayPlan.dinner.prep_instructions}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Consolidated Shopping List */}
          {plan.consolidated_shopping_list && plan.consolidated_shopping_list.length > 0 && (
            <Card title="Consolidated Grocery Shopping List" subtitle="Categorized for easy supermarket navigation" icon={ShoppingBag}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {plan.consolidated_shopping_list.map((cat, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-4 rounded-2xl border border-slate-100 bg-cream-50/50 space-y-2"
                  >
                    <span className="font-bold text-forest-900 text-xs block pb-1 border-b border-cream-200">
                      {cat.category}
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-slate-700">
                      {cat.items.map((item, iIdx) => (
                        <li key={iIdx} className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-lime-600 shrink-0" />
                          <span className="capitalize">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Nutritional Advisory Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-relaxed">
              <span className="font-bold">Medical Disclaimer:</span> {plan.nutrition_estimate_disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
