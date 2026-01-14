
import React, { useState, useEffect, useMemo } from 'react';
import { Organization, Headcount, Payroll, ViewType, OrgNode, Attendance } from './types.ts';
import { INITIAL_ORGS, ALL_INITIAL_DATA, CURRENT_MONTH, MONTHS, YEARS } from './constants.tsx';
import Dashboard from './components/Dashboard.tsx';
import OrgChart from './components/OrgChart.tsx';
import PayrollAnalysis from './components/PayrollAnalysis.tsx';
import AttendanceAnalysis from './components/AttendanceAnalysis.tsx';
import DataUpload from './components/DataUpload.tsx';
import Sidebar from './components/Sidebar.tsx';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  
  const [selectedYear, setSelectedYear] = useState<string>(CURRENT_MONTH.split('-')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(CURRENT_MONTH.split('-')[1]);

  const currentMonth = useMemo(() => `${selectedYear}-${selectedMonth}`, [selectedYear, selectedMonth]);
  
  const [organizations] = useState<Organization[]>(INITIAL_ORGS);
  const [allHeadcount, setAllHeadcount] = useState<Headcount[]>([]);
  const [allPayroll, setAllPayroll] = useState<Payroll[]>([]);
  const [allAttendance, setAllAttendance] = useState<Attendance[]>([]);

  // 초기 데이터 로드 (mount 시 1회 실행)
  useEffect(() => {
    const flattenedHc = Object.values(ALL_INITIAL_DATA).flatMap((d: any) => d.hcs);
    const flattenedPay = Object.values(ALL_INITIAL_DATA).flatMap((d: any) => d.pay);
    const flattenedAtt = Object.values(ALL_INITIAL_DATA).flatMap((d: any) => d.att);
    
    setAllHeadcount(flattenedHc);
    setAllPayroll(flattenedPay);
    setAllAttendance(flattenedAtt);
  }, []);

  const headcount = useMemo(() => allHeadcount.filter(h => h.reference_month === currentMonth), [allHeadcount, currentMonth]);
  const payroll = useMemo(() => allPayroll.filter(p => p.effective_month === currentMonth), [allPayroll, currentMonth]);
  const attendance = useMemo(() => allAttendance.filter(a => a.reference_month === currentMonth), [allAttendance, currentMonth]);

  const orgTree = useMemo(() => {
    const orgMap = new Map<string, OrgNode>();
    organizations.forEach(org => {
      const hc = headcount.find(h => h.org_id === org.org_id);
      const pr = payroll.find(p => p.org_id === org.org_id);
      const at = attendance.find(a => a.org_id === org.org_id);
      orgMap.set(org.org_id, { 
        ...org, 
        children: [], 
        metrics: { 
          headcount: hc || { org_id: org.org_id, reference_month: currentMonth, total_headcount: 0, regular_headcount: 0, contract_headcount: 0, executive_headcount: 0, new_hires: 0, resignations: 0 },
          payroll: pr || { 
            org_id: org.org_id, 
            effective_month: currentMonth, 
            base_pay: 0, 
            base_pay_retro: 0,
            fixed_overtime: 0,
            rank_allowance: 0,
            meal_allowance: 0,
            position_allowance: 0,
            childcare_allowance: 0,
            holiday_work_pay: 0,
            overtime_work_pay: 0,
            other_allowance: 0,
            cert_allowance: 0,
            annual_leave_pay: 0,
            incentive: 0,
            currency: 'KRW' 
          },
          attendance: at || { org_id: org.org_id, reference_month: currentMonth, avg_working_hours: 0, weekday_overtime_hours: 0, holiday_overtime_hours: 0, total_overtime_hours: 0, attendance_issues: 0 }
        }
      });
    });

    const root: OrgNode[] = [];
    orgMap.forEach(node => {
      if (node.parent_org_id && orgMap.has(node.parent_org_id)) {
        orgMap.get(node.parent_org_id)!.children?.push(node);
      } else {
        root.push(node);
      }
    });
    return root;
  }, [organizations, headcount, payroll, attendance, currentMonth]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-pretendard">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-y-auto p-8 relative">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {currentView === 'dashboard' && '경영 분석 대시보드'}
              {currentView === 'orgchart' && '조직도 및 구조 관리'}
              {currentView === 'payroll' && '인건비 상세 분석'}
              {currentView === 'attendance' && '전사 근태 현황'}
              {currentView === 'data' && '데이터 매니지먼트'}
            </h1>
            <p className="text-slate-400 text-sm font-medium">HR Insight Pro v2.5 | 조직 중심 의사결정 지원 플랫폼</p>
          </div>
          <div className="flex items-center space-x-3 bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-2 px-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Year</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-slate-700 text-sm font-bold outline-none"
              >
                {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
              </select>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center space-x-2 px-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Month</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-slate-700 text-sm font-bold outline-none"
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}월</option>)}
              </select>
            </div>
            <div className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-blue-100">
              {currentMonth}
            </div>
          </div>
        </header>

        {currentView === 'dashboard' && <Dashboard allHeadcount={allHeadcount} allPayroll={allPayroll} allAttendance={allAttendance} organizations={organizations} currentMonth={currentMonth} />}
        {currentView === 'orgchart' && <OrgChart tree={orgTree} onUpdateOrgs={() => {}} />}
        {currentView === 'payroll' && (
          <PayrollAnalysis 
            payroll={payroll} 
            headcount={headcount} 
            organizations={organizations} 
            onUpdate={(updated) => {
              setAllPayroll(prev => {
                const otherMonths = prev.filter(p => p.effective_month !== currentMonth);
                return [...otherMonths, ...updated];
              });
            }}
          />
        )}
        {currentView === 'attendance' && (
          <AttendanceAnalysis 
            organizations={organizations} 
            allAttendance={allAttendance} 
            currentMonth={currentMonth}
            onUpdate={(updated) => {
              setAllAttendance(prev => {
                const otherMonths = prev.filter(a => a.reference_month !== currentMonth);
                return [...otherMonths, ...updated];
              });
            }}
          />
        )}
        {currentView === 'data' && (
          <DataUpload 
            organizations={organizations} 
            headcount={headcount} 
            payroll={payroll}
            onUpdateData={(orgs, hc, pr) => {
              setAllHeadcount(prev => [...prev.filter(h => h.reference_month !== currentMonth), ...hc]);
              setAllPayroll(prev => [...prev.filter(p => p.effective_month !== currentMonth), ...pr]);
            }} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
