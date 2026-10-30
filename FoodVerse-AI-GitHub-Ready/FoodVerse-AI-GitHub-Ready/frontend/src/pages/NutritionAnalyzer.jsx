import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { foodApi } from '../services/api';
import {
  Activity,
  Search,
  Scale,
  Sparkles,
  PieChart as PieIcon,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  Flame,
  Award,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import Card from '../components/Card';
import Badge from '../components/Badge';

export default function NutritionAnalyzer() {
  const { pendingFoodToAnalyze, setPendingFoodToAnalyze, addToast } = useApp();

  const [foodQuery, setFoodQuery] = useState(pendingFoodToAnalyze?.food_name || 'Palak Paneer');
  const [portionGrams, setPortionGrams] = useState(150);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (pendingFoodToAnalyze?.food_name) {
      setFoodQuery(pendingFoodToAnalyze.food_name);
      runAnalysis(pendingFoodToAnalyze.food_name, portionGrams);
      setPendingFoodToAnalyze(null);
    } else {
      runAnalysis(foodQuery, portionGrams);
    }
  }, []);

  const runAnalysis = async (foodName, grams) => {
    if (!foodName || !foodName.trim()) return;

    setLoading(true);
    try {
      const data = await foodApi.analyzeNutrition({
        food_name: foodName.trim(),
        portion_grams: Number(grams),
        save_to_history: true,
      });
      setReport(data);
    } catch (err) {
      addToast(err.message || 'Could not analyze food nutrition.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePortionChange = (newGrams) => {
    setPortionGrams(newGrams);
    runAnalysis(foodQuery, newGrams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    runAnalysis(foodQuery, portionGrams);
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5" />
          <span>USDA Standard Nutrition Calibrations</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Nutrition Analyzer
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Lookup genuine nutritional values for dishes, proteins, and ingredients. Adjust portion sizes dynamically to compute calibrated macronutrients, calories, and transparent health ratings.
        </p>
      </div>

      {/* Search & Portion Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={foodQuery}
              onChange={(e) => setFoodQuery(e.target.value)}
              placeholder="Search food item (e.g., Apple, Grilled Chicken, Palak Paneer, Oats, Brown Rice)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-600 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            {loading ? <span>Calculating...</span> : <span>Analyze Nutrition</span>}
          </button>
        </form>

        {/* Live Portion Slider */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2 text-slate-700 font-semibold">
            <Scale className="w-4 h-4 text-forest-600" />
            <span>Serving Portion Size:</span>
            <span className="text-forest-800 font-bold text-sm bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
              {portionGrams}g
            </span>
          </div>

          <div className="flex items-center space-x-3 flex-1 sm:max-w-xs">
            <span className="text-[11px] text-slate-400">50g</span>
            <input
              type="range"
              min="25"
              max="600"
              step="25"
              value={portionGrams}
              onChange={(e) => handlePortionChange(Number(e.target.value))}
              className="w-full accent-forest-700 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400">600g</span>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center space-x-1.5">
            {[100, 150, 200, 250].map((preset) => (
              <button
                key={preset}
                onClick={() => handlePortionChange(preset)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  portionGrams === preset
                    ? 'bg-forest-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {preset}g
              </button>
            ))}
          </div>
        </div>
      </div>

      {report && (
        <div className="space-y-6">
          {/* Main Summary Header Card */}
          <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {report.dietary_tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-lime-400/20 text-lime-300 border border-lime-400/30"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {report.food_name}
              </h3>
              <p className="text-xs text-forest-200">
                Nutritional values calculated for <span className="font-bold text-white">{report.portion_grams}g</span> portion
              </p>
            </div>

            <div className="flex items-center space-x-6 bg-forest-950/60 p-4 rounded-2xl border border-forest-800/80">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-forest-300 block">Total Calories</span>
                <span className="text-3xl font-black text-lime-400 tracking-tight">
                  {Math.round(report.calories)}
                </span>
                <span className="text-[10px] text-forest-300 block">kcal</span>
              </div>
              <div className="w-px h-10 bg-forest-800" />
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-forest-300 block">Health Rating</span>
                <span className="text-3xl font-black text-white tracking-tight">
                  {report.health_score.score}
                </span>
                <span className="text-[10px] text-forest-300 block">/ 100</span>
              </div>
            </div>
          </div>

          {/* Macronutrients & Health Score Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Macro Breakdown Card */}
            <div className="lg:col-span-7">
              <Card title="Macronutrient Distribution" subtitle="Gram amounts and caloric ratios" icon={PieIcon}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="h-44 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={report.macronutrients}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={4}
                          dataKey="amount_g"
                        >
                          {report.macronutrients.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val, name) => [`${val}g`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3 text-xs">
                    {report.macronutrients.map((m) => (
                      <div key={m.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                          <span className="font-semibold text-slate-800">{m.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">{m.amount_g}g</span>
                          <span className="text-[10px] text-slate-400 block font-medium">{m.percentage_of_calories}% cals</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Dietary Fiber</span>
                    <span className="font-bold text-slate-800">{report.fiber_g}g</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Total Sugars</span>
                    <span className="font-bold text-slate-800">{report.sugar_g}g</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Sodium Content</span>
                    <span className="font-bold text-slate-800">{report.sodium_mg}mg</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Health Score Explainer */}
            <div className="lg:col-span-5">
              <Card title="Transparent Health Score" subtitle={report.health_score.rating} icon={Award}>
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-forest-50 border border-forest-200 text-forest-950 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider block">Score Index</span>
                      <span className="text-2xl font-black text-forest-900">{report.health_score.score} / 100</span>
                    </div>
                    <Badge variant={report.health_score.score >= 75 ? 'emerald' : 'amber'}>
                      {report.health_score.rating}
                    </Badge>
                  </div>

                  {/* Positives */}
                  <div className="space-y-2">
                    <span className="font-bold text-emerald-800 text-xs flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Nutritional Highlights:</span>
                    </span>
                    <ul className="space-y-1.5 pl-4 text-slate-600 list-disc text-[11px] leading-relaxed">
                      {report.health_score.positives.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Warnings */}
                  {report.health_score.warnings && report.health_score.warnings.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="font-bold text-amber-800 text-xs flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Dietary Considerations:</span>
                      </span>
                      <ul className="space-y-1.5 pl-4 text-slate-600 list-disc text-[11px] leading-relaxed">
                        {report.health_score.warnings.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 italic pt-2 border-t border-slate-100">
                    {report.health_score.transparency_notes}
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Micronutrients Table if available */}
          {report.micronutrients && report.micronutrients.length > 0 && (
            <Card title="Micronutrients & Essential Minerals" subtitle="Vitamins and daily value estimates" icon={Sparkles}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {report.micronutrients.map((m) => (
                  <div key={m.name} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                    <span className="text-slate-500 text-[11px] block">{m.name}</span>
                    <div className="font-bold text-slate-900 text-sm">
                      {m.amount} {m.unit}
                    </div>
                    {m.daily_value_pct !== null && (
                      <span className="text-[10px] font-semibold text-forest-700 bg-forest-100/70 px-1.5 py-0.5 rounded inline-block">
                        {m.daily_value_pct}% Daily Value
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Mandatory Transparency & Scientific Disclaimer Card */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-amber-900 text-xs flex items-start space-x-3 leading-relaxed">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Scientific Notice on Nutritional Estimates:</span>
              <p className="mt-0.5 text-slate-600 text-[11px]">
                {report.disclaimer} Reference database: <span className="font-medium text-slate-800">{report.data_source}</span>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
