package security.rsa.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import security.rsa.dto.RsaPublic;
import security.rsa.service.ChatService;
import security.rsa.service.RsaService;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class StompHandler {
    private final SimpMessagingTemplate messagingTemplate;
    private final RsaService rsaService;
    private final ChatService chatService;

    @EventListener
    public void handleConnect(SessionConnectedEvent event) {
        var headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        log.info("Клиент подсоединен по веб-сокету. Session ID: {}", headerAccessor.getSessionId());
    }
    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        var accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        rsaService.removeUserRsa(sessionId);

        String json = chatService.getJson(Map.of("userId", sessionId));
        messagingTemplate.convertAndSend("/topic/users.logout", json);

        log.info("Клиент отсоединен от веб-сокета. Session ID: {}", sessionId);
    }
    @EventListener
    public void handleSessionSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        log.info("Клиент '{}' подписался на '{}'", accessor.getSessionId(), accessor.getDestination());
    }
}
