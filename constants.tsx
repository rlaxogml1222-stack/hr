
import { Organization, Headcount, Payroll, Attendance } from './types.ts';

const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const CURRENT_MONTH = getCurrentMonth();

// 2023년부터 2030년까지의 모든 월 옵션 생성
export const YEARS = ['2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'];
export const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

export const MONTH_OPTIONS = YEARS.flatMap(y => MONTHS.map(m => `${y}-${m}`)).sort();

export const INITIAL_ORGS: Organization[] = [
  { org_id: 'EXE', org_name: '임원', parent_org_id: null, org_level: '임원', manager_name: '대표이사', location: '서울본사' },
  
  // 경영지원본부
  { org_id: 'MS_HQ', org_name: '경영지원본부', parent_org_id: null, org_level: '본부', manager_name: '김본부장', location: '서울본사' },
  { org_id: 'MS_BIZ_1', org_name: '경영관리사업부', parent_org_id: 'MS_HQ', org_level: '사업부', manager_name: '이부장', location: '서울본사' },
  { org_id: 'MS_TEAM_COMM', org_name: '커뮤니케이션팀', parent_org_id: 'MS_BIZ_1', org_level: '팀', manager_name: '박팀장', location: '서울본사' },
  { org_id: 'MS_TEAM_HR', org_name: '인사총무팀', parent_org_id: 'MS_BIZ_1', org_level: '팀', manager_name: '최팀장', location: '서울본사' },
  { org_id: 'MS_TEAM_SEC', org_name: '정보보안팀', parent_org_id: 'MS_BIZ_1', org_level: '팀', manager_name: '정팀장', location: '서울본사' },
  { org_id: 'MS_BIZ_2', org_name: '경영지원사업부', parent_org_id: 'MS_HQ', org_level: '사업부', manager_name: '조부장', location: '서울본사' },
  { org_id: 'MS_TEAM_ACC', org_name: '회계팀', parent_org_id: 'MS_BIZ_2', org_level: '팀', manager_name: '강팀장', location: '서울본사' },
  { org_id: 'MS_TEAM_FIN', org_name: '자금팀', parent_org_id: 'MS_BIZ_2', org_level: '팀', manager_name: '윤팀장', location: '서울본사' },
  { org_id: 'MS_TEAM_LEG', org_name: '법무팀', parent_org_id: 'MS_BIZ_2', org_level: '팀', manager_name: '한팀장', location: '서울본사' },
  { org_id: 'MS_TEAM_MON', org_name: '장기모니터링팀', parent_org_id: 'MS_BIZ_2', org_level: '팀', manager_name: '오팀장', location: '서울본사' },
  { org_id: 'MS_TEAM_ETH', org_name: '윤리경영팀', parent_org_id: 'MS_BIZ_2', org_level: '팀', manager_name: '임팀장', location: '서울본사' },

  // 글로벌영업본부
  { org_id: 'GS_HQ', org_name: '글로벌영업본부', parent_org_id: null, org_level: '본부', manager_name: '글로벌장', location: '서울본사' },
  { org_id: 'GS_BIZ_MKT', org_name: '마케팅사업부', parent_org_id: 'GS_HQ', org_level: '사업부', manager_name: '마부장', location: '서울본사' },
  { org_id: 'GS_TEAM_GMKT', org_name: '글로벌마케팅팀', parent_org_id: 'GS_BIZ_MKT', org_level: '팀', manager_name: '송팀장', location: '서울본사' },
  { org_id: 'GS_TEAM_EBIZ', org_name: 'E-biz팀', parent_org_id: 'GS_BIZ_MKT', org_level: '팀', manager_name: '유팀장', location: '서울본사' },
  { org_id: 'GS_TEAM_DSN', org_name: '디자인팀', parent_org_id: 'GS_BIZ_MKT', org_level: '팀', manager_name: '서팀장', location: '서울본사' },
  { org_id: 'GS_TEAM_PLAN', org_name: '영업기획팀', parent_org_id: 'GS_BIZ_MKT', org_level: '팀', manager_name: '고팀장', location: '서울본사' },
  { org_id: 'GS_TEAM_JP', org_name: '일본영업팀', parent_org_id: 'GS_BIZ_MKT', org_level: '팀', manager_name: '심팀장', location: '도쿄지사' },
  { org_id: 'GS_TEAM_CH', org_name: '중화영업팀', parent_org_id: 'GS_BIZ_MKT', org_level: '팀', manager_name: '양팀장', location: '상해지사' },
  { org_id: 'GS_TEAM_S1', org_name: '글로벌영업1팀', parent_org_id: 'GS_BIZ_MKT', org_level: '팀', manager_name: '허팀장', location: '서울본사' },
  { org_id: 'GS_TEAM_S2', org_name: '글로벌영업2팀', parent_org_id: 'GS_BIZ_MKT', org_level: '팀', manager_name: '남팀장', location: '서울본사' },

  // 연구본부
  { org_id: 'RD_HQ', org_name: '연구본부', parent_org_id: null, org_level: '본부', manager_name: '연구본부장', location: '판교' },
  { org_id: 'RD_CTR_ENG', org_name: '조직공학연구센터', parent_org_id: 'RD_HQ', org_level: '사업부', manager_name: '공센터장', location: '판교' },
  { org_id: 'RD_TEAM_ENG', org_name: '조직공학연구팀', parent_org_id: 'RD_CTR_ENG', org_level: '팀', manager_name: '팀1', location: '판교' },
  { org_id: 'RD_TEAM_AUTO', org_name: '공정자동화팀', parent_org_id: 'RD_CTR_ENG', org_level: '팀', manager_name: '팀2', location: '판교' },
  // Fix: changed 'anchor' to 'org_name' to comply with the Organization interface
  { org_id: 'RD_TEAM_MED', org_name: '첨단의료기기연구팀', parent_org_id: 'RD_CTR_ENG', org_level: '팀', manager_name: '팀3', location: '판교' },
  { org_id: 'RD_TEAM_PLAN', org_name: '연구기획/IP팀', parent_org_id: 'RD_CTR_ENG', org_level: '팀', manager_name: '팀4', location: '판교' },

  // 품질관리본부
  { org_id: 'QC_HQ', org_name: '품질관리본부', parent_org_id: null, org_level: '본부', manager_name: '품질장', location: '울산' },
  { org_id: 'QC_BIZ', org_name: '품질관리사업부', parent_org_id: 'QC_HQ', org_level: '사업부', manager_name: '차부장', location: '울산' },
  { org_id: 'QC_TEAM_MAIN', org_name: '품질관리팀', parent_org_id: 'QC_BIZ', org_level: '팀', manager_name: '품질팀장', location: '울산' },
  { org_id: 'QC_TEAM_PERM', org_name: '인허가팀', parent_org_id: 'QC_BIZ', org_level: '팀', manager_name: '인허가장', location: '울산' },

  // 생산본부
  { org_id: 'PD_HQ', org_name: '생산본부', parent_org_id: null, org_level: '본부', manager_name: '생산본부장', location: '울산' },
  { org_id: 'PD_BIZ_SUP', org_name: '생산지원사업부', parent_org_id: 'PD_HQ', org_level: '사업부', manager_name: '생부장', location: '울산' },
  { org_id: 'PD_TEAM_PLAN', org_name: '생산기획팀', parent_org_id: 'PD_HQ', org_level: '팀', manager_name: '생기팀장', location: '울산' },
  { org_id: 'PD_TEAM_FAC', org_name: '시설관리팀', parent_org_id: 'PD_HQ', org_level: '팀', manager_name: '시설팀장', location: '울산' },
  { org_id: 'PD_TEAM_PKG', org_name: '제품포장팀', parent_org_id: 'PD_HQ', org_level: '팀', manager_name: '포장팀장', location: '울산' },
  { org_id: 'PD_TEAM_1', org_name: '생산1팀', parent_org_id: 'PD_HQ', org_level: '팀', manager_name: '팀A', location: '울산' },
  { org_id: 'PD_TEAM_2', org_name: '생산2팀', parent_org_id: 'PD_HQ', org_level: '팀', manager_name: '팀B', location: '울산' },
  { org_id: 'PD_TEAM_3', org_name: '생산3팀', parent_org_id: 'PD_HQ', org_level: '팀', manager_name: '팀C', location: '울산' },
  { org_id: 'PD_TEAM_4', org_name: '생산4팀', parent_org_id: 'PD_HQ', org_level: '팀', manager_name: '팀D', location: '울산' },
];

