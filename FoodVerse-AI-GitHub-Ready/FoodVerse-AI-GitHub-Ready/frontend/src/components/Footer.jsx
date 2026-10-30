import React from 'react';
import { Heart, ShieldCheck, Database, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200/80 bg-white/50 py-8 px-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-700">Food Verse AI</span>
          <span>•</span>
          <span>Multimodal Food Intelligence Agent</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600">
          <div className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-forest-600" />
            <span>Computer Vision & OpenCV</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-lime-600" />
            <span>USDA FoodData Calibrated Reference</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-orange" />
            <span>Observable Safety & Hygiene Audit</span>
          </div>
        </div>

        <div className="text-slate-400 text-center md:text-right">
          Estimates provided for informational & culinary guidance.
        </div>
      </div>
    </footer>
  );
}
