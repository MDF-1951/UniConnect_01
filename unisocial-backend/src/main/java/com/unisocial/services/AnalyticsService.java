package com.unisocial.services;

import com.unisocial.dto.*;
import com.unisocial.models.*;
import com.unisocial.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final ClubMembershipRepository clubMembershipRepository;

    public AnalyticsService(UserRepository userRepository,
                           PostRepository postRepository,
                           ClubRepository clubRepository,
                           EventRepository eventRepository,
                           LikeRepository likeRepository,
                           CommentRepository commentRepository,
                           ClubMembershipRepository clubMembershipRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.clubRepository = clubRepository;
        this.eventRepository = eventRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.clubMembershipRepository = clubMembershipRepository;
    }

    /**
     * Get admin analytics - global platform summary
     */
    public AdminAnalyticsDTO getAdminAnalytics() {
        long totalUsers = userRepository.count();
        long totalClubs = clubRepository.count();
        long verifiedClubs = clubRepository.findAllByVerifiedTrue().size();
        long totalPosts = postRepository.count();
        long totalEvents = eventRepository.count();
        long totalComments = commentRepository.count();
        long totalLikes = likeRepository.count();

        // Calculate active users (users who posted or commented in last 30 days)
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        List<Post> recentPosts = postRepository.findAll().stream()
                .filter(p -> p.getCreatedAt().isAfter(thirtyDaysAgo))
                .collect(Collectors.toList());
        List<Comment> recentComments = commentRepository.findAll().stream()
                .filter(c -> c.getCreatedAt().isAfter(thirtyDaysAgo))
                .collect(Collectors.toList());

        Set<Long> activeUserIds = new HashSet<>();
        recentPosts.forEach(p -> activeUserIds.add(p.getAuthor()));
        recentComments.forEach(c -> activeUserIds.add(c.getAuthor().getUserId()));

        long activeUsers = activeUserIds.size();

        return new AdminAnalyticsDTO(
                totalUsers,
                totalClubs,
                verifiedClubs,
                totalPosts,
                totalEvents,
                totalComments,
                totalLikes,
                activeUsers
        );
    }

    /**
     * Get user registration trends over time
     * Groups users by date and counts registrations per day
     */
    public List<UserTrendDTO> getUserRegistrationTrend(LocalDate startDate, LocalDate endDate) {
        List<User> allUsers = userRepository.findAll();

        // Filter users by date range if provided
        List<User> filteredUsers = allUsers.stream()
                .filter(user -> {
                    if (user.getCreatedAt() == null) return false;
                    LocalDate userDate = user.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate();
                    boolean afterStart = startDate == null || !userDate.isBefore(startDate);
                    boolean beforeEnd = endDate == null || !userDate.isAfter(endDate);
                    return afterStart && beforeEnd;
                })
                .collect(Collectors.toList());

        // Group by date and count
        Map<LocalDate, Long> trendsMap = filteredUsers.stream()
                .collect(Collectors.groupingBy(
                        user -> user.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate(),
                        Collectors.counting()
                ));

        // Convert to DTO list and sort by date
        return trendsMap.entrySet().stream()
                .map(entry -> new UserTrendDTO(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(UserTrendDTO::getDate))
                .collect(Collectors.toList());
    }

    /**
     * Get trending posts ranked by engagement (likes + comments)
     */
    public List<TrendingPostDTO> getTrendingPosts(int limit) {
        List<Post> allPosts = postRepository.findAllByOrderByCreatedAtDesc();

        // Calculate engagement for each post
        List<TrendingPostDTO> trendingPosts = allPosts.stream()
                .map(post -> {
                    long likeCount = likeRepository.countByPostPostId(post.getPostId());
                    long commentCount = commentRepository.countByPostPostId(post.getPostId());

                    // Get author name
                    String authorName = getAuthorName(post);

                    return new TrendingPostDTO(
                            post.getPostId(),
                            authorName,
                            post.getContentText(),
                            likeCount,
                            commentCount,
                            post.getCreatedAt()
                    );
                })
                .sorted((a, b) -> Long.compare(b.getTotalEngagement(), a.getTotalEngagement()))
                .limit(limit)
                .collect(Collectors.toList());

        return trendingPosts;
    }

    /**
     * Get club-specific analytics
     */
    public ClubAnalyticsDTO getClubAnalytics(Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        // Count members (approved only)
        int memberCount = (int) clubMembershipRepository.findAllByClub(club).stream()
                .filter(m -> m.getStatus() == MembershipStatus.APPROVED)
                .count();

        // Count posts by this club
        int postCount = (int) postRepository.findAll().stream()
                .filter(p -> p.getAuthorType() == AuthorType.CLUB && p.getAuthor().equals(clubId))
                .count();

        // Count events by this club
        int eventCount = eventRepository.findByClub_ClubId(clubId).size();

        // Calculate engagement score
        List<Post> clubPosts = postRepository.findAll().stream()
                .filter(p -> p.getAuthorType() == AuthorType.CLUB && p.getAuthor().equals(clubId))
                .collect(Collectors.toList());

        long totalLikes = 0;
        long totalComments = 0;

        for (Post post : clubPosts) {
            totalLikes += likeRepository.countByPostPostId(post.getPostId());
            totalComments += commentRepository.countByPostPostId(post.getPostId());
        }

        double engagementScore = 0.0;
        if (postCount > 0) {
            engagementScore = (double) (totalLikes + totalComments) / postCount;
        }

        return new ClubAnalyticsDTO(
                clubId,
                club.getName(),
                memberCount,
                postCount,
                eventCount,
                Math.round(engagementScore * 100.0) / 100.0  // Round to 2 decimal places
        );
    }

    /**
     * Helper method to get author name for a post
     */
    private String getAuthorName(Post post) {
        if (post.getAuthorType() == AuthorType.USER) {
            Optional<User> user = userRepository.findById(post.getAuthor());
            return user.map(User::getName).orElse("Unknown User");
        } else {
            Optional<Club> club = clubRepository.findById(post.getAuthor());
            return club.map(Club::getName).orElse("Unknown Club");
        }
    }
}



