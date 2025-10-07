-- Sample data for Dashboard Analytics Charts
-- This script inserts sample conversations, messages, and audit logs for the last 7 days

-- Insert sample conversations (last 7 days)
INSERT INTO `conversations` (`type`, `name`, `created_by`, `created_at`) VALUES
-- Today
('direct', NULL, 2, DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 8 HOUR),
('group', 'Navy Command Group', 3, DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 9 HOUR),
('direct', NULL, 4, DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 10 HOUR),
('group', 'Operations Team', 5, DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 11 HOUR),

-- 1 day ago
('direct', NULL, 6, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 8 HOUR),
('group', 'Security Alert Group', 2, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 9 HOUR),
('direct', NULL, 7, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 10 HOUR),
('group', 'Training Coordination', 8, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 11 HOUR),

-- 2 days ago
('direct', NULL, 9, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 8 HOUR),
('group', 'Maintenance Team', 3, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 9 HOUR),
('direct', NULL, 10, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 10 HOUR),
('group', 'Logistics Planning', 4, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 11 HOUR),

-- 3 days ago
('direct', NULL, 11, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 8 HOUR),
('group', 'Emergency Response', 5, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 9 HOUR),
('direct', NULL, 12, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 10 HOUR),
('group', 'Intelligence Briefing', 6, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 11 HOUR),

-- 4 days ago
('direct', NULL, 13, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 8 HOUR),
('group', 'Weather Updates', 7, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 9 HOUR),
('direct', NULL, 14, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 10 HOUR),
('group', 'Medical Team', 8, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 11 HOUR),

-- 5 days ago
('direct', NULL, 15, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 8 HOUR),
('group', 'Navigation Team', 9, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 9 HOUR),
('direct', NULL, 16, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 10 HOUR),
('group', 'Communication Center', 10, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 11 HOUR),

-- 6 days ago
('direct', NULL, 17, DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 8 HOUR),
('group', 'Supply Chain', 11, DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 9 HOUR),
('direct', NULL, 18, DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 10 HOUR),
('group', 'Technical Support', 12, DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 11 HOUR);

-- Insert conversation participants for group conversations
INSERT INTO `conversation_participants` (`conversation_id`, `user_id`, `joined_at`) VALUES
-- Group conversations (assuming conversation IDs start from 1)
(2, 2, DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 9 HOUR),
(2, 3, DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 9 HOUR),
(2, 4, DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 9 HOUR),
(2, 5, DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 9 HOUR),

(4, 2, DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 11 HOUR),
(4, 3, DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 11 HOUR),
(4, 6, DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 11 HOUR),
(4, 7, DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 11 HOUR),

(6, 2, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 9 HOUR),
(6, 3, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 9 HOUR),
(6, 8, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 9 HOUR),

(8, 8, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 11 HOUR),
(8, 9, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 11 HOUR),
(8, 10, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 11 HOUR),

(10, 3, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 9 HOUR),
(10, 4, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 9 HOUR),
(10, 11, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 9 HOUR),

(12, 4, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 11 HOUR),
(12, 5, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 11 HOUR),
(12, 12, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 11 HOUR);

-- Insert sample messages (last 7 days)
INSERT INTO `messages` (`conversation_id`, `sender_id`, `content`, `type`, `created_at`) VALUES
-- Today's messages
(1, 2, 'Good morning, Admiral. Ready for the daily briefing.', 'text', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 8 HOUR + INTERVAL 30 MINUTE),
(1, 3, 'Morning, sir. All systems operational.', 'text', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 8 HOUR + INTERVAL 35 MINUTE),

(2, 3, 'Navy Command Group: Morning briefing in 15 minutes.', 'text', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 9 HOUR + INTERVAL 15 MINUTE),
(2, 2, 'Confirmed, all commanders present.', 'text', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 9 HOUR + INTERVAL 20 MINUTE),
(2, 4, 'Weather conditions favorable for operations.', 'text', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 9 HOUR + INTERVAL 25 MINUTE),
(2, 5, 'Fleet status: All vessels ready.', 'text', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 9 HOUR + INTERVAL 30 MINUTE),

(3, 4, 'Captain, we need to discuss the logistics for next week.', 'text', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 10 HOUR + INTERVAL 15 MINUTE),
(3, 6, 'I have the supply reports ready.', 'text', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 10 HOUR + INTERVAL 20 MINUTE),

(4, 5, 'Operations Team: Mission briefing at 1400 hours.', 'text', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 11 HOUR + INTERVAL 30 MINUTE),
(4, 2, 'Mission objectives confirmed.', 'text', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 11 HOUR + INTERVAL 35 MINUTE),
(4, 3, 'Equipment checklist completed.', 'text', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 11 HOUR + INTERVAL 40 MINUTE),
(4, 6, 'Personnel assignments ready.', 'text', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 11 HOUR + INTERVAL 45 MINUTE),

