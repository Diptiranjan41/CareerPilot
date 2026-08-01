package com.careerpilot.backend.service;

import com.careerpilot.backend.entity.User;
import com.careerpilot.backend.repository.UserRepository;
import com.careerpilot.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("=== LOAD USER DEBUG ===");
        System.out.println("Looking for email: " + email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        System.out.println("Found user: " + user.getEmail());
        System.out.println("Password hash: " + user.getPassword());

        return UserDetailsImpl.build(user);
    }
}
