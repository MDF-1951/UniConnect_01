package com.unisocial.repositories;

import com.unisocial.models.ChatParticipant;
import com.unisocial.models.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {
    List<ChatParticipant> findByUser_UserId(Long userId);
    List<ChatParticipant> findByChatRoom_ChatRoomId(Long chatRoomId);
}



