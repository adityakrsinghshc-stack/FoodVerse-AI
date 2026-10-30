import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { foodApi } from '../services/api';
import {
  Apple,
  UploadCloud,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Thermometer,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Eye,
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';

const PRODUCE_CATEGORIES = [
  { id: 'apple', name: 'Apples' },
  { id: 'banana', name: 'Bananas' },
  { id: 'orange', name: 'Citrus / Oranges' },
  { id: 'tomato', name: 'Tomatoes' },
  { id: 'spinach', name: 'Spinach & Leafy Greens' },
  { id: 'produce', name: 'General Fruit / Vegetable' },
];

export default function FreshnessChecker() {
  const { addToast } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('apple');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      addToast('Please upload a valid image file (JPG, PNG, WEBP).', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      addToast('Image size exceeds 15MB limit.', 'error');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('food_category', selectedCategory);

    try {
      const data = await foodApi.analyzeFreshness(formData);
      setResult(data);
      addToast(`Analyzed ${data.food_category}: ${data.freshness_status}`, 'success');
    } catch (err) {
      addToast(err.message || 'Freshness analysis failed.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
          <Apple className="w-3.5 h-3.5" />
          <span>Computer Vision Produce Inspection</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Food Freshness Checker
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Inspect visible indicators of produce vitality, surface oxidation, and tissue decomposition. Get actionable, science-based storage advice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-4">
          <Card title="Select Produce Category" icon={Apple}>
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                {PRODUCE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                      selectedCategory === cat.id
                        ? 'border-forest-600 bg-forest-50 text-forest-900 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Upload Dropzone */}
              <div className="pt-2">
                {!previewUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-forest-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-white transition-colors flex flex-col items-center justify-center space-y-2"
                  >
                    <UploadCloud className="w-8 h-8 text-forest-600" />
                    <div>
                      <p className="font-bold text-slate-800">Upload Produce Photo</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WEBP</p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center">
                      <img src={previewUrl} alt="Produce" className="w-full h-full object-contain" />
                      <button
                        onClick={clearSelection}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="w-full py-3 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                    >
                      {analyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Auditing Visual Markers...</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 text-lime-400" />
                          <span>Assess Freshness Indicators</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Freshness Status Card */}
              <Card
                title={`${result.food_category} Freshness Assessment`}
                subtitle={result.model_mode}
                icon={CheckCircle2}
                badge={
                  <Badge
                    variant={
                      result.freshness_status === 'Fresh'
                        ? 'emerald'
                        : result.freshness_status === 'Moderately Fresh'
                        ? 'amber'
                        : 'rose'
                    }
                    size="md"
                  >
                    {result.freshness_status}
                  </Badge>
                }
              >
                <div className="space-y-6">
                  {/* Gauge */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-forest-50/60 border border-forest-100">
                    <div>
                      <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider block">
                        Freshness Vitality Score
                      </span>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-black text-forest-950">
                          {result.freshness_score}
                        </span>
                        <span className="text-xs text-forest-600 font-semibold">/ 100</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Certainty</span>
                      <span className="font-bold text-slate-800 text-sm">{result.confidence}%</span>
                    </div>
                  </div>

                  {/* Advisory */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-1">Visual Observation:</span>
                    {result.safety_advisory}
                  </div>

                  {/* Visible Indicators */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-900 text-xs block">
                      Observable Computer Vision Metrics:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {result.visible_indicators.map((ind, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-slate-100 bg-white shadow-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{ind.name}</span>
                            <Badge
                              variant={
                                ind.status === 'optimal'
                                  ? 'emerald'
                                  : ind.status === 'caution'
                                  ? 'amber'
                                  : 'rose'
                              }
                              size="sm"
                            >
                              {ind.status}
                            </Badge>
                          </div>
                          <span className="text-forest-700 font-semibold block text-[11px]">
                            {ind.observed_value}
                          </span>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {ind.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Storage Suggestions Card */}
              {result.storage_suggestions && result.storage_suggestions.length > 0 && (
                <Card title="Practical Shelf-Life Extension Tips" icon={Thermometer}>
                  <div className="space-y-3 text-xs">
                    {result.storage_suggestions.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-100 bg-cream-50/60 flex items-start space-x-3"
                      >
                        <div className="w-7 h-7 rounded-lg bg-lime-100 text-forest-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">{tip.environment}</span>
                            <span className="text-[10px] text-forest-700 bg-forest-100 px-1.5 rounded font-medium">
                              {tip.duration}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">{tip.tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Safety Disclaimer Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-amber-900">
                  <span className="font-bold">Important Notice:</span> {result.disclaimer}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
              <Apple className="w-10 h-10 text-slate-300" />
              <div>
                <p className="font-semibold text-slate-700 text-sm">No Produce Inspected Yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Pick a category and upload an image on the left to evaluate visible browning, texture, and storage advice.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
