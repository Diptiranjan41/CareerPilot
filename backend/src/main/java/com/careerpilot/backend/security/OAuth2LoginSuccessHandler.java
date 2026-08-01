package com.careerpilot.backend.security;

import com.careerpilot.backend.entity.Role;
import com.careerpilot.backend.entity.User;
import com.careerpilot.backend.repository.RoleRepository;
import com.careerpilot.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        DefaultOAuth2User oauthUser = (DefaultOAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        System.out.println("=== Google Login Success ===");
        System.out.println("Email: " + email);
        System.out.println("Name: " + name);

        // Check if user exists
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isEmpty()) {
            // Create new user
            user = new User();
            user.setEmail(email);
            user.setFullName(name);
            user.setPassword(""); // No password for OAuth users
            user.setIsEmailVerified(true);

            // Assign STUDENT role by default
            Set<Role> roles = new HashSet<>();
            Role studentRole = roleRepository.findByName("ROLE_STUDENT")
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            roles.add(studentRole);
            user.setRoles(roles);

            user = userRepository.save(user);
            System.out.println("New user created via Google OAuth");
        } else {
            user = existingUser.get();
            System.out.println("Existing user logged in via Google OAuth");
        }

        // Generate JWT token
        String role = user.getRoles().iterator().next().getName();
        String jwtToken = jwtUtils.generateToken(user.getEmail(), user.getId(), role);

        // ✅ FIX: Clear existing session to avoid state mismatch on refresh
        request.getSession().invalidate();
        
        // ✅ FIX: Redirect to frontend with token in URL (not JSON response)
        // This avoids extension interference and refresh issues
        String redirectUrl = "http://localhost:5173/oauth2/redirect?token=" + jwtToken +
                "&id=" + user.getId() +
                "&email=" + URLEncoder.encode(email, StandardCharsets.UTF_8) +
                "&fullName=" + URLEncoder.encode(name, StandardCharsets.UTF_8) +
                "&role=" + role;
        
        System.out.println("Redirecting to: " + redirectUrl);
        response.sendRedirect(redirectUrl);
    }
}