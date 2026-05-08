export interface Payment {
  id: number;
  loan_id: number;
  installment_id: number | null;
  user_id: number;
  amount: string;
  late_fee: string;
  payment_date: string;
  reference: string | null;
  method: "cash" | "transfer" | "other";
  notes: string | null;
  created_at: string;
  loan?: {
    id: number;
    client: {
      id: number;
      full_name: string;
    };
  };
  installment?: {
    id: number;
    installment_number: number;
    due_date: string;
    amount: string;
  };
}

export interface PaymentFilters {
  loan_id?: number;
  page?: number;
  per_page?: number;
}

export interface PaymentForm {
  loan_id: number;
  installment_id: number | null;
  amount: number;
  payment_date: string;
  method: "cash" | "transfer" | "other";
  reference: string;
  notes: string;
}
