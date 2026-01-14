
import { GoogleGenAI } from "@google/genai";
import { Organization, Headcount, Payroll } from "../types.ts";

export const getHRInsights = async (
  orgs: Organization[],
  hc: Headcount[],
  pr: Payroll[]
) => {
  // 전역 process 변수가 없는 빌드 환경을 위한 안전장치
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  
  if (!apiKey) {
    return "API 키가 설정되지 않아 분석 리포트를 생성할 수 없습니다.";
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
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
    당신은 기업 HR 전략 컨설턴트입니다. 다음 HR 데이터를 분석하여 경영진 보고용 인사이트를 한국어로 제공하십시오.
    
    데이터 요약:
    - 조직 수: ${orgs.length}
    - 총 인원: ${hc.reduce((a, b) => a + (b.total_headcount || 0), 0)}
    - 총 인건비: ${totalCost.toLocaleString()}원
    
    요구사항:
    1. 인력 구성의 효율성 분석
    2. 인건비 지출 패턴의 특징 및 리스크 진단
    3. 조직 구조의 건강도 제안
    
    분석 데이터 상세:
    Orgs: ${JSON.stringify(orgs.slice(0, 10))}...
    Cost Summary: ${totalCost}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "분석 결과를 생성하지 못했습니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 분석 리포트를 생성하는 중 오류가 발생했습니다.";
  }
};
