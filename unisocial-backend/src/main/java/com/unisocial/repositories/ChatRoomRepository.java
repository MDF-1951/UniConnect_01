package com.unisocial.repositories;

import com.unisocial.models.ChatRoom;
import com.unisocial.models.ChatType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByTypeAndClub_ClubId(ChatType type, Long clubId);
}



