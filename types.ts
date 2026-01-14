
export interface Organization {
  org_id: string;
  org_name: string;
  parent_org_id: string | null;
  org_level: '본부' | '사업부' | '팀' | '임원';
  manager_name: string;
  location: string;
}

export interface Headcount {
  org_id: string;
  reference_month: string; // YYYY-MM
  total_headcount: number;
  regular_headcount: number;
  contract_headcount: number;
  executive_headcount: number;
  new_hires: number;
  resignations: number;
}

export interface Payroll {
  org_id: string;
  effective_month: string;
  base_pay: number;           // 기본급
  base_pay_retro: number;     // 기본급 소급
  fixed_overtime: number;     // 고정연장근로수당
  rank_allowance: number;     // 직급수당
  meal_allowance: number;     // 식대
  position_allowance: number; // 직책수당
  childcare_allowance: number;// 육아수당
  holiday_work_pay: number;   // 휴일근무수당
  overtime_work_pay: number;  // 연장근무수당
  other_allowance: number;    // 기타수당
  cert_allowance: number;     // 자격수당
  annual_leave_pay: number;   // 연차수당
  incentive: number;          // 인센티브
  currency: 'KRW';
}

export interface Attendance {
  org_id: string;
  reference_month: string;
  avg_working_hours: number;
  weekday_overtime_hours: number; // 평일 연장 근로
  holiday_overtime_hours: number; // 휴일 근로
  total_overtime_hours: number; // 합계
  attendance_issues: number;
}

export interface OrgNode extends Organization {
  children?: OrgNode[];
  metrics?: {
    headcount: Headcount;
    payroll: Payroll;
    attendance: Attendance;
  };
}

export type ViewType = 'dashboard' | 'orgchart' | 'payroll' | 'attendance' | 'data';
