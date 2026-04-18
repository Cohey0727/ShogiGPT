CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`match_id` text NOT NULL,
	`role` text NOT NULL,
	`contents` text NOT NULL,
	`is_partial` integer DEFAULT false NOT NULL,
	`metadata` text,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `chat_messages_match_idx` ON `chat_messages` (`match_id`);--> statement-breakpoint
CREATE INDEX `chat_messages_created_at_idx` ON `chat_messages` (`created_at`);--> statement-breakpoint
CREATE TABLE `evaluations` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`sfen` text NOT NULL,
	`engine_name` text NOT NULL,
	`score` integer NOT NULL,
	`variations` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `evaluations_sfen_engine_uq` ON `evaluations` (`sfen`,`engine_name`);--> statement-breakpoint
CREATE INDEX `evaluations_sfen_idx` ON `evaluations` (`sfen`);--> statement-breakpoint
CREATE INDEX `evaluations_engine_idx` ON `evaluations` (`engine_name`);--> statement-breakpoint
CREATE TABLE `match_ai_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`match_id` text NOT NULL,
	`player` text NOT NULL,
	`engine_name` text,
	`think_time` integer,
	`depth` integer,
	`multi_pv` integer,
	`personality` text,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `match_ai_configs_match_player_uq` ON `match_ai_configs` (`match_id`,`player`);--> statement-breakpoint
CREATE INDEX `match_ai_configs_match_idx` ON `match_ai_configs` (`match_id`);--> statement-breakpoint
CREATE TABLE `match_states` (
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`match_id` text NOT NULL,
	`index` integer NOT NULL,
	`usi_move` text NOT NULL,
	`sfen` text NOT NULL,
	`thinking_time` integer,
	PRIMARY KEY(`match_id`, `index`),
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`status` text DEFAULT 'ONGOING' NOT NULL,
	`player_sente` text,
	`player_gote` text,
	`sente_type` text DEFAULT 'HUMAN' NOT NULL,
	`gote_type` text DEFAULT 'HUMAN' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `matches_created_at_idx` ON `matches` (`created_at`);--> statement-breakpoint
CREATE INDEX `matches_status_idx` ON `matches` (`status`);