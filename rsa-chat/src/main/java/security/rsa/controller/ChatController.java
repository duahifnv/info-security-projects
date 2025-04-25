package security.rsa.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import security.rsa.dto.RsaEncryptedMessage;
import security.rsa.dto.RsaPublish;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {
    @MessageMapping("/chat")
    @SendTo("/topic/chat")
    public RsaEncryptedMessage sendMessageToChat(@Payload RsaEncryptedMessage message) {
        log.info("Отправляем в чат сообщение '{}' от пользователя {}", message.cryptos(), message.issuerId());
        return message;
    }
    @MessageMapping("/rsa")
    @SendTo("/topic/rsa")
    public RsaPublish publishRsa(@Payload RsaPublish rsaPublish) {
        return new RsaPublish(rsaPublish.issuerId(), rsaPublish.publicKey(), rsaPublish.module());
    }
}
