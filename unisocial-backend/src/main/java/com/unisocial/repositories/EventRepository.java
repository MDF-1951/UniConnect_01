package com.unisocial.repositories;

import com.unisocial.models.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOrderByStartTimeAsc();
    List<Event> findByClub_ClubId(Long clubId);
}



