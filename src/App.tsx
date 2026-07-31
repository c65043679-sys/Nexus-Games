import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Play } from './pages/Play';
import { Settings } from './pages/Settings';
import { Updates } from './pages/Updates';
import { Category } from './types';
import { AuthProvider, useAuth } from './components/AuthContext';
import { SettingsProvider, useSettings } from './components/SettingsContext';
import { FpsCounter } from './components/FpsCounter';
import { PanicOverlay } from './components/PanicOverlay';

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const { profile } = useAuth();
  const { settings, updateSetting } = useSettings();

  React.useEffect(() => {
    if (profile?.themeColor && profile.themeColor !== settings.themeColor) {
      updateSetting('themeColor', profile.themeColor);
    }
  }, [profile?.themeColor]);

  return (
    <Router>
      <div className="relative min-h-screen bg-bg-dark text-slate-50 font-sans selection:bg-accent selection:text-white overflow-x-hidden">
        {/* Mesh Gradients */}
        {settings.enableMeshGradient && (
          <>
            <div className="mesh-gradient-1" />
            <div className="mesh-gradient-2" />
          </>
        )}

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar onSearch={setSearchQuery} />
          
          <main className="flex flex-1 overflow-hidden">
            <Sidebar 
              activeCategory={activeCategory} 
              onCategoryChange={setActiveCategory} 
            />
            
            <div className="flex-1 overflow-y-auto">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <Home 
                      searchQuery={searchQuery} 
                      activeCategory={activeCategory} 
                    />
                  } 
                />
                <Route path="/play/:id" element={<Play />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/updates" element={<Updates />} />
              </Routes>
            </div>
          </main>
          
          <footer className="relative py-8 px-6 border-t border-white/10 text-center text-slate-500 text-sm bg-bg-dark/40 backdrop-blur-md">
            <p>© 2026 NEXUS GAMES. All rights reserved.</p>
            <p className="mt-2 text-slate-600">Built with passion for the browser gaming community.</p>
          </footer>
        </div>

        {/* Global Performance HUD & Emergency Panic Overlay */}
        <FpsCounter />
        <PanicOverlay />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}

