package com.careerpilot.backend;

import com.careerpilot.backend.entity.Role;
import com.careerpilot.backend.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  // Added for automatic token blacklist cleanup
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
        System.out.println("=========================================");
        System.out.println("CareerPilot AI Backend Started!");
        System.out.println("Test API: http://localhost:8080/api/test/hello");
        System.out.println("Google Login: http://localhost:8080/oauth2/authorization/google");
        System.out.println("=========================================");
    }

    @Bean
    public CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            if (roleRepository.count() == 0) {
                System.out.println("Initializing roles...");

                Role student = new Role();
                student.setName("ROLE_STUDENT");
                student.setDescription("Student role");
                student.setIsActive(true);
                roleRepository.save(student);

                Role mentor = new Role();
                mentor.setName("ROLE_MENTOR");
                mentor.setDescription("Mentor role");
                mentor.setIsActive(true);
                roleRepository.save(mentor);

                Role admin = new Role();
                admin.setName("ROLE_ADMIN");
                admin.setDescription("Admin role");
                admin.setIsActive(true);
                roleRepository.save(admin);

                System.out.println("Roles initialized successfully!");
            }
        };
    }
}
