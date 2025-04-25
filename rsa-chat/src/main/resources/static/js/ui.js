let activeContactSessionId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Обработчик кликов по вкладкам контактов
    document.getElementById('contacts-nav').addEventListener('click', function(e) {
        const tab = e.target.closest('.contact-tab');
        if (tab) {
            switchContactTab(tab);
        }
    });
});

const setUserId = (userId) => {
    const userInfoContainer = document.getElementById('user-info');
    userInfoContainer.innerHTML += `<p><b>User ID:</b> ${userId}</p>`
}

// Функция переключения вкладки контакта
const switchContactTab = (tab) => {
    // Убираем активный класс у всех вкладок
    document.querySelectorAll('.contact-tab').forEach(t => {
        t.classList.remove('active');
    });
    // Добавляем активный класс текущей вкладке
    tab.classList.add('active');
    // Скрываем все контейнеры сообщений
    document.querySelectorAll('.messages-container').forEach(container => {
        container.classList.remove('active');
    });
    // Показываем выбранный контейнер
    const contactId = tab.getAttribute('data-contact');
    document.querySelector(`.messages-container[data-contact="${contactId}"]`).classList.add('active');
    activeContactSessionId = contactId;
}

// Функция для добавления нового контакта
const addContact = (userId) => {
    const contactsNav = document.getElementById('contacts-nav');

    // Создаем вкладку контакта
    const contactTab = document.createElement('div');
    contactTab.className = 'contact-tab';
    contactTab.setAttribute('data-contact', userId);
    contactTab.textContent = userId;
    contactsNav.appendChild(contactTab);

    // Создаем контейнер для сообщений этого контакта
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'messages-container';
    messagesContainer.setAttribute('data-contact', userId);
    document.querySelector('.message-block').appendChild(messagesContainer);

    const messageInput = document.getElementById('messageInput');
    messageInput.disabled = false;

    console.log(`Контакт ${userId} добавлен`);
}

// Функция для удаления контакта
const removeContact = (userId) => {
    // Удаляем вкладку контакта
    const tab = document.querySelector(`.contact-tab[data-contact="${userId}"]`);
    if (tab) {
        tab.remove();
    }
    // Удаляем контейнер сообщений
    const container = document.querySelector(`.messages-container[data-contact="${userId}"]`);
    if (container) {
        container.remove();
    }
    // Если удаляли активный контакт, переключаемся на "Все сообщения"
    if (document.querySelector('.contact-tab.active')?.getAttribute('data-contact') === userId) {
        const allTab = document.querySelector('.contact-tab[data-contact="all"]');
        if (allTab) {
            switchContactTab(allTab);
        }
    }
    if (Object.keys(usersRsa).length === 0) {
        const messageInput = document.getElementById('messageInput');
        messageInput.disabled = true;
    }
    console.log(`Контакт ${userId} удален`);
}

const printChatMessage = (userId, text, self=false) => {
    const messageContainer = document.querySelector(`.messages-container[data-contact="${userId}"]`);
    messageContainer.innerHTML += `<p class=${self ? "my-message" : "message"}>${text}</p>`;
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

const printRsaLog = (text) => {
    printLog('RSA', text, 'white')
}

const printServerLog = (text) => {
    printLog('SERVER', text, 'violet')
}

const printLog = (status, text, textColor) => {
    const logsDiv = document.getElementById('logs');
    logsDiv.innerHTML += `<p style="color: ${textColor}"><strong>${status.toUpperCase()}</strong>: ${text}</p>`;
    logsDiv.scrollTop = logsDiv.scrollHeight;
}

const sendChatInput = () => {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;

    if (!message.trim()) {
        return;
    }
    const receiverId = activeContactSessionId;
    if (!receiverId) {
        console.error('Невозможно отправить сообщение: нет активных собеседников');
        return;
    }
    const cryptos = encryptText(message, usersRsa[receiverId]);

    const jsonData = JSON.stringify({
        'issuerId': clientSessionId,
        'receiverId': receiverId,
        'cryptos': Array.from(cryptos)
    });

    sendStompMessage('/app/chat', jsonData);
    printChatMessage(receiverId, message, true);
    messageInput.value = '';
}