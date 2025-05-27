// UploadPage.tsx（修改后）
import React, { useState } from 'react';
import Papa from 'papaparse';
import { EvaluationRow } from '../App';

declare global {
  interface Window {
    electronAPI: {
      openCsvFile: () => Promise<{ filePath: string; content: string }>;
    };
  }
}

interface UploadPageProps {
  onSuccess: (data: EvaluationRow[], filePath: string) => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ onSuccess }) => {
  const [fileName, setFileName] = useState<string>('');

  const handleUpload = async () => {
    const result = await window.electronAPI.openCsvFile();
    if (!result || !result.filePath) return;

    Papa.parse<EvaluationRow>(result.content, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data as EvaluationRow[];
        onSuccess(parsedData, result.filePath); // ✅ 现在可以拿到真实路径
      },
    });
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload CSV File</h2>

      <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
        Upload CSV
      </button>

      {fileName && (
        <p className="text-green-700 mb-4">Uploaded: {fileName}</p>
      )}
    </div>
  );
};

export default UploadPage;
