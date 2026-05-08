export interface Client {
  id: number;
  user_id: number;
  full_name: string;
  dni: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  status: "active" | "inactive" | "defaulter";
  loans_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ClientFilters {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ClientForm {
  full_name: string;
  dni: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  status: "active" | "inactive" | "defaulter";
}
