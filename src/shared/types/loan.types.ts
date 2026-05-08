export type LoanStatus = "active" | "paid" | "overdue" | "refinanced";
export type PeriodType = "daily" | "weekly" | "monthly";
export type InstallmentStatus = "pending" | "paid" | "partial" | "overdue";

export interface Installment {
  id: number;
  loan_id: number;
  installment_number: number;
  due_date: string;
  amount: string | number;
  principal: string | number;
  interest: string | number;
  paid_amount: string | number;
  late_fee: string | number;
  balance: string | number;
  status: InstallmentStatus;
  paid_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LoanClient {
  id: number;
  full_name: string;
  phone?: string | null;
}

export interface Loan {
  id: number;
  user_id: number;
  client_id: number;
  principal_amount: string | number;
  interest_rate: string | number;
  period_type: PeriodType;
  period_count: number;
  installment_amount: string | number;
  total_amount: string | number;
  total_paid: string | number;
  balance: string | number;
  status: LoanStatus;
  start_date: string;
  end_date: string;
  late_fee_rate: string | number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: LoanClient;
  installments?: Installment[];
}

export interface LoanForm {
  client_id: number;
  principal_amount: number;
  interest_rate: number;
  period_type: PeriodType;
  period_count: number;
  start_date: string;
  late_fee_rate?: number;
  notes?: string;
}

export interface LoanFilters {
  search?: string;
  status?: string;
  client_id?: number;
  page?: number;
  per_page?: number;
}
