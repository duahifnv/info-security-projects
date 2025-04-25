const CHAT_SUB_ID = 'sub-0';
const RSA_SUB_ID = 'sub-1';

let stompSessionId = null

const stompClient = new StompJs.Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

    onConnect: () => {
        console.log('STOMP соединение установлено');

        const transportUrl = stompClient.webSocket._transport.url;
        stompSessionId = transportUrl.split('/').reverse()[1];

        subscribeStomp('/topic/chat', (stompMessage) => {
            const jsonMessage = JSON.parse(stompMessage.body);
            handleEncryptedMessageJson(jsonMessage);
        }, CHAT_SUB_ID);

        sendStompMessage(
            '/app/rsa',
            JSON.stringify({
                'issuerId': stompSessionId,
                'publicKey': clientRsa.publicKey.toString(),
                'module': clientRsa.module.toString()
            }),
        );

        subscribeStomp('/topic/rsa', (stompMessage) => {
            const jsonMessage = JSON.parse(stompMessage.body);
            handleRsaJson(jsonMessage);
        }, RSA_SUB_ID);
    },

    onStompError: (frame) => {
        console.error('Ошибка STOMP:', frame);
    },

    onDisconnect: () => {
        console.log('STOMP соединение закрыто');
    },
    reconnectDelay: 30000 // 30s
});

stompClient.activate();

const subscribeStomp = (destination, callback, sub_id) => {
    if (!stompClient || !stompClient.connected) {
        console.warn('Невозможно подписаться: STOMP соединение не установлено');
        return;
    }
    stompClient.subscribe(destination, callback, { id: sub_id } );
}

const sendStompMessage = (destination, payload) => {
    if (!stompClient || !stompClient.connected) {
        console.warn('Невозможно отправить сообщение: STOMP соединение не установлено');
        return;
    }
    stompClient.publish({
        destination: destination,
        body: payload
    });
}

const handleEncryptedMessageJson = (jsonMessage) => {
    const issuerId = jsonMessage['issuerId'];
    const cryptos = jsonMessage['cryptos'];

    const echoFlag = issuerId === stompSessionId;
    const rsa = echoFlag ? clientRsa : sessionsRsa[issuerId] ?? null;
    if (rsa === null) {
        console.error(`Не найден RSA ключ для sessionId: ${issuerId}`);
        return;
    }
    const decryptedMessage = decryptText(cryptos, rsa);

    const color = echoFlag ? 'darkblue' : 'black';
    const header = echoFlag ? 'Вы' : issuerId;

    chat(header, decryptedMessage, color);
}

const handleRsaJson = (jsonMessage) => {
    const issuerId = jsonMessage['issuerId'];
    const publicKey = jsonMessage['publicKey'];
    const module = jsonMessage['module'];
    if (issuerId !== stompSessionId) {
        sessionsRsa[issuerId] = {
            'publicKey': BigInt(publicKey),
            'module': BigInt(module)
        };
        console.log(sessionsRsa);
        serverLog(`Собеседник <b>${issuerId}</b> опубликовал свой публичный ключ: 
                    (Ключ: <code>${publicKey}</code>, Модуль: <code>${module}</code>)`);
    }
}