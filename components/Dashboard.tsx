
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Headcount, Payroll, Organization, Attendance } from '../types.ts';

interface DashboardProps {
  allHeadcount: Headcount[];
  allPayroll: Payroll[];
  allAttendance: Attendance[];
  organizations: Organization[];
  currentMonth: string;
}

const COLORS = ['#1e40af', '#0ea5e9', '#6366f1', '#f59e0b', '#ef4444', '#06b6d4'];

const Dashboard: React.FC<DashboardProps> = ({ allHeadcount, allPayroll, allAttendance, organizations, currentMonth }) => {
  
  const hqSummaryData = useMemo(() => {
    const hqs = organizations.filter(org => org.org_level === '본부' || org.org_id === 'EXE');
    
    const summary = hqs.map(hq => {
      const subOrgIds = organizations
        .filter(org => {
          if (org.org_id === hq.org_id) return true;
          if (org.parent_org_id === hq.org_id) return true;
          const parentBiz = organizations.find(p => p.org_id === org.parent_org_id);
          if (parentBiz && parentBiz.parent_org_id === hq.org_id) return true;
          return false;
        })
        .map(org => org.org_id);

      const hcs = allHeadcount.filter(h => h.reference_month === currentMonth && subOrgIds.includes(h.org_id));
      const prs = allPayroll.filter(p => p.effective_month === currentMonth && subOrgIds.includes(p.org_id));
      const ats = allAttendance.filter(a => a.reference_month === currentMonth && subOrgIds.includes(a.org_id));

      const totalHc = hcs.reduce((a, b) => a + (b.total_headcount || 0), 0);
      const totalCost = prs.reduce((acc, curr) => {
        return acc + (
          curr.base_pay + curr.base_pay_retro + curr.fixed_overtime + curr.rank_allowance + 
          curr.meal_allowance + curr.position_allowance + curr.childcare_allowance + 
          curr.holiday_work_pay + curr.overtime_work_pay + curr.other_allowance + 
          curr.cert_allowance + curr.annual_leave_pay + curr.incentive
        );
      }, 0);
      
      const weekdayHours = ats.reduce((a, b) => a + (b.weekday_overtime_hours || 0), 0);
      const holidayHours = ats.reduce((a, b) => a + (b.holiday_overtime_hours || 0), 0);
      const overtimePay = prs.reduce((a, b) => a + (b.overtime_work_pay || 0), 0);
      const holidayPay = prs.reduce((a, b) => a + (b.holiday_work_pay || 0), 0);

      return {
        id: hq.org_id,
        name: hq.org_name,
        headcount: totalHc,
        payrollCost: totalCost,
        standardHours: 160,
        overtimeHours: weekdayHours,
        holidayHours: holidayHours,
        overtimePay: overtimePay,
        holidayPay: holidayPay,
        status: (weekdayHours + holidayHours > 400 || hq.org_id === 'PD_HQ') ? '주의' : '정상'
      };
    });

    return summary;
  }, [organizations, allHeadcount, allPayroll, allAttendance, currentMonth]);

  const hasData = hqSummaryData.some(d => d.headcount > 0 || d.payrollCost > 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 본부별 인력 현황 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col min-h-[420px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">본부별 인력 현황</h3>
            <div className="text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
              기준: {currentMonth}
            </div>
          </div>
          <div className="flex-1 w-full" style={{ height: '300px' }}>
            {!hasData ? (
              <div className="h-full flex items-center justify-center text-slate-300 font-bold italic">해당 월의 데이터가 없습니다.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hqSummaryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                  />
                  <Bar dataKey="headcount" name="인원(명)" fill="#1d4ed8" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 본부별 인건비 비중 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col min-h-[420px]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">본부별 인건비 비중</h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">단위: 백만원</span>
          </div>
          <div className="flex-1 w-full" style={{ height: '320px' }}>
            {!hasData ? (
              <div className="h-full flex items-center justify-center text-slate-300 font-bold italic">분석할 인건비 데이터가 없습니다.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hqSummaryData}
                    cx="40%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={110}
                    paddingAngle={6}
                    dataKey="payrollCost"
                    stroke="none"
                  >
                    {hqSummaryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${(value / 1000000).toLocaleString('ko-KR', {maximumFractionDigits: 1})}백만원`}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}
                  />
                  <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle" 
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-sm font-bold text-slate-600 ml-2">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">조직별 근태/수당 통합 분석</h3>
            <p className="text-sm text-slate-400 mt-1 font-medium">기준월 {currentMonth}의 수치 기반 경영 리포트</p>
          </div>
          <div className="flex space-x-2">
            <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-50 transition-all flex items-center shadow-sm">
              CSV 추출
            </button>
            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              데이터 일괄수정
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5 border-b border-slate-100">본부/임원실</th>
                <th className="px-6 py-5 border-b border-slate-100 text-center">인원수</th>
                <th className="px-6 py-5 border-b border-slate-100 text-center">소정근로</th>
                <th className="px-6 py-5 border-b border-slate-100 text-center">연장근로</th>
                <th className="px-6 py-5 border-b border-slate-100 text-center">휴일근로</th>
                <th className="px-6 py-5 border-b border-slate-100 text-right">연장수당 합계</th>
                <th className="px-10 py-5 border-b border-slate-100 text-right">휴일수당 합계</th>
                <th className="px-8 py-5 border-b border-slate-100 text-center">리스크</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {hqSummaryData.map((hq) => (
                <tr key={hq.id} className="hover:bg-blue-50/10 transition-all group">
                  <td className="px-8 py-5 font-bold text-slate-700">{hq.name}</td>
                  <td className="px-6 py-5 text-center text-slate-600 font-medium tabular-nums">{hq.headcount}명</td>
                  <td className="px-6 py-5 text-center text-slate-400 font-medium tabular-nums">{hq.standardHours}h</td>
                  <td className="px-6 py-5 text-center font-black text-amber-600 tabular-nums">{hq.overtimeHours}h</td>
                  <td className="px-6 py-5 text-center font-black text-rose-500 tabular-nums">{hq.holidayHours}h</td>
                  <td className="px-6 py-5 text-right text-slate-700 font-bold tabular-nums">₩{hq.overtimePay.toLocaleString()}</td>
                  <td className="px-10 py-5 text-right text-slate-700 font-bold tabular-nums">₩{hq.holidayPay.toLocaleString()}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-tight ${
                      hq.status === '정상' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {hq.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-black text-base">
              <tr>
                <td className="px-8 py-7" colSpan={3}>전사 합계 (Grand Total)</td>
                <td className="px-6 py-7 text-center text-amber-400">
                  {hqSummaryData.reduce((acc, curr) => acc + curr.overtimeHours, 0).toLocaleString()}h
                </td>
                <td className="px-6 py-7 text-center text-rose-400">
                  {hqSummaryData.reduce((acc, curr) => acc + curr.holidayHours, 0).toLocaleString()}h
                </td>
                <td className="px-6 py-7 text-right">
                  ₩{hqSummaryData.reduce((acc, curr) => acc + curr.overtimePay, 0).toLocaleString()}
                </td>
                <td className="px-10 py-7 text-right">
                  ₩{hqSummaryData.reduce((acc, curr) => acc + curr.holidayPay, 0).toLocaleString()}
                </td>
                <td className="px-8 py-7"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
