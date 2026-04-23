import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#6c48f2', '#10b981', '#f59e0b'];

const CourseStatusPie = ({ completed, inProgress, total }) => {
  const notStarted = Math.max(0, total - completed - inProgress);
  const data = [
    { name: 'Completed',   value: completed  || 0 },
    { name: 'In Progress', value: inProgress || 0 },
    { name: 'Not Started', value: notStarted || 0 },
  ].filter(d => d.value > 0);

  if (total === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft flex flex-col items-center justify-center text-center">
        <div className="text-4xl mb-3">📊</div>
        <p className="font-extrabold text-textMain mb-1">No Courses Yet</p>
        <p className="text-secondary text-xs">Enroll in a course to see your progress</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft">
      <h3 className="font-extrabold text-textMain mb-0.5">Course Status</h3>
      <p className="text-secondary text-xs mb-4">Your completion breakdown</p>

      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={72}
            dataKey="value"
            stroke="none"
            paddingAngle={3}
          >
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: '13px' }}
            formatter={(value, name) => [`${value} course${value !== 1 ? 's' : ''}`, name]}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-col gap-2 mt-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-xs font-semibold text-secondary">{d.name}</span>
            </div>
            <span className="text-xs font-extrabold text-textMain">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseStatusPie;
