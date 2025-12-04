package com.note.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import com.note.demo.model.Users;
import com.note.demo.repository.UserRepository;
import java.time.LocalDateTime;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public Users syncUserFromJwt(Jwt jwt) {
        String keycloakId = jwt.getClaimAsString("sub");
        String username = jwt.getClaimAsString("preferred_username");
        String email = jwt.getClaimAsString("email");
        String firstName = jwt.getClaimAsString("given_name");
        String lastName = jwt.getClaimAsString("family_name");
        
        Users user = userRepository.findByKeycloakId(keycloakId)
                .orElse(new Users(keycloakId, username, email));
        
        user.setUsername(username);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setLastLogin(LocalDateTime.now());
        
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(LocalDateTime.now());
        }
        
        return userRepository.save(user);
    }
    
    public Users syncUserFromOAuth2(org.springframework.security.oauth2.core.user.OAuth2User oauth2User) {
        String keycloakId = oauth2User.getAttribute("sub");
        String username = oauth2User.getAttribute("preferred_username");
        String email = oauth2User.getAttribute("email");
        String firstName = oauth2User.getAttribute("given_name");
        String lastName = oauth2User.getAttribute("family_name");
        
        Users user = userRepository.findByKeycloakId(keycloakId)
                .orElse(new Users(keycloakId, username, email));
        
        user.setUsername(username);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setLastLogin(LocalDateTime.now());
        
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(LocalDateTime.now());
        }
        
        return userRepository.save(user);
    }
    
    public Users findByKeycloakId(String keycloakId) {
        return userRepository.findByKeycloakId(keycloakId).orElse(null);
    }
}