export const PRODUCTION_TEAMS = ['PD_TEAM_1', 'PD_TEAM_2', 'PD_TEAM_3', 'PD_TEAM_4', 'PD_TEAM_PKG'];

const HC_MAP: Record<string, number> = {
  'EXE': 4,
  'MS_HQ': 23, 'MS_BIZ_1': 1, 'MS_TEAM_COMM': 1, 'MS_TEAM_HR': 5, 'MS_TEAM_SEC': 4,
  'MS_BIZ_2': 1, 'MS_TEAM_ACC': 5, 'MS_TEAM_FIN': 4, 'MS_TEAM_LEG': 1, 'MS_TEAM_MON': 1, 'MS_TEAM_ETH': 0,
  'GS_HQ': 31, 'GS_BIZ_MKT': 1, 'GS_TEAM_GMKT': 2, 'GS_TEAM_EBIZ': 4, 'GS_TEAM_DSN': 3, 'GS_TEAM_PLAN': 6, 'GS_TEAM_JP': 4, 'GS_TEAM_CH': 4, 'GS_TEAM_S1': 5, 'GS_TEAM_S2': 2,
  'RD_HQ': 28, 'RD_CTR_ENG': 1, 'RD_TEAM_ENG': 15, 'RD_TEAM_AUTO': 3, 'RD_TEAM_MED': 6, 'RD_TEAM_PLAN': 3,
  'QC_HQ': 14, 'QC_BIZ': 1, 'QC_TEAM_MAIN': 10, 'QC_TEAM_PERM': 3,
  'PD_HQ': 203, 'PD_BIZ_SUP': 0, 'PD_TEAM_PLAN': 17, 'PD_TEAM_FAC': 8, 'PD_TEAM_PKG': 30, 'PD_TEAM_1': 43, 'PD_TEAM_2': 41, 'PD_TEAM_3': 14, 'PD_TEAM_4': 50
};

