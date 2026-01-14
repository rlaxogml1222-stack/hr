
import { GoogleGenAI } from "@google/genai";
import { Organization, Headcount, Payroll } from "../types";

export const getHRInsights = async (
  orgs: Organization[],
  hc: Headcount[],
  pr: Payroll[]
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    당신은 기업 HR 전략 컨설턴트입니다. 다음 HR 데이터를 분석하여 경영진 보고용 인사이트를 한국어로 제공하십시오.
    
    데이터 요약:
    - 조직 수: ${orgs.length}
    - 총 인원: ${hc.reduce((a, b) => a + b.total_headcount, 0)}
    - 총 인건비: ${pr.reduce((a, b) => a + b.base_pay + b.bonus + b.allowances, 0)}
    
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
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 분석 리포트를 생성하는 중 오류가 발생했습니다.";
  }
};
