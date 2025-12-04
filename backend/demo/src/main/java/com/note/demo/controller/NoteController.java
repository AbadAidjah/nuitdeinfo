package com.note.demo.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.note.demo.model.Notes;
import com.note.demo.model.Users;
import com.note.demo.repository.NoteRepository;
import com.note.demo.service.NoteService;
import com.note.demo.service.UserService;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/notes/")
public class NoteController {
    
    @Autowired
    NoteRepository noteRepository;

    @Autowired
    NoteService noteService;
    
    @Autowired
    UserService userService;

    @GetMapping("/my-notes")
    public ResponseEntity<?> getMyNotes(@AuthenticationPrincipal Object principal) {
        Users user = null;
        if (principal instanceof Jwt jwt) {
            user = userService.syncUserFromJwt(jwt);
        } else if (principal instanceof org.springframework.security.oauth2.core.user.OAuth2User oauth2User) {
            user = userService.syncUserFromOAuth2(oauth2User);
        } else {
            return ResponseEntity.status(401).body("Not authenticated: principal is null or unknown type: " + (principal == null ? "null" : principal.getClass().getName()));
        }
        List<Notes> notes = user.getNotes();
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getNoteByUserId(@PathVariable Long userId) {
        List<Notes> notes = noteService.getNotesByUserId(userId);
        if(!notes.isEmpty()){
            return ResponseEntity.ok(notes);
        }
        else{
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/create/")
    public ResponseEntity<?> createNote(
            @RequestBody CreateNoteRequest request, 
            @AuthenticationPrincipal Jwt jwt,
            @AuthenticationPrincipal OAuth2User oauth2User) {
        try{
            Users user;
            if (jwt != null) {
                user = userService.syncUserFromJwt(jwt);
            } else if (oauth2User != null) {
                user = userService.syncUserFromOAuth2(oauth2User);
            } else {
                return ResponseEntity.status(401).body("Not authenticated");
            }
            
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Title is required");
            }
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Content is required");
            }
            
            Notes note = new Notes();
            note.setTitle(request.getTitle().trim());
            note.setContent(request.getContent().trim());
            note.setCreated_at(LocalDate.now());
            note.setUser(user);
            
            Notes newNote = noteRepository.save(note);
            return ResponseEntity.ok(newNote);
        }
        catch(Exception e){
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/note/{noteId}")
    public ResponseEntity<?> getNoteById(@PathVariable Long noteId, @AuthenticationPrincipal Object principal) {
        try {
            Users user = getAuthenticatedUser(principal);
            if (user == null) {
                return ResponseEntity.status(401).body("Not authenticated");
            }

            Optional<Notes> noteOpt = noteRepository.findById(noteId);
            if (noteOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Notes note = noteOpt.get();
            if (!note.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("Access denied: This note doesn't belong to you");
            }

            return ResponseEntity.ok(note);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PutMapping("/update/{noteId}")
    public ResponseEntity<?> updateNote(
            @PathVariable Long noteId,
            @RequestBody UpdateNoteRequest request,
            @AuthenticationPrincipal Object principal) {
        try {
            Users user = getAuthenticatedUser(principal);
            if (user == null) {
                return ResponseEntity.status(401).body("Not authenticated");
            }

            Optional<Notes> noteOpt = noteRepository.findById(noteId);
            if (noteOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Notes note = noteOpt.get();
            if (!note.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("Access denied: You can only edit your own notes");
            }

            if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
                note.setTitle(request.getTitle().trim());
            }
            if (request.getContent() != null && !request.getContent().trim().isEmpty()) {
                note.setContent(request.getContent().trim());
            }

            Notes updatedNote = noteRepository.save(note);
            return ResponseEntity.ok(updatedNote);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating note: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/delete/{noteId}")
    public ResponseEntity<?> deleteNote(@PathVariable Long noteId, @AuthenticationPrincipal Object principal) {
        try {
            Users user = getAuthenticatedUser(principal);
            if (user == null) {
                return ResponseEntity.status(401).body("Not authenticated");
            }

            Optional<Notes> noteOpt = noteRepository.findById(noteId);
            if (noteOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Notes note = noteOpt.get();
            if (!note.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("Access denied: You can only delete your own notes");
            }

            noteRepository.delete(note);
            return ResponseEntity.ok().body("Note deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting note: " + e.getMessage());
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchNotes(
            @org.springframework.web.bind.annotation.RequestParam String query,
            @AuthenticationPrincipal Object principal) {
        try {
            Users user = getAuthenticatedUser(principal);
            if (user == null) {
                return ResponseEntity.status(401).body("Not authenticated");
            }

            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Search query is required");
            }

            List<Notes> allNotes = user.getNotes();
            List<Notes> filteredNotes = allNotes.stream()
                .filter(note -> note.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                               note.getContent().toLowerCase().contains(query.toLowerCase()))
                .toList();
                
            return ResponseEntity.ok(filteredNotes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error searching notes: " + e.getMessage());
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<?> getNotesCount(@AuthenticationPrincipal Object principal) {
        try {
            Users user = getAuthenticatedUser(principal);
            if (user == null) {
                return ResponseEntity.status(401).body("Not authenticated");
            }

            long count = user.getNotes().size();
            return ResponseEntity.ok().body("{\"count\": " + count + "}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting notes count: " + e.getMessage());
        }
    }
    
    private Users getAuthenticatedUser(Object principal) {
        if (principal instanceof Jwt jwt) {
            return userService.syncUserFromJwt(jwt);
        } else if (principal instanceof OAuth2User oauth2User) {
            return userService.syncUserFromOAuth2(oauth2User);
        }
        return null;
    }
    
    public static class UpdateNoteRequest {
        private String title;
        private String content;
        
        public String getTitle() {
            return title;
        }
        
        public void setTitle(String title) {
            this.title = title;
        }
        
        public String getContent() {
            return content;
        }
        
        public void setContent(String content) {
            this.content = content;
        }
    }
    
    public static class CreateNoteRequest {
        private String title;
        private String content;
        
        public String getTitle() { 
            return title; 
        }
        
        public void setTitle(String title) { 
            this.title = title; 
        }
        
        public String getContent() { 
            return content; 
        }
        
        public void setContent(String content) { 
            this.content = content; 
        }
    }
}