const generateMonthlyData = (month: string) => {
  // 연도별/월별 약간의 변동성 부여
  const [year, mStr] = month.split('-').map(Number);
  const drift = (year - 2023) * 5 + (mStr / 2);

  const hcs: Headcount[] = INITIAL_ORGS.map(org => {
    const baseHc = HC_MAP[org.org_id] ?? 0;
    const finalHc = Math.max(0, Math.floor(baseHc + (Math.random() * drift * 0.5)));
    return {
      org_id: org.org_id,
      reference_month: month,
      total_headcount: finalHc,
      regular_headcount: Math.floor(finalHc * 0.9),
      contract_headcount: Math.ceil(finalHc * 0.1),
      executive_headcount: org.org_id === 'EXE' ? 4 : 0,
      new_hires: Math.floor(Math.random() * 3),
      resignations: Math.floor(Math.random() * 2),
    };
  });

  const pay: Payroll[] = INITIAL_ORGS.map(org => {
    const baseWage = org.org_level === '본부' ? 80000000 : 3200000;
    const wageWithDrift = baseWage + (drift * 50000);
    return {
      org_id: org.org_id,
      effective_month: month,
      base_pay: wageWithDrift,
      base_pay_retro: 0,
      fixed_overtime: wageWithDrift * 0.1,
      rank_allowance: 150000,
      meal_allowance: 100000,
      position_allowance: 200000,
      childcare_allowance: 100000,
      holiday_work_pay: 250000,
      overtime_work_pay: 150000,
      other_allowance: 50000,
      cert_allowance: 30000,
      annual_leave_pay: 0,
      incentive: Math.random() > 0.8 ? 500000 : 0,
      currency: 'KRW'
    };
  });

  const att: Attendance[] = INITIAL_ORGS.map(org => {
    const isProd = PRODUCTION_TEAMS.includes(org.org_id);
    const wd = isProd ? 30 + Math.floor(Math.random() * 20) : 5 + Math.floor(Math.random() * 10);
    const hd = isProd ? 15 + Math.floor(Math.random() * 15) : 2 + Math.floor(Math.random() * 5);
    return {
      org_id: org.org_id,
      reference_month: month,
      avg_working_hours: 174.5,
      weekday_overtime_hours: wd,
      holiday_overtime_hours: hd,
      total_overtime_hours: wd + hd,
      attendance_issues: Math.floor(Math.random() * 2),
    };
  });

  return { hcs, pay, att };
};

export const ALL_INITIAL_DATA = MONTH_OPTIONS.reduce((acc: any, month) => {
  acc[month] = generateMonthlyData(month);
  return acc;
}, {});
