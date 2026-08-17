export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type Service = {
  id: string;
  name: string;
  durationMin: number;
  price: number;
  depositPercent: number;
};
