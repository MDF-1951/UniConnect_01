package com.unisocial.services;

import com.unisocial.dto.EventResponse;
import com.unisocial.dto.PostResponse;
import com.unisocial.dto.ClubResponse;
import com.unisocial.models.*;
import com.unisocial.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RecommendationService {

    private final UserInteractionRepository interactionRepository;
    private final PostRepository postRepository;
    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public RecommendationService(UserInteractionRepository interactionRepository,
                                 PostRepository postRepository,
                                 ClubRepository clubRepository,
                                 EventRepository eventRepository,
                                 UserRepository userRepository) {
        this.interactionRepository = interactionRepository;
        this.postRepository = postRepository;
        this.clubRepository = clubRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public List<PostResponse> getRecommendedPosts(Long userId) {
        Map<Long, Long> clubScore = scoreClubs(userId);
        if (clubScore.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> topClubIds = clubScore.entrySet().stream()
                .sorted((a,b) -> Long.compare(b.getValue(), a.getValue()))
                .map(Map.Entry::getKey)
                .limit(5)
                .collect(Collectors.toList());

        // Posts authored by top clubs' admins/users is not directly modeled, so fallback to recent posts
        // by mapping authorId if that corresponds to users from those clubs (not available). Return recent.
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(20)
                .map(p -> {
                    String authorName = "Unknown User";
                    String authorDpUrl = null;
                    if (p.getAuthor() != null) {
                        User author = userRepository.findById(p.getAuthor()).orElse(null);
                        if (author != null) {
                            authorName = author.getName();
                            authorDpUrl = author.getDpUrl();
                        }
                    }
                    return new PostResponse(
                        p.getPostId(),
                        p.getAuthor(),
                        authorName,
                        authorDpUrl,
                        p.getAuthorType(),
                        p.getContentText(),
                        p.getMediaUrl(),
                        p.getMediaType(),
                        p.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    public List<EventResponse> getRecommendedEvents(Long userId) {
        Map<Long, Long> clubScore = scoreClubs(userId);
        List<Event> events;
        if (clubScore.isEmpty()) {
            events = eventRepository.findAllByOrderByStartTimeAsc();
        } else {
            Set<Long> clubIds = clubScore.keySet();
            events = eventRepository.findAllByOrderByStartTimeAsc().stream()
                    .filter(e -> clubIds.contains(e.getClub().getClubId()))
                    .collect(Collectors.toList());
            if (events.isEmpty()) {
                events = eventRepository.findAllByOrderByStartTimeAsc();
            }
        }
        return events.stream()
                .limit(20)
                .map(e -> new EventResponse(
                        e.getEventId(), e.getClub().getClubId(), e.getClub().getName(), e.getTitle(), e.getDescription(),
                        e.getBannerUrl(), e.getLocation(), e.getStartTime(), e.getEndTime(), e.getRegistrationLink(),
                        e.getRegistrationDeadline(), e.getOdProvided(), e.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    public List<ClubResponse> getRecommendedClubs(Long userId) {
        Map<Long, Long> clubScore = scoreClubs(userId);
        List<Club> clubs;
        if (clubScore.isEmpty()) {
            clubs = clubRepository.findAllByVerifiedTrue();
        } else {
            clubs = clubRepository.findAllByVerifiedTrue().stream()
                    .sorted(Comparator.comparingLong(c -> -clubScore.getOrDefault(c.getClubId(), 0L)))
                    .collect(Collectors.toList());
        }
        return clubs.stream()
                .limit(20)
                .map(c -> new ClubResponse(
                        c.getClubId(), c.getName(), c.getDescription(), c.getLogoUrl(), c.getVerified(),
                        c.getCreatedAt(), c.getCreatedBy().getUserId(), c.getCreatedBy().getName()
                ))
                .collect(Collectors.toList());
    }

    private Map<Long, Long> scoreClubs(Long userId) {
        List<UserInteraction> interactions = interactionRepository.findByUser_UserId(userId);
        Map<Long, Long> score = new HashMap<>();
        for (UserInteraction ui : interactions) {
            long delta = switch (ui.getAction()) {
                case LIKE -> 1;
                case COMMENT -> 2;
                case JOIN -> 5;
                case REGISTER -> 3;
                case VIEW -> 1;
            };
            if (ui.getTargetType() == TargetType.CLUB) {
                score.merge(ui.getTargetId(), delta, Long::sum);
            }
            // For POST/EVENT you could map back to club if modeled; skipped due to missing linkage
        }
        return score;
    }
}



