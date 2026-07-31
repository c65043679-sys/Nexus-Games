import React from 'react';
import { useSettings } from './SettingsContext';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export const PanicOverlay: React.FC = () => {
  const { isPanicTriggered, dismissPanic } = useSettings();

  if (!isPanicTriggered) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#f8f9fa] text-[#202124] flex flex-col font-sans select-none overflow-auto">
      {/* Fake Google Header */}
      <header className="h-16 border-b border-[#dadce0] bg-white flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-sm">
            G
          </div>
          <span className="font-medium text-lg text-[#3c4043]">Google Classroom</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-[#5f6368]">
          <span>Classes</span>
          <span>Calendar</span>
          <span>To-do</span>
          <button 
            onClick={dismissPanic}
            className="ml-4 px-3 py-1.5 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] rounded-md transition-colors flex items-center gap-1.5 font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Resume Session
          </button>
        </div>
      </header>

      {/* Fake Classroom Dashboard */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-8 space-y-6">
        <div className="bg-[#1a73e8] text-white p-8 rounded-2xl shadow-md">
          <h1 className="text-3xl font-bold mb-2">AP Computer Science & Systems</h1>
          <p className="text-blue-100 text-sm">Period 4 • Semester 2 • Assignment Portal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white border border-[#dadce0] p-6 rounded-xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1a73e8] uppercase tracking-wider">Upcoming Assignment</span>
                <span className="text-xs text-[#5f6368]">Due Tomorrow, 11:59 PM</span>
              </div>
              <h2 className="text-xl font-bold text-[#202124]">Lab 04: Data Structures & Hash Maps Optimization</h2>
              <p className="text-sm text-[#5f6368] leading-relaxed">
                Complete all exercise problems in chapter 4. Submit your compiled `.ts` solution along with test coverage results.
              </p>
              <div className="pt-2 flex justify-end">
                <button className="px-5 py-2 bg-[#1a73e8] text-white text-sm font-medium rounded-md hover:bg-[#1557b0] transition-colors">
                  View Assignment
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#dadce0] p-6 rounded-xl shadow-sm space-y-3">
              <h3 className="font-bold text-[#202124]">Class Announcement</h3>
              <p className="text-sm text-[#5f6368]">
                Midterm project review sessions will begin next Monday. Please bring your project outlines.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-[#dadce0] p-5 rounded-xl shadow-sm space-y-2">
              <h3 className="font-bold text-sm text-[#202124]">Work Due Soon</h3>
              <p className="text-xs text-[#5f6368]">Woohoo, no work due soon!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
