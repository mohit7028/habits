
import React, { useMemo } from 'react';
import { Habit, DayCompletion } from '../types';
import { Check, X, Plus, Trash2 } from 'lucide-react';

interface HabitGridProps {
  currentMonth: Date;
  habits: Habit[];
  history: { [date: string]: DayCompletion };
  onToggle: (date: string, habitId: string) => void;
  onAddHabit: () => void;
  onDeleteHabit: (id: string) => void;
}

const HabitGrid: React.FC<HabitGridProps> = ({ 
  currentMonth, 
  habits, 
  history, 
  onToggle, 
  onAddHabit,
  onDeleteHabit 
}) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleString('default', { month: 'long' }).toUpperCase();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getWeekNumber = (day: number) => Math.ceil(day / 7);

  const stats = useMemo(() => {
    let completed = 0;
    let totalPossible = habits.length * daysInMonth;
    
    habits.forEach(h => {
      daysArray.forEach(d => {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (history[dateKey]?.[h.id]) completed++;
      });
    });

    return {
      completed,
      progress: totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0
    };
  }, [habits, history, daysInMonth, month, year, daysArray]);

  return (
    <div className="bg-white border-2 border-slate-800 rounded-lg shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="flex border-b-2 border-slate-800">
        <div className="flex-1 bg-slate-200 p-6 border-r-2 border-slate-800 flex items-center justify-center">
          <h1 className="text-4xl font-black tracking-tighter text-slate-800">{monthName}</h1>
        </div>
        <div className="w-96 bg-slate-100 p-4 space-y-2">
          <div className="flex justify-between items-center text-sm font-bold text-slate-600">
            <span>Completed Habits</span>
            <span className="text-xl text-slate-800">{stats.completed}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-slate-600">
            <span>Progress in %</span>
            <span className="text-xl text-blue-600">{stats.progress}%</span>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            {/* Weeks Row */}
            <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className="border-r-2 border-b-2 border-slate-800 p-2 min-w-[200px] bg-slate-100">MY Habits</th>
              {[1, 2, 3, 4, 5].map(w => (
                <th key={w} colSpan={w === 5 ? (daysInMonth - 28) : 7} className="border-r-2 border-b-2 border-slate-800 p-2 bg-slate-50">
                  Week {w}
                </th>
              ))}
            </tr>
            {/* Days Row */}
            <tr className="bg-white text-xs font-bold text-slate-800">
              <th className="border-r-2 border-b-2 border-slate-800 p-2 text-left flex justify-between items-center">
                <span>HABIT NAME</span>
                <button onClick={onAddHabit} className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                  <Plus size={14} />
                </button>
              </th>
              {daysArray.map(d => (
                <th key={d} className="border-r border-b-2 border-slate-200 p-2 min-w-[32px] text-center">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id} className="hover:bg-slate-50 group">
                <td className="border-r-2 border-b border-slate-800 p-2 font-medium text-slate-700 flex justify-between items-center">
                  <span className="truncate">{habit.name}</span>
                  <button onClick={() => onDeleteHabit(habit.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600">
                    <Trash2 size={12} />
                  </button>
                </td>
                {daysArray.map(d => {
                  const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  const isDone = history[dateKey]?.[habit.id] || false;
                  return (
                    <td key={d} className="border-r border-b border-slate-200 p-0 text-center">
                      <button
                        onClick={() => onToggle(dateKey, habit.id)}
                        className={`w-full h-8 flex items-center justify-center transition-colors ${isDone ? 'bg-green-100 text-green-600' : 'bg-transparent hover:bg-slate-100'}`}
                      >
                        {isDone ? <Check size={16} strokeWidth={3} /> : <div className="w-4 h-4 border border-slate-300 rounded-sm" />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-bold text-[10px] text-slate-600 uppercase">
              <td className="border-r-2 border-slate-800 p-2">Progress (Daily)</td>
              {daysArray.map(d => {
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const dayDone = habits.filter(h => history[dateKey]?.[h.id]).length;
                return (
                  <td key={d} className="border-r border-slate-200 p-1 text-center bg-slate-50">
                    {dayDone > 0 && <span className="text-blue-600">{dayDone}</span>}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default HabitGrid;
