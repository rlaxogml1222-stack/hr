
import React, { useState, useEffect, useMemo } from 'react';
import { Organization, Headcount, Payroll, Attendance, ViewType, OrgNode } from './types';
import { INITIAL_ORGS, INITIAL_HEADCOUNT, INITIAL_PAYROLL, INITIAL_ATTENDANCE } from './constants';
import Dashboard from './components/Dashboard';
import OrgChart from './components/OrgChart';
import PayrollAnalysis from './components/PayrollAnalysis';
import DataUpload from './components/DataUpload';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGS);
  const [headcount, setHeadcount] = useState<Headcount[]>(INITIAL_HEADCOUNT);
  const [payroll, setPayroll] = useState<Payroll[]>(INITIAL_PAYROLL);
  const [attendance, setAttendance] = useState<Attendance[]>(INITIAL_ATTENDANCE);

  // Build hierarchy for Org Chart
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
          headcount: hc || { org_id: org.org_id, reference_month: '2024-03', total_headcount: 0, regular_headcount: 0, contract_headcount: 0, executive_headcount: 0, new_hires: 0, resignations: 0 },
          payroll: pr || { org_id: org.org_id, effective_month: '2024-03', base_pay: 0, bonus: 0, allowances: 0, overtime_pay: 0, holiday_pay: 0, currency: 'KRW' },
          attendance: at || { org_id: org.org_id, reference_month: '2024-03', avg_working_hours: 0, total_overtime_hours: 0, total_holiday_hours: 0, attendance_issues: 0 }
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
  }, [organizations, headcount, payroll, attendance]);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard headcount={headcount} payroll={payroll} organizations={organizations} attendance={attendance} />;
      case 'orgchart':
        return <OrgChart tree={orgTree} onUpdateOrgs={setOrganizations} />;
      case 'payroll':
        return <PayrollAnalysis payroll={payroll} headcount={headcount} organizations={organizations} />;
      case 'attendance':
        return <div className="p-8 bg-white rounded-xl border">근태 분석 상세 페이지 준비 중...</div>;
      case 'data':
        return <DataUpload 
                  organizations={organizations} 
                  headcount={headcount} 
                  payroll={payroll}
                  onUpdateData={(orgs, hc, pr) => {
                    setOrganizations(orgs);
                    setHeadcount(hc);
                    setPayroll(pr);
                  }} 
                />;
      default:
        return <Dashboard headcount={headcount} payroll={payroll} organizations={organizations} attendance={attendance} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-y-auto p-8 relative">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {currentView === 'dashboard' && '경영 분석 대시보드'}
              {currentView === 'orgchart' && '조직도 및 구조 관리'}
              {currentView === 'payroll' && '인건비 분석'}
              {currentView === 'attendance' && '근태 분석 상세'}
              {currentView === 'data' && '데이터 연동 관리'}
            </h1>
            <p className="text-slate-500">한국 중견·대기업 인사 전략 분석 플랫폼 (v2.0)</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 shadow-sm">
              기준월: 2024-03
            </span>
          </div>
        </header>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
