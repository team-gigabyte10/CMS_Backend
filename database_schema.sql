-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------
--
-- HIERARCHICAL ORGANIZATIONAL STRUCTURE:
-- This database implements a flexible organizational hierarchy:
-- 1. UNITS (main organizational unit with parent-child relationships) - e.g., "Naval Headquarters", "Dhaka Naval Area"
-- 2. DEPARTMENTS (connected to units with parent-child relationships) - departments belong to specific units and can have hierarchical structure
-- 3. DESIGNATIONS (linked to departments with parent-child relationships) - designations belong to specific departments and can have hierarchical structure
-- 4. USERS (unlimited hierarchical structure) - users can have parent users, creating unlimited depth
--
-- USER CREATION METHODOLOGY:
-- Units -> Departments -> Designations -> Users -> Users -> Users ... (unlimited nesting via parent_id)
--
-- RELATIONSHIPS:
-- - units (1) -> departments (many) - departments belong to units
-- - units (1) -> units (many) - parent-child relationships for unit hierarchy
-- - departments (1) -> departments (many) - parent-child relationships for department hierarchy
-- - departments (1) -> designations (many) - designations belong to specific departments
-- - designations (1) -> designations (many) - parent-child relationships for designation hierarchy within departments
-- - units (1) -> users (many) - users belong to units as main organizational unit
-- - departments (1) -> users (many) - users belong to departments within units
-- - designations (1) -> users (many) - users are assigned designations within departments
-- - users (1) -> users (many) - parent-child relationships for unlimited user hierarchy
-- - users reference: unit_id, department_id, designation_id, parent_id (for hierarchical structure)
--
-- This structure allows for proper organizational hierarchy management
-- and ensures data integrity through foreign key constraints.
-- Password hashes are generated automatically using bcrypt during user creation.
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for cms_db
CREATE DATABASE IF NOT EXISTS `cms_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `cms_db`;

-- Dumping structure for table cms_db.audit_logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `action` varchar(100) NOT NULL,
  `target_type` varchar(100) DEFAULT NULL,
  `target_id` int DEFAULT NULL,
  `target_name` varchar(255) DEFAULT NULL,
  `details` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_target_type` (`target_type`),
  KEY `idx_target_id` (`target_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_audit_logs_user_action_created` (`user_id`,`action`,`created_at`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table cms_db.conversations
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('direct','group') NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table cms_db.conversation_participants
CREATE TABLE IF NOT EXISTS `conversation_participants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `user_id` int NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_participant` (`conversation_id`,`user_id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `conversation_participants_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversation_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for view cms_db.conversation_summary
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `conversation_summary` (
	`id` INT NOT NULL,
	`type` ENUM('direct','group') NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`name` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`participant_count` BIGINT NOT NULL,
	`message_count` BIGINT NOT NULL,
	`last_message_at` TIMESTAMP NULL,
	`created_at` TIMESTAMP NULL,
	`updated_at` TIMESTAMP NULL
) ENGINE=MyISAM;

-- Dumping structure for procedure cms_db.CreateDirectConversation
DELIMITER //
CREATE PROCEDURE `CreateDirectConversation`(
    IN p_user1_id INT,
    IN p_user2_id INT
)
BEGIN
    DECLARE v_conversation_id INT;
    DECLARE v_existing_conversation INT DEFAULT 0;

    -- Check if a conversation already exists between the two users
    SELECT COUNT(*) INTO v_existing_conversation
    FROM conversations c
    JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
    WHERE c.type = 'direct'
      AND ((cp1.user_id = p_user1_id AND cp2.user_id = p_user2_id)
        OR (cp1.user_id = p_user2_id AND cp2.user_id = p_user1_id));

    IF v_existing_conversation = 0 THEN
        -- Create a new direct conversation
        INSERT INTO conversations (type, created_by) VALUES ('direct', p_user1_id);
        SET v_conversation_id = LAST_INSERT_ID();

        -- Add both participants
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (v_conversation_id, p_user1_id),
               (v_conversation_id, p_user2_id);
    END IF;
END//
DELIMITER ;

-- Dumping structure for procedure cms_db.CreateUser
DELIMITER //
CREATE PROCEDURE `CreateUser`(
    IN p_name VARCHAR(255),
    IN p_rank_id INT,
    IN p_service_no VARCHAR(50),
    IN p_unit_id INT,
    IN p_department_id INT,
    IN p_role_id INT,
    IN p_designation_id INT,
    IN p_phone VARCHAR(20),
    IN p_mobile VARCHAR(20),
    IN p_alternative_mobile VARCHAR(20),
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    INSERT INTO users (
        name, rank_id, service_no, unit_id, department_id,
        role_id, designation_id, phone, mobile, alternative_mobile, email, password_hash
    ) VALUES (
        p_name, p_rank_id, p_service_no, p_unit_id, p_department_id,
        p_role_id, p_designation_id, p_phone, p_mobile, p_alternative_mobile, p_email, p_password_hash
    );

    -- Log the user creation
    INSERT INTO audit_logs (user_id, action, target_type, target_name, details)
    VALUES (LAST_INSERT_ID(), 'USER_CREATED', 'user', p_name, 'User account created');

    COMMIT;
END//
DELIMITER ;

-- Dumping structure for table cms_db.feedback
CREATE TABLE IF NOT EXISTS `feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `rating` int NOT NULL,
  `category` varchar(100) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `satisfaction` enum('Very Satisfied','Satisfied','Neutral','Dissatisfied','Very Dissatisfied') NOT NULL,
  `recommend` enum('Definitely','Probably','Not Sure','Probably Not','Definitely Not') NOT NULL,
  `improvements` json DEFAULT NULL,
  `anonymous` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('pending','reviewed','resolved') NOT NULL DEFAULT 'pending',
  `reviewed_by` int DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `resolution_notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `idx_email` (`email`),
  KEY `idx_rating` (`rating`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_anonymous` (`anonymous`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_feedback_status_created` (`status`,`created_at`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `feedback_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for procedure cms_db.LogUserActivity
DELIMITER //
CREATE PROCEDURE `LogUserActivity`(
    IN p_user_id INT,
    IN p_action VARCHAR(100),
    IN p_target_type VARCHAR(100),
    IN p_target_id INT,
    IN p_target_name VARCHAR(255),
    IN p_details TEXT,
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT
)
BEGIN
    INSERT INTO audit_logs (
        user_id, action, target_type, target_id, target_name,
        details, ip_address, user_agent
    ) VALUES (
        p_user_id, p_action, p_target_type, p_target_id, p_target_name,
        p_details, p_ip_address, p_user_agent
    );
END//
DELIMITER ;

-- Dumping structure for table cms_db.messages
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `content` text NOT NULL,
  `type` enum('text','system') NOT NULL DEFAULT 'text',
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_sender_id` (`sender_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_messages_conversation_created` (`conversation_id`,`created_at`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for view cms_db.message_statistics
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `message_statistics` (
	`message_date` DATE NULL,
	`total_messages` BIGINT NOT NULL,
	`text_messages` BIGINT NOT NULL,
	`system_messages` BIGINT NOT NULL,
	`unique_senders` BIGINT NOT NULL
) ENGINE=MyISAM;

-- Dumping structure for table cms_db.notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','warning','error','success') NOT NULL DEFAULT 'info',
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `action_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table cms_db.system_settings
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  `setting_type` enum('string','number','boolean','json') NOT NULL DEFAULT 'string',
  `description` text,
  `is_public` tinyint(1) NOT NULL DEFAULT '0',
  `updated_by` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`),
  KEY `updated_by` (`updated_by`),
  KEY `idx_setting_key` (`setting_key`),
  KEY `idx_is_public` (`is_public`),
  CONSTRAINT `system_settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table cms_db.departments
CREATE TABLE IF NOT EXISTS `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `unit_id` int NOT NULL,
  `parent_id` int DEFAULT NULL,
  `description` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_unit_id` (`unit_id`),
  KEY `idx_parent_id` (`parent_id`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `departments_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping structure for table cms_db.units
CREATE TABLE IF NOT EXISTS `units` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text,
  `parent_id` int DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_name` (`name`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `units_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `units` (`id`) ON DELETE SET NULL,
  CONSTRAINT `units_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping structure for table cms_db.branches
-- Branches table removed - using parent-child relationships instead

-- Sub_branches table removed - using parent-child relationships instead

-- Dumping structure for table cms_db.ranks
CREATE TABLE IF NOT EXISTS `ranks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `level` int DEFAULT NULL,
  `description` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`),
  KEY `idx_level` (`level`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping structure for table cms_db.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `level` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`),
  KEY `idx_level` (`level`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table cms_db.permissions
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `resource` varchar(100) NOT NULL,
  `action` varchar(50) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_permission` (`resource`,`action`),
  KEY `idx_name` (`name`),
  KEY `idx_resource` (`resource`),
  KEY `idx_action` (`action`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table cms_db.role_permissions
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_permission` (`role_id`,`permission_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table cms_db.designations
CREATE TABLE IF NOT EXISTS `designations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `department_id` int NOT NULL,
  `parent_id` int DEFAULT NULL,
  `description` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_department_parent` (`name`,`department_id`,`parent_id`),
  KEY `idx_name` (`name`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `designations_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `designations_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `designations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping structure for table cms_db.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `rank_id` int DEFAULT NULL,
  `service_no` varchar(50) NOT NULL,
  `unit_id` int NOT NULL,
  `department_id` int DEFAULT NULL,
  `role_id` int NOT NULL DEFAULT '3',
  `designation_id` int NOT NULL,
  `phone` varchar(20) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `alternative_mobile` varchar(20) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `status` enum('online','offline','busy') NOT NULL DEFAULT 'offline',
  `last_seen` timestamp NULL DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `parent_id` int DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `service_no` (`service_no`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_service_no` (`service_no`),
  KEY `idx_email` (`email`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_users_role_status` (`role_id`,`status`),
  KEY `idx_users_status_updated` (`status`,`updated_at`),
  KEY `idx_rank_id` (`rank_id`),
  KEY `idx_unit_id` (`unit_id`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_designation_id` (`designation_id`),
  KEY `idx_parent_id` (`parent_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`rank_id`) REFERENCES `ranks` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `users_ibfk_3` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_4` FOREIGN KEY (`designation_id`) REFERENCES `designations` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `users_ibfk_5` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `users_ibfk_6` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping structure for table cms_db.user_permissions
CREATE TABLE IF NOT EXISTS `user_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  `granted_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_permission` (`user_id`,`permission_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_permission_id` (`permission_id`),
  KEY `idx_granted_by` (`granted_by`),
  CONSTRAINT `user_permissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_permissions_ibfk_3` FOREIGN KEY (`granted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Sample data for lookup tables

-- Insert sample roles
INSERT INTO `roles` (`id`, `name`, `description`, `level`) VALUES
(1, 'Super_admin', 'Super Administrator with full system access', 100),
(2, 'Admin', 'Administrator with elevated privileges', 50),
(3, 'User', 'Regular user with standard access', 10);

-- Insert sample permissions
INSERT INTO `permissions` (`name`, `description`, `resource`, `action`) VALUES
-- User management permissions
('user.create', 'Create new users', 'user', 'create'),
('user.read', 'View user information', 'user', 'read'),
('user.update', 'Update user information', 'user', 'update'),
('user.delete', 'Delete users', 'user', 'delete'),
('user.manage_roles', 'Manage user roles and permissions', 'user', 'manage_roles'),

-- Unit management permissions
('unit.create', 'Create new units', 'unit', 'create'),
('unit.read', 'View unit information', 'unit', 'read'),
('unit.update', 'Update unit information', 'unit', 'update'),
('unit.delete', 'Delete units', 'unit', 'delete'),

-- Branch management permissions
('branch.create', 'Create new branches', 'branch', 'create'),
('branch.read', 'View branch information', 'branch', 'read'),
('branch.update', 'Update branch information', 'branch', 'update'),
('branch.delete', 'Delete branches', 'branch', 'delete'),

-- Sub-branch management permissions
('sub_branch.create', 'Create new sub-branches', 'sub_branch', 'create'),
('sub_branch.read', 'View sub-branch information', 'sub_branch', 'read'),
('sub_branch.update', 'Update sub-branch information', 'sub_branch', 'update'),
('sub_branch.delete', 'Delete sub-branches', 'sub_branch', 'delete'),

-- Department management permissions
('department.create', 'Create new departments', 'department', 'create'),
('department.read', 'View department information', 'department', 'read'),
('department.update', 'Update department information', 'department', 'update'),
('department.delete', 'Delete departments', 'department', 'delete'),

-- Designation management permissions
('designation.create', 'Create new designations', 'designation', 'create'),
('designation.read', 'View designation information', 'designation', 'read'),
('designation.update', 'Update designation information', 'designation', 'update'),
('designation.delete', 'Delete designations', 'designation', 'delete'),

-- Rank management permissions
('rank.create', 'Create new ranks', 'rank', 'create'),
('rank.read', 'View rank information', 'rank', 'read'),
('rank.update', 'Update rank information', 'rank', 'update'),
('rank.delete', 'Delete ranks', 'rank', 'delete'),

-- Message permissions
('message.create', 'Send messages', 'message', 'create'),
('message.read', 'Read messages', 'message', 'read'),
('message.update', 'Update messages', 'message', 'update'),
('message.delete', 'Delete messages', 'message', 'delete'),

-- Conversation permissions
('conversation.create', 'Create conversations', 'conversation', 'create'),
('conversation.read', 'View conversations', 'conversation', 'read'),
('conversation.update', 'Update conversations', 'conversation', 'update'),
('conversation.delete', 'Delete conversations', 'conversation', 'delete'),

-- Notification permissions
('notification.create', 'Create notifications', 'notification', 'create'),
('notification.read', 'View notifications', 'notification', 'read'),
('notification.update', 'Update notifications', 'notification', 'update'),
('notification.delete', 'Delete notifications', 'notification', 'delete'),

-- Feedback permissions
('feedback.create', 'Submit feedback', 'feedback', 'create'),
('feedback.read', 'View feedback', 'feedback', 'read'),
('feedback.update', 'Update feedback status', 'feedback', 'update'),
('feedback.delete', 'Delete feedback', 'feedback', 'delete'),

-- Audit log permissions
('audit_log.read', 'View audit logs', 'audit_log', 'read'),
('audit_log.delete', 'Delete audit logs', 'audit_log', 'delete'),

-- System settings permissions
('system_settings.read', 'View system settings', 'system_settings', 'read'),
('system_settings.update', 'Update system settings', 'system_settings', 'update'),

-- Dashboard permissions
('dashboard.view', 'Access dashboard', 'dashboard', 'view'),
('dashboard.analytics', 'View analytics and statistics', 'dashboard', 'analytics');

-- Assign permissions to Super_admin role (all permissions)
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, id FROM permissions;

-- Assign permissions to Admin role (most permissions except critical ones)
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 2, id FROM permissions 
WHERE name NOT IN ('user.delete', 'user.manage_roles', 'system_settings.update', 'audit_log.delete');

-- Assign permissions to User role (basic permissions)
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 3, id FROM permissions 
WHERE name IN (
    'user.read',
    'message.create', 'message.read', 'message.update', 'message.delete',
    'conversation.create', 'conversation.read', 'conversation.update',
    'notification.read', 'notification.update',
    'feedback.create', 'feedback.read',
    'dashboard.view'
);

-- Insert sample units
INSERT INTO `units` (`name`, `code`, `description`, `parent_id`, `created_by`) VALUES
('Naval Headquarters', 'NHQ', 'Naval Headquarters - Top level unit', NULL, 1),
('Dhaka Naval Area', 'DNA', 'Dhaka Naval Area Command', NULL, 1),
('Chittagong Naval Area', 'CNA', 'Chittagong Naval Area Command', NULL, 1),
('Khulna Naval Area', 'KNA', 'Khulna Naval Area Command', NULL, 1),
('Information Technology Department', 'ITD', 'Information Technology Department', 1, 1),
('Engineering Division', 'ENG', 'Engineering and technical operations', 1, 1),
('Operations Division', 'OPS', 'Operations and planning', 1, 1);

-- Insert sample departments (connected to Naval Headquarters unit)
INSERT INTO `departments` (`name`, `unit_id`, `parent_id`, `description`) VALUES
('CNS', 1, NULL, 'Chief of Naval Staff Secretariat'),
('NS', 1, NULL, 'Naval Staff'),
('Drafting Authority', 1, NULL, 'Drafting Authority'),
('JAG', 1, NULL, 'Judge Advocate General'),
('ACNS', 1, 'Assistant Chief of Naval Staff'),
('DNO', 1, 'Director Naval Operations'),
('DNI', 1, 'Director Naval Intelligence'),
('DNP', 1, 'Director Naval Plans'),
('D SIG', 1, 'Director Signals'),
('D Works', 1, 'Director Works'),
('Naval Avn', 1, 'Naval Aviation'),
('D Hydro', 1, 'Director Hydrography'),
('D Sub', 1, 'Director Submarines'),
('D Spl Ops', 1, 'Director Special Operations'),
('SD & Cer', 1, 'Staff Duties & Ceremonial'),
('Overseas Ops', 1, 'Overseas Operations'),
('DPS', 1, 'Director Personnel Services'),
('DNT', 1, 'Director Naval Training'),
('D Wel', 1, 'Director Welfare'),
('DMS', 1, 'Director Medical Services'),
('D Edn', 1, 'Director Education'),
('D Civ Pers', 1, 'Director Civilian Personnel');

-- Insert sample branches (under Naval Headquarters)
-- Branch and sub_branch data removed - using parent-child relationships instead

-- Insert sample ranks
INSERT INTO `ranks` (`name`, `level`, `description`) VALUES
('General', 10, 'Highest military rank'),
('Lieutenant General', 9, 'Three-star general'),
('Major General', 8, 'Two-star general'),
('Brigadier General', 7, 'One-star general'),
('Colonel', 6, 'Senior field officer'),
('Lieutenant Colonel', 5, 'Mid-level field officer'),
('Major', 4, 'Junior field officer'),
('Captain', 3, 'Company-level officer'),
('First Lieutenant', 2, 'Junior officer'),
('Second Lieutenant', 1, 'Entry-level officer'),
('Command Sergeant Major', 10, 'Highest enlisted rank'),
('Sergeant Major', 9, 'Senior enlisted advisor'),
('First Sergeant', 8, 'Company-level senior enlisted'),
('Master Sergeant', 7, 'Senior non-commissioned officer'),
('Sergeant First Class', 6, 'Mid-level non-commissioned officer'),
('Staff Sergeant', 5, 'Junior non-commissioned officer'),
('Sergeant', 4, 'Squad leader'),
('Corporal', 3, 'Team leader'),
('Specialist', 2, 'Skilled soldier'),
('Private First Class', 1, 'Experienced private'),
('Private', 0, 'Entry-level enlisted');

-- Insert sample designations (CNS department - department_id: 1)
INSERT INTO `designations` (`name`, `department_id`, `description`, `parent_id`) VALUES
('CNS', 1, 'Chief of Naval Staff', NULL),
('Secy to CNS', 1, 'Secretary to Chief of Naval Staff', 1),
('Asst. Secy', 1, 'Assistant Secretary', 2),
('Flag Lt', 1, 'Flag Lieutenant', 1),
('Protocol Offr', 1, 'Protocol Officer', 1),
('Escort Offr', 1, 'Escort Officer', 1);

-- Insert sample designations (NS department - department_id: 2)
INSERT INTO `designations` (`name`, `department_id`, `description`, `parent_id`) VALUES
('NS', 2, 'Naval Staff', NULL),
('SONA-1', 2, 'Staff Officer Naval Affairs 1', 7),
('SONA-1 (Tec)', 2, 'Staff Officer Naval Affairs 1 Technical', 8),
('SONA-2', 2, 'Staff Officer Naval Affairs 2', 7),
('SONA-2 (Plans)', 2, 'Staff Officer Naval Affairs 2 Plans', 10),
('SO Tec', 2, 'Staff Officer Technical', 7);

-- Insert sample designations (Drafting Authority department - department_id: 3)
INSERT INTO `designations` (`name`, `department_id`, `description`, `parent_id`) VALUES
('DA', 3, 'Drafting Authority', NULL),
('DD Drafting', 3, 'Deputy Director Drafting', 13),
('Sec Comd-1', 3, 'Secretary Command 1', 13),
('Sec Comd-2', 3, 'Secretary Command 2', 13),
('Sec Comd-3', 3, 'Secretary Command 3', 13);

-- Insert sample designations (JAG department - department_id: 4)
INSERT INTO `designations` (`name`, `department_id`, `description`, `parent_id`) VALUES
('JAG', 4, 'Judge Advocate General', NULL),
('DD JAG', 4, 'Deputy Director Judge Advocate General', 18),
('SO (JAG)', 4, 'Staff Officer Judge Advocate General', 18);

-- Insert sample designations (ACNS Operations department - department_id: 5)
INSERT INTO `designations` (`name`, `department_id`, `description`, `parent_id`) VALUES
('ACNS (O)', 5, 'Assistant Chief of Naval Staff Operations', NULL),
('Coord to ACNS(O)', 5, 'Coordinator to Assistant Chief of Naval Staff Operations', 21),
('DNO', 5, 'Director Naval Operations', 21),
('DDNO', 5, 'Deputy Director Naval Operations', 23),
('SO(O)', 5, 'Staff Officer Operations', 23),
('SO (Ops Plan)', 5, 'Staff Officer Operations Planning', 25),
('DNI', 5, 'Director Naval Intelligence', 21),
('DDNI', 5, 'Deputy Director Naval Intelligence', 27),
('SO(I)', 5, 'Staff Officer Intelligence', 27),
('SO (CI)', 5, 'Staff Officer Counter Intelligence', 29),
('SO (Tec)', 5, 'Staff Officer Technical', 21),
('SO (Media)', 5, 'Staff Officer Media', 21),
('DNP', 5, 'Director Naval Plans', 21),
('DDNP', 5, 'Deputy Director Naval Plans', 33),
('SO(Plan-1)', 5, 'Staff Officer Plans 1', 33),
('SO (Plans-2)', 5, 'Staff Officer Plans 2', 33),
('D SIG', 5, 'Director Signals', 21),
('DD Sig', 5, 'Deputy Director Signals', 37),
('SO(Sig)', 5, 'Staff Officer Signals', 37),
('D Works', 5, 'Director Works', 21),
('DD Works', 5, 'Deputy Director Works', 40),
('SO(Works)', 5, 'Staff Officer Works', 40),
('Naval Avn', 5, 'Naval Aviation', 21),
('DD Nav', 5, 'Deputy Director Naval', 43),
('SO (Nav)', 5, 'Staff Officer Naval', 43),
('D Hydro', 5, 'Director Hydrography', 21),
('DD Hydro', 5, 'Deputy Director Hydrography', 46),
('SO (Hydro)', 5, 'Staff Officer Hydrography', 46),
('Capt Staff', 5, 'Captain Staff', 21),
('DD Sub', 5, 'Deputy Director Submarines', 21),
('DD Sub (Tec)', 5, 'Deputy Director Submarines Technical', 51),
('So (Sub)', 5, 'Staff Officer Submarines', 51),
('D Spl Ops', 5, 'Director Special Operations', 21),
('SO (Spl Ops)', 5, 'Staff Officer Special Operations', 54),
('SD & Cer', 5, 'Staff Duties & Ceremonial', 21),
('DD SD & C', 5, 'Deputy Director Staff Duties & Ceremonial', 56),
('SO (SD & C)', 5, 'Staff Officer Staff Duties & Ceremonial', 56),
('Overseas Ops', 5, 'Overseas Operations', 21),
('DDONO', 5, 'Deputy Director Overseas Naval Operations', 59),
('SO (ONO)', 5, 'Staff Officer Overseas Naval Operations', 59);

-- Insert sample designations (Personnel Services department - department_id: 13)
INSERT INTO `designations` (`name`, `department_id`, `description`, `parent_id`) VALUES
('ACNS (P)', 13, 'Assistant Chief of Naval Staff Personnel', NULL),
('Coord to ACNS(P)', 13, 'Coordinator to Assistant Chief of Naval Staff Personnel', 61),
('DPS', 13, 'Director Personnel Services', 61),
('DDNPS', 13, 'Deputy Director Naval Personnel Services', 63),
('SO(Pers)', 13, 'Staff Officer Personnel', 63),
('DNT', 13, 'Director Naval Training', 61),
('DDNT', 13, 'Deputy Director Naval Training', 66),
('SO(T-1)', 13, 'Staff Officer Training 1', 66),
('SO (T-2)', 13, 'Staff Officer Training 2', 66),
('SO (T)', 13, 'Staff Officer Training', 66),
('D Wel', 13, 'Director Welfare', 61),
('DD Wel', 13, 'Deputy Director Welfare', 71),
('SO (Wel)', 13, 'Staff Officer Welfare', 71),
('DMS', 13, 'Director Medical Services', 61),
('DDMS', 13, 'Deputy Director Medical Services', 74),
('SO (Med)', 13, 'Staff Officer Medical', 74),
('D Edn', 13, 'Director Education', 61),
('DD Edn', 13, 'Deputy Director Education', 77),
('SO (Edn)', 13, 'Staff Officer Education', 77),
('D Civ Pers', 13, 'Director Civilian Personnel', 61),
('DD (Nav)', 13, 'Deputy Director Naval', 80),
('SO (Nav)', 13, 'Staff Officer Naval', 80);

-- Insert sample designations (D Works department - department_id: 10)
INSERT INTO `designations` (`name`, `department_id`, `description`, `parent_id`) VALUES
('ACNS (M)', 10, 'Assistant Chief of Naval Staff Material', NULL),
('Coord to ACNS(M)', 10, 'Coordinator to Assistant Chief of Naval Staff Material', 81),
('DNO', 10, 'Director Naval Operations', 81),
('DDNO', 10, 'Deputy Director Naval Operations', 83),
('SO(O)', 10, 'Staff Officer Operations', 83),
('D Works', 10, 'Director Works', 81),
('DD Works', 10, 'Deputy Director Works', 86),
('SO(Works)', 10, 'Staff Officer Works', 86);

-- Insert sample designations (Overseas Operations department - department_id: 17)
INSERT INTO `designations` (`name`, `department_id`, `description`, `parent_id`) VALUES
('ACNS (L)', 17, 'Assistant Chief of Naval Staff Logistics', NULL),
('Coord to ACNS(L)', 17, 'Coordinator to Assistant Chief of Naval Staff Logistics', 89),
('DNO', 17, 'Director Naval Operations', 89),
('DDNO', 17, 'Deputy Director Naval Operations', 91),
('SO(O)', 17, 'Staff Officer Operations', 91),
('Overseas Op', 17, 'Overseas Operations', 89);

-- Insert sample users (only Super Admin and Admin)
-- Password for both: admin123
INSERT INTO `users` (`name`, `rank_id`, `service_no`, `unit_id`, `department_id`, `role_id`, `designation_id`, `phone`, `mobile`, `alternative_mobile`, `email`, `password_hash`) VALUES
('Admiral Sheikh Nazrul Islam', 1, 'BN10001', 1, 1, 1, 1, '+880211111111', '+8801811111111', '+8801811111111', 's_admin@gmail.com', '$2a$12$UxSeLoeManJbBuKOTkZZCe7nERf.kwNlesS7ExTt0too33egCs1CK'),
('Rear Admiral Mohammad Ali', 2, 'BN10002', 1, 1, 2, 2, '+880211111112', '+8801811111112', '+8801811111112', 'admin@gmail.com', '$2a$12$UxSeLoeManJbBuKOTkZZCe7nERf.kwNlesS7ExTt0too33egCs1CK');

-- Data exporting was unselected.

-- Data exporting was unselected.

-- Dumping structure for table cms_db.user_preferences
CREATE TABLE IF NOT EXISTS `user_preferences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `preference_key` varchar(100) NOT NULL,
  `preference_value` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_preference` (`user_id`,`preference_key`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_preference_key` (`preference_key`),
  CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table cms_db.user_sessions
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_token` (`session_token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_token` (`session_token`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for view cms_db.user_statistics
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `user_statistics` (
	`total_users` BIGINT NOT NULL,
	`online_users` BIGINT NOT NULL,
	`offline_users` BIGINT NOT NULL,
	`busy_users` BIGINT NOT NULL,
	`super_admins` BIGINT NOT NULL,
	`admins` BIGINT NOT NULL,
	`regular_users` BIGINT NOT NULL
) ENGINE=MyISAM;

-- Dumping structure for trigger cms_db.log_user_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `log_user_update` AFTER UPDATE ON `users` FOR EACH ROW BEGIN
    IF (OLD.name != NEW.name) OR (OLD.email != NEW.email) OR (OLD.phone != NEW.phone) THEN
        INSERT INTO audit_logs (user_id, action, target_type, target_id, target_name, details)
        VALUES (NEW.id, 'USER_UPDATED', 'user', NEW.id, NEW.name,
                CONCAT(
                    CASE WHEN OLD.name != NEW.name THEN CONCAT('name from \"', OLD.name, '\" to \"', NEW.name, '\"; ') ELSE '' END,
                    CASE WHEN OLD.email != NEW.email THEN CONCAT('email from \"', OLD.email, '\" to \"', NEW.email, '\"; ') ELSE '' END,
                    CASE WHEN OLD.phone != NEW.phone THEN CONCAT('phone from \"', OLD.phone, '\" to \"', NEW.phone, '\";') ELSE '' END
                ));
    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger cms_db.update_last_seen_on_status_change
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `update_last_seen_on_status_change` BEFORE UPDATE ON `users` FOR EACH ROW BEGIN
    IF NEW.status = 'online' AND OLD.status != 'online' THEN
        SET NEW.last_seen = CURRENT_TIMESTAMP;
    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `conversation_summary`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `conversation_summary` AS select `c`.`id` AS `id`,`c`.`type` AS `type`,`c`.`name` AS `name`,count(distinct `cp`.`user_id`) AS `participant_count`,count(`m`.`id`) AS `message_count`,max(`m`.`created_at`) AS `last_message_at`,`c`.`created_at` AS `created_at`,`c`.`updated_at` AS `updated_at` from ((`conversations` `c` left join `conversation_participants` `cp` on((`c`.`id` = `cp`.`conversation_id`))) left join `messages` `m` on((`c`.`id` = `m`.`conversation_id`))) group by `c`.`id`,`c`.`type`,`c`.`name`,`c`.`created_at`,`c`.`updated_at`;

-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `message_statistics`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `message_statistics` AS select cast(`messages`.`created_at` as date) AS `message_date`,count(0) AS `total_messages`,count((case when (`messages`.`type` = 'text') then 1 end)) AS `text_messages`,count((case when (`messages`.`type` = 'system') then 1 end)) AS `system_messages`,count(distinct `messages`.`sender_id`) AS `unique_senders` from `messages` group by cast(`messages`.`created_at` as date);

-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `user_statistics`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `user_statistics` AS 
select 
    count(0) AS `total_users`,
    count((case when (`users`.`status` = 'online') then 1 end)) AS `online_users`,
    count((case when (`users`.`status` = 'offline') then 1 end)) AS `offline_users`,
    count((case when (`users`.`status` = 'busy') then 1 end)) AS `busy_users`,
    count((case when (`users`.`role_id` = 1) then 1 end)) AS `super_admins`,
    count((case when (`users`.`role_id` = 2) then 1 end)) AS `admins`,
    count((case when (`users`.`role_id` = 3) then 1 end)) AS `regular_users`
from `users` 
where (`users`.`is_active` = true);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
