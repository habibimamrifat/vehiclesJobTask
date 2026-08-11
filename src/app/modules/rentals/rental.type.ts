export interface Rental {
  id: number;
  vehicle_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: Date;
  end_date: Date;
  total_amount: number;
  status: "booked" | "ongoing" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRentalData {
  vehicle_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
}

export interface UpdateRentalData {
  vehicle_id?: number;
  customer_name?: string;
  customer_phone?: string;
  start_date?: string;
  end_date?: string;
  status?: 'booked' | 'ongoing' | 'completed' | 'cancelled';
}