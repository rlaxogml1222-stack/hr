
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Headcount, Payroll, Organization, Attendance } from '../types.ts';
import { getHRInsights } from '../services/aiService.ts';

interface DashboardProps {
  allHeadcount: Headcount[];
  allPayroll: Payroll[];
  allAttendance: Attendance[];
  organizations: Organization[];
  currentMonth: string;
}

const COLORS = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

const Dashboard: React.FC<DashboardProps> = ({ allHeadcount, allPayroll, allAttendance, organizations, currentMonth }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const hqSummaryData = useMemo(() => {
    const hqs = organizations.filter(org => org.org_level === '본부' || org.org_id === 'EXE');
    return hqs.map(hq => {
      const subOrgIds = organizations
        .filter(org => {
          if (org.org_id === hq.org_id) return true;
          if (org.parent_org_id === hq.org_id) return true;
          const parentBiz = organizations.find(p => p.org_id === org.parent_org_id);
          return parentBiz && parentBiz.parent_org_id === hq.org_id;
        })
        .map(org => org.org_id);

      const hcs = allHeadcount.filter(h => h.reference_month === currentMonth && subOrgIds.includes(h.org_id));
      const prs = allPayroll.filter(p => p.effective_month === currentMonth && subOrgIds.includes(p.org_id));
      const ats = allAttendance.filter(a => a.reference_month === currentMonth && subOrgIds.includes(a.org_id));

      const totalHc = hcs.reduce((a, b) => a + (b.total_headcount || 0), 0);
      const totalCost = prs.reduce((acc, curr) => acc + (
        (curr.base_pay || 0) + (curr.fixed_overtime || 0) + (curr.position_allowance || 0) + (curr.incentive || 0)
      ), 0);
      
      const weekdayHours = ats.reduce((a, b) => a + (b.weekday_overtime_hours || 0), 0);
      const holidayHours = ats.reduce((a, b) => a + (b.holiday_overtime_hours || 0), 0);

      return {
        id: hq.org_id,
        name: hq.org_name,
        headcount: totalHc,
        payrollCost: totalCost,
        standardHours: 160,
        overtimeHours: weekdayHours,
        holidayHours: holidayHours,
        overtimePay: prs.reduce((a, b) => a + (b.overtime_work_pay || 0), 0),
        holidayPay: prs.reduce((a, b) => a + (b.holiday_work_pay || 0), 0),
        status: (weekdayHours + holidayHours > 400) ? '주의' : '정상'
      };
    });
  }, [organizations, allHeadcount, allPayroll, allAttendance, currentMonth]);

  const handleGenerateAI = async () => {
    setIsLoadingAi(true);
    try {
      // 현재 달의 전체 데이터 필터링
      const hcs = allHeadcount.filter(h => h.reference_month === currentMonth);
      const prs = allPayroll.filter(p => p.effective_month === currentMonth);
      const result = await getHRInsights(organizations, hcs, prs);
      setAiInsight(result);
    } catch (err) {
      setAiInsight("분석 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const hasData = hqSummaryData.some(d => d.headcount > 0);

  if (!hasData) return <div className="p-10 text-center text-slate-400">데이터가 없습니다.</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 상단 섹션: 주요 지표 & AI 리포트 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-[400px]">
            <h3 className="text-xl font-black text-slate-800 mb-6">본부별 인력 분포</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hqSummaryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{fontSize: 11, fill: '#94a3b8'}} />
                  <YAxis tick={{fontSize: 11, fill: '#94a3b8'}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)'}} />
                  <Bar dataKey="headcount" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-[400px]">
            <h3 className="text-xl font-black text-slate-800 mb-2">인건비 비중</h3>
            <div className="h-full -mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={hqSummaryData} innerRadius={60} outerRadius={90} dataKey="payrollCost" paddingAngle={5}>
                    {hqSummaryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `₩${(v/1000000).toFixed(1)}M`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI 인사이트 카드 */}
        <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col h-[400px]">
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="font-black text-lg">AI 경영 리포트</h3>
              </div>
              <button 
                onClick={handleGenerateAI}
                disabled={isLoadingAi}
                className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all"
              >
                {isLoadingAi ? 'Analyzing...' : 'Refresh AI'}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingAi ? (
                <div className="space-y-4">
                  <div className="h-4 w-3/4 shimmer rounded"></div>
                  <div className="h-4 w-full shimmer rounded"></div>
                  <div className="h-4 w-5/6 shimmer rounded"></div>
                  <div className="h-4 w-2/3 shimmer rounded"></div>
                </div>
              ) : aiInsight ? (
                <div className="text-sm leading-relaxed text-slate-300 whitespace-pre-line animate-fade-in">
                  {aiInsight}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" /></svg>
                  <p className="text-xs">데이터 기반 HR 전략을 도출하려면<br/>버튼을 눌러주세요.</p>
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] pointer-events-none"></div>
        </div>
      </div>

      {/* 하단 상세 테이블 */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-800">조직별 세부 지표</h3>
          <span className="text-xs font-bold text-slate-400">데이터 기준: {currentMonth}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">조직명</th>
                <th className="px-6 py-4 text-center">인원</th>
                <th className="px-6 py-4 text-center">연장근로</th>
                <th className="px-6 py-4 text-right">추정 인건비</th>
                <th className="px-8 py-4 text-center">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {hqSummaryData.map((hq) => (
                <tr key={hq.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-700">{hq.name}</td>
                  <td className="px-6 py-5 text-center text-slate-600 font-medium tabular-nums">{hq.headcount}명</td>
                  <td className="px-6 py-5 text-center font-bold text-amber-600 tabular-nums">{hq.overtimeHours}h</td>
                  <td className="px-6 py-5 text-right font-bold text-slate-900 tabular-nums">₩{hq.payrollCost.toLocaleString()}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${hq.status === '정상' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {hq.status}
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

export default Dashboard;
