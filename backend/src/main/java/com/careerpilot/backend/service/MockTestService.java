package com.careerpilot.backend.service;

import com.careerpilot.backend.dto.response.MockTestResponse;
import com.careerpilot.backend.entity.MockTest;
import com.careerpilot.backend.entity.Question;
import com.careerpilot.backend.entity.User;
import com.careerpilot.backend.repository.MockTestRepository;
import com.careerpilot.backend.repository.QuestionRepository;
import com.careerpilot.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MockTestService {

    @Autowired
    private MockTestRepository mockTestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Value("${anthropic.api.key:}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ──────────────────────────────────────────────────────────────────────
    // Generate Daily Mock Test
    // ──────────────────────────────────────────────────────────────────────
    public MockTest generateDailyMockTest(Long userId, String category, String difficulty) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<Map<String, Object>> questions = generateQuestions(category, difficulty, "", 5);

        MockTest mockTest = new MockTest();
        mockTest.setUser(user);
        mockTest.setTitle("Daily " + category + " Mock Test");
        mockTest.setCategory(category);
        mockTest.setDifficulty(difficulty);
        mockTest.setTotalQuestions(questions.size());
        mockTest.setScore(0);
        mockTest.setPercentage(0.0);
        mockTest.setDuration(300);
        mockTest.setCompletedAt(null);
        mockTest.setCreatedAt(LocalDateTime.now());

        try {
            mockTest.setQuestions(objectMapper.writeValueAsString(questions));
        } catch (Exception e) {
            mockTest.setQuestions("[]");
        }
        mockTest.setAnswers("{}");

        return mockTestRepository.save(mockTest);
    }

    // ──────────────────────────────────────────────────────────────────────
    // Generate Questions
    // ──────────────────────────────────────────────────────────────────────
    public List<Map<String, Object>> generateQuestions(String category, String difficulty, String topic, int count) {
        try {
            List<Map<String, Object>> dbQuestions = loadQuestionsFromDatabase(category, difficulty, topic, count);
            if (!dbQuestions.isEmpty()) {
                System.out.println("✅ Loaded " + dbQuestions.size() + " questions from database");
                return dbQuestions;
            }
            System.out.println("⚠️ No questions found in database, using fallback questions");
            return generateFallbackQuestions(category, difficulty, count);
        } catch (Exception e) {
            e.printStackTrace();
            return generateFallbackQuestions(category, difficulty, count);
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // Load Questions from Database
    // ──────────────────────────────────────────────────────────────────────
    private List<Map<String, Object>> loadQuestionsFromDatabase(String category, String difficulty, String topic, int count) {
        List<Question> dbQuestions = new ArrayList<>();

        if (topic != null && !topic.isEmpty() && !topic.equals("All topics")) {
            dbQuestions = questionRepository.findRandomByCategoryAndTopic(category, topic, count);
        } else if (difficulty != null && !difficulty.equals("Mixed")) {
            dbQuestions = questionRepository.findRandomByCategoryAndDifficulty(category, difficulty, count);
        } else {
            dbQuestions = questionRepository.findRandomByCategory(category, count);
        }

        if (dbQuestions.size() < count) {
            List<Map<String, Object>> fallbackQuestions = generateFallbackQuestions(category, difficulty, count - dbQuestions.size());
            List<Map<String, Object>> convertedDbQuestions = convertDbQuestionsToMap(dbQuestions);
            convertedDbQuestions.addAll(fallbackQuestions);
            return convertedDbQuestions;
        }

        return convertDbQuestionsToMap(dbQuestions);
    }

    private List<Map<String, Object>> convertDbQuestionsToMap(List<Question> dbQuestions) {
        List<Map<String, Object>> questions = new ArrayList<>();
        for (int i = 0; i < dbQuestions.size(); i++) {
            Question q = dbQuestions.get(i);
            Map<String, Object> questionMap = new HashMap<>();
            questionMap.put("id", i + 1);
            questionMap.put("question", q.getQuestion());
            questionMap.put("options", Arrays.asList(q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD()));
            questionMap.put("correct_answer", q.getCorrectAnswer());
            questionMap.put("explanation", q.getExplanation());
            questionMap.put("difficulty", q.getDifficulty());
            questionMap.put("topic", q.getTopic() != null ? q.getTopic() : "General");
            questions.add(questionMap);
        }
        return questions;
    }

    // ──────────────────────────────────────────────────────────────────────
    // Fallback Questions
    // ──────────────────────────────────────────────────────────────────────
    private List<Map<String, Object>> generateFallbackQuestions(String category, String difficulty, int count) {
        List<Map<String, Object>> questions = new ArrayList<>();

        long dbCount = questionRepository.countByCategory(category);
        if (dbCount > 0) {
            return loadQuestionsFromDatabase(category, difficulty, "", count);
        }

        String[][] categoryQuestions = getQuestionsByCategory(category);

        for (int i = 0; i < Math.min(count, categoryQuestions.length); i++) {
            String[] q = categoryQuestions[i];
            Map<String, Object> question = new HashMap<>();
            question.put("id", i + 1);
            question.put("question", q[0]);
            question.put("options", Arrays.asList(q[1], q[2], q[3], q[4]));
            question.put("correct_answer", q[5]);
            question.put("explanation", q[6]);
            question.put("difficulty", difficulty.equals("Mixed") ? getRandomDifficulty() : difficulty);
            question.put("topic", category);
            questions.add(question);
        }

        while (questions.size() < count) {
            Map<String, Object> question = new HashMap<>();
            question.put("id", questions.size() + 1);
            question.put("question", getRandomQuestion(category));
            question.put("options", Arrays.asList("Option A", "Option B", "Option C", "Option D"));
            question.put("correct_answer", "Option A");
            question.put("explanation", "This is a sample explanation for " + category + " question.");
            question.put("difficulty", difficulty.equals("Mixed") ? getRandomDifficulty() : difficulty);
            question.put("topic", category);
            questions.add(question);
        }

        return questions;
    }

    private String getRandomDifficulty() {
        String[] difficulties = {"Easy", "Medium", "Hard"};
        return difficulties[new Random().nextInt(difficulties.length)];
    }

    private String getRandomQuestion(String category) {
        String[][] questions = getQuestionsByCategory(category);
        String[] q = questions[new Random().nextInt(questions.length)];
        return q[0];
    }

    private String[][] getQuestionsByCategory(String category) {
        switch (category.toLowerCase()) {
            case "aptitude":
                return new String[][]{
                    {"If a product costs $120 and is sold at a 20% profit, what is the selling price?", "$140", "$144", "$150", "$160", "$144", "Profit = 20% of 120 = $24. Selling price = $120 + $24 = $144"},
                    {"What is 15% of 200?", "20", "25", "30", "35", "30", "15% of 200 = (15/100) × 200 = 30"},
                    {"If the ratio of boys to girls is 3:2 and there are 30 boys, total students?", "40", "45", "50", "55", "50", "If 3 parts = 30, then 1 part = 10. Total = 5 × 10 = 50"},
                    {"A train travels 60 km in 1 hour. How far will it travel in 2.5 hours?", "120 km", "150 km", "180 km", "200 km", "150 km", "Distance = Speed × Time = 60 × 2.5 = 150 km"},
                    {"What is the square root of 144?", "10", "11", "12", "13", "12", "12 × 12 = 144"},
                };
            case "java":
                return new String[][]{
                    {"Which is not a Java keyword?", "static", "Boolean", "extends", "implements", "Boolean", "Boolean is a wrapper class, not a keyword"},
                    {"Which collection maintains insertion order?", "HashSet", "TreeSet", "ArrayList", "HashMap", "ArrayList", "ArrayList maintains insertion order and allows duplicates"},
                    {"What is the default value of a local variable?", "0", "null", "undefined", "No default value", "No default value", "Local variables must be initialized before use"},
                    {"Which keyword is used to inherit a class?", "super", "this", "extends", "implements", "extends", "The extends keyword is used for class inheritance"},
                    {"What is JVM?", "Java Virtual Machine", "Java Variable Method", "Java Visual Machine", "None", "Java Virtual Machine", "JVM runs Java bytecode"},
                };
            case "dsa":
                return new String[][]{
                    {"Which data structure uses LIFO?", "Queue", "Stack", "Array", "LinkedList", "Stack", "Stack follows Last-In-First-Out principle"},
                    {"What is the time complexity of binary search?", "O(n)", "O(log n)", "O(n²)", "O(1)", "O(log n)", "Binary search divides the array in half each time"},
                    {"Which sorting algorithm is fastest on average?", "Bubble Sort", "Selection Sort", "Quick Sort", "Insertion Sort", "Quick Sort", "Quick Sort has average O(n log n) complexity"},
                };
            case "sql":
                return new String[][]{
                    {"Which SQL statement retrieves data?", "INSERT", "UPDATE", "SELECT", "DELETE", "SELECT", "SELECT is used to query data from database"},
                    {"Which clause filters records?", "WHERE", "HAVING", "GROUP BY", "ORDER BY", "WHERE", "WHERE clause filters rows before grouping"},
                    {"What does JOIN do?", "Combines tables", "Deletes data", "Creates tables", "Updates data", "Combines tables", "JOIN combines rows from multiple tables"},
                };
            default:
                return new String[][]{
                    {"What is the capital of France?", "London", "Berlin", "Paris", "Madrid", "Paris", "Paris is the capital of France"},
                    {"Which planet is known as the Red Planet?", "Mars", "Venus", "Jupiter", "Saturn", "Mars", "Mars appears red due to iron oxide"},
                    {"Who wrote 'Romeo and Juliet'?", "Charles Dickens", "Jane Austen", "William Shakespeare", "Mark Twain", "William Shakespeare", "Shakespeare wrote many famous plays"},
                };
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // Save Test Result
    // ──────────────────────────────────────────────────────────────────────
    public MockTestResponse saveTestResult(Long userId, Map<String, Object> result) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            MockTest mockTest = new MockTest();
            mockTest.setUser(user);
            mockTest.setTitle((String) result.getOrDefault("title", "Mock Test"));
            mockTest.setCategory((String) result.getOrDefault("category", "General"));
            mockTest.setDifficulty((String) result.getOrDefault("difficulty", "Mixed"));
            mockTest.setTopic((String) result.getOrDefault("topic", "All Topics"));
            mockTest.setTotalQuestions(toInt(result.getOrDefault("totalQuestions", 0)));
            mockTest.setScore(toInt(result.getOrDefault("score", 0)));
            mockTest.setCorrectAnswers(toInt(result.getOrDefault("correctAnswers", 0)));

            double percentage = mockTest.getTotalQuestions() > 0
                ? (mockTest.getScore() * 100.0) / mockTest.getTotalQuestions()
                : 0.0;
            mockTest.setPercentage(Math.round(percentage * 100.0) / 100.0);

            mockTest.setDuration(toInt(result.getOrDefault("duration", 0)));
            mockTest.setCompletedAt(LocalDateTime.now());
            mockTest.setCreatedAt(LocalDateTime.now());

            try {
                mockTest.setAnswers(objectMapper.writeValueAsString(result.get("answers")));
            } catch (Exception e) {
                mockTest.setAnswers("{}");
            }

            try {
                mockTest.setQuestions(objectMapper.writeValueAsString(result.get("questions")));
            } catch (Exception e) {
                mockTest.setQuestions("[]");
            }

            MockTest saved = mockTestRepository.save(mockTest);
            return convertToResponse(saved);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to save test result: " + e.getMessage());
        }
    }

    // Safe int casting (handles Integer and other Number types from JSON deserialization)
    private int toInt(Object val) {
        if (val == null) return 0;
        if (val instanceof Integer) return (Integer) val;
        if (val instanceof Number) return ((Number) val).intValue();
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return 0; }
    }

    // ──────────────────────────────────────────────────────────────────────
    // Get Test History
    // ──────────────────────────────────────────────────────────────────────
    public List<MockTestResponse> getTestHistory(Long userId) {
        return mockTestRepository.findByUserIdOrderByCompletedAtDesc(userId)
            .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────────────────────────
    // Get Single Test Result
    // ──────────────────────────────────────────────────────────────────────
    public MockTestResponse getTestResult(Long userId, Long testId) {
        MockTest test = mockTestRepository.findById(testId)
            .orElseThrow(() -> new RuntimeException("Test not found"));
        if (!test.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access");
        }
        return convertToResponse(test);
    }

    // ──────────────────────────────────────────────────────────────────────
    // Get Latest Test Result
    // ──────────────────────────────────────────────────────────────────────
    public MockTestResponse getLatestTestResult(Long userId) {
        MockTest test = mockTestRepository.findTopByUserIdOrderByCompletedAtDesc(userId);
        return test == null ? null : convertToResponse(test);
    }

    // ──────────────────────────────────────────────────────────────────────
    // Get Leaderboard
    // ──────────────────────────────────────────────────────────────────────
    public List<Map<String, Object>> getLeaderboard(String category, String difficulty, Integer limit) {
        List<MockTest> results;

        if (category != null && !category.isEmpty() && difficulty != null && !difficulty.isEmpty() && !difficulty.equals("Mixed")) {
            results = mockTestRepository.findByCategoryAndDifficultyOrderByPercentageDesc(category, difficulty);
        } else if (category != null && !category.isEmpty()) {
            results = mockTestRepository.findByCategoryOrderByPercentageDesc(category);
        } else {
            results = mockTestRepository.findAllByOrderByPercentageDesc();
        }

        List<Map<String, Object>> rankedResults = new ArrayList<>();
        int max = Math.min(results.size(), limit != null ? limit : 50);
        for (int i = 0; i < max; i++) {
            MockTest test = results.get(i);
            Map<String, Object> item = new HashMap<>();
            item.put("_id", test.getId());
            item.put("userId", test.getUser().getId());
            item.put("username", test.getUser().getFullName());  // ✅ FIX: getName() → getFullName()
            item.put("percentage", test.getPercentage());
            item.put("category", test.getCategory());
            item.put("difficulty", test.getDifficulty());
            item.put("correctAnswers", test.getCorrectAnswers() != null ? test.getCorrectAnswers() : test.getScore());
            item.put("totalQuestions", test.getTotalQuestions());
            item.put("createdAt", test.getCompletedAt());
            item.put("rank", i + 1);
            rankedResults.add(item);
        }

        return rankedResults;
    }

    // ──────────────────────────────────────────────────────────────────────
    // Get User Rank
    // ──────────────────────────────────────────────────────────────────────
    public Map<String, Object> getUserRank(Long userId, String category) {
        List<MockTest> allResults = (category != null && !category.isEmpty())
            ? mockTestRepository.findByCategoryOrderByPercentageDesc(category)
            : mockTestRepository.findAllByOrderByPercentageDesc();

        int rank = 1;
        MockTest userTest = null;
        for (MockTest test : allResults) {
            if (test.getUser().getId().equals(userId)) {
                userTest = test;
                break;
            }
            rank++;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("rank", rank);
        response.put("totalUsers", allResults.size());
        if (userTest != null) {
            response.put("percentage", userTest.getPercentage());
            response.put("score", userTest.getScore());
            response.put("totalQuestions", userTest.getTotalQuestions());
        }
        return response;
    }

    // ──────────────────────────────────────────────────────────────────────
    // Get All Results (admin)
    // ──────────────────────────────────────────────────────────────────────
    public List<MockTestResponse> getAllResults() {
        return mockTestRepository.findAllByOrderByCompletedAtDesc()
            .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────────────────────────
    // Get Global Stats
    // ──────────────────────────────────────────────────────────────────────
    public Map<String, Object> getGlobalStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTests", mockTestRepository.count());
        stats.put("totalUsers", userRepository.count());
        return stats;
    }

    // ──────────────────────────────────────────────────────────────────────
    // Convert to Response DTO
    // ──────────────────────────────────────────────────────────────────────
    private MockTestResponse convertToResponse(MockTest test) {
        MockTestResponse response = new MockTestResponse();
        response.setId(test.getId());
        response.setTitle(test.getTitle());
        response.setCategory(test.getCategory());
        response.setDifficulty(test.getDifficulty());
        response.setTopic(test.getTopic());          // ✅ works now that MockTestResponse has topic field
        response.setTotalQuestions(test.getTotalQuestions());
        response.setScore(test.getScore());
        response.setPercentage(test.getPercentage());
        response.setDuration(test.getDuration());
        response.setCompletedAt(test.getCompletedAt());

        try {
            if (test.getAnswers() != null && !test.getAnswers().isEmpty()) {
                response.setAnswers(objectMapper.readValue(test.getAnswers(), Map.class));
            }
            if (test.getQuestions() != null && !test.getQuestions().isEmpty()) {
                response.setQuestions(objectMapper.readValue(test.getQuestions(), List.class));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return response;
    }
}
