
import { GoogleGenAI } from "@google/genai";
import { Organization, Headcount, Payroll } from "../types.ts";

export const getHRInsights = async (
  orgs: Organization[],
  hc: Headcount[],
  pr: Payroll[]
) => {
  // 환경 변수 참조 안전성 확보
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  
  if (!apiKey) {
    return "분석을 위해 Google AI Studio API 키가 필요합니다. 환경 설정을 확인해주세요.";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const totalCost = pr.reduce((acc, curr) => {
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

  const prompt = `
    당신은 글로벌 기업의 시니어 HR 전략 컨설턴트입니다. 다음 데이터를 분석하여 경영진 보고용 인사이트를 한국어로 작성하십시오.
    
    [데이터 요약]
    - 조직 수: ${orgs.length}개 부서
    - 총 인원: ${hc.reduce((a, b) => a + (b.total_headcount || 0), 0)}명
    - 총 인건비 집행액: ${totalCost.toLocaleString()}원
    
    [분석 요청사항]
    1. 인력 효율성: 인원 구성 대비 생산성 리스크가 있는 조직을 식별하십시오.
    2. 비용 관리: 인건비 비중이 과도하게 높은 항목(수당 등)을 분석하고 최적화 방안을 제안하십시오.
    3. 미래 전략: 조직 성장을 위한 인력 구조 개편안을 간략히 제안하십시오.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "분석 결과를 도출하지 못했습니다. 다시 시도해주세요.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI 분석 서비스 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};
