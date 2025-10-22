package com.unisocial.services;

import com.unisocial.models.*;
import com.unisocial.repositories.*;
import com.unisocial.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ClubRepository clubRepository;

    public ChatService(ChatRoomRepository chatRoomRepository,
                       ChatParticipantRepository chatParticipantRepository,
                       MessageRepository messageRepository,
                       UserRepository userRepository,
                       ClubRepository clubRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatParticipantRepository = chatParticipantRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.clubRepository = clubRepository;
    }

    public ChatRoomResponse createPrivateChat(Long user1Id, Long user2Id) {
        // Check if a private chat already exists between these two users
        List<ChatParticipant> user1Chats = chatParticipantRepository.findByUser_UserId(user1Id);
        List<ChatParticipant> user2Chats = chatParticipantRepository.findByUser_UserId(user2Id);
        
        for (ChatParticipant p1 : user1Chats) {
            ChatRoom room = p1.getChatRoom();
            if (room.getType() == ChatType.PRIVATE) {
                // Check if user2 is also in this room
                for (ChatParticipant p2 : user2Chats) {
                    if (p2.getChatRoom().getChatRoomId().equals(room.getChatRoomId())) {
                        // Found existing private chat
                        return convertToChatRoomResponse(room);
                    }
                }
            }
        }
        
        // Create a new PRIVATE room and add both participants
        ChatRoom room = new ChatRoom();
        room.setType(ChatType.PRIVATE);
        ChatRoom saved = chatRoomRepository.save(room);

        ChatParticipant p1 = new ChatParticipant();
        p1.setChatRoom(saved);
        p1.setUser(userRepository.getReferenceById(user1Id));
        chatParticipantRepository.save(p1);

        ChatParticipant p2 = new ChatParticipant();
        p2.setChatRoom(saved);
        p2.setUser(userRepository.getReferenceById(user2Id));
        chatParticipantRepository.save(p2);

        return convertToChatRoomResponse(saved);
    }

    public ChatRoom createGroupChat(Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found: " + clubId));
        ChatRoom room = new ChatRoom();
        room.setType(ChatType.GROUP);
        room.setClub(club);
        return chatRoomRepository.save(room);
    }

    public MessageResponse sendMessage(Long chatRoomId, Long senderId, String content) {
        ChatRoom room = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found: " + chatRoomId));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found: " + senderId));

        Message message = new Message();
        message.setChatRoom(room);
        message.setSender(sender);
        message.setContent(content);
        Message saved = messageRepository.save(message);

        // Message saved to database - frontend will poll for updates
        return convertToMessageResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(Long chatRoomId) {
        List<Message> messages = messageRepository.findByChatRoom_ChatRoomIdOrderByTimestampAsc(chatRoomId);
        return messages.stream()
                .map(this::convertToMessageResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getUserChatRooms(Long userId) {
        List<ChatParticipant> participants = chatParticipantRepository.findByUser_UserId(userId);
        
        // Deduplicate by chatRoomId to avoid showing the same chat multiple times
        java.util.Map<Long, ChatRoom> uniqueRooms = new java.util.LinkedHashMap<>();
        for (ChatParticipant participant : participants) {
            ChatRoom room = participant.getChatRoom();
            uniqueRooms.putIfAbsent(room.getChatRoomId(), room);
        }
        
        return uniqueRooms.values().stream()
                .map(this::convertToChatRoomResponse)
                .collect(Collectors.toList());
    }
    
    private ChatRoomResponse convertToChatRoomResponse(ChatRoom chatRoom) {
        // Get participants
        List<ChatParticipant> participants = chatParticipantRepository.findByChatRoom_ChatRoomId(chatRoom.getChatRoomId());
        List<UserResponse> userResponses = participants.stream()
                .map(p -> convertToUserResponse(p.getUser()))
                .collect(Collectors.toList());
        
        // Get last message and convert to MessageResponse
        Message lastMessage = messageRepository.findLastMessageByChatRoomId(chatRoom.getChatRoomId());
        MessageResponse lastMessageResponse = null;
        if (lastMessage != null) {
            lastMessageResponse = convertToMessageResponse(lastMessage);
        }
        
        // Convert club if it's a group chat
        ClubResponse clubResponse = null;
        if (chatRoom.getType() == ChatType.GROUP && chatRoom.getClub() != null) {
            clubResponse = convertToClubResponse(chatRoom.getClub());
        }
        
        return new ChatRoomResponse(
                chatRoom.getChatRoomId(),
                chatRoom.getType(),
                clubResponse,
                chatRoom.getCreatedAt(),
                lastMessageResponse,
                userResponses
        );
    }
    
    private MessageResponse convertToMessageResponse(Message message) {
        return new MessageResponse(
                message.getMessageId(),
                message.getChatRoom().getChatRoomId(),
                message.getSender().getUserId(),
                message.getSender().getName(),
                message.getContent(),
                message.getTimestamp(),
                message.getRead()
        );
    }
    
    private UserResponse convertToUserResponse(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getRegNo(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.getBio(),
                user.getDpUrl(),
                user.getCreatedAt()
        );
    }
    
    private ClubResponse convertToClubResponse(Club club) {
        return new ClubResponse(
                club.getClubId(),
                club.getName(),
                club.getDescription(),
                club.getLogoUrl(),
                club.getVerified(),
                club.getCreatedAt(),
                club.getCreatedBy() != null ? club.getCreatedBy().getUserId() : null,
                club.getCreatedBy() != null ? club.getCreatedBy().getName() : null
        );
    }
    
    @Transactional(readOnly = true)
    public List<ChatParticipant> getChatRoomParticipants(Long chatRoomId) {
        return chatParticipantRepository.findByChatRoom_ChatRoomId(chatRoomId);
    }
    
    @Transactional(readOnly = true)
    public Message getLastMessage(Long chatRoomId) {
        return messageRepository.findLastMessageByChatRoomId(chatRoomId);
    }
}