-- Yesterday's messages
(5, 6, 'Status update: All systems green.', 'text', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 8 HOUR + INTERVAL 30 MINUTE),
(5, 7, 'Received, thank you for the update.', 'text', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 8 HOUR + INTERVAL 35 MINUTE),

(6, 2, 'Security Alert: Unauthorized access attempt detected.', 'system', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 9 HOUR + INTERVAL 15 MINUTE),
(6, 2, 'Investigating the source of the attempt.', 'text', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 9 HOUR + INTERVAL 20 MINUTE),
(6, 3, 'Security protocols activated.', 'text', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 9 HOUR + INTERVAL 25 MINUTE),
(6, 8, 'All personnel accounted for.', 'text', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 9 HOUR + INTERVAL 30 MINUTE),

(7, 7, 'Training schedule for next week ready.', 'text', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 10 HOUR + INTERVAL 15 MINUTE),
(7, 9, 'Excellent, I will review the materials.', 'text', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 10 HOUR + INTERVAL 20 MINUTE),

(8, 8, 'Training Coordination: Schedule attached.', 'text', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 11 HOUR + INTERVAL 30 MINUTE),
(8, 9, 'Received, will distribute to all units.', 'text', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 11 HOUR + INTERVAL 35 MINUTE),
(8, 10, 'Training equipment prepared.', 'text', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 11 HOUR + INTERVAL 40 MINUTE),

-- 2 days ago messages
(9, 9, 'Maintenance report submitted.', 'text', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 8 HOUR + INTERVAL 30 MINUTE),
(9, 11, 'Thank you, reviewing now.', 'text', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 8 HOUR + INTERVAL 35 MINUTE),

(10, 3, 'Maintenance Team: Weekly check completed.', 'text', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 9 HOUR + INTERVAL 15 MINUTE),
(10, 4, 'All equipment operational.', 'text', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 9 HOUR + INTERVAL 20 MINUTE),
(10, 11, 'Next maintenance scheduled.', 'text', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 9 HOUR + INTERVAL 25 MINUTE),

(11, 10, 'Logistics planning meeting notes shared.', 'text', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 10 HOUR + INTERVAL 15 MINUTE),
(11, 12, 'Received, will implement changes.', 'text', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 10 HOUR + INTERVAL 20 MINUTE),

(12, 4, 'Logistics Planning: Updated inventory list.', 'text', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 11 HOUR + INTERVAL 30 MINUTE),
(12, 5, 'Supply chain optimized.', 'text', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 11 HOUR + INTERVAL 35 MINUTE),
(12, 12, 'Delivery schedule confirmed.', 'text', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 11 HOUR + INTERVAL 40 MINUTE);

-- Insert sample audit logs (last 7 days)
INSERT INTO `audit_logs` (`user_id`, `action`, `target_type`, `target_id`, `target_name`, `details`, `ip_address`, `created_at`) VALUES
-- Today's activities
(2, 'LOGIN_SUCCESS', 'user', 2, 'Admiral Sheikh Nazrul Islam', 'Successful login from headquarters', '192.168.1.100', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 8 HOUR),
(3, 'LOGIN_SUCCESS', 'user', 3, 'Rear Admiral Mohammad Ali', 'Successful login from office', '192.168.1.101', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 8 HOUR + INTERVAL 5 MINUTE),
(4, 'LOGIN_SUCCESS', 'user', 4, 'Captain Karim Ahmed', 'Successful login from field', '192.168.1.102', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 8 HOUR + INTERVAL 10 MINUTE),
(2, 'CREATE_CONVERSATION', 'conversation', 1, 'Direct Message', 'Created direct conversation', '192.168.1.100', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 8 HOUR + INTERVAL 30 MINUTE),
(3, 'CREATE_CONVERSATION', 'conversation', 2, 'Navy Command Group', 'Created group conversation', '192.168.1.101', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 9 HOUR),
(5, 'CREATE_CONVERSATION', 'conversation', 4, 'Operations Team', 'Created group conversation', '192.168.1.103', DATE_SUB(NOW(), INTERVAL 0 DAY) + INTERVAL 11 HOUR),

-- Yesterday's activities
(6, 'LOGIN_SUCCESS', 'user', 6, 'Captain Rahman Ali', 'Successful login from base', '192.168.1.104', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 8 HOUR),
(7, 'LOGIN_SUCCESS', 'user', 7, 'Commander Fatima Begum', 'Successful login from office', '192.168.1.105', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 8 HOUR + INTERVAL 5 MINUTE),
(2, 'SECURITY_ALERT', 'security', NULL, 'Unauthorized Access', 'Detected unauthorized access attempt', '192.168.1.100', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 9 HOUR + INTERVAL 15 MINUTE),
(2, 'PASSWORD_CHANGE', 'user', 8, 'Lieutenant Commander Hasan Mia', 'Password changed for security', '192.168.1.100', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 10 HOUR),
(8, 'CREATE_CONVERSATION', 'conversation', 8, 'Training Coordination', 'Created group conversation', '192.168.1.106', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 11 HOUR),

