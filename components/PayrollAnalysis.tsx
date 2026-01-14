
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Payroll, Headcount, Organization } from '../types';

interface PayrollAnalysisProps {
  payroll: Payroll[];
  headcount: Headcount[];
  organizations: Organization[];
}

const PayrollAnalysis: React.FC<PayrollAnalysisProps> = ({ payroll, headcount, organizations }) => {
  const chartData = organizations
    .filter(org => org.org_level === '본부')
    .map(org => {
      const pr = payroll.find(p => p.org_id === org.org_id);
      return {
        name: org.org_name,
        base: pr?.base_pay || 0,
        bonus: pr?.bonus || 0,
        allowances: pr?.allowances || 0,
        total: (pr?.base_pay || 0) + (pr?.bonus || 0) + (pr?.allowances || 0)
      };
    });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold mb-6 text-slate-800">본부별 인건비 구성 (KRW 단위: 천원)</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `₩${(v/1000).toLocaleString()}K`} />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip formatter={(value: number) => `₩${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="base" name="기본급" fill="#3b82f6" stackId="a" />
              <Bar dataKey="bonus" name="성과급/상여" fill="#fbbf24" stackId="a" />
              <Bar dataKey="allowances" name="제수당" fill="#10b981" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 text-slate-800">조직별 인건비 현황 상세</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500">조직명</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">기본급</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">성과급</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">수당</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">총계</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chartData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">{item.name}</td>
                    <td className="px-4 py-3 text-right text-slate-600">₩{(item.base / 1000).toLocaleString()}K</td>
                    <td className="px-4 py-3 text-right text-slate-600">₩{(item.bonus / 1000).toLocaleString()}K</td>
                    <td className="px-4 py-3 text-right text-slate-600">₩{(item.allowances / 1000).toLocaleString()}K</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">₩{(item.total / 1000).toLocaleString()}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-4">AI 인사 비용 진단</h3>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
              현재 영업본부의 성과급 비중이 전체 비용의 25%로 타 본부(평균 15%) 대비 높게 형성되어 있습니다. 성과 달성도에 따른 보상 체계의 적정성을 재검토할 시점입니다.
            </p>
          </div>
          <div className="space-y-4">
            <div className="bg-white/10 p-3 rounded-lg border border-white/20">
              <p className="text-xs text-blue-200">권장 조치</p>
              <p className="text-sm font-semibold">본부별 인건비 예산 정밀 실사</p>
            </div>
            <button className="w-full py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors">
              상세 보고서 생성
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollAnalysis;
