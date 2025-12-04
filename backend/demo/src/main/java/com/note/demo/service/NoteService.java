package com.note.demo.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.note.demo.model.Notes;
import com.note.demo.repository.NoteRepository;

import jakarta.annotation.PostConstruct;

@Service
public class NoteService {
    @Autowired
    NoteRepository noteRepository;

    public List<Notes> getNotesByUserId(Long id){
       return noteRepository.findByUser_Id(id);
    }
    public Optional<Notes> getNotesById(long id){
       return noteRepository.findById(id);
    }
    // @PostConstruct
    // public void testMethod(){
    //  System.out.println("hello "+ getNotesById(1).get().getTitle());
    // }

    public Notes updateNoteById(long id, String title , String content, LocalDate created_at){
        Optional<Notes> noteOptional = noteRepository.findById(id);
        if(noteOptional.isPresent()){
        Notes note = noteOptional.get();
        if(!title.equals(note.getTitle())){
            note.setTitle(title);
        }
        if(!content.equals(note.getContent())){
            note.setContent(content);
        }
        if(!created_at.equals(note.getCreated_at())){
            note.setCreated_at(created_at);
        }

        return noteRepository.save(note);
    }
    return null;
    }

    public void deleteNoteById(long id){
        noteRepository.deleteById(id);
    }
}
