import React, { useState } from 'react';
import { EvaluationRow } from '../App';
import { WEEK_HIGHLIGHT_THRESHOLD, WEEK_HIGHLIGHT_CLASS } from '../config';

interface WeekBalancerProps {
  onNavigate: (page: string) => void;
  onDayClick?: (dateStr: string) => void;
  data?: EvaluationRow[];
}

const WeekBalancer: React.FC<WeekBalancerProps> = ({ onNavigate, data = [], onDayClick }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedCourse, setSelectedCourse] = useState('');

  const courses = Array.from(new Set(data.map(d => d.Course))).filter(Boolean);
  const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const filtered = data.filter((row) => {
    const dueDayRaw = row['Due Day'];
    if (!dueDayRaw) return false;

    const dueDay = new Date(dueDayRaw.trim());
    if (isNaN(dueDay.getTime())) return false;

    return (
      dueDay.getFullYear() === year &&
      dueDay.getMonth() + 1 === month &&
      (!selectedCourse || row.Course === selectedCourse)
    );
  });

  // 构建日历矩阵（每周7天，周一开始）
  const getCalendarMatrix = (): Date[][] => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const matrix: Date[][] = [];

    let current = new Date(firstDay);
    const offset = (current.getDay() + 6) % 7; // 将周日设为6，周一为0
    current.setDate(current.getDate() - offset);

    while (current <= lastDay || current.getDay() !== 1) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      matrix.push(week);
    }

    return matrix;
  };

  const calendar = getCalendarMatrix();

  const countEvaluationsInWeek = (week: Date[]): number => {
    return filtered.filter((row) => {
      const rowDate = new Date(row['Due Day'].trim());
      return week.some(day =>
        rowDate.getFullYear() === day.getFullYear() &&
        rowDate.getMonth() === day.getMonth() &&
        rowDate.getDate() === day.getDate()
      );
    }).length;
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* 控制栏：年/月/Course 选择 */}
      <div className="mb-4 flex gap-4">
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {courses.length > 0 && (
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {/* 日历表格 */}
      <table className="table-fixed border-collapse w-full text-center border text-sm">
        <thead>
          <tr>
            {dayHeaders.map((day) => (
              <th key={day} className="border p-2 bg-gray-100">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendar.map((week, wi) => {
            const count = countEvaluationsInWeek(week);
            const highlight = count >= WEEK_HIGHLIGHT_THRESHOLD;

            return (
              <tr key={wi} className={highlight ? WEEK_HIGHLIGHT_CLASS : ''}>
                {week.map((day, di) => {
                  const dayStr = day.toDateString();
                  const evaluationsToday = filtered.filter(row => {
                    return row['Due Day'].trim().slice(0, 10) === day.toISOString().slice(0, 10)
                  });

                  return (
                    <td
                      key={di}
                      className="border align-top p-1 text-left cursor-pointer hover:bg-blue-100"
                      onClick={() => {
                        if (onDayClick && day.getMonth() + 1 === month) {
                          onDayClick(day.toISOString().slice(0, 10)); // e.g. "2025-06-01"
                        }
                      }}
                    >
                      <div className="font-bold">{day.getMonth() + 1 === month ? day.getDate() : ''}</div>
                      {evaluationsToday.map((ev, i) => (
                        <div key={i}>
                          {ev.Course} - {ev['Evaluation Weight']} - {ev['Evaluation Type']}
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-6 text-center">
        <button
          onClick={() => onNavigate('upload')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Go to Upload
        </button>
      </div>
    </div>
  );
};

export default WeekBalancer;
