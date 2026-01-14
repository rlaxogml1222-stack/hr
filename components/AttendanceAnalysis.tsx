
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Organization, Attendance } from '../types.ts';
import { PRODUCTION_TEAMS } from '../constants.tsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AttendanceAnalysisProps {
  organizations: Organization[];
  allAttendance: Attendance[];
  currentMonth: string;
  onUpdate: (updated: Attendance[]) => void;
}

const AttendanceAnalysis: React.FC<AttendanceAnalysisProps> = ({ organizations, allAttendance, currentMonth, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [localAttendance, setLocalAttendance] = useState<Attendance[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 테이블 편집용 로컬 상태
  useEffect(() => {
    const currentData = allAttendance.filter(a => a.reference_month === currentMonth);
    setLocalAttendance(currentData);
  }, [allAttendance, currentMonth]);

  // 날짜 계산 헬퍼
  const getRelativeMonth = (monthStr: string, monthDiff: number) => {
    try {
      const [year, month] = monthStr.split('-').map(Number);
      const date = new Date(year, (month - 1) + monthDiff, 1);
      const resYear = date.getFullYear();
      const resMonth = String(date.getMonth() + 1).padStart(2, '0');
      return `${resYear}-${resMonth}`;
    } catch (e) {
      return monthStr;
    }
  };

  const prevMonthStr = useMemo(() => getRelativeMonth(currentMonth, -1), [currentMonth]);
  const prevYearStr = useMemo(() => getRelativeMonth(currentMonth, -12), [currentMonth]);

  // --- 시각화 데이터 가공 ---
  const prodComparisonData = useMemo(() => {
    const prodTeams = organizations.filter(org => PRODUCTION_TEAMS.includes(org.org_id));
    if (prodTeams.length === 0) return [];

    return prodTeams.map(team => {
      const ly = allAttendance.find(a => a.org_id === team.org_id && a.reference_month === prevYearStr)?.total_overtime_hours || 0;
      const lm = allAttendance.find(a => a.org_id === team.org_id && a.reference_month === prevMonthStr)?.total_overtime_hours || 0;
      const cm = allAttendance.find(a => a.org_id === team.org_id && a.reference_month === currentMonth)?.total_overtime_hours || 0;

      return {
        name: team.org_name,
        '전년동월': ly,
        '전월': lm,
        '당월': cm,
      };
    });
  }, [organizations, allAttendance, currentMonth, prevMonthStr, prevYearStr]);

  const managementComparisonData = useMemo(() => {
    const hqs = organizations.filter(org => org.org_level === '본부' || org.org_id === 'EXE');
    if (hqs.length === 0) return [];
    
    return hqs.map(hq => {
      const subOrgIds = organizations
        .filter(org => {
          if (PRODUCTION_TEAMS.includes(org.org_id)) return false;
          if (org.org_id === hq.org_id) return true;
          if (org.parent_org_id === hq.org_id) return true;
          const parentBiz = organizations.find(p => p.org_id === org.parent_org_id);
          if (parentBiz && parentBiz.parent_org_id === hq.org_id) return true;
          return false;
        })
        .map(org => org.org_id);

      const getSumForMonth = (month: string) => {
        return allAttendance
          .filter(a => a.reference_month === month && subOrgIds.includes(a.org_id))
          .reduce((sum, curr) => sum + (curr.total_overtime_hours || 0), 0);
      };

      return {
        name: hq.org_name,
        '전년동월': getSumForMonth(prevYearStr),
        '전월': getSumForMonth(prevMonthStr),
        '당월': getSumForMonth(currentMonth),
      };
    });
  }, [organizations, allAttendance, currentMonth, prevMonthStr, prevYearStr]);

  const handleInputChange = (orgId: string, field: keyof Attendance, value: number) => {
    const updated = localAttendance.map(a => {
      if (a.org_id === orgId) {
        const newObj = { ...a, [field]: value };
        if (field === 'weekday_overtime_hours' || field === 'holiday_overtime_hours') {
          newObj.total_overtime_hours = Number(newObj.weekday_overtime_hours) + Number(newObj.holiday_overtime_hours);
        }
        return newObj;
      }
      return a;
    });
    setLocalAttendance(updated);
  };

  const handleSave = () => {
    onUpdate(localAttendance);
    setEditMode(false);
    setUploadStatus("데이터 저장 완료");
    setTimeout(() => setUploadStatus(null), 3000);
  };

  const sortedOrgs = [...organizations].sort((a, b) => {
    const order = ['EXE', 'MS', 'GS', 'RD', 'QC', 'PD'];
    const getOrder = (id: string) => order.findIndex(o => id.startsWith(o));
    return getOrder(a.org_id) - getOrder(b.org_id);
  });

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {uploadStatus && (
        <div className="fixed top-24 right-10 z-[100]">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-slate-700">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
            <span className="font-bold text-sm">{uploadStatus}</span>
          </div>
        </div>
      )}

      {/* 그래프 섹션 - 높이 명시적 지정 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center">
              <span className="w-2 h-7 bg-amber-500 rounded-full mr-3 shadow-lg shadow-amber-100"></span>
              생산직군 팀별 근태 추이 (YoY/MoM)
            </h3>
            <p className="text-[11px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
              Comparing {prevYearStr} vs {prevMonthStr} vs {currentMonth}
            </p>
          </div>
          <div className="h-[350px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prodComparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="전년동월" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="전월" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="당월" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center">
              <span className="w-2 h-7 bg-blue-600 rounded-full mr-3 shadow-lg shadow-blue-100"></span>
              관리직군 본부별 근태 추이 (YoY/MoM)
            </h3>
            <p className="text-[11px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
              Total Overtime Comparison across Headquarters
            </p>
          </div>
          <div className="h-[350px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={managementComparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="전년동월" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="전월" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="당월" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 데이터 테이블 섹션 */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black flex items-center tracking-tight">
              전사 근태 기록부 (Current: {currentMonth})
            </h3>
            <p className="text-slate-400 text-xs mt-1 font-medium">데이터가 공란인 경우 선택한 년/월의 데이터가 존재하는지 확인하세요.</p>
          </div>
          <div className="flex space-x-3">
             {!editMode ? (
              <button onClick={() => setEditMode(true)} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-black shadow-xl">
                데이터 직접 수정
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditMode(false)} className="px-5 py-3 bg-slate-700 rounded-2xl text-xs font-bold">취소</button>
                <button onClick={handleSave} className="px-6 py-3 bg-emerald-600 rounded-2xl text-xs font-black shadow-xl">저장</button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b-2 border-slate-200">
                <th className="px-10 py-5 text-left border-r border-slate-200">Organization Name</th>
                <th className="px-4 py-5 text-center border-r border-slate-200">Type</th>
                <th className="px-4 py-5 text-center border-r border-slate-200">Weekday OT</th>
                <th className="px-4 py-5 text-center border-r border-slate-200">Holiday</th>
                <th className="px-4 py-5 text-center border-r border-slate-200 bg-blue-50/30 text-blue-900">Total Sum</th>
                <th className="px-4 py-5 text-center">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedOrgs.map(org => {
                const att = localAttendance.find(a => a.org_id === org.org_id);
                if (!att) return null;
                const isHq = org.org_level === '본부' || org.org_id === 'EXE';
                const isProd = PRODUCTION_TEAMS.includes(org.org_id);
                const depth = org.org_level === '본부' ? 0 : org.org_level === '사업부' ? 1 : 2;

                return (
                  <tr key={org.org_id} className={`group hover:bg-blue-50/20 transition-colors ${isHq ? 'bg-slate-50 font-bold' : ''}`}>
                    <td className="px-10 py-4 border-r border-slate-100" style={{ paddingLeft: `${depth * 24 + 40}px` }}>
                      <span className={isHq ? 'text-blue-900 text-xs' : 'text-slate-700 text-xs'}>{org.org_name}</span>
                    </td>
                    <td className="px-4 py-4 text-center border-r border-slate-100">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${isProd ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {isProd ? 'PRODUCTION' : 'MANAGEMENT'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center border-r border-slate-100">
                      {editMode ? (
                        <input type="number" value={att.weekday_overtime_hours} onChange={(e) => handleInputChange(org.org_id, 'weekday_overtime_hours', Number(e.target.value))} className="w-16 text-center border rounded-lg py-1 font-bold text-xs" />
                      ) : <span className="text-slate-600 font-medium tabular-nums text-xs">{att.weekday_overtime_hours}h</span>}
                    </td>
                    <td className="px-4 py-4 text-center border-r border-slate-100">
                      {editMode ? (
                        <input type="number" value={att.holiday_overtime_hours} onChange={(e) => handleInputChange(org.org_id, 'holiday_overtime_hours', Number(e.target.value))} className="w-16 text-center border rounded-lg py-1 font-bold text-xs" />
                      ) : <span className="text-rose-600 font-medium tabular-nums text-xs">{att.holiday_overtime_hours}h</span>}
                    </td>
                    <td className="px-4 py-4 text-center font-black border-r border-slate-100 bg-blue-50/10 text-xs tabular-nums text-blue-900">
                      {att.total_overtime_hours}h
                    </td>
                    <td className="px-4 py-4 text-center text-xs">
                      {att.attendance_issues > 0 ? <span className="text-amber-600 font-black">{att.attendance_issues}건</span> : <span className="text-slate-200">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceAnalysis;
