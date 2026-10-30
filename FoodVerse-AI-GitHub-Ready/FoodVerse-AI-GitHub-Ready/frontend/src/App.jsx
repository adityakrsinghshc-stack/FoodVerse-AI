import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import FoodRecognition from './pages/FoodRecognition';
import NutritionAnalyzer from './pages/NutritionAnalyzer';
import FreshnessChecker from './pages/FreshnessChecker';
import HygieneMonitor from './pages/HygieneMonitor';
import AICookingAssistant from './pages/AICookingAssistant';
import MealPlanner from './pages/MealPlanner';
import AnalysisHistory from './pages/AnalysisHistory';
import SettingsPage from './pages/SettingsPage';

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex">
      {/* Toast notifications */}
      <ToastContainer />

      {/* Responsive Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Navbar setMobileOpen={setMobileOpen} />

        <main className="flex-1 px-4 sm:px-8 pt-6">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recognize" element={<FoodRecognition />} />
            <Route path="/nutrition" element={<NutritionAnalyzer />} />
            <Route path="/freshness" element={<FreshnessChecker />} />
            <Route path="/hygiene" element={<HygieneMonitor />} />
            <Route path="/cooking" element={<AICookingAssistant />} />
            <Route path="/meal-plan" element={<MealPlanner />} />
            <Route path="/history" element={<AnalysisHistory />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppLayout />
      </Router>
    </AppProvider>
  );
}