-- 2 days ago activities
(9, 'LOGIN_SUCCESS', 'user', 9, 'Rear Admiral Karim Uddin', 'Successful login from headquarters', '192.168.1.107', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 8 HOUR),
(10, 'LOGIN_SUCCESS', 'user', 10, 'Captain Nusrat Jahan', 'Successful login from field', '192.168.1.108', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 8 HOUR + INTERVAL 5 MINUTE),
(3, 'DELETE_USER', 'user', 50, 'Captain Moniruzzaman', 'User account deactivated', '192.168.1.101', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 9 HOUR),
(11, 'CREATE_CONVERSATION', 'conversation', 10, 'Maintenance Team', 'Created group conversation', '192.168.1.109', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 9 HOUR),
(4, 'CREATE_CONVERSATION', 'conversation', 12, 'Logistics Planning', 'Created group conversation', '192.168.1.102', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 11 HOUR),

-- 3 days ago activities
(11, 'LOGIN_SUCCESS', 'user', 11, 'Commander Rafiqul Islam', 'Successful login from office', '192.168.1.110', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 8 HOUR),
(12, 'LOGIN_SUCCESS', 'user', 12, 'Lieutenant Commander Salma Khan', 'Successful login from field', '192.168.1.111', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 8 HOUR + INTERVAL 5 MINUTE),
(5, 'ADMIN_ACTION', 'system', NULL, 'System Configuration', 'Updated system security settings', '192.168.1.103', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 9 HOUR),
(5, 'CREATE_CONVERSATION', 'conversation', 14, 'Emergency Response', 'Created group conversation', '192.168.1.103', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 9 HOUR),
(6, 'CREATE_CONVERSATION', 'conversation', 16, 'Intelligence Briefing', 'Created group conversation', '192.168.1.104', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 11 HOUR),

-- 4 days ago activities
(13, 'LOGIN_SUCCESS', 'user', 13, 'Lieutenant Kamal Ahmed', 'Successful login from base', '192.168.1.112', DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 8 HOUR),
(14, 'LOGIN_SUCCESS', 'user', 14, 'Commander Nasir Uddin', 'Successful login from office', '192.168.1.113', DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 8 HOUR + INTERVAL 5 MINUTE),
(7, 'PASSWORD_CHANGE', 'user', 15, 'Captain Aminul Haque', 'Password changed for security', '192.168.1.105', DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 9 HOUR),
(7, 'CREATE_CONVERSATION', 'conversation', 18, 'Weather Updates', 'Created group conversation', '192.168.1.105', DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 9 HOUR),
(8, 'CREATE_CONVERSATION', 'conversation', 20, 'Medical Team', 'Created group conversation', '192.168.1.106', DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 11 HOUR),

-- 5 days ago activities
(15, 'LOGIN_SUCCESS', 'user', 15, 'Captain Aminul Haque', 'Successful login from headquarters', '192.168.1.114', DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 8 HOUR),
(16, 'LOGIN_SUCCESS', 'user', 16, 'Commander Rashida Begum', 'Successful login from field', '192.168.1.115', DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 8 HOUR + INTERVAL 5 MINUTE),
(9, 'DELETE_CONVERSATION', 'conversation', 15, 'Old Training Group', 'Deleted inactive conversation', '192.168.1.107', DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 9 HOUR),
(9, 'CREATE_CONVERSATION', 'conversation', 22, 'Navigation Team', 'Created group conversation', '192.168.1.107', DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 9 HOUR),
(10, 'CREATE_CONVERSATION', 'conversation', 24, 'Communication Center', 'Created group conversation', '192.168.1.108', DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 11 HOUR),

-- 6 days ago activities
(17, 'LOGIN_SUCCESS', 'user', 17, 'Lieutenant Commander Mahbub Alam', 'Successful login from office', '192.168.1.116', DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 8 HOUR),
(18, 'LOGIN_SUCCESS', 'user', 18, 'Lieutenant Farzana Akter', 'Successful login from base', '192.168.1.117', DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 8 HOUR + INTERVAL 5 MINUTE),
(11, 'ADMIN_ACTION', 'system', NULL, 'User Management', 'Bulk user permissions updated', '192.168.1.109', DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 9 HOUR),
(11, 'CREATE_CONVERSATION', 'conversation', 26, 'Supply Chain', 'Created group conversation', '192.168.1.109', DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 9 HOUR),
(12, 'CREATE_CONVERSATION', 'conversation', 28, 'Technical Support', 'Created group conversation', '192.168.1.110', DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 11 HOUR);
