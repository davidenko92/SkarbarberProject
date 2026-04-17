// Database types - will be auto-generated from Supabase later
// For now, manual types matching our schema

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  timezone: string;
  business_hours: BusinessHours;
  created_at: string;
  updated_at: string;
};

export type BusinessHours = {
  mon: DayHours | null;
  tue: DayHours | null;
  wed: DayHours | null;
  thu: DayHours | null;
  fri: DayHours | null;
  sat: DayHours | null;
  sun: DayHours | null;
};

export type DayHours = {
  open: string; // "09:00"
  close: string; // "20:00"
};

export type Profile = {
  id: string;
  tenant_id: string;
  full_name: string;
  role: "owner" | "barber";
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type Client = {
  id: string;
  tenant_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  tenant_id: string;
  name: string;
  duration: number; // minutes
  price: number; // euros
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type Appointment = {
  id: string;
  tenant_id: string;
  client_id: string;
  barber_id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status: "confirmed" | "completed" | "cancelled" | "no_show";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Reminder = {
  id: string;
  appointment_id: string;
  channel: "whatsapp" | "email" | "sms";
  status: "pending" | "sent" | "failed" | "delivered";
  scheduled_for: string;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
};

// Joined types for UI
export type AppointmentWithDetails = Appointment & {
  client: Client;
  service: Service;
  barber: Profile;
};
