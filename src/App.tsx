import { useState } from 'react'
import './App.css'
import WeekBalancer from './week_balancer/WeekBalancer';
import UploadPage from './week_balancer/UploadPage';
import DailyView from './week_balancer/DailyView'; // ✅ 新增

type Page =
  | 'home'
  | 'weekbalancer'
  | 'upload'
  | 'weekbalancerWithData'
  | { type: 'dailyView'; date: string }; // ✅ 新增 dailyView 类型

export interface EvaluationRow {
  Course: string;
  Professor: string;
  'Evaluation Type': string;
  'Evaluation Weight': string;
  'Due Day': string;
}

function App() {
  const [page, setPage] = useState<Page>('home');
  const [csvData, setCsvData] = useState<EvaluationRow[]>([]);
  const [csvFilePath, setCsvFilePath] = useState<string | null>(null);


  const updateCsvData = (newData: EvaluationRow[]) => {
    setCsvData(newData);
  };

  const renderPage = () => {
    switch (page) {
      case 'weekbalancer':
        return <WeekBalancer onNavigate={(p) => setPage(p)} />;
      case 'weekbalancerWithData':
        return (
          <WeekBalancer
            onNavigate={(p) => setPage(p)}
            data={csvData}
            onDayClick={(dateStr) => setPage({ type: 'dailyView', date: dateStr })} // ✅ 加入点击日期跳转
          />
        );
      case 'upload':
        return (
          <UploadPage
            onSuccess={(data, filePath) => {
              setCsvData(data);
              setCsvFilePath(filePath);
              setPage('weekbalancerWithData');
            }}
          />
        );
      case 'home':
        return (
          <div className='App space-y-10'>
            <h1>SQATE tooling</h1>

            <div className='flex-center'>
              <button
                className="w-[240px] h-[68px] bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                onClick={() => alert('Under construction')}
              >
                Enroll Helper
              </button>
            </div>

            <div className='flex-center'>
              <button
                className="w-[240px] h-[68px] bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-4 py-2 rounded"
                onClick={() => setPage('weekbalancer')}
              >
                Week Balancer
              </button>
            </div>
          </div>
        );
      default:
        if (typeof page === 'object' && page.type === 'dailyView') {
          return (
            <DailyView
              date={page.date}
              data={csvData}
              filePath={csvFilePath}
              onBack={() => setPage('weekbalancerWithData')}
              onUpdate={updateCsvData}
            />
          );
        }
        return null;
    }
  };

  return <>{renderPage()}</>;
}

export default App;
