CREATE TABLE `author` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`website` text NOT NULL,
	`logo` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `modalities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `modalities_name_type_idx` ON `modalities` (`name`,`type`);--> statement-breakpoint
CREATE TABLE `model_modalities` (
	`model_id` text NOT NULL,
	`modality_id` text NOT NULL,
	PRIMARY KEY(`model_id`, `modality_id`),
	FOREIGN KEY (`model_id`) REFERENCES `models`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`modality_id`) REFERENCES `modalities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `model_modalities_model_idx` ON `model_modalities` (`model_id`);--> statement-breakpoint
CREATE INDEX `model_modalities_modality_idx` ON `model_modalities` (`modality_id`);--> statement-breakpoint
CREATE TABLE `model_request_modalities` (
	`request_id` text NOT NULL,
	`modality_id` text NOT NULL,
	PRIMARY KEY(`request_id`, `modality_id`),
	FOREIGN KEY (`request_id`) REFERENCES `model_requests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`modality_id`) REFERENCES `modalities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `model_request_modalities_request_idx` ON `model_request_modalities` (`request_id`);--> statement-breakpoint
CREATE INDEX `model_request_modalities_modality_idx` ON `model_request_modalities` (`modality_id`);--> statement-breakpoint
CREATE TABLE `model_request_status` (
	`request_id` text PRIMARY KEY NOT NULL,
	`is_reasoning` integer DEFAULT false NOT NULL,
	`is_experimental` integer DEFAULT false NOT NULL,
	`is_preview` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`request_id`) REFERENCES `model_requests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `model_request_status_reasoning_idx` ON `model_request_status` (`is_reasoning`);--> statement-breakpoint
CREATE TABLE `model_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`model_key` text NOT NULL,
	`description` text NOT NULL,
	`author_id` text,
	`author_name` text NOT NULL,
	`author_website` text,
	`author_description` text,
	`author_logo` text,
	`model_doc_link` text,
	`request_status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `author`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `model_requests_author_idx` ON `model_requests` (`author_id`);--> statement-breakpoint
CREATE INDEX `model_requests_status_idx` ON `model_requests` (`request_status`);--> statement-breakpoint
CREATE INDEX `model_requests_created_idx` ON `model_requests` (`created_at`);--> statement-breakpoint
CREATE TABLE `model_status` (
	`model_id` text PRIMARY KEY NOT NULL,
	`is_reasoning` integer DEFAULT false NOT NULL,
	`is_experimental` integer DEFAULT false NOT NULL,
	`is_preview` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`model_id`) REFERENCES `models`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `model_status_reasoning_idx` ON `model_status` (`is_reasoning`);--> statement-breakpoint
CREATE INDEX `model_status_experimental_idx` ON `model_status` (`is_experimental`);--> statement-breakpoint
CREATE INDEX `model_status_preview_idx` ON `model_status` (`is_preview`);--> statement-breakpoint
CREATE TABLE `model_tags` (
	`model_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`model_id`, `tag_id`),
	FOREIGN KEY (`model_id`) REFERENCES `models`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `model_tags_model_idx` ON `model_tags` (`model_id`);--> statement-breakpoint
CREATE INDEX `model_tags_tag_idx` ON `model_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `models` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`author_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `author`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `models_author_idx` ON `models` (`author_id`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);