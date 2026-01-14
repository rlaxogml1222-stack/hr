
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Headcount, Payroll, Organization, Attendance } from '../types';

interface DashboardProps {
  headcount: Headcount[];
  payroll: Payroll[];
  organizations: Organization[];
  attendance?: Attendance[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const Dashboard: React.FC<DashboardProps> = ({ headcount, payroll, organizations, attendance = [] }) => {
  // Aggregate Metrics
  const totalHc = headcount.reduce((acc, curr) => acc + (curr.total_headcount || 0), 0);
  const totalCost = payroll.reduce((acc, curr) => acc + (curr.base_pay + curr.bonus + curr.allowances + curr.overtime_pay + curr.holiday_pay), 0);
  const totalOvertime = attendance.reduce((acc, curr) => acc + curr.total_overtime_hours, 0);
  const totalHoliday = attendance.reduce((acc, curr) => acc + curr.total_holiday_hours, 0);
  const avgWage = totalHc > 0 ? totalCost / totalHc : 0;
  const avgWorkingHours = 174.2;

  // Chart Data Preparation
  const hqData = organizations
    .filter(org => org.org_level === '본부')
    .map(org => {
      const hc = headcount.find(h => h.org_id === org.org_id);
      const pr = payroll.find(p => p.org_id === org.org_id);
      const at = attendance.find(a => a.org_id === org.org_id);
      return {
        name: org.org_name,
        totalHc: hc?.total_headcount || 0,
        totalCost: pr ? (pr.base_pay + pr.bonus + pr.allowances + pr.overtime_pay + pr.holiday_pay) : 0,
        overtime: at?.total_overtime_hours || 0,
        holiday: at?.total_holiday_hours || 0,
      };
    });

  return (
    <div className="space-y-6">
      {/* 1. Top Section: KPI Cards (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="총 인원" value={`${totalHc.toLocaleString()}명`} subValue="전월대비 ▲2.1%" color="blue" />
        <KPICard title="총 인건비(월)" value={`₩${(totalCost / 1000000).toFixed(1)}M`} subValue="예산대비 94%" color="indigo" />
        <KPICard title="인당 평균 임금" value={`₩${(avgWage / 10000).toFixed(0)}만원`} subValue="업계평균 상회" color="green" />
        <KPICard title="연장근로 합계" value={`${totalOvertime.toLocaleString()}h`} subValue="평균 1.2h/인" color="amber" />
        <KPICard title="휴일근로 합계" value={`${totalHoliday.toLocaleString()}h`} subValue="전월대비 ▼5%" color="red" />
        <KPICard title="평균 실근로시간" value={`${avgWorkingHours}h`} subValue="주 평균 40.2h" color="slate" />
      </div>

      {/* 2. Middle Section: Summary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Headcount Analysis Block */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">본부별 인력 현황</h3>
            <select className="text-xs border rounded p-1 text-slate-500">
              <option>전체 보기</option>
              <option>고용형태별</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hqData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="totalHc" name="인원수" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Payroll Analysis Block */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">본부별 인건비 비중</h3>
            <span className="text-xs text-slate-400">단위: 백만원</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hqData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="totalCost"
                >
                  {hqData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `₩${(v / 1000000).toFixed(1)}M`} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Bottom Section: Attendance Detail & Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">근태 및 연장근로 상세 분석</h3>
            <p className="text-sm text-slate-500">부서별 실근로 및 수당 지급 현황</p>
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">CSV 다운로드</button>
            <button className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">일괄 수정</button>
          </div>
        </div>
        
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <th className="px-6 py-4 text-left font-medium">조직명</th>
                <th className="px-6 py-4 text-center font-medium">인원</th>
                <th className="px-6 py-4 text-center font-medium">소정근로(h)</th>
                <th className="px-6 py-4 text-center font-medium">연장근로(h)</th>
                <th className="px-6 py-4 text-center font-medium">휴일근로(h)</th>
                <th className="px-6 py-4 text-right font-medium">연장수당</th>
                <th className="px-6 py-4 text-right font-medium">휴일수당</th>
                <th className="px-6 py-4 text-center font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {hqData.map((item, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{item.name}</td>
                  <td className="px-6 py-4 text-center">{item.totalHc}명</td>
                  <td className="px-6 py-4 text-center text-slate-500">160h</td>
                  <td className="px-6 py-4 text-center font-medium text-amber-600">{item.overtime}h</td>
                  <td className="px-6 py-4 text-center font-medium text-red-600">{item.holiday}h</td>
                  <td className="px-6 py-4 text-right">₩{(item.overtime * 25000).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">₩{(item.holiday * 35000).toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.overtime > 100 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {item.overtime > 100 ? '주의' : '정상'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const KPICard: React.FC<{ title: string; value: string; subValue: string; color: string }> = ({ title, value, subValue, color }) => {
  const colorMap: any = {
    blue: 'border-l-blue-500 bg-blue-50/30',
    indigo: 'border-l-indigo-500 bg-indigo-50/30',
    green: 'border-l-green-500 bg-green-50/30',
    amber: 'border-l-amber-500 bg-amber-50/30',
    red: 'border-l-red-500 bg-red-50/30',
    slate: 'border-l-slate-500 bg-slate-50/30',
  };

  return (
    <div className={`p-5 rounded-xl border-l-4 shadow-sm bg-white ${colorMap[color] || 'border-l-slate-200'}`}>
      <p className="text-xs font-bold text-slate-500 mb-1">{title}</p>
      <h4 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">{value}</h4>
      <p className={`text-[10px] font-semibold ${subValue.includes('▲') || subValue.includes('상회') ? 'text-blue-600' : 'text-slate-400'}`}>
        {subValue}
      </p>
    </div>
  );
};

export default Dashboard;
