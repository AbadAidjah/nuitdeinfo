package com.note.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.note.demo.dto.AdminCreateUserRequest;
import com.note.demo.dto.AdminUpdateUserRequest;
import com.note.demo.dto.RegisterRequest;
import com.note.demo.dto.UpdateProfileRequest;
import com.note.demo.model.Role;
import com.note.demo.model.Users;
import com.note.demo.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public Users register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        
        Users user = new Users(
            request.getUsername(),
            request.getEmail(),
            passwordEncoder.encode(request.getPassword())
        );
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setCreatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }


/////////////
/// // ...existing code...

public Users updateProfileById(Long userId, UpdateProfileRequest request) {
    Users user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));
    
    // Check if username is being changed and if it's already taken
    if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        user.setUsername(request.getUsername());
    }
    
    // Check if email is being changed and if it's already taken
    if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        user.setEmail(request.getEmail());
    }
    
    if (request.getFirstName() != null) {
        user.setFirstName(request.getFirstName());
    }
    
    if (request.getLastName() != null) {
        user.setLastName(request.getLastName());
    }
    
    if (request.getProfileLink() != null) {
        user.setProfileLink(request.getProfileLink());
    }
    
    // Update password if provided
    if (request.getPassword() != null && !request.getPassword().isEmpty()) {
        user.setPassword(passwordEncoder.encode(request.getPassword()));
    }
    // Secure password change (using currentPassword + newPassword)
    else if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
        if (request.getCurrentPassword() == null || 
            !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    }
    
    return userRepository.save(user);
}

// ...existing code... 
/// 


    
    public Users findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
    
    public Users findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
    
    public Users findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    public Users updateProfile(String username, UpdateProfileRequest request) {
        Users user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if username is being changed and if it's already taken
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new RuntimeException("Username already exists");
            }
            user.setUsername(request.getUsername());
        }
        
        // Check if email is being changed and if it's already taken
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }
        
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        
        if (request.getProfileLink() != null) {
            user.setProfileLink(request.getProfileLink());
        }
        
        // Update password - two options:
        // 1. Direct password update (using 'password' field)
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        // 2. Secure password change (using currentPassword + newPassword)
        else if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            if (request.getCurrentPassword() == null || 
                !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }
        
        return userRepository.save(user);
    }
    
    public void deleteUser(String username) {
        Users user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }
    
    public void updateLastLogin(String username) {
        Users user = userRepository.findByUsername(username).orElse(null);
        if (user != null) {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        }
    }
    
    // ==================== ADMIN METHODS ====================
    
    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Users adminCreateUser(AdminCreateUserRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        
        Users user = new Users(
            request.getUsername(),
            request.getEmail(),
            passwordEncoder.encode(request.getPassword())
        );
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole() != null ? request.getRole() : Role.USER);
        user.setCreatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    public Users adminUpdateUser(Long userId, AdminUpdateUserRequest request) {
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if username is being changed and if it's already taken
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new RuntimeException("Username already exists");
            }
            user.setUsername(request.getUsername());
        }
        
        // Check if email is being changed and if it's already taken
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }
        
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        
        if (request.getProfileLink() != null) {
            user.setProfileLink(request.getProfileLink());
        }
        
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        
        // Update password if provided (admin can set without current password)
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        return userRepository.save(user);
    }
    
    public void adminDeleteUser(Long userId) {
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }
    
    public long countUsers() {
        return userRepository.count();
    }
    
    public long countUsersByRole(Role role) {
        return userRepository.countByRole(role);
    }
}
