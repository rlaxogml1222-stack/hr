
import { GoogleGenAI } from "@google/genai";
import { Organization, Headcount, Payroll } from "../types.ts";

export const getHRInsights = async (
  orgs: Organization[],
  hc: Headcount[],
  pr: Payroll[]
) => {
  // Initialize with the standard API key from environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Fix: Calculate total cost using the actual properties defined in the Payroll interface
  const totalCost = pr.reduce((acc, curr) => {
    return acc + (
      curr.base_pay + 
      curr.base_pay_retro + 
      curr.fixed_overtime + 
      curr.rank_allowance + 
      curr.meal_allowance + 
      curr.position_allowance + 
      curr.childcare_allowance + 
      curr.holiday_work_pay + 
      curr.overtime_work_pay + 
      curr.other_allowance + 
      curr.cert_allowance + 
      curr.annual_leave_pay + 
      curr.incentive
    );
  }, 0);

  const prompt = `
    당신은 기업 HR 전략 컨설턴트입니다. 다음 HR 데이터를 분석하여 경영진 보고용 인사이트를 한국어로 제공하십시오.
    
    데이터 요약:
    - 조직 수: ${orgs.length}
    - 총 인원: ${hc.reduce((a, b) => a + b.total_headcount, 0)}
    - 총 인건비: ${totalCost.toLocaleString()}원
    
    요구사항:
    1. 인력 구성의 효율성 (정규직 vs 비계약직)
    2. 인건비 지출 패턴의 특징
    3. 조직 구조의 건강도 및 개선 제안
    
    분석 데이터 상세 (JSON):
    Orgs: ${JSON.stringify(orgs)}
    Headcount: ${JSON.stringify(hc)}
    Payroll: ${JSON.stringify(pr)}
  `;

  try {
    // Use gemini-3-pro-preview for complex reasoning tasks like HR strategy analysis
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    // Fix: Access .text property directly (not a method)
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 분석 리포트를 생성하는 중 오류가 발생했습니다.";
  }
};
