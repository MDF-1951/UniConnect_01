package com.unisocial.services;

import com.unisocial.dto.CreateEventRequest;
import com.unisocial.dto.EventResponse;
import com.unisocial.models.Club;
import com.unisocial.models.ClubMembership;
import com.unisocial.models.ClubRole;
import com.unisocial.models.Event;
import com.unisocial.models.MembershipStatus;
import com.unisocial.models.User;
import com.unisocial.repositories.ClubMembershipRepository;
import com.unisocial.repositories.ClubRepository;
import com.unisocial.repositories.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final ClubRepository clubRepository;
    private final ClubMembershipRepository clubMembershipRepository;

    public EventService(EventRepository eventRepository, ClubRepository clubRepository,
                        ClubMembershipRepository clubMembershipRepository) {
        this.eventRepository = eventRepository;
        this.clubRepository = clubRepository;
        this.clubMembershipRepository = clubMembershipRepository;
    }

    public EventResponse createEvent(User clubAdmin, Long clubId, CreateEventRequest request) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        // Ensure requester is an approved admin of the club
        ensureClubAdmin(clubAdmin, club);

        Event event = new Event();
        event.setClub(club);
        applyRequest(event, request);
        Event saved = eventRepository.save(event);
        return toResponse(saved);
    }

    public EventResponse updateEvent(Long eventId, CreateEventRequest request, User clubAdmin) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));

        ensureClubAdmin(clubAdmin, event.getClub());

        applyRequest(event, request);
        Event saved = eventRepository.save(event);
        return toResponse(saved);
    }

    public void deleteEvent(Long eventId, User clubAdmin) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));
        ensureClubAdmin(clubAdmin, event.getClub());
        eventRepository.delete(event);
    }

    @Transactional(readOnly = true)
    public EventResponse getEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));
        return toResponse(event);
    }

    @Transactional(readOnly = true)
    public List<EventResponse> listUpcomingEvents() {
        return eventRepository.findAllByOrderByStartTimeAsc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getEventsByClub(Long clubId) {
        return eventRepository.findByClub_ClubId(clubId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAllByOrderByStartTimeAsc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getEventsByMonth(int year, int month) {
        // Filter events that start in the given month
        return eventRepository.findAllByOrderByStartTimeAsc().stream()
                .filter(event -> {
                    java.time.LocalDateTime localDateTime = java.time.LocalDateTime.ofInstant(
                            event.getStartTime(), java.time.ZoneId.systemDefault());
                    return localDateTime.getYear() == year && localDateTime.getMonthValue() == month;
                })
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private void ensureClubAdmin(User user, Club club) {
        clubMembershipRepository.findByClubAndUser(club, user)
                .filter(m -> ClubRole.ADMIN.equals(m.getRole()) && MembershipStatus.APPROVED.equals(m.getStatus()))
                .orElseThrow(() -> new RuntimeException("Only club admins can manage events for this club"));
    }

    private void applyRequest(Event event, CreateEventRequest request) {
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setBannerUrl(request.getBannerUrl());
        event.setLocation(request.getLocation());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setRegistrationLink(request.getRegistrationLink());
        event.setRegistrationDeadline(request.getRegistrationDeadline());
        event.setOdProvided(request.getOdProvided());
    }

    private EventResponse toResponse(Event event) {
        return new EventResponse(
                event.getEventId(),
                event.getClub().getClubId(),
                event.getClub().getName(),
                event.getTitle(),
                event.getDescription(),
                event.getBannerUrl(),
                event.getLocation(),
                event.getStartTime(),
                event.getEndTime(),
                event.getRegistrationLink(),
                event.getRegistrationDeadline(),
                event.getOdProvided(),
                event.getCreatedAt()
        );
    }
}



