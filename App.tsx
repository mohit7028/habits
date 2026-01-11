
import React, { useState, useEffect, useMemo } from 'react';
import { Habit, DayCompletion, HabitState, AnalyticSummary } from './types';
import HabitGrid from './components/HabitGrid';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import VeoAnimator from './components/VeoAnimator';
import { Trophy, Calendar, Sparkles, BrainCircuit, Info } from 'lucide-react';
import { generateHabitMotivation } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<HabitState>(() => {
    const saved = localStorage.getItem('habit_tracker_state');
    return saved ? JSON.parse(saved) : {
      habits: [
        { id: '1', name: 'Morning Exercise', goal: 31, category: 'Health' },
        { id: '2', name: 'Read 20 Pages', goal: 31, category: 'Mind' },
        { id: '3', name: 'Meditation', goal: 31, category: 'Mind' },
        { id: '4', name: 'Deep Work (4hrs)', goal: 20, category: 'Work' }
      ],
      history: {},
      monthlyTargets: [
        "Complete 75% of all habits",
        "Finish a new book",
        "Run 50km total"
      ]
    };
  });

  const [currentMonth] = useState(new Date());
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('habit_tracker_state', JSON.stringify(state));
  }, [state]);

  const toggleDay = (date: string, habitId: string) => {
    setState(prev => {
      const dayData = prev.history[date] || {};
      const newDayData = { ...dayData, [habitId]: !dayData[habitId] };
      return {
        ...prev,
        history: { ...prev.history, [date]: newDayData }
      };
    });
  };

  const addHabit = () => {
    const name = prompt('Enter habit name:');
    if (!name) return;
    const goal = parseInt(prompt('Monthly goal (days):', '31') || '31');
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      goal: isNaN(goal) ? 31 : goal,
      category: 'General'
    };
    setState(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
  };

  const deleteHabit = (id: string) => {
    if (confirm('Delete this habit and all history?')) {
      setState(prev => ({
        ...prev,
        habits: prev.habits.filter(h => h.id !== id)
      }));
    }
  };

  const analyticsData = useMemo((): AnalyticSummary[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return state.habits.map(habit => {
      let actual = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (state.history[dateKey]?.[habit.id]) actual++;
      }
      return {
        habitId: habit.id,
        name: habit.name,
        actual,
        goal: habit.goal,
        progress: habit.goal > 0 ? (actual / habit.goal) * 100 : 0
      };
    });
  }, [state.habits, state.history, currentMonth]);

  const fetchAiInsight = async () => {
    setAiLoading(true);
    try {
      const summary = analyticsData.map(d => `${d.name}: ${d.actual}/${d.goal}`).join(', ');
      const insight = await generateHabitMotivation(summary);
      setAiInsight(insight || null);
    } catch (err) {
      console.error(err);
      setAiInsight("Unable to generate insight at this time.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b-2 border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-2 rounded-lg">
              <Trophy className="text-yellow-400" size={24} />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight italic">HABITQUEST PRO</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-slate-500 font-bold text-sm">
              <Calendar size={18} />
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <button 
              onClick={fetchAiInsight}
              disabled={aiLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
            >
              {aiLoading ? <Sparkles className="animate-pulse" /> : <BrainCircuit size={18} />}
              AI INSIGHT
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* AI Insight Alert */}
        {aiInsight && (
          <div className="mb-8 bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg shadow-sm flex gap-4 animate-in slide-in-from-top duration-500">
            <div className="bg-purple-500 p-3 rounded-full h-fit text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="font-black text-purple-900 mb-1">GEMINI AI INSIGHT</h4>
              <p className="text-purple-800 leading-relaxed text-sm italic">"{aiInsight}"</p>
              <button onClick={() => setAiInsight(null)} className="mt-3 text-xs font-bold text-purple-600 hover:underline">Dismiss</button>
            </div>
          </div>
        )}

        {/* Main Tracker Grid */}
        <section>
          <HabitGrid 
            currentMonth={currentMonth}
            habits={state.habits}
            history={state.history}
            onToggle={toggleDay}
            onAddHabit={addHabit}
            onDeleteHabit={deleteHabit}
          />
        </section>

        {/* Analytics Section */}
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-3xl font-black text-slate-800">PERFORMANCE SUMMARY</h2>
            <div className="flex-1 h-1 bg-slate-200" />
          </div>
          <AnalyticsDashboard 
            data={analyticsData}
            monthlyTargets={state.monthlyTargets}
          />
        </section>

        {/* Veo Animator Section */}
        <section className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-3xl font-black text-slate-800 uppercase italic">Goal Celebration</h2>
            <div className="flex-1 h-1 bg-slate-200" />
            <span className="bg-yellow-100 text-yellow-800 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">New AI Feature</span>
          </div>
          <VeoAnimator />
        </section>

        {/* Footer Info */}
        <footer className="mt-20 border-t-2 border-slate-200 pt-8 text-center text-slate-400">
          <div className="flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-widest mb-4">
            <Info size={14} /> Built with Google Gemini API & Veo Generation
          </div>
          <p className="text-xs">© {new Date().getFullYear()} HABITQUEST PRO. Your data is stored locally in your browser.</p>
        </footer>
      </main>

      {/* Floating Action for Mobile */}
      <button 
        onClick={addHabit}
        className="fixed bottom-6 right-6 w-14 h-14 bg-slate-800 text-white rounded-full shadow-2xl md:hidden flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
      >
        <span className="text-3xl">+</span>
      </button>
    </div>
  );
};

export default App;
