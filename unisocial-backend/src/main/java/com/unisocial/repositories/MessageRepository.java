package com.unisocial.repositories;

import com.unisocial.models.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChatRoom_ChatRoomIdOrderByTimestampAsc(Long chatRoomId);
    
    @Query("SELECT m FROM Message m WHERE m.chatRoom.chatRoomId = :chatRoomId ORDER BY m.timestamp DESC LIMIT 1")
    Message findLastMessageByChatRoomId(@Param("chatRoomId") Long chatRoomId);
}



