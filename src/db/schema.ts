import { pgTable, text, varchar, timestamp, integer, uniqueIndex, index, boolean } from "drizzle-orm/pg-core";

// 1. Users Table
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash"),
  image: text("image"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Startups Table
export const startups = pgTable(
  "startups",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description").notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    image: text("image").notNull(),
    pitch: text("pitch").notNull(),
    views: integer("views").default(0).notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("category_idx").on(table.category),
    authorIdx: index("author_idx").on(table.authorId),
    createdIdx: index("created_idx").on(table.createdAt),
  })
);

// 3. Comments Table (Public Pitch Discussion)
export const comments = pgTable(
  "comments",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    startupId: text("startup_id")
      .notNull()
      .references(() => startups.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    startupIdx: index("comment_startup_idx").on(table.startupId),
    userIdx: index("comment_user_idx").on(table.userId),
  })
);

// 4. Reachouts Table (Private Founder Inbox Messages)
export const reachouts = pgTable(
  "reachouts",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    senderId: text("sender_id").references(() => users.id, { onDelete: "set null" }),
    receiverId: text("receiver_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startupId: text("startup_id").references(() => startups.id, { onDelete: "set null" }),
    senderName: varchar("sender_name", { length: 255 }).notNull(),
    senderEmail: varchar("sender_email", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    receiverIdx: index("reachout_receiver_idx").on(table.receiverId),
    senderIdx: index("reachout_sender_idx").on(table.senderId),
    readIdx: index("reachout_read_idx").on(table.isRead),
  })
);

// 5. Votes Table
export const votes = pgTable(
  "votes",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startupId: text("startup_id")
      .notNull()
      .references(() => startups.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userStartupUnique: uniqueIndex("user_startup_unique").on(table.userId, table.startupId),
  })
);
