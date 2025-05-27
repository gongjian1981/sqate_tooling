// WeekBalancer.tsx
import React, { useState } from 'react';
import { EvaluationRow } from '../App';

interface WeekBalancerProps {
  data: EvaluationRow[];
  onBack: () => void;
}

const WeekBalancer: React.FC<WeekBalancerProps> = ({ data, onBack }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedCourse, setSelectedCourse] = useState('');

  const courses = Array.from(new Set(data.map(d => d.Course)));

  const filtered = data.filter(d => {
    const date = new Date(d['Due Day']);
    return (
      d.Course === selectedCourse &&
      date.getFullYear() === year &&
      date.getMonth() + 1 === month
    );
  });

  const weeks: Record<string, EvaluationRow[]>[] = [];

  const getWeeksInMonth = () => {
    const first = new Date(year, month - 1, 1);
    const last = new Date(year, month, 0);
    const weeks: Date[][] = [];

    let current = new Date(first);
    current.setDate(current.getDate() - ((current.getDay() + 6) % 7)); // Go to Monday of the first week

    while (current <= last || current.getDay() !== 1) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }

    return weeks;
  };

  const calendarWeeks = getWeeksInMonth();

  const countEvaluationsInWeek = (week: Date[]): number => {
    return filtered.filter(item => {
      const day = new Date(item['Due Day']);
      return week.some(w => w.toDateString() === day.toDateString());
    }).length;
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="mb-4 flex gap-4">
        <select value={year} onChange={e => setYear(Number(e.target.value))}>
          {Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select value={month} onChange={e => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
          <option value="" disabled>Select Course</option>
          {courses.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <table className="table-fixed border-collapse w-full text-center border">
        <thead>
          <tr>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <th key={day} className="border p-2">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendarWeeks.map((week, idx) => {
            const count = countEvaluationsInWeek(week);
            return (
              <tr key={idx} className={count > 3 ? 'bg-red-300' : ''}>
                {week.map((day, i) => (
                  <td key={i} className="border h-20 align-top p-1">
                    {day.getMonth() + 1 === month ? day.getDate() : ''}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        onClick={onBack}
        className="mt-6 bg-gray-600 text-white px-4 py-2 rounded"
      >
        Back
      </button>
    </div>
  );
};

export default WeekBalancer;
