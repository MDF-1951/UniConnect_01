package com.unisocial.repositories;

import com.unisocial.models.Club;
import com.unisocial.models.ClubMembership;
import com.unisocial.models.ClubRole;
import com.unisocial.models.MembershipStatus;
import com.unisocial.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubMembershipRepository extends JpaRepository<ClubMembership, Long> {

    Optional<ClubMembership> findByClubAndUser(Club club, User user);

    List<ClubMembership> findAllByClubAndStatus(Club club, MembershipStatus status);

    long countByClubAndRole(Club club, ClubRole role);

    List<ClubMembership> findAllByUserAndStatus(User user, MembershipStatus status);

    List<ClubMembership> findAllByUser(User user);

    List<ClubMembership> findAllByClub(Club club);

    boolean existsByClubAndUserAndStatus(Club club, User user, MembershipStatus status);

    void deleteAllByClub(Club club);
}


