
import { Organization, Headcount, Payroll, Attendance } from './types';

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

export const INITIAL_HEADCOUNT: Headcount[] = [
  { org_id: 'EXE', reference_month: '2024-03', total_headcount: 4, regular_headcount: 4, contract_headcount: 0, executive_headcount: 4, new_hires: 0, resignations: 0 },
  { org_id: 'MS_HQ', reference_month: '2024-03', total_headcount: 23, regular_headcount: 21, contract_headcount: 2, executive_headcount: 0, new_hires: 1, resignations: 0 },
  { org_id: 'GS_HQ', reference_month: '2024-03', total_headcount: 31, regular_headcount: 28, contract_headcount: 3, executive_headcount: 0, new_hires: 2, resignations: 1 },
  { org_id: 'RD_HQ', reference_month: '2024-03', total_headcount: 28, regular_headcount: 28, contract_headcount: 0, executive_headcount: 0, new_hires: 0, resignations: 0 },
  { org_id: 'QC_HQ', reference_month: '2024-03', total_headcount: 14, regular_headcount: 12, contract_headcount: 2, executive_headcount: 0, new_hires: 0, resignations: 0 },
  { org_id: 'PD_HQ', reference_month: '2024-03', total_headcount: 203, regular_headcount: 180, contract_headcount: 23, executive_headcount: 0, new_hires: 5, resignations: 2 },
  
  // 팀별 인원 상세 (캡처 기반)
  { org_id: 'MS_BIZ_1', reference_month: '2024-03', total_headcount: 1, regular_headcount: 1, contract_headcount: 0, executive_headcount: 0, new_hires: 0, resignations: 0 },
  { org_id: 'MS_TEAM_COMM', reference_month: '2024-03', total_headcount: 1, regular_headcount: 1, contract_headcount: 0, executive_headcount: 0, new_hires: 0, resignations: 0 },
  { org_id: 'MS_TEAM_HR', reference_month: '2024-03', total_headcount: 5, regular_headcount: 5, contract_headcount: 0, executive_headcount: 0, new_hires: 0, resignations: 0 },
  { org_id: 'MS_TEAM_SEC', reference_month: '2024-03', total_headcount: 4, regular_headcount: 4, contract_headcount: 0, executive_headcount: 0, new_hires: 0, resignations: 0 },
  { org_id: 'MS_BIZ_2', reference_month: '2024-03', total_headcount: 1, regular_headcount: 1, contract_headcount: 0, executive_headcount: 0, new_hires: 0, resignations: 0 },
  { org_id: 'MS_TEAM_ACC', reference_month: '2024-03', total_headcount: 5, regular_headcount: 5, contract_headcount: 0, executive_headcount: 0, new_hires: 0, resignations: 0 },
  { org_id: 'MS_TEAM_FIN', reference_month: '2024-03', total_headcount: 4, regular_headcount: 4, contract_headcount: 0, executive_headcount: 0, new_hires: 0, resignations: 0 },
  { org_id: 'PD_TEAM_PKG', reference_month: '2024-03', total_headcount: 30, regular_headcount: 25, contract_headcount: 5, executive_headcount: 0, new_hires: 0, resignations: 0 },
  { org_id: 'PD_TEAM_1', reference_month: '2024-03', total_headcount: 43, regular_headcount: 40, contract_headcount: 3, executive_headcount: 0, new_hires: 0, resignations: 0 },
  { org_id: 'PD_TEAM_2', reference_month: '2024-03', total_headcount: 41, regular_headcount: 38, contract_headcount: 3, executive_headcount: 0, new_hires: 0, resignations: 0 },
  { org_id: 'PD_TEAM_4', reference_month: '2024-03', total_headcount: 50, regular_headcount: 45, contract_headcount: 5, executive_headcount: 0, new_hires: 0, resignations: 0 },
];

export const INITIAL_PAYROLL: Payroll[] = INITIAL_ORGS.map(org => ({
  org_id: org.org_id,
  effective_month: '2024-03',
  base_pay: org.org_level === '본부' ? 120000000 : 45000000,
  bonus: org.org_level === '본부' ? 20000000 : 5000000,
  allowances: 2000000,
  overtime_pay: 1500000,
  holiday_pay: 500000,
  currency: 'KRW'
}));

export const INITIAL_ATTENDANCE: Attendance[] = INITIAL_ORGS.map(org => ({
  org_id: org.org_id,
  reference_month: '2024-03',
  avg_working_hours: 174.5,
  total_overtime_hours: org.org_id === 'PD_HQ' ? 450 : 80,
  total_holiday_hours: org.org_id === 'PD_HQ' ? 120 : 20,
  attendance_issues: org.org_id === 'PD_HQ' ? 12 : 2,
}));
