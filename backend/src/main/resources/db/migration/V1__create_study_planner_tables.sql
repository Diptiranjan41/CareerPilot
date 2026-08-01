-- ============================================
-- AI STUDY PLANNER & MOCK TEST TABLES
-- ============================================

-- 1. Students Table (extend existing users)
CREATE TABLE IF NOT EXISTS students (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    name VARCHAR(100),
    skills TEXT,
    weak_areas TEXT,
    target_company VARCHAR(100),
    exam_type VARCHAR(100),
    daily_study_time DECIMAL(3,1),
    preferred_language VARCHAR(50),
    experience_level VARCHAR(20),
    xp_points INT DEFAULT 0,
    streak_days INT DEFAULT 0,
    rank_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 2. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20),
    exam_pattern JSON,
    difficulty_level VARCHAR(10),
    preparation_weeks INT DEFAULT 8
);

-- 3. Topics Table
CREATE TABLE IF NOT EXISTS topics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    topic_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    difficulty VARCHAR(10),
    estimated_hours INT,
    priority INT DEFAULT 1
);

-- 4. Questions Bank
CREATE TABLE IF NOT EXISTS questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_text TEXT NOT NULL,
    option_a VARCHAR(500),
    option_b VARCHAR(500),
    option_c VARCHAR(500),
    option_d VARCHAR(500),
    correct_answer CHAR(1),
    explanation TEXT,
    topic_id BIGINT,
    company_id BIGINT,
    difficulty VARCHAR(10),
    question_type VARCHAR(20),
    coding_input_format TEXT,
    coding_output_format TEXT,
    coding_constraints TEXT,
    coding_test_cases JSON,
    coding_solution TEXT,
    time_complexity VARCHAR(50),
    space_complexity VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- 5. Mock Tests
CREATE TABLE IF NOT EXISTS mock_tests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    test_name VARCHAR(200),
    test_type VARCHAR(30),
    company_id BIGINT,
    total_questions INT,
    time_minutes INT,
    difficulty VARCHAR(10),
    questions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- 6. Daily Study Plans
CREATE TABLE IF NOT EXISTS daily_study_plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT,
    plan_date DATE,
    day_number INT,
    week_number INT,
    topic_id BIGINT,
    duration_hours DECIMAL(3,1),
    tasks TEXT,
    resources TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

-- 7. Test Attempts
CREATE TABLE IF NOT EXISTS test_attempts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT,
    mock_test_id BIGINT,
    attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score DECIMAL(5,2),
    percentage DECIMAL(5,2),
    time_taken INT,
    answers JSON,
    weak_topics JSON,
    strong_topics JSON,
    accuracy DECIMAL(5,2),
    rank_prediction VARCHAR(50),
    placement_readiness DECIMAL(5,2),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (mock_test_id) REFERENCES mock_tests(id)
);

-- 8. Performance Tracking
CREATE TABLE IF NOT EXISTS performance_tracking (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT,
    topic_id BIGINT,
    questions_solved INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    accuracy DECIMAL(5,2),
    time_spent DECIMAL(5,2),
    mastery_level VARCHAR(20) DEFAULT 'Not Started',
    last_practiced DATE,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

-- 9. AI Recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT,
    recommendation_type VARCHAR(10),
    title VARCHAR(200),
    description TEXT,
    priority INT,
    resource_url VARCHAR(500),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_applied BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- 10. Leaderboard
CREATE TABLE IF NOT EXISTS leaderboard (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT,
    total_score INT,
    rank_position INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);