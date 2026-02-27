
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { DailyStats, UserProfile } from '../types';

interface DashboardProps {
  stats: DailyStats;
  profile: UserProfile;
  onAddWater: () => void;
  onRemoveWater: () => void;
  onUpdateProfile: (field: keyof UserProfile, value: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, profile, onAddWater, onRemoveWater, onUpdateProfile }) => {
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const caloriePercent = Math.min((stats.calories / profile.dailyGoal) * 100, 100);
  
  const weeklyData = [
    { day: 'Mon', cal: 1850 },
    { day: 'Tue', cal: 2100 },
    { day: 'Wed', cal: 1950 },
    { day: 'Thu', cal: stats.calories },
    { day: 'Fri', cal: 1700 },
    { day: 'Sat', cal: 2200 },
    { day: 'Sun', cal: 1800 },
  ];

  const intervals = [
    { label: '30m', value: 30 },
    { label: '1h', value: 60 },
    { label: '2h', value: 120 },
    { label: '3h', value: 180 }
  ];

  return (
    <div className="tab-content space-y-8 pb-32 px-5 pt-8">
      {/* Header Section */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Hello, <span className="text-emerald-600">{profile.name}</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Ready to fuel your body?</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-emerald-500">
          <i className="fa-solid fa-sparkles text-xl"></i>
        </div>
      </header>

      {/* Main Stats Card */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg shadow-slate-200/60 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-48 h-48 relative flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle 
                  cx="96" cy="96" r="88" 
                  stroke="currentColor" strokeWidth="12" fill="transparent" 
                  strokeDasharray={552.9} 
                  strokeDashoffset={552.9 - (552.9 * caloriePercent) / 100} 
                  strokeLinecap="round"
                  className="text-emerald-500 transition-all duration-1000 ease-out" 
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Calories Left</span>
                <h3 className="text-5xl font-extrabold text-slate-800">{Math.max(0, profile.dailyGoal - stats.calories)}</h3>
                <span className="text-emerald-500 text-sm font-bold mt-1">{stats.calories} kcal consumed</span>
             </div>
          </div>
        </div>
      </div>

      {/* Daily Progress Chart */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold text-slate-800 tracking-tight">Weekly Intensity</h4>
          <span className="text-[10px] font-extrabold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg uppercase tracking-wider">Last 7 Days</span>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} dy={10} />
              <Tooltip 
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px'}} 
                cursor={{stroke: '#e2e8f0', strokeWidth: 1}}
              />
              <Area type="monotone" dataKey="cal" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trackers Grid */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
          {/* Reminder Toggle Button */}
          <button 
            onClick={() => setShowReminderSettings(!showReminderSettings)}
            className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all ${profile.waterReminderEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
          >
            <i className={`fa-solid ${profile.waterReminderEnabled ? 'fa-bell' : 'fa-bell-slash'} text-xs`}></i>
          </button>

          {showReminderSettings && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 p-4 flex flex-col animate-fadeIn">
               <button onClick={() => setShowReminderSettings(false)} className="absolute top-4 right-4 text-slate-400">
                  <i className="fa-solid fa-xmark"></i>
               </button>
               <h5 className="text-[10px] font-black uppercase text-slate-400 mt-2 mb-4 tracking-widest">Reminders</h5>
               <div className="flex flex-col gap-3 w-full">
                  <button 
                    onClick={() => onUpdateProfile('waterReminderEnabled', !profile.waterReminderEnabled)}
                    className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${profile.waterReminderEnabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-200 text-slate-500'}`}
                  >
                    {profile.waterReminderEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                     {intervals.map(int => (
                       <button
                        key={int.value}
                        onClick={() => onUpdateProfile('waterReminderInterval', int.value)}
                        className={`py-2 rounded-xl text-[10px] font-black transition-all ${profile.waterReminderInterval === int.value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
                       >
                         {int.label}
                       </button>
                     ))}
                  </div>
               </div>
            </div>
          )}

          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
            <i className="fa-solid fa-droplet text-lg"></i>
          </div>
          <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">Hydration</span>
          <div className="flex items-baseline gap-1 my-2">
            <h3 className="text-3xl font-extrabold text-slate-900">{stats.water}</h3>
            <span className="text-slate-400 text-xs font-bold">/ 8</span>
          </div>
          <div className="flex gap-2 w-full mt-2">
            <button onClick={onAddWater} className="flex-1 bg-slate-900 text-white h-11 rounded-xl flex items-center justify-center active:scale-95 transition-all">
              <i className="fa-solid fa-plus text-xs"></i>
            </button>
            <button onClick={onRemoveWater} className="w-11 bg-slate-100 text-slate-400 h-11 rounded-xl flex items-center justify-center active:scale-95 transition-all">
              <i className="fa-solid fa-minus text-xs"></i>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
          <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest block mb-4 text-center">Today's Macros</span>
          <div className="space-y-4">
             <MacroBar label="Prot" color="bg-orange-400" value={stats.items.reduce((acc, i) => acc + (i.protein || 0), 0)} goal={profile.proteinGoal} />
             <MacroBar label="Carb" color="bg-emerald-400" value={stats.items.reduce((acc, i) => acc + (i.carbs || 0), 0)} goal={profile.carbsGoal} />
             <MacroBar label="Fat" color="bg-indigo-400" value={stats.items.reduce((acc, i) => acc + (i.fat || 0), 0)} goal={profile.fatGoal} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-extrabold text-slate-800 text-lg tracking-tight">Today's Fuel</h4>
          <button className="text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full">History</button>
        </div>
        {stats.items.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm font-medium">Log your first meal to see stats here</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {stats.items.slice(-3).reverse().map(item => (
              <div key={item.id} className="bg-white rounded-[1.5rem] p-4 flex items-center gap-4 border border-slate-50 shadow-sm hover:border-emerald-100 transition-colors">
                 <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0 shadow-inner">
                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><i className="fa-solid fa-bowl-food text-slate-300"></i></div>}
                 </div>
                 <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-slate-800 truncate">{item.name}</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                 </div>
                 <div className="text-right">
                    <span className="text-sm font-black text-slate-900">{item.calories}</span>
                    <p className="text-[8px] font-black text-slate-300 uppercase leading-none">kcal</p>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MacroBar: React.FC<{ label: string; color: string; value: number; goal: number }> = ({ label, color, value, goal }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 tracking-wider">
      <span>{label}</span>
      <span className="text-slate-600">{Math.round(value)}g / {goal}g</span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-700 ease-out rounded-full`} 
        style={{ width: `${Math.min((value / goal) * 100, 100)}%` }}
      />
    </div>
  </div>
);

export default Dashboard;
