package com.unisocial.services;

import com.unisocial.dto.ClubResponse;
import com.unisocial.dto.CreateClubRequest;
import com.unisocial.models.Club;
import com.unisocial.models.ClubMembership;
import com.unisocial.models.ClubRole;
import com.unisocial.models.MembershipStatus;
import com.unisocial.models.Role;
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
public class ClubService {

    private final ClubRepository clubRepository;
    private final ClubMembershipRepository clubMembershipRepository;
    private final UserRepository userRepository;

    public ClubService(ClubRepository clubRepository, ClubMembershipRepository clubMembershipRepository, 
                     UserRepository userRepository) {
        this.clubRepository = clubRepository;
        this.clubMembershipRepository = clubMembershipRepository;
        this.userRepository = userRepository;
    }

    public ClubResponse createClub(User user, CreateClubRequest request) {
        // Check if club name already exists
        if (clubRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Club with name '" + request.getName() + "' already exists");
        }

        // Create club
        Club club = new Club();
        club.setName(request.getName());
        club.setDescription(request.getDescription());
        club.setLogoUrl(request.getLogoUrl());
        club.setCreatedBy(user);
        club.setVerified(false); // Default to false, needs Main Admin approval

        Club savedClub = clubRepository.save(club);

        // Create membership for the creator as ADMIN
        ClubMembership membership = new ClubMembership();
        membership.setClub(savedClub);
        membership.setUser(user);
        membership.setRole(ClubRole.ADMIN);
        membership.setStatus(MembershipStatus.APPROVED); // Creator is auto-approved

        clubMembershipRepository.save(membership);

        return convertToResponse(savedClub);
    }

    public ClubResponse verifyClub(Long clubId, User mainAdmin) {
        // Check if user is Main Admin
        if (!Role.ADMIN.equals(mainAdmin.getRole())) {
            throw new RuntimeException("Only Main Admin can verify clubs");
        }

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        club.setVerified(true);
        Club savedClub = clubRepository.save(club);

        return convertToResponse(savedClub);
    }

    public ClubResponse requestJoinClub(User user, Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        // Check if user already has a membership request
        if (clubMembershipRepository.existsByClubAndUserAndStatus(club, user, MembershipStatus.PENDING)) {
            throw new RuntimeException("You already have a pending membership request for this club");
        }

        // Check if user is already a member
        if (clubMembershipRepository.findByClubAndUser(club, user).isPresent()) {
            throw new RuntimeException("You are already a member of this club");
        }

        // Create membership request
        ClubMembership membership = new ClubMembership();
        membership.setClub(club);
        membership.setUser(user);
        membership.setRole(ClubRole.MEMBER);
        membership.setStatus(MembershipStatus.PENDING);

        clubMembershipRepository.save(membership);

        return convertToResponse(club);
    }

    @Transactional(readOnly = true)
    public ClubResponse getClub(Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        return convertToResponse(club);
    }

    @Transactional(readOnly = true)
    public List<ClubResponse> listClubs() {
        List<Club> clubs = clubRepository.findAllByVerifiedTrue();
        return clubs.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClubResponse> listClubs(Boolean verified) {
        List<Club> clubs;
        if (verified == null) {
            clubs = clubRepository.findAll();
        } else if (Boolean.TRUE.equals(verified)) {
            clubs = clubRepository.findAllByVerifiedTrue();
        } else {
            clubs = clubRepository.findAllByVerifiedFalse();
        }
        return clubs.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private ClubResponse convertToResponse(Club club) {
        // Count approved members
        int memberCount = (int) clubMembershipRepository.findAllByClub(club).stream()
                .filter(m -> MembershipStatus.APPROVED.equals(m.getStatus()))
                .count();
        
        return new ClubResponse(
                club.getClubId(),
                club.getName(),
                club.getDescription(),
                club.getLogoUrl(),
                club.getVerified(),
                club.getCreatedAt(),
                club.getCreatedBy().getUserId(),
                club.getCreatedBy().getName(),
                memberCount
        );
    }

    public void deleteClub(Long clubId, User actingUser) {
        if (!Role.ADMIN.equals(actingUser.getRole())) {
            throw new RuntimeException("Only Main Admin can delete clubs");
        }

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        // Delete memberships first to satisfy FK constraints
        clubMembershipRepository.deleteAllByClub(club);

        // Delete the club
        clubRepository.delete(club);
    }

    public ClubResponse updateClub(Long clubId, User user, CreateClubRequest request) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        // Check if user is admin of this club
        ClubMembership membership = clubMembershipRepository.findByClubAndUser(club, user)
                .orElseThrow(() -> new RuntimeException("You are not a member of this club"));

        if (!ClubRole.ADMIN.equals(membership.getRole())) {
            throw new RuntimeException("Only club admins can update club details");
        }

        // Update club details
        club.setName(request.getName());
        club.setDescription(request.getDescription());
        club.setLogoUrl(request.getLogoUrl());

        Club savedClub = clubRepository.save(club);
        return convertToResponse(savedClub);
    }

    public List<Object> getClubPosts(Long clubId) {
        // This should ideally be handled by PostService, but for now return empty list
        // The actual implementation would fetch posts where authorType = CLUB and author = clubId
        return new java.util.ArrayList<>();
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getMembershipStatus(User user, Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        
        java.util.Optional<ClubMembership> membershipOpt = clubMembershipRepository.findByClubAndUser(club, user);
        
        if (membershipOpt.isPresent()) {
            ClubMembership membership = membershipOpt.get();
            response.put("isMember", true);
            response.put("status", membership.getStatus().toString());
            response.put("role", membership.getRole().toString());
            response.put("membershipId", membership.getMembershipId());
        } else {
            response.put("isMember", false);
            response.put("status", "NONE");
            response.put("role", "NONE");
        }
        
        return response;
    }
}


