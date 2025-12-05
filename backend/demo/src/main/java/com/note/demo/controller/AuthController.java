package com.note.demo.controller;

import org.springframework.web.bind.annotation.*;
import com.note.demo.dto.*;
import com.note.demo.model.Users;
import com.note.demo.security.JwtUtils;
import com.note.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            Users user = userService.register(request);
            String token = jwtUtils.generateTokenFromUsername(user.getUsername());
            
            AuthResponse response = new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getProfileLink(),
                user.getRole()
            );
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = jwtUtils.generateJwtToken(authentication);
            


            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            Users user = userService.findByUsername(userDetails.getUsername());
            userService.updateLastLogin(user.getUsername());
            
            AuthResponse response = new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getProfileLink(),
                user.getRole()
            );

            System.out.println("got into login ");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid username or password");
            return ResponseEntity.status(401).body(error);
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Not authenticated");
            return ResponseEntity.status(401).body(error);
        }
        
        Users user = userService.findByUsername(userDetails.getUsername());
        
        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not found");
            return ResponseEntity.status(404).body(error);
        }
        
        return ResponseEntity.ok(new UserResponse(user));
    }
    
    // ...existing code...

@PutMapping("/profile/{userId}")
public ResponseEntity<?> updateProfile(
        @PathVariable Long userId,
        @RequestBody UpdateProfileRequest request,
        @AuthenticationPrincipal UserDetails userDetails) {
    try {
        if (userDetails == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Not authenticated");
            return ResponseEntity.status(401).body(error);
        }
        
        // Get current authenticated user
        Users currentUser = userService.findByUsername(userDetails.getUsername());
        
        // Check if user is updating their own profile or is an admin
        // if (!currentUser.getId().equals(userId) && 
        //     !currentUser.getRole().name().equals("ADMIN")) {
        //     Map<String, String> error = new HashMap<>();
        //     error.put("error", "You can only update your own profile");
        //     return ResponseEntity.status(403).body(error);
        // }
        
        Users updatedUser = userService.updateProfileById(userId, request);
        
        // Generate new token only if user updated their own profile
        String token = null;
        if (currentUser.getId().equals(userId)) {
            token = jwtUtils.generateTokenFromUsername(updatedUser.getUsername());
        }
        
        AuthResponse response = new AuthResponse(
            token != null ? token : "",
            updatedUser.getId(),
            updatedUser.getUsername(),
            updatedUser.getEmail(),
            updatedUser.getFirstName(),
            updatedUser.getLastName(),
            updatedUser.getProfileLink(),
            updatedUser.getRole()
        );
        
        return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}

// ...existing code...
    
    @DeleteMapping("/profile")
    public ResponseEntity<?> deleteProfile(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Not authenticated");
                return ResponseEntity.status(401).body(error);
            }
            
            userService.deleteUser(userDetails.getUsername());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Account deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}