const primeBounds = {'min': 1e3, 'max': 1e6 - 1}

const addUserRsa = (userId, rsa) => {
    usersRsa[userId] = {
        'publicKey': BigInt(rsa.publicKey),
        'module': BigInt(rsa.module)
    };
    addContact(userId);
    printServerLog(`<b>${userId}</b> опубликовал свой публичный ключ: 
                    (Ключ: <code>${rsa.publicKey}</code>, Модуль: <code>${rsa.module}</code>)`);
}

const deleteUserRsa = (userId) => {
    if (!usersRsa[userId]) {
        console.error(`Не найден пользователь ${userId}`);
        return;
    }
    delete usersRsa[userId]
    removeContact(userId);
}

const generateRandomRsa = () => {
    const min = primeBounds.min;
    const max = primeBounds.max;

    const p = generateLargePrime(min, max);
    const q = generateLargePrime(min, max);
    printRsaLog(`Сгенерировали P: <code>${p}</code>, Q: <code>${q}</code>`)
    return _generateRsa(p, q);
}

const _generateRsa = (p, q) => {
    const module = p * q;
    const phi = (p - 1) * (q - 1);
    printRsaLog(`Модуль N: <code>${module}</code>, ф(N): <code>${phi}</code>`)
    const publicKey = findCoprimeNumber(phi);
    printRsaLog(`Публичный ключ: <code>${publicKey}</code>`)
    const privateKey = modInverseBigInt(publicKey, phi); // (pub * priv) % phi = 1
    printRsaLog(`Секретный ключ: <code>${privateKey}</code>`)
    return {'publicKey': BigInt(publicKey), 'privateKey': BigInt(privateKey), 'module': BigInt(module)}
}

const modInverseBigInt = (a, m) => {
    a = BigInt(a);
    m = BigInt(m);
    let [gcd, x, y] = extendedGCDBigInt(a, m);
    if (gcd !== 1n) {
        throw new Error("Обратного элемента не существует");
    }
    return ((x % m) + m) % m;
}

const extendedGCDBigInt = (a, b) => {
    if (b === 0n) {
        return [a, 1n, 0n];
    }
    let [gcd, x1, y1] = extendedGCDBigInt(b, a % b);
    return [gcd, y1, x1 - (a / b) * y1];
}

const findCoprimeNumber = (n) => {
    if (n < 2) return 2;
    const isCoprime = (a, b) => {
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a === 1;
    }
    let candidate = 2;
    while (true) {
        if (isCoprime(n, candidate)) {
            return candidate;
        }
        candidate++;
    }
}

const generateLargePrime = (min, max) => {
    let candidate = Math.floor(Math.random() * (max - min + 1)) + min;
    // Убедимся, что число нечетное (четные числа, кроме 2, не простые)
    if (candidate % 2 === 0) candidate++;
    // Ищем ближайшее простое число, начиная с кандидата
    while (!isPrime(candidate)) {
        candidate += 2;
        // Если вышли за границы, начинаем снова
        if (candidate > max) candidate = min + 1;
    }
    return candidate;
}

// Тест Миллера-Рабина для проверки простоты
const isPrime = (n, k = 5) => {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0) return false;

    // Записываем n-1 в виде (2^s)*d
    let d = n - 1;
    let s = 0;
    while (d % 2 === 0) {
        d /= 2;
        s++;
    }

    // Проводим k раундов теста
    for (let i = 0; i < k; i++) {
        const a = 2 + Math.floor(Math.random() * (n - 3));
        let x = modPow(a, d, n);

        if (x === 1 || x === n - 1) continue;

        let isComposite = true;
        for (let j = 0; j < s - 1; j++) {
            x = modPow(x, 2, n);
            if (x === n - 1) {
                isComposite = false;
                break;
            }
        }

        if (isComposite) return false;
    }

    return true;
}

// Быстрое возведение в степень по модулю (a^b mod n)
const modPow = (a, b, n) => {
    let result = 1n;
    a = BigInt(a);
    b = BigInt(b);
    n = BigInt(n);

    a = a % n;
    while (b > 0n) {
        if (b % 2n === 1n) {
            result = (result * a) % n;
        }
        b = b / 2n;
        a = (a * a) % n;
    }
    return Number(result);
}