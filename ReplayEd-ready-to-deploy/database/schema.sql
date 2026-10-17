-- ============================================================
-- ReplayEd: MySQL Relational Database Schema & Initial Seed
-- Adaptive Learning & Coding Assessment Platform
-- ============================================================

CREATE DATABASE IF NOT EXISTS replayed_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE replayed_db;

-- ------------------------------------------------------------
-- 1. USERS & ROLES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher', 'admin') NOT NULL DEFAULT 'student',
  student_id VARCHAR(64) NULL,
  cohort VARCHAR(120) NULL,
  status ENUM('Active', 'Inactive', 'Suspended') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_email (email),
  INDEX idx_student_id (student_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. COURSES & SYLLABUS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  description TEXT NULL,
  modules_count INT DEFAULT 0,
  prerequisite VARCHAR(191) NULL,
  trainer_id VARCHAR(64) NULL,
  enrolled_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS modules (
  id VARCHAR(64) PRIMARY KEY,
  course_id VARCHAR(64) NOT NULL,
  title VARCHAR(191) NOT NULL,
  order_index INT NOT NULL DEFAULT 1,
  is_completed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. CONCEPTS & MASTERY
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS concepts (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL DEFAULT 'Algorithms',
  default_difficulty ENUM('Foundational', 'Intermediate', 'Advanced') DEFAULT 'Intermediate'
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_concept_mastery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  concept_id VARCHAR(64) NOT NULL,
  mastery_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  is_weak_topic BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_student_concept (student_id, concept_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. ASSESSMENTS & CODING TEST BENCH
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assessments (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  difficulty ENUM('Easy', 'Medium', 'Hard', 'Advanced') NOT NULL DEFAULT 'Medium',
  supported_languages VARCHAR(120) DEFAULT 'python,javascript,cpp',
  time_limit_minutes INT DEFAULT 45,
  starter_code TEXT NULL,
  test_cases_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. SUBMISSIONS & RESULTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS submissions (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  assessment_id VARCHAR(64) NOT NULL,
  language VARCHAR(32) DEFAULT 'python',
  code_content LONGTEXT NOT NULL,
  score INT DEFAULT 0,
  passed_tests INT DEFAULT 0,
  total_tests INT DEFAULT 0,
  runtime_ms INT DEFAULT 0,
  memory_mb DECIMAL(6,2) DEFAULT 0.00,
  status ENUM('Submitted', 'Evaluating', 'Reviewed', 'Flagged') DEFAULT 'Submitted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. SESSION REPLAY & FORENSIC INTEGRITY SIGNALS
-- (Signature Feature: Keystroke Telemetry Storage)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_replays (
  id VARCHAR(64) PRIMARY KEY,
  submission_id VARCHAR(64) NOT NULL UNIQUE,
  student_id VARCHAR(64) NOT NULL,
  duration_seconds INT NOT NULL DEFAULT 0,
  average_wpm INT DEFAULT 70,
  paste_events_count INT DEFAULT 0,
  integrity_verdict ENUM('High Confidence', 'Flagged for Viva', 'Under Review') DEFAULT 'High Confidence',
  trainer_notes TEXT NULL,
  telemetry_stream_json LONGTEXT NULL, -- JSON array of character keystrokes, timestamp intervals, and pauses
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. AUDIT LOGS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event VARCHAR(255) NOT NULL,
  actor VARCHAR(120) NOT NULL,
  level VARCHAR(64) DEFAULT 'Audit Log',
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- INITIAL SEED DATA
-- ============================================================

-- Seed Users
INSERT INTO users (id, name, email, password_hash, role, student_id, cohort, status)
VALUES
  ('usr_stu_001', 'Alex Chen', 'student@replayed.edu', '$2a$10$X8m1Z9W7bC1O1U2O3E4R5E6T7Y8U9I0O', 'student', 'STU-2026-042', 'Batch 2026-A', 'Active'),
  ('usr_tea_002', 'Dr. Elena Vance', 'trainer@replayed.edu', '$2a$10$X8m1Z9W7bC1O1U2O3E4R5E6T7Y8U9I0O', 'teacher', NULL, 'Faculty (Algorithms)', 'Active'),
  ('usr_adm_003', 'Marcus Wright', 'admin@replayed.edu', '$2a$10$X8m1Z9W7bC1O1U2O3E4R5E6T7Y8U9I0O', 'admin', NULL, 'Super Administrator', 'Active'),
  ('usr_stu_089', 'Maya Patel', 'maya.patel@replayed.edu', '$2a$10$X8m1Z9W7bC1O1U2O3E4R5E6T7Y8U9I0O', 'student', 'STU-2026-089', 'Batch 2026-B', 'Active'),
  ('usr_stu_114', 'Jordan Lee', 'jordan.lee@replayed.edu', '$2a$10$X8m1Z9W7bC1O1U2O3E4R5E6T7Y8U9I0O', 'student', 'STU-2026-114', 'Batch 2026-A', 'Active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed Concepts
INSERT INTO concepts (id, name, category, default_difficulty)
VALUES
  ('c_arrays', 'Arrays & Two Pointers', 'Data Structures', 'Foundational'),
  ('c_lists', 'Doubly-Linked Lists & Sentinels', 'Data Structures', 'Foundational'),
  ('c_heaps', 'Binary Heap Priority Queues', 'Data Structures', 'Intermediate'),
  ('c_graphs', 'Graph Traversal (BFS & DFS)', 'Algorithms', 'Intermediate'),
  ('c_locks', 'Thread-Safe Lock Concurrency', 'Systems', 'Advanced'),
  ('c_dp', 'Dynamic Programming Memoization', 'Algorithms', 'Advanced')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed Student Concept Mastery for Alex Chen
INSERT INTO student_concept_mastery (student_id, concept_id, mastery_percentage, is_weak_topic)
VALUES
  ('usr_stu_001', 'c_arrays', 96.00, FALSE),
  ('usr_stu_001', 'c_lists', 93.00, FALSE),
  ('usr_stu_001', 'c_heaps', 91.00, FALSE),
  ('usr_stu_001', 'c_graphs', 79.00, FALSE),
  ('usr_stu_001', 'c_locks', 54.00, TRUE),
  ('usr_stu_001', 'c_dp', 48.00, TRUE)
ON DUPLICATE KEY UPDATE mastery_percentage=VALUES(mastery_percentage);

-- Seed Courses
INSERT INTO courses (id, title, description, modules_count, prerequisite, trainer_id, enrolled_count)
VALUES
  ('CRS-101', 'Full-Stack Distributed Systems', 'Building resilient multi-node architectures, consensus, and containerized backends.', 6, 'Data Structures & Algorithms', 'usr_tea_002', 78),
  ('CRS-102', 'High-Performance Algorithms & Memory', 'Low-level cache locality, algorithmic optimization, and O(1) eviction data structures.', 8, 'Systems Basics', 'usr_tea_002', 64)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Seed Assessments
INSERT INTO assessments (id, title, description, difficulty, supported_languages, time_limit_minutes)
VALUES
  ('ASM-001', 'Design an LRU Cache with O(1) Operations', 'Implement an LRU Cache with get and put in O(1) average time complexity using a hash table and doubly linked list.', 'Hard', 'python,javascript,cpp', 45),
  ('ASM-002', 'Red-Black Tree Self Balancing Insertion', 'Implement color flipping and tree rotations upon node insertion to maintain balanced height bounds.', 'Hard', 'python,cpp', 60)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Seed Audit Logs
INSERT INTO audit_logs (event, actor, level)
VALUES
  ('System Initialized: Database Schemas & Keystroke Telemetry Tables Online', 'System Init', 'System Startup'),
  ('Role Verification: Marcus Wright authenticated as Super Administrator', 'Auth Engine', 'Security Audit')
ON DUPLICATE KEY UPDATE event=VALUES(event);
