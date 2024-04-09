import {
  date,
  integer,
  pgTable,
  serial,
  text,
  pgSchema,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  user_id: serial("user_id").primaryKey(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone_number: text("phone_number"),
  address: text("address"),
});

export const roles = pgTable("roles", {
  role_id: serial("role_id").primaryKey(),
  role_name: text("role_name").notNull().unique(),
});

//allow many-to-many relationship between 'user' and 'roles'
export const userRoles = pgTable("userRoles", {
  user_id: integer("user_id").references(() => users.user_id),
  role_id: integer("role_id").references(()=> roles.role_id),
})

export const billingInformation = pgTable("billingInformation", {
  billing_id: serial("billing_id").primaryKey(),
  user_id: integer("user_id").references(() => users.user_id),
  periodicity: text("periodicity").notNull(),
  card_type: text("cardType"),
  card_holder: text("cardHolder").notNull(),
  card_number: text("cardNumber").notNull(),
  expiry: date("expiry").notNull(),
});

export const members = pgTable("member", {
  user_id: integer("user_id").references(() => users.user_id),
  health_metric: text("health_metric"),
  fitness_goals: text("fitness_goals"),
  fitness_achievements: text("fitness_achievements"),
  join_date: date("join_date"),
});

export const paymentInfo = pgTable("paymentInfo", {
  payment_id: serial("payment_id").primaryKey(),
  user_id: integer("user_id").references(() => users.user_id),
  payment_date: date(`payment_date`),
  amount: integer("amount"),
});

export const membershipCard = pgTable("membershipCard", {
  user_id: integer("user_id").references(() => users.user_id),
  nfc: text("nfc"),
});

export const equipments = pgTable("equipment", {
  equipment_id: serial("equipment_id").primaryKey(),
  equipment_name: text("equipment_name"),
  last_maintained: date("last_maintained").notNull(),
  next_maintained: date("next_maintained").notNull(),
});

export const timeSlots = pgTable("timeSlots", {
  slot_id: serial("slot_id").primaryKey(),
  title: text("title").notNull(),
  trainer_id: integer("trainer_Id").notNull(),
  start_time: date("start_time").notNull(),
  end_time: date("end_time").notNull(),
  current_enrollment: integer("current_enrollment").notNull(),
  capacity: integer("capacity").notNull(),
  location: text("location")
});

export const bookings = pgTable("bookings", {
  user_id: integer("user_id").references(() => users.user_id),
  slot_id: integer("slot_id").references(() => timeSlots.slot_id)
});

export const trainer = pgTable("trainer", {
  user_id: integer("user_id").references(() => users.user_id),
});

export const exercise = pgTable("exercise", {
  exercise_type: text("exercise").primaryKey(),
  reps: integer("reps"),
  duration: integer("duration"),
});

// keep this table for flexibility
// allows to add admin specific attributes
export const adminStaff = pgTable("adminStaff", {
  user_id: integer("user_id").references(() => users.user_id),
});
