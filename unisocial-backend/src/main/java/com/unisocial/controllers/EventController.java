package com.unisocial.controllers;

import com.unisocial.dto.CreateEventRequest;
import com.unisocial.dto.EventResponse;
import com.unisocial.models.User;
import com.unisocial.repositories.UserRepository;
import com.unisocial.services.EventService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class EventController {

    private final EventService eventService;
    private final UserRepository userRepository;

    public EventController(EventService eventService, UserRepository userRepository) {
        this.eventService = eventService;
        this.userRepository = userRepository;
    }

    @PostMapping("/api/clubs/{clubId}/events")
    public ResponseEntity<?> createEvent(@PathVariable Long clubId, @Valid @RequestBody CreateEventRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            EventResponse response = eventService.createEvent(user, clubId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/api/events/{eventId}")
    public ResponseEntity<?> updateEvent(@PathVariable Long eventId, @Valid @RequestBody CreateEventRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            EventResponse response = eventService.updateEvent(eventId, request, user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/events/{eventId}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long eventId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            eventService.deleteEvent(eventId, user);
            return ResponseEntity.ok(Map.of("message", "Event deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/events/{eventId}")
    public ResponseEntity<?> getEvent(@PathVariable Long eventId) {
        try {
            EventResponse response = eventService.getEvent(eventId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/events/upcoming")
    public ResponseEntity<List<EventResponse>> listUpcoming() {
        List<EventResponse> events = eventService.listUpcomingEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/api/clubs/{clubId}/events")
    public ResponseEntity<List<EventResponse>> listByClub(@PathVariable Long clubId) {
        List<EventResponse> events = eventService.getEventsByClub(clubId);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/api/events")
    public ResponseEntity<List<EventResponse>> listAllEvents(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        List<EventResponse> events;
        if (year != null && month != null) {
            events = eventService.getEventsByMonth(year, month);
        } else {
            events = eventService.getAllEvents();
        }
        return ResponseEntity.ok(events);
    }
}



