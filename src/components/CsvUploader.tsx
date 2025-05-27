// CsvUploader.tsx
import React, { useState } from "react";
import Papa from "papaparse";
import { CsvRow } from "./types";

const CsvUploader: React.FC = () => {
  const [data, setData] = useState<CsvRow[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
      },
    });
  };

  return (
    <div className="p-4">
      <input type="file" accept=".csv" onChange={handleFileChange} />
      
      {data.length > 0 && (
        <table className="table-auto border mt-4">
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th className="border px-4 py-2" key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((value, i) => (
                  <td className="border px-4 py-2" key={i}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CsvUploader;
