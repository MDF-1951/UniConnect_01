package com.unisocial.controllers;

import com.unisocial.models.Message;
import com.unisocial.models.User;
import com.unisocial.dto.ChatRoomResponse;
import com.unisocial.dto.MessageResponse;
import com.unisocial.repositories.UserRepository;
import com.unisocial.services.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    public ChatController(ChatService chatService, UserRepository userRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
    }

    @PostMapping("/private/{receiverId}")
    public ResponseEntity<?> startPrivate(@PathVariable Long receiverId) {
        try {
            Long userId = getCurrentUserId();
            return ResponseEntity.ok(chatService.createPrivateChat(userId, receiverId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/group/{clubId}")
    public ResponseEntity<?> startGroup(@PathVariable Long clubId) {
        try {
            return ResponseEntity.ok(chatService.createGroupChat(clubId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{chatRoomId}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable Long chatRoomId) {
        return ResponseEntity.ok(chatService.getMessages(chatRoomId));
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomResponse>> getUserChatRooms() {
        try {
            Long userId = getCurrentUserId();
            return ResponseEntity.ok(chatService.getUserChatRooms(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/{chatRoomId}/message")
    public ResponseEntity<?> sendMessage(@PathVariable Long chatRoomId, @RequestBody Map<String, String> body) {
        try {
            Long userId = getCurrentUserId();
            String content = body.get("content");
            return ResponseEntity.ok(chatService.sendMessage(chatRoomId, userId, content));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return user.getUserId();
    }
}



