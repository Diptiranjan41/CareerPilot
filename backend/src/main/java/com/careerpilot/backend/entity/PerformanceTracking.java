package com.careerpilot.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "performance_tracking")
public class PerformanceTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column
    private String category;

    @Column(name = "avg_score")
    private Double avgScore;

    @Column(name = "total_tests")
    private Integer totalTests;

    @Column(name = "tracked_at")
    private LocalDateTime trackedAt;

    @PrePersist
    protected void onCreate() {
        trackedAt = LocalDateTime.now();
    }

    public PerformanceTracking() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getAvgScore() { return avgScore; }
    public void setAvgScore(Double avgScore) { this.avgScore = avgScore; }
    public Integer getTotalTests() { return totalTests; }
    public void setTotalTests(Integer totalTests) { this.totalTests = totalTests; }
    public LocalDateTime getTrackedAt() { return trackedAt; }
    public void setTrackedAt(LocalDateTime trackedAt) { this.trackedAt = trackedAt; }
}