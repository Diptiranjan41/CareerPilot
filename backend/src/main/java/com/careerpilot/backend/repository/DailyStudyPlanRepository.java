package com.careerpilot.backend.repository;

import com.careerpilot.backend.entity.DailyStudyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DailyStudyPlanRepository extends JpaRepository<DailyStudyPlan, Long> {
    List<DailyStudyPlan> findByUserId(Long userId);

    @Query("SELECT d FROM DailyStudyPlan d WHERE d.user.id = :studentId")
    List<DailyStudyPlan> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT d FROM DailyStudyPlan d WHERE d.user.id = :studentId AND d.isCompleted = :isCompleted")
    List<DailyStudyPlan> findByStudentIdAndIsCompleted(@Param("studentId") Long studentId, @Param("isCompleted") Boolean isCompleted);
}