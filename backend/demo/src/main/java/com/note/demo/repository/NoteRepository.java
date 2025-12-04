package com.note.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.note.demo.model.Notes;
import java.util.List;
import java.util.Optional;


public interface NoteRepository extends JpaRepository<Notes, Long>{

    Optional<Notes> findById(Long id);
    List<Notes> findByUser_Id(Long userId);
}