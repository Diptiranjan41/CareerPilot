package com.careerpilot.backend.repository;

import com.careerpilot.backend.entity.CareerRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CareerRoleRepository extends JpaRepository<CareerRole, Long> {

    @Query("SELECT c FROM CareerRole c WHERE LOWER(c.requiredSkills) LIKE LOWER(CONCAT('%', :skill, '%'))")
    List<CareerRole> findBySkillContaining(@Param("skill") String skill);

    List<CareerRole> findByDemandScoreGreaterThanEqual(Integer score);
}