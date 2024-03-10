import {date, integer, pgTable, serial, text, pgSchema} from 'drizzle-orm/pg-core';

export const student = pgTable('student', {
    student_id: serial('id').primaryKey(),
    first_name: text('first_name').notNull(),
    last_name: text('last_name').notNull(),
    email: text('email').notNull().unique(),
    enrollment_date: date('enrollment_date')
});
