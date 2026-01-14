
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

// 전문적인 HR 컬러 팔레트 (신뢰감을 주는 네이비/블루 계열)
const COLORS = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

const Dashboard: React.FC<DashboardProps> = ({ allHeadcount, allPayroll, allAttendance, organizations, currentMonth }) => {
  
  // 본부 및 임원 단위 데이터 집계 (경영진 보고용)
  const hqSummaryData = useMemo(() => {
    // 본부 레벨 또는 임원(EXE) 조직 필터링
    const hqs = organizations.filter(org => org.org_level === '본부' || org.org_id === 'EXE');
    
    const summary = hqs.map(hq => {
      // 해당 본부 산하의 모든 조직 ID 추출
      const subOrgIds = organizations
        .filter(org => {
          if (org.org_id === hq.org_id) return true;
          if (org.parent_org_id === hq.org_id) return true;
          const parentBiz = organizations.find(p => p.org_id === org.parent_org_id);
          if (parentBiz && parentBiz.parent_org_id === hq.org_id) return true;
          return false;
        })
        .map(org => org.org_id);

      // 현재 선택된 달의 데이터 매칭
      const hcs = allHeadcount.filter(h => h.reference_month === currentMonth && subOrgIds.includes(h.org_id));
      const prs = allPayroll.filter(p => p.effective_month === currentMonth && subOrgIds.includes(p.org_id));
      const ats = allAttendance.filter(a => a.reference_month === currentMonth && subOrgIds.includes(a.org_id));

      const totalHc = hcs.reduce((a, b) => a + (b.total_headcount || 0), 0);
      
      // 총 인건비 계산 (모든 수당 합산)
      const totalCost = prs.reduce((acc, curr) => {
        return acc + (
          (curr.base_pay || 0) + 
          (curr.base_pay_retro || 0) + 
          (curr.fixed_overtime || 0) + 
          (curr.rank_allowance || 0) + 
          (curr.meal_allowance || 0) + 
          (curr.position_allowance || 0) + 
          (curr.childcare_allowance || 0) + 
          (curr.holiday_work_pay || 0) + 
          (curr.overtime_work_pay || 0) + 
          (curr.other_allowance || 0) + 
          (curr.cert_allowance || 0) + 
          (curr.annual_leave_pay || 0) + 
          (curr.incentive || 0)
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
        // 상태: 생산본부이거나 합산 연장시간이 높을 경우 주의
        status: (weekdayHours + holidayHours > 400 || hq.org_id === 'PD_HQ') ? '주의' : '정상'
      };
    });

    return summary;
  }, [organizations, allHeadcount, allPayroll, allAttendance, currentMonth]);

  // 데이터 존재 여부 확인 (그래프 공란 방지)
  const hasData = hqSummaryData.some(d => d.headcount > 0 || d.payrollCost > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-3xl border border-slate-100 shadow-sm animate-fade-in">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-400">데이터를 불러올 수 없습니다</h3>
        <p className="text-sm text-slate-300 mt-2">상단에서 연도와 월을 다시 확인해 주세요 (현재: {currentMonth})</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 좌측: 본부별 인력 현황 (Bar) */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-[450px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">본부별 인력 현황</h3>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
              <span className="text-xs font-bold text-slate-400">인원수(명)</span>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hqSummaryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                  formatter={(value: number) => [`${value}명`, '현원']}
                />
                <Bar dataKey="headcount" fill="#1d4ed8" radius={[8, 8, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 우측: 본부별 인건비 비중 (Pie/Donut) */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-[450px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">본부별 인건비 비중</h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">단위: 백만원</span>
          </div>
          <div className="flex-1 w-full min-h-0 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hqSummaryData}
                  cx="40%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="payrollCost"
                  stroke="none"
                >
                  {hqSummaryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${(value / 1000000).toLocaleString('ko-KR', {maximumFractionDigits: 0})}백만원`}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}
                />
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle" 
                  iconType="circle"
                  wrapperStyle={{ paddingLeft: '20px' }}
                  formatter={(value) => (
                    <span className="text-sm font-bold text-slate-600 ml-2">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 하단 상세 분석 테이블 */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">근태 및 연장근로 상세 분석</h3>
            <p className="text-sm text-slate-400 mt-1 font-medium italic">조직별 실근로 시간 및 수당 지급 현황 통합 분석 리포트</p>
          </div>
          <div className="flex space-x-2">
            <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-50 transition-all shadow-sm">
              CSV 다운로드
            </button>
            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              일괄 수정
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5 border-b border-slate-100">조직명</th>
                <th className="px-6 py-5 border-b border-slate-100 text-center">인원</th>
                <th className="px-6 py-5 border-b border-slate-100 text-center">소정근로(h)</th>
                <th className="px-6 py-5 border-b border-slate-100 text-center">연장근로(h)</th>
                <th className="px-6 py-5 border-b border-slate-100 text-center">휴일근로(h)</th>
                <th className="px-6 py-5 border-b border-slate-100 text-right">연장수당</th>
                <th className="px-10 py-5 border-b border-slate-100 text-right">휴일수당</th>
                <th className="px-8 py-5 border-b border-slate-100 text-center">상태</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {hqSummaryData.map((hq) => (
                <tr key={hq.id} className="hover:bg-blue-50/20 transition-all group">
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
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${hq.status === '정상' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
                      {hq.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-black text-base">
              <tr>
                <td className="px-8 py-8" colSpan={3}>전사 인사 통합 집계 (Grand Total)</td>
                <td className="px-6 py-8 text-center text-amber-400">
                  {hqSummaryData.reduce((acc, curr) => acc + curr.overtimeHours, 0).toLocaleString()}h
                </td>
                <td className="px-6 py-8 text-center text-rose-400">
                  {hqSummaryData.reduce((acc, curr) => acc + curr.holidayHours, 0).toLocaleString()}h
                </td>
                <td className="px-6 py-8 text-right">
                  ₩{hqSummaryData.reduce((acc, curr) => acc + curr.overtimePay, 0).toLocaleString()}
                </td>
                <td className="px-10 py-8 text-right">
                  ₩{hqSummaryData.reduce((acc, curr) => acc + curr.holidayPay, 0).toLocaleString()}
                </td>
                <td className="px-8 py-8"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
