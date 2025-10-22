package com.unisocial.repositories;

import com.unisocial.models.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {

    Optional<Club> findByName(String name);

    List<Club> findAllByVerifiedTrue();

    List<Club> findAllByVerifiedFalse();

    List<Club> findAllByCreatedByUserId(Long userId);
}


