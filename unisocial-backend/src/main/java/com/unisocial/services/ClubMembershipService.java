package com.unisocial.services;

import com.unisocial.dto.ClubMembershipResponse;
import com.unisocial.models.Club;
import com.unisocial.models.ClubMembership;
import com.unisocial.models.ClubRole;
import com.unisocial.models.MembershipStatus;
import com.unisocial.models.User;
import com.unisocial.repositories.ClubMembershipRepository;
import com.unisocial.repositories.ClubRepository;
import com.unisocial.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClubMembershipService {

    private final ClubMembershipRepository clubMembershipRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;

    public ClubMembershipService(ClubMembershipRepository clubMembershipRepository, 
                               ClubRepository clubRepository,
                               UserRepository userRepository) {
        this.clubMembershipRepository = clubMembershipRepository;
        this.clubRepository = clubRepository;
        this.userRepository = userRepository;
    }

    public ClubMembershipResponse approveMembership(Long membershipId, User clubAdmin) {
        ClubMembership membership = clubMembershipRepository.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Membership not found with id: " + membershipId));

        // Check if the requesting user is an admin of the club
        if (!isClubAdmin(clubAdmin, membership.getClub())) {
            throw new RuntimeException("Only club admins can approve memberships");
        }

        membership.setStatus(MembershipStatus.APPROVED);
        ClubMembership savedMembership = clubMembershipRepository.save(membership);

        return convertToResponse(savedMembership);
    }

    public ClubMembershipResponse rejectMembership(Long membershipId, User clubAdmin) {
        ClubMembership membership = clubMembershipRepository.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Membership not found with id: " + membershipId));

        // Check if the requesting user is an admin of the club
        if (!isClubAdmin(clubAdmin, membership.getClub())) {
            throw new RuntimeException("Only club admins can reject memberships");
        }

        membership.setStatus(MembershipStatus.REJECTED);
        ClubMembership savedMembership = clubMembershipRepository.save(membership);

        return convertToResponse(savedMembership);
    }

    public ClubMembershipResponse promoteToAdmin(Long membershipId, User clubAdmin) {
        ClubMembership membership = clubMembershipRepository.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Membership not found with id: " + membershipId));

        // Check if the requesting user is an admin of the club
        if (!isClubAdmin(clubAdmin, membership.getClub())) {
            throw new RuntimeException("Only club admins can promote members");
        }

        // Check if the membership is approved
        if (!MembershipStatus.APPROVED.equals(membership.getStatus())) {
            throw new RuntimeException("Can only promote approved members");
        }

        membership.setRole(ClubRole.ADMIN);
        ClubMembership savedMembership = clubMembershipRepository.save(membership);

        return convertToResponse(savedMembership);
    }

    public ClubMembershipResponse demoteAdmin(Long membershipId, User clubAdmin) {
        ClubMembership membership = clubMembershipRepository.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Membership not found with id: " + membershipId));

        // Check if the requesting user is an admin of the club
        if (!isClubAdmin(clubAdmin, membership.getClub())) {
            throw new RuntimeException("Only club admins can demote other admins");
        }

        // Check if trying to demote themselves
        if (membership.getUser().getUserId().equals(clubAdmin.getUserId())) {
            throw new RuntimeException("Cannot demote yourself");
        }

        // Check if this is the last admin
        long adminCount = clubMembershipRepository.countByClubAndRole(membership.getClub(), ClubRole.ADMIN);
        if (adminCount <= 1) {
            throw new RuntimeException("Cannot demote the last admin of the club");
        }

        membership.setRole(ClubRole.MEMBER);
        ClubMembership savedMembership = clubMembershipRepository.save(membership);

        return convertToResponse(savedMembership);
    }

    @Transactional(readOnly = true)
    public List<ClubMembershipResponse> getPendingMemberships(Long clubId, User clubAdmin) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        // Check if the requesting user is an admin of the club
        if (!isClubAdmin(clubAdmin, club)) {
            throw new RuntimeException("Only club admins can view pending memberships");
        }

        List<ClubMembership> memberships = clubMembershipRepository.findAllByClubAndStatus(club, MembershipStatus.PENDING);
        return memberships.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClubMembershipResponse> getClubMembers(Long clubId, User clubAdmin) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        // Check if the requesting user is an admin of the club
        if (!isClubAdmin(clubAdmin, club)) {
            throw new RuntimeException("Only club admins can view club members");
        }

        List<ClubMembership> memberships = clubMembershipRepository.findAllByClub(club);
        return memberships.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private boolean isClubAdmin(User user, Club club) {
        return clubMembershipRepository.findByClubAndUser(club, user)
                .map(membership -> ClubRole.ADMIN.equals(membership.getRole()) && 
                                  MembershipStatus.APPROVED.equals(membership.getStatus()))
                .orElse(false);
    }

    private ClubMembershipResponse convertToResponse(ClubMembership membership) {
        return new ClubMembershipResponse(
                membership.getMembershipId(),
                membership.getClub().getClubId(),
                membership.getClub().getName(),
                membership.getClub().getVerified(),
                membership.getUser().getUserId(),
                membership.getUser().getName(),
                membership.getRole(),
                membership.getStatus(),
                membership.getJoinedAt()
        );
    }

    public ClubMembershipResponse removeMember(Long clubId, Long targetUserId, User actingAdmin) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        if (!isClubAdmin(actingAdmin, club)) {
            throw new RuntimeException("Only club admins can remove members");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + targetUserId));

        ClubMembership membership = clubMembershipRepository.findByClubAndUser(club, targetUser)
                .orElseThrow(() -> new RuntimeException("Membership not found for user in this club"));

        // Prevent removing the last admin
        if (ClubRole.ADMIN.equals(membership.getRole())) {
            long adminCount = clubMembershipRepository.countByClubAndRole(club, ClubRole.ADMIN);
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot remove the last admin of the club");
            }
        }

        ClubMembershipResponse response = convertToResponse(membership);
        clubMembershipRepository.delete(membership);
        return response;
    }

    @Transactional(readOnly = true)
    public List<ClubMembershipResponse> getUserClubs(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Get all approved memberships for the user
        List<ClubMembership> memberships = clubMembershipRepository.findAllByUserAndStatus(user, MembershipStatus.APPROVED);
        return memberships.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClubMembershipResponse> getAllUserMemberships(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Get ALL memberships for the user (including PENDING and REJECTED)
        List<ClubMembership> memberships = clubMembershipRepository.findAllByUser(user);
        return memberships.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
}
