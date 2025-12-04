package com.note.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String keycloakId;
    
    @Column(unique = true)
    private String username;
    
    private String email;
    private String firstName;
    private String lastName;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Notes> notes;

    public Users(){}

    public Users(String keycloakId, String username, String email){
        this.keycloakId = keycloakId;
        this.username = username;
        this.email = email;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { 
        return id; 
    }
    
    public void setId(Long id) { 
        this.id = id; 
    }
    
    public String getKeycloakId() { 
        return keycloakId; 
    }
    
    public void setKeycloakId(String keycloakId) { 
        this.keycloakId = keycloakId; 
    }
    
    public String getUsername() { 
        return username; 
    }
    
    public void setUsername(String username) { 
        this.username = username; 
    }
    
    public String getEmail() { 
        return email; 
    }
    
    public void setEmail(String email) { 
        this.email = email; 
    }
    
    public String getFirstName() { 
        return firstName; 
    }
    
    public void setFirstName(String firstName) { 
        this.firstName = firstName; 
    }
    
    public String getLastName() { 
        return lastName; 
    }
    
    public void setLastName(String lastName) { 
        this.lastName = lastName; 
    }
    
    public LocalDateTime getCreatedAt() { 
        return createdAt; 
    }
    
    public void setCreatedAt(LocalDateTime createdAt) { 
        this.createdAt = createdAt; 
    }
    
    public LocalDateTime getLastLogin() { 
        return lastLogin; 
    }
    
    public void setLastLogin(LocalDateTime lastLogin) { 
        this.lastLogin = lastLogin; 
    }
    
    public List<Notes> getNotes() { 
        return notes; 
    }
    
    public void setNotes(List<Notes> notes) { 
        this.notes = notes; 
    }
}
