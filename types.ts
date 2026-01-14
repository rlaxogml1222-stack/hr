
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
  effective_month: string; // YYYY-MM
  base_pay: number;
  bonus: number;
  allowances: number;
  overtime_pay: number;
  holiday_pay: number;
  currency: 'KRW';
}

export interface Attendance {
  org_id: string;
  reference_month: string;
  avg_working_hours: number;
  total_overtime_hours: number;
  total_holiday_hours: number;
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
