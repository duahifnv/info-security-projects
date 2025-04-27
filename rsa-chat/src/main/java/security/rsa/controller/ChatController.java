package security.rsa.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import security.rsa.dto.RsaEncryptedMessage;
import security.rsa.dto.RsaPublic;
import security.rsa.service.ChatService;
import security.rsa.service.RsaService;

import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {
    private final ChatService chatService;
    private final RsaService rsaService;

    @MessageMapping("/chat")
    public void sendMessageToChat(@Payload RsaEncryptedMessage message) {
        String decryptedFromPublic = rsaService.decryptMessage(message);
        log.warn("Перехваченное сообщение: {}", decryptedFromPublic);

        log.info("Отправляем в чат сообщение '{}' от {} к {}",
                message.cryptos(), message.issuerId(), message.receiverId());
        chatService.sendStompToUser("/queue/chat", message.receiverId(), message);
    }
    @MessageMapping("/rsa")
    @SendTo("/topic/rsa")
    public RsaPublic publishRsa(@Payload RsaPublic rsaPublic) {
        log.info("Клиент {} опубликовал RSA ключ: ({}, {})",
                rsaPublic.issuerId(), rsaPublic.publicKey(), rsaPublic.module());
        rsaService.addUserRsa(rsaPublic);
        return new RsaPublic(rsaPublic.issuerId(), rsaPublic.publicKey(), rsaPublic.module());
    }
    @MessageMapping("/users.rsa")
    public void receiveUsersRsa(@Header("simpSessionId") String sessionId) {
        String json = chatService.getJson(Map.of("users", rsaService.getUsersRsa()));
        chatService.sendStompToUser("/queue/rsa", sessionId, json);
    }
}
