
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { AnalyticSummary } from '../types';

interface AnalyticsDashboardProps {
  data: AnalyticSummary[];
  monthlyTargets: string[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data, monthlyTargets }) => {
  const pieData = data.map((d, i) => ({
    name: d.name,
    value: d.actual
  })).filter(d => d.value > 0);

  const totalPossible = data.reduce((acc, curr) => acc + curr.goal, 0);
  const totalActual = data.reduce((acc, curr) => acc + curr.actual, 0);
  const overallProgress = totalPossible > 0 ? (totalActual / totalPossible) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      {/* Analysis Table */}
      <div className="bg-white border-2 border-slate-800 rounded-lg p-4 shadow-sm overflow-x-auto">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-600 rounded-full" />
          ANALYSIS
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-600 font-bold">
              <th className="p-2 text-left">HABIT</th>
              <th className="p-2 text-center">GOAL</th>
              <th className="p-2 text-center">ACTUAL</th>
              <th className="p-2 text-right">PROGRESS</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-100">
                <td className="p-2 font-medium text-slate-800">{item.name}</td>
                <td className="p-2 text-center text-slate-500">{item.goal}</td>
                <td className="p-2 text-center font-bold text-slate-800">{item.actual}</td>
                <td className="p-2 text-right text-blue-600 font-bold">{Math.round(item.progress)}%</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-slate-400 italic">No habits added yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Chart Section */}
      <div className="bg-white border-2 border-slate-800 rounded-lg p-4 shadow-sm flex flex-col">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-green-600 rounded-full" />
          PIE ANALYTICS
        </h3>
        <div className="flex-1 min-h-[300px]">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              Add data to see distribution
            </div>
          )}
        </div>
        <div className="text-center mt-4">
          <p className="text-3xl font-black text-slate-800">{Math.round(overallProgress)}%</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overall Completion</p>
        </div>
      </div>

      {/* Monthly Targets Section */}
      <div className="bg-white border-2 border-slate-800 rounded-lg p-4 shadow-sm">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-purple-600 rounded-full" />
          MONTHLY TARGETS
        </h3>
        <div className="space-y-2">
          {monthlyTargets.map((target, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded">
              <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
              <span className="text-sm text-slate-700">{target}</span>
            </div>
          ))}
          {monthlyTargets.length < 10 && Array.from({ length: 10 - monthlyTargets.length }).map((_, i) => (
            <div key={i} className="h-9 border-b border-slate-100 flex items-center">
              <span className="text-slate-200">..................................................</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
