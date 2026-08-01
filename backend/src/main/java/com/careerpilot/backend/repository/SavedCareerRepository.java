package com.careerpilot.backend.repository;

import com.careerpilot.backend.entity.SavedCareer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SavedCareerRepository extends JpaRepository<SavedCareer, Long> {
    List<SavedCareer> findByUserId(Long userId);
    void deleteByUserIdAndCareerId(Long userId, Long careerId);
    boolean existsByUserIdAndCareerId(Long userId, Long careerId);
}
