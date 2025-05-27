import React, { useState } from 'react';
import Papa from 'papaparse';
import { EvaluationRow } from '../App';
import {
  COURSE_OPTIONS,
  PROFESSOR_OPTIONS,
  EVALUATION_TYPE_OPTIONS,
} from '../config';

declare global {
  interface Window {
    electronAPI: {
      saveToCsvFile: (filePath: string, csvContent: string) => void;
    };
  }
}

export const saveToCsvFile = (filePath: string, data: EvaluationRow[]) => {
  const csv = Papa.unparse(data);
  window.electronAPI.saveToCsvFile(filePath, csv);
};

interface DailyViewProps {
  date: string;
  data: EvaluationRow[];
  filePath: string | null;
  onBack: () => void;
  onUpdate: (updatedData: EvaluationRow[]) => void;
}

const DailyView: React.FC<DailyViewProps> = ({ date, data, filePath, onBack, onUpdate }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<EvaluationRow>>({
    Course: '',
    Professor: '',
    'Evaluation Type': '',
    'Evaluation Weight': '',
  });

  const evaluationsForDate = data.filter((ev) =>
    ev['Due Day']?.trim().slice(0, 10) === date
  );

  const handleDelete = (index: number) => {
    const itemToDelete = evaluationsForDate[index];
    const updated = data.filter((ev) => ev !== itemToDelete);
    onUpdate(updated);
    console.log('filePath:', filePath); // ✅ 添加这行
    if (filePath) {
        console.log('Saving to:', filePath); // ✅ 添加这行
console.log("updated=" + updated);
      saveToCsvFile(filePath, updated); // 实时保存
    }
  };

  const handleEdit = (index: number) => {
    const ev = evaluationsForDate[index];
    setForm(ev);
    setEditingIndex(index);
  };

  const handleSave = () => {
    if (!form.Course || !form['Evaluation Type'] || !form['Evaluation Weight']) {
      alert('Course, Type, and Weight are required');
      return;
    }

    const updatedForm: EvaluationRow = {
      Course: form.Course!,
      Professor: form.Professor || '',
      'Evaluation Type': form['Evaluation Type']!,
      'Evaluation Weight': form['Evaluation Weight']!,
      'Due Day': date,
    };

    let updatedData: EvaluationRow[];

    if (editingIndex !== null) {
      const oldItem = evaluationsForDate[editingIndex];
      updatedData = data.map((ev) => (ev === oldItem ? updatedForm : ev));
    } else {
      updatedData = [...data, updatedForm];
    }

    onUpdate(updatedData);
    if (filePath) {
        console.log('Saving to:', filePath); // ✅ 添加这行
        saveToCsvFile(filePath, updatedData); // 实时保存
    }
    setForm({ Course: '', Professor: '', 'Evaluation Type': '', 'Evaluation Weight': '' });
    setEditingIndex(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-center">Evaluations on {date}</h2>

      <table className="w-full table-auto border border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Course</th>
            <th className="border p-2">Professor</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Weight</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {evaluationsForDate.map((ev, idx) => (
            <tr key={idx} className="text-center">
              <td className="border p-2">{ev.Course}</td>
              <td className="border p-2">{ev.Professor}</td>
              <td className="border p-2">{ev['Evaluation Type']}</td>
              <td className="border p-2">{ev['Evaluation Weight']}</td>
              <td className="border p-2 space-x-2">
                <button onClick={() => handleEdit(idx)} className="text-blue-600">Edit</button>
                <button onClick={() => handleDelete(idx)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border p-4 rounded bg-gray-50 space-y-2">
        <h3 className="font-semibold">{editingIndex !== null ? 'Edit Evaluation' : 'Add New Evaluation'}</h3>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            className="border p-1 flex-1"
            value={form.Course || ''}
            onChange={(e) => setForm({ ...form, Course: e.target.value })}
          >
            <option value="">Select Course</option>
            {COURSE_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className="border p-1 flex-1"
            value={form.Professor || ''}
            onChange={(e) => setForm({ ...form, Professor: e.target.value })}
          >
            <option value="">Select Professor</option>
            {PROFESSOR_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            className="border p-1 flex-1"
            value={form['Evaluation Type'] || ''}
            onChange={(e) => setForm({ ...form, 'Evaluation Type': e.target.value })}
          >
            <option value="">Select Type</option>
            {EVALUATION_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <input
            className="border p-1 flex-1"
            placeholder="Weight"
            value={form['Evaluation Weight'] || ''}
            onChange={(e) => setForm({ ...form, 'Evaluation Weight': e.target.value })}
          />
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-1 rounded"
          onClick={handleSave}
        >
          {editingIndex !== null ? 'Update' : 'Add'}
        </button>
      </div>

      <div className="text-center">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={onBack}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default DailyView;
