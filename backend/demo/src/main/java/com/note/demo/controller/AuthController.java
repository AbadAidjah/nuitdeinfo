
package com.note.demo.controller;

import org.springframework.web.bind.annotation.*;
import com.note.demo.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    // Externalized configuration values
    @Value("${app.keycloak.auth-url}")
    private String keycloakAuthUrl;
    
    @Value("${app.keycloak.logout-url}")
    private String keycloakLogoutUrl;
    
    @Value("${app.keycloak.register-url}")
    private String keycloakRegisterUrl;
    
    @Value("${app.keycloak.base-url}")
    private String keycloakBaseUrl;
    
    @Value("${app.keycloak.realm}")
    private String keycloakRealm;
    
    @Value("${app.backend.url}")
    private String backendUrl;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;
    
    @Value("${app.client.id}")
    private String clientId;
    
    @GetMapping("/login-url")
    public ResponseEntity<?> getLoginUrl() {
        Map<String, String> response = new HashMap<>();
        response.put("loginUrl", keycloakAuthUrl +
                "?client_id=" + clientId +
                "&redirect_uri=" + backendUrl + "/login/oauth2/code/keycloak" +
                "&response_type=code" +
                "&scope=openid profile email");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/register-url")
    public ResponseEntity<?> getRegisterUrl() {
        Map<String, String> response = new HashMap<>();
        response.put("registerUrl", keycloakRegisterUrl +
                "?client_id=" + clientId +
                "&redirect_uri=" + backendUrl + "/login/oauth2/code/keycloak" +
                "&response_type=code" +
                "&scope=openid profile email");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/token")
    public ResponseEntity<?> getTokenEndpoint(@RequestBody LoginRequest request) {
        Map<String, String> keycloakInfo = new HashMap<>();
        keycloakInfo.put("tokenUrl", keycloakBaseUrl + "/realms/" + keycloakRealm + "/protocol/openid-connect/token");
        keycloakInfo.put("clientId", clientId);
        keycloakInfo.put("grantType", "password");
        
        return ResponseEntity.ok(keycloakInfo);
    }

    @GetMapping("/success")
    public void loginSuccess(
            @org.springframework.security.core.annotation.AuthenticationPrincipal 
            org.springframework.security.oauth2.core.user.OAuth2User principal,
            HttpServletResponse response) throws IOException {
        
        if (principal == null) {
            response.sendRedirect(frontendUrl + "?error=authentication_failed");
            return;
        }
        
        try {
            userService.syncUserFromOAuth2(principal);
        } catch (Exception e) {
            System.err.println("Failed to sync user: " + e.getMessage());
        }
        
        response.sendRedirect(frontendUrl);
    }
    
    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(
            @org.springframework.security.core.annotation.AuthenticationPrincipal 
            org.springframework.security.oauth2.core.user.OAuth2User principal) {
        
        if (principal == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("username", principal.getAttribute("preferred_username"));
        userInfo.put("email", principal.getAttribute("email"));
        userInfo.put("name", principal.getAttribute("name"));
        userInfo.put("id", principal.getAttribute("sub"));
        
        return ResponseEntity.ok(userInfo);
    }

    @GetMapping("/logout-url")
    public ResponseEntity<?> getLogoutUrl() {
        Map<String, String> response = new HashMap<>();
        response.put("logoutUrl", keycloakLogoutUrl +
                "?client_id=" + clientId +
                "&post_logout_redirect_uri=" + frontendUrl +
                "&redirect_uri=" + frontendUrl);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/public/logged-out")
    public void loggedOut(HttpServletResponse response) throws IOException {
        response.sendRedirect(frontendUrl);
    }
    
    public static class LoginRequest {
        private String username;
        private String password;
        
        public String getUsername() { 
            return username; 
        }
        
        public void setUsername(String username) { 
            this.username = username; 
        }
        
        public String getPassword() { 
            return password; 
        }
        
        public void setPassword(String password) { 
            this.password = password; 
        }
    }
}