 export interface Vehicle {
  id: number;
  name: string;
  plate_number: string;
  category: string;
  daily_rate: number;
  photo_path?: string;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateVehicleData {
  name: string;
  plate_number: string;
  category: string;
  daily_rate: number;
  photo_path?: string;
}

export interface UpdateVehicleData {
  name?: string;
  plate_number?: string;
  category?: string;
  daily_rate?: number;
  photo_path?: string;
}