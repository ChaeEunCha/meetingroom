export type ReservationStatus = "confirmed" | "cancelled";

export interface Room {
  id: number;
  name: string;
  capacity: number;
  floor: string;
  equipment: string;
  note: string | null;
}

export interface Reservation {
  id: string;
  reservation_code: string;
  room_id: number;
  reservee_name: string;
  department: string;
  title: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: ReservationStatus;
}
