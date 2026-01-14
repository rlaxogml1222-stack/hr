
import React, { useState } from 'react';
import { Organization, Headcount, Payroll } from '../types.ts';

interface DataUploadProps {
  organizations: Organization[];
  headcount: Headcount[];
  payroll: Payroll[];
  onUpdateData: (orgs: Organization[], hc: Headcount[], pr: Payroll[]) => void;
}

const DataUpload: React.FC<DataUploadProps> = ({ organizations, headcount, payroll, onUpdateData }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleSimulateUpload = (type: 'org' | 'hc' | 'pr') => {
    setIsUploading(true);
    setLogs(prev => [...prev, `[시스템] ${type.toUpperCase()} 데이터 업로드 프로세스를 시작합니다...`]);
    
    setTimeout(() => {
      setLogs(prev => [...prev, `[검증] 컬럼 유효성 검사 중...`, `[데이터] 변동 사항 감지 및 동기화 수행 중...`]);
      
      let nextOrgs = [...organizations];
      let nextHc = [...headcount];
      let nextPr = [...payroll];

      if (type === 'hc') {
        nextHc = headcount.map(h => ({ ...h, total_headcount: Math.floor(h.total_headcount * (1 + (Math.random() * 0.05 - 0.02))) }));
        setLogs(prev => [...prev, `[완료] 인원 현황 데이터 ${nextHc.length}건이 갱신되었습니다.`]);
      } else if (type === 'pr') {
        nextPr = payroll.map(p => ({ ...p, incentive: Math.random() > 0.5 ? p.incentive + 100000 : p.incentive }));
        setLogs(prev => [...prev, `[완료] 급여 데이터 ${nextPr.length}건이 갱신되었습니다.`]);
      } else {
        setLogs(prev => [...prev, `[완료] 조직 구조 데이터가 최신 상태로 유지되었습니다.`]);
      }

      onUpdateData(nextOrgs, nextHc, nextPr);
      setIsUploading(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold mb-2 text-slate-800">인사 데이터 연동 콘솔</h3>
        <p className="text-slate-500 mb-8">엑셀 템플릿을 업로드하여 조직, 인원, 급여 데이터를 실시간 동기화합니다.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UploadCard 
            title="조직 정보" 
            fileName="Organization.xlsx" 
            onUpload={() => handleSimulateUpload('org')} 
            disabled={isUploading}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
          />
          <UploadCard 
            title="인원 현황" 
            fileName="Headcount.xlsx" 
            onUpload={() => handleSimulateUpload('hc')} 
            disabled={isUploading}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          />
          <UploadCard 
            title="급여 정보" 
            fileName="Payroll.xlsx" 
            onUpload={() => handleSimulateUpload('pr')} 
            disabled={isUploading}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
          />
        </div>
      </div>

      <div className="bg-slate-900 text-slate-300 p-6 rounded-xl shadow-lg font-mono text-sm h-64 overflow-y-auto">
        <div className="flex items-center space-x-2 mb-4 text-slate-500 border-b border-slate-800 pb-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-2 text-xs uppercase tracking-widest">System Logs</span>
        </div>
        {logs.length === 0 ? (
          <p className="text-slate-600 italic">연동 대기 중...</p>
        ) : (
          logs.map((log, i) => (
            <p key={i} className="mb-1">{`> ${log}`}</p>
          ))
        )}
        {isUploading && (
          <p className="animate-pulse text-blue-400 mt-2">서버 동기화 중...</p>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl">
        <div className="flex space-x-4">
          <div className="text-amber-500">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
          <div>
            <h5 className="font-bold text-amber-900 mb-1">데이터 업로드 유의사항</h5>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>개인 성명, 주민번호 등 민감 정보는 포함되지 않아야 합니다.</li>
              <li>중복된 조직ID(org_id)는 최신 데이터로 업데이트됩니다.</li>
              <li>기준월(YYYY-MM)이 정확한지 다시 한번 확인해 주세요.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadCard: React.FC<{ title: string, fileName: string, onUpload: () => void, disabled: boolean, icon: React.ReactNode }> = ({ title, fileName, onUpload, disabled, icon }) => (
  <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-400 transition-colors flex flex-col items-center text-center group">
    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
      {icon}
    </div>
    <h4 className="font-bold mb-1">{title}</h4>
    <p className="text-xs text-slate-400 mb-4">{fileName}</p>
    <button 
      disabled={disabled}
      onClick={onUpload}
      className="mt-auto w-full px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-all"
    >
      업로드 실행
    </button>
  </div>
);

export default DataUpload;
