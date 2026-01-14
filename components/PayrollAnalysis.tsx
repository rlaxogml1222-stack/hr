
import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Payroll, Organization, Headcount } from '../types.ts';

interface PayrollAnalysisProps {
  payroll: Payroll[];
  headcount: Headcount[];
  organizations: Organization[];
  onUpdate: (updated: Payroll[]) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const PayrollAnalysis: React.FC<PayrollAnalysisProps> = ({ payroll, headcount, organizations, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [localPayroll, setLocalPayroll] = useState<Payroll[]>([]);
  const [status, setStatus] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalPayroll(payroll);
  }, [payroll]);

  const calculateTotal = (p: Payroll) => {
    return p.base_pay + p.base_pay_retro + p.fixed_overtime + p.rank_allowance + 
           p.meal_allowance + p.position_allowance + p.childcare_allowance + 
           p.holiday_work_pay + p.overtime_work_pay + p.other_allowance + 
           p.cert_allowance + p.annual_leave_pay + p.incentive;
  };

  const showStatus = (message: string, type: 'success' | 'info' | 'error') => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 4000);
  };

  const handleInputChange = (orgId: string, field: keyof Payroll, value: any) => {
    const updated = localPayroll.map(p => {
      if (p.org_id === orgId) return { ...p, [field]: Number(value) };
      return p;
    });
    setLocalPayroll(updated);
  };

  const handleSave = () => {
    onUpdate(localPayroll);
    setEditMode(false);
    showStatus("데이터가 안전하게 시스템에 저장되었습니다.", 'success');
  };

  // 실제 CSV 파일을 읽고 파싱하는 핸들러
  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    showStatus(`${file.name} 분석 및 데이터 추출 중...`, 'info');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          showStatus("업로드된 파일에 데이터가 없습니다.", 'error');
          return;
        }

        // 헤더 제외 데이터 파싱 (조직명 기준 매핑)
        const updated = [...localPayroll];
        let mappedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const columns = lines[i].split(',').map(col => col.trim().replace(/"/g, ''));
          if (columns.length < 14) continue;

          const orgName = columns[0];
          const org = organizations.find(o => o.org_name === orgName);

          if (org) {
            const index = updated.findIndex(p => p.org_id === org.org_id);
            if (index !== -1) {
              updated[index] = {
                ...updated[index],
                base_pay: Number(columns[1]) || 0,
                base_pay_retro: Number(columns[2]) || 0,
                fixed_overtime: Number(columns[3]) || 0,
                rank_allowance: Number(columns[4]) || 0,
                meal_allowance: Number(columns[5]) || 0,
                position_allowance: Number(columns[6]) || 0,
                childcare_allowance: Number(columns[7]) || 0,
                holiday_work_pay: Number(columns[8]) || 0,
                overtime_work_pay: Number(columns[9]) || 0,
                other_allowance: Number(columns[10]) || 0,
                cert_allowance: Number(columns[11]) || 0,
                annual_leave_pay: Number(columns[12]) || 0,
                incentive: Number(columns[13]) || 0,
              };
              mappedCount++;
            }
          }
        }

        if (mappedCount > 0) {
          setLocalPayroll(updated);
          onUpdate(updated);
          showStatus(`총 ${mappedCount}개 조직의 업로드 숫자가 정확히 반영되었습니다.`, 'success');
        } else {
          showStatus("매핑된 조직이 없습니다. 양식의 조직명을 확인해 주세요.", 'error');
        }
      } catch (err) {
        showStatus("파일 분석 중 오류가 발생했습니다.", 'error');
        console.error(err);
      }
      
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = ["조직명(매핑키)", "기본급", "소급분", "고정연장", "직급수당", "식대", "직책수당", "육아수당", "휴일수당", "연장수당", "기타수당", "자격수당", "연차수당", "인센티브"];
    const rows = organizations.map(org => {
      const p = localPayroll.find(item => item.org_id === org.org_id);
      return [
        org.org_name, 
        p?.base_pay || 0, 
        p?.base_pay_retro || 0, 
        p?.fixed_overtime || 0, 
        p?.rank_allowance || 0, 
        p?.meal_allowance || 0, 
        p?.position_allowance || 0, 
        p?.childcare_allowance || 0, 
        p?.holiday_work_pay || 0, 
        p?.overtime_work_pay || 0, 
        p?.other_allowance || 0, 
        p?.cert_allowance || 0, 
        p?.annual_leave_pay || 0, 
        p?.incentive || 0
      ].join(",");
    });
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "HR_Payroll_Input_Template.csv";
    link.click();
  };

  const hqData = organizations
    .filter(org => org.org_level === '본부' || org.org_id === 'EXE')
    .map(hq => {
      const total = localPayroll
        .filter(p => p.org_id === hq.org_id || organizations.find(o => o.org_id === p.org_id)?.parent_org_id === hq.org_id)
        .reduce((sum, curr) => sum + calculateTotal(curr), 0);
      return { name: hq.org_name, value: total };
    });

  const categoryData = [
    { name: '기본급류', value: localPayroll.reduce((a, b) => a + b.base_pay + b.base_pay_retro, 0) },
    { name: '제수당', value: localPayroll.reduce((a, b) => a + b.rank_allowance + b.meal_allowance + b.position_allowance + b.childcare_allowance + b.other_allowance + b.cert_allowance, 0) },
    { name: '시간외', value: localPayroll.reduce((a, b) => a + b.fixed_overtime + b.overtime_work_pay + b.holiday_work_pay, 0) },
    { name: '성과급', value: localPayroll.reduce((a, b) => a + b.incentive, 0) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {status && (
        <div className={`fixed bottom-12 right-12 z-50 px-7 py-4 rounded-3xl shadow-2xl border flex items-center space-x-4 transition-all duration-500 transform ${
          status.type === 'success' ? 'bg-slate-900 border-emerald-500 text-white' : 
          status.type === 'error' ? 'bg-rose-900 border-rose-400 text-white' : 'bg-white border-blue-500 text-slate-900'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${
            status.type === 'success' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 
            status.type === 'error' ? 'bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.8)]' : 'bg-blue-500 animate-pulse'
          }`}></div>
          <span className="font-bold text-sm tracking-tight">{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Budget Usage</p>
            <h2 className="text-4xl font-black text-slate-900">
              {(localPayroll.reduce((a, b) => a + calculateTotal(b), 0) / 100000000).toFixed(2)}<span className="text-xl font-bold text-slate-400 ml-1">억</span>
            </h2>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
             <span className="text-xs text-slate-500 font-medium">전체 조직 인건비 합계</span>
             <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">REAL-TIME</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-80">
          <h4 className="text-[11px] font-bold text-slate-400 mb-4 flex items-center uppercase tracking-wider">
            본부별 집행 비중
          </h4>
          <div className="h-full -mt-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={hqData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {hqData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />)}
                </Pie>
                <Tooltip 
                  formatter={(v: any) => `${(v/10000).toLocaleString()}만원`}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-80">
          <h4 className="text-[11px] font-bold text-slate-400 mb-4 flex items-center uppercase tracking-wider">
            항목별 총 비용 현황 (단위: 백만원)
          </h4>
          <div className="h-full -mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => (v/1000000).toFixed(0)} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(v: any) => `${v.toLocaleString()}원`} contentStyle={{ borderRadius: '15px', border: 'none' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 gap-4">
        <div className="flex items-center space-x-5">
          <div className="w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 leading-tight">정밀 급여 데이터 매퍼</h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Real-time Excel Synchronization</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button onClick={downloadTemplate} className="px-6 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold border border-slate-200 transition-all">
            현재 데이터 양식 받기
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-xl">
            수정된 엑셀 업로드
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleExcelUpload} />
          
          <div className="w-px h-10 bg-slate-200 mx-3"></div>
          
          {!editMode ? (
            <button onClick={() => setEditMode(true)} className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-xl transition-all flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              화면에서 직접 수정
            </button>
          ) : (
            <div className="flex space-x-2">
              <button onClick={() => { setLocalPayroll(payroll); setEditMode(false); }} className="px-6 py-3.5 bg-slate-100 text-slate-500 rounded-2xl text-xs font-bold hover:bg-slate-200">취소</button>
              <button onClick={handleSave} className="px-7 py-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-xl">저장 완료</button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] min-w-[1900px] border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-black border-b-2 border-slate-200">
                <th rowSpan={2} className="px-8 py-6 text-left border-r sticky left-0 bg-slate-50 z-30 w-72 shadow-[4px_0_15px_rgba(0,0,0,0.05)]">고정 조직 구분</th>
                <th colSpan={3} className="px-2 py-4 text-center border-r bg-blue-50/40 text-blue-900 border-b border-blue-100">고정 급여 항목</th>
                <th colSpan={6} className="px-2 py-4 text-center border-r bg-emerald-50/40 text-emerald-900 border-b border-emerald-100">제수당 항목</th>
                <th colSpan={2} className="px-2 py-4 text-center border-r bg-amber-50/40 text-amber-900 border-b border-amber-100">시간외 수당</th>
                <th rowSpan={2} className="px-4 py-6 text-right border-r">연차/기타</th>
                <th rowSpan={2} className="px-4 py-6 text-right border-r text-rose-600 bg-rose-50/20">인센티브</th>
                <th rowSpan={2} className="px-8 py-6 text-right font-black text-blue-900 bg-slate-50 sticky right-0 z-30 shadow-[-4px_0_15px_rgba(0,0,0,0.05)] text-sm">월간 총액</th>
              </tr>
              <tr className="bg-slate-50 text-slate-400 border-b border-slate-200">
                <th className="px-3 py-3 text-right border-r">기본급</th>
                <th className="px-3 py-3 text-right border-r">소급분</th>
                <th className="px-3 py-3 text-right border-r text-blue-600">고정연장</th>
                <th className="px-3 py-3 text-right border-r text-emerald-600">직급</th>
                <th className="px-3 py-3 text-right border-r text-emerald-600">식대</th>
                <th className="px-3 py-3 text-right border-r text-emerald-600">직책</th>
                <th className="px-3 py-3 text-right border-r text-emerald-600">육아</th>
                <th className="px-3 py-3 text-right border-r text-emerald-600">기타</th>
                <th className="px-3 py-3 text-right border-r text-emerald-600">자격</th>
                <th className="px-3 py-3 text-right border-r">휴일</th>
                <th className="px-3 py-3 text-right border-r">연장</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {organizations.map((org) => {
                const item = localPayroll.find(p => p.org_id === org.org_id);
                if (!item) return null;
                const isHq = org.org_level === '본부' || org.org_id === 'EXE';
                const total = calculateTotal(item);
                
                return (
                  <tr key={org.org_id} className={`group hover:bg-blue-50/30 transition-colors ${isHq ? 'bg-slate-50/50 font-bold' : ''}`}>
                    <td className="px-8 py-4 border-r border-slate-100 sticky left-0 bg-white z-20 shadow-[4px_0_15px_rgba(0,0,0,0.02)] group-hover:bg-blue-50/30">
                      <div className="flex items-center">
                        <span className={`w-2.5 h-2.5 rounded-full mr-3 ${isHq ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'bg-slate-300'}`}></span>
                        <span className={`truncate text-xs ${isHq ? 'text-blue-900' : 'text-slate-700'}`}>{org.org_name}</span>
                      </div>
                    </td>
                    <EditableCell editMode={editMode} value={item.base_pay} onChange={(v) => handleInputChange(item.org_id, 'base_pay', v)} />
                    <EditableCell editMode={editMode} value={item.base_pay_retro} onChange={(v) => handleInputChange(item.org_id, 'base_pay_retro', v)} />
                    <EditableCell editMode={editMode} value={item.fixed_overtime} onChange={(v) => handleInputChange(item.org_id, 'fixed_overtime', v)} className="text-blue-600 font-bold" />
                    
                    <EditableCell editMode={editMode} value={item.rank_allowance} onChange={(v) => handleInputChange(item.org_id, 'rank_allowance', v)} className="bg-emerald-50/10" />
                    <EditableCell editMode={editMode} value={item.meal_allowance} onChange={(v) => handleInputChange(item.org_id, 'meal_allowance', v)} className="bg-emerald-50/10" />
                    <EditableCell editMode={editMode} value={item.position_allowance} onChange={(v) => handleInputChange(item.org_id, 'position_allowance', v)} className="bg-emerald-50/10" />
                    <EditableCell editMode={editMode} value={item.childcare_allowance} onChange={(v) => handleInputChange(item.org_id, 'childcare_allowance', v)} className="bg-emerald-50/10" />
                    <EditableCell editMode={editMode} value={item.other_allowance} onChange={(v) => handleInputChange(item.org_id, 'other_allowance', v)} className="bg-emerald-50/10" />
                    <EditableCell editMode={editMode} value={item.cert_allowance} onChange={(v) => handleInputChange(item.org_id, 'cert_allowance', v)} className="bg-emerald-50/10" />
                    
                    <EditableCell editMode={editMode} value={item.holiday_work_pay} onChange={(v) => handleInputChange(item.org_id, 'holiday_work_pay', v)} className="bg-amber-50/10" />
                    <EditableCell editMode={editMode} value={item.overtime_work_pay} onChange={(v) => handleInputChange(item.org_id, 'overtime_work_pay', v)} className="bg-amber-50/10" />
                    
                    <EditableCell editMode={editMode} value={item.annual_leave_pay} onChange={(v) => handleInputChange(item.org_id, 'annual_leave_pay', v)} />
                    <EditableCell editMode={editMode} value={item.incentive} onChange={(v) => handleInputChange(item.org_id, 'incentive', v)} className="text-rose-600 font-black" />
                    
                    <td className="px-8 py-4 text-right font-black text-blue-900 bg-blue-50/20 sticky right-0 z-20 shadow-[-4px_0_15px_rgba(0,0,0,0.05)] tabular-nums text-sm group-hover:bg-blue-100/40">
                      {total.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-black text-base">
               <tr>
                 <td className="px-8 py-7 sticky left-0 bg-slate-900 z-20 shadow-[4px_0_15px_rgba(0,0,0,0.3)]">전사 인건비 총계 (Grand Total)</td>
                 <td colSpan={13}></td>
                 <td className="px-8 py-7 text-right text-emerald-400 sticky right-0 bg-slate-900 z-20 shadow-[-4px_0_15px_rgba(0,0,0,0.3)] tabular-nums">
                   {localPayroll.reduce((acc, curr) => acc + calculateTotal(curr), 0).toLocaleString()}원
                 </td>
               </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

const EditableCell: React.FC<{ editMode: boolean, value: number, onChange: (v: string) => void, className?: string }> = ({ editMode, value, onChange, className = "" }) => (
  <td className={`px-3 py-4 text-right border-r border-slate-100 tabular-nums ${className}`}>
    {editMode ? (
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-right bg-white border-2 border-blue-200 rounded-xl px-2 py-1.5 focus:border-blue-500 outline-none font-bold text-xs"
      />
    ) : (
      <span>{value.toLocaleString()}</span>
    )}
  </td>
);

export default PayrollAnalysis;
