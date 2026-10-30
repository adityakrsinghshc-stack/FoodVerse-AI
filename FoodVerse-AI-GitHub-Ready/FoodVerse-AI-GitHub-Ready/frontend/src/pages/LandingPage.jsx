import React from 'react';
import { Link } from 'react-router-dom';
import {
  ScanEye,
  Activity,
  Apple,
  ShieldCheck,
  ChefHat,
  CalendarDays,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  HeartPulse,
} from 'lucide-react';
import Badge from '../components/Badge';

export default function LandingPage() {
  const features = [
    {
      title: 'Food Recognition',
      desc: 'Identify foods, ingredients, and dishes from camera captures using computer vision food classification models.',
      icon: ScanEye,
      color: 'forest',
      link: '/recognize',
    },
    {
      title: 'Nutrition Analyzer',
      desc: 'Calculate precise macronutrients, calories, and transparent explainable health scores with dynamic portion scaling.',
      icon: Activity,
      color: 'lime',
      link: '/nutrition',
    },
    {
      title: 'Produce Freshness Checker',
      desc: 'Inspect fruits and vegetables for visible enzymatic browning, chlorophyll degradation, and surface texture decay.',
      icon: Apple,
      color: 'emerald',
      link: '/freshness',
    },
    {
      title: 'Kitchen Hygiene Monitor',
      desc: 'Audit kitchen video frames with OpenCV to verify hair coverings, glove protection, and workstation cleanliness.',
      icon: ShieldCheck,
      color: 'orange',
      link: '/hygiene',
    },
    {
      title: 'AI Cooking Assistant',
      desc: 'Conversational chef with voice speech-to-text, ingredient matching, culinary substitutions, and step-by-step guidance.',
      icon: ChefHat,
      color: 'amber',
      link: '/cooking',
    },
    {
      title: 'Personalized Meal Planner',
      desc: 'Generate balanced daily and weekly dietary plans tailored to your age, allergies, fitness goals, and grocery budget.',
      icon: CalendarDays,
      color: 'purple',
      link: '/meal-plan',
    },
  ];

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-900 via-forest-800 to-forest-950 text-white p-8 sm:p-14 shadow-card">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-lime-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-accent-orange/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-forest-800/80 border border-forest-700/80 text-lime-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Multimodal Food AI</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Food Verse <span className="text-lime-400">AI</span>
            <span className="block text-2xl sm:text-3xl font-semibold text-slate-200 mt-2">
              Intelligent Food, Nutrition & Kitchen Hygiene Agent
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            A unified full-stack intelligence platform that bridges computer vision, USDA-standard nutritional science, visible produce freshness assessment, automated hygiene auditing, and LLM-assisted culinary guidance.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-forest-950 font-bold text-sm shadow-lg shadow-lime-500/20 hover:shadow-lime-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/recognize"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-forest-800/80 hover:bg-forest-800 text-white font-semibold text-sm border border-forest-700 transition-all duration-200"
            >
              <ScanEye className="w-4 h-4 text-lime-400" />
              <span>Try Food Recognition</span>
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-forest-800/80 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
            <span>MobileNetV2 Vision</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
            <span>USDA FoodData Mapping</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
            <span>OpenCV Video Hygiene</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
            <span>Multimodal Voice & Chat</span>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Integrated Food Intelligence Modules
          </h2>
          <p className="text-sm text-slate-500">
            Six comprehensive AI & computer vision pipelines engineered for consumers, dietitians, and commercial culinary operators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center group-hover:bg-lime-100 group-hover:text-forest-900 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-forest-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={item.link}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-forest-700 hover:text-lime-600 transition-colors"
                  >
                    <span>Launch Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-[11px] text-slate-400 font-medium">Ready</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* System Architecture Section */}
      <section className="bg-cream-100 rounded-3xl p-8 sm:p-12 border border-cream-200 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-forest-900 text-lime-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">End-to-End Multimodal Architecture</h3>
            <p className="text-xs text-slate-600">Built with modern, production-grade engineering principles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="font-bold text-forest-800 text-sm block">1. Frontend Layer</span>
            <p className="text-slate-600 leading-relaxed">
              ReactJS with Vite, Tailwind CSS, Recharts for data visualizations, Lucide React icons, and Web Speech API for voice synthesis and microphone input.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="font-bold text-forest-800 text-sm block">2. High-Performance API</span>
            <p className="text-slate-600 leading-relaxed">
              FastAPI backend with Pydantic validation, SQLite database via SQLAlchemy, file safety limits, and structured REST endpoints with Swagger UI.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="font-bold text-forest-800 text-sm block">3. Computer Vision & LLM</span>
            <p className="text-slate-600 leading-relaxed">
              OpenCV 5 & Pillow image color space pipelines, frame-by-frame video hygiene keyframe sampling, and Gemini LLM with robust offline culinary fallbacks.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
