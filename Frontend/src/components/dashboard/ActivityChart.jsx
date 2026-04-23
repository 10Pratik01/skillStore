import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

/**
 * Builds a "lessons completed per day" chart for the last 7 days
 * from the real LessonProgress objects returned by the backend.
 * Each LessonProgress has: { lessonId, courseId, completed, completedAt }
 */
const buildActivityData = (progressMap) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.toISOString().slice(0, 10), // YYYY-MM-DD
      lessons: 0,
    });
  }

  // Flatten all completed lessons across all courses
  const allProgress = Object.values(progressMap).flat();
  for (const p of allProgress) {
    if (!p.completed || !p.completedAt) continue;
    const completedDate = p.completedAt.slice(0, 10);
    const slot = days.find(d => d.date === completedDate);
    if (slot) slot.lessons += 1;
  }

  return days;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-soft text-sm">
      <p className="font-extrabold text-textMain mb-1">{label}</p>
      <p className="text-primary font-bold">{payload[0].value} lesson{payload[0].value !== 1 ? 's' : ''} completed</p>
    </div>
  );
};

const ActivityChart = ({ progressData }) => {
  const data = useMemo(() => buildActivityData(progressData), [progressData]);
  const totalThisWeek = data.reduce((s, d) => s + d.lessons, 0);

  return (
    <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-soft">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-extrabold text-textMain mb-0.5">Weekly Activity</h3>
          <p className="text-secondary text-xs">Lessons completed per day (last 7 days)</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-primary">{totalThisWeek}</p>
          <p className="text-xs text-secondary font-medium">this week</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6c48f2" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6c48f2" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false} tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="lessons"
            stroke="#6c48f2"
            strokeWidth={3}
            fill="url(#actGrad)"
            dot={{ fill: '#6c48f2', r: 5, strokeWidth: 0 }}
            activeDot={{ r: 7, fill: '#6c48f2', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
