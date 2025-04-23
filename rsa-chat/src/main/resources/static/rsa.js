const generateRsa = () => {
    const min = 1e6; // 1000000
    const max = 1e9 - 1; // 999999999
    const p = generateLargePrime(min, max);
    const q = generateLargePrime(min, max);
    console.log(`Сгенерировали P: ${p}, Q: ${q}`)
    return _generateRsa(p, q);
}

const _generateRsa = (p, q) => {
    const module = p * q;
    const phi = (p - 1) * (q - 1);
    console.log(`Модуль N: ${module}, ф(N): ${phi}`)
    const publicKey = findCoprimeNumber(phi);
    console.log(`Публичный ключ: ${publicKey}`)
    const privateKey = findInverse(publicKey, phi); // (pub * priv) % phi = 1
    console.log(`Секретный ключ: ${privateKey}`)
    return {'publicKey': publicKey, 'privateKey': privateKey, 'module': module}
}

const findInverse = (number, module) => {
    let a = module;
    let b = number;
    let q, r;
    let x1 = 0;
    let x2 = 1;
    let y1 = 1;
    let y2 = 0;
    while (b > 0) {
        q = a / b;
        r = a - q * b;
        let x = x2 - q * x1;
        let y = y2 - q * y1;
        a = b;
        b = r;
        x2 = x1;
        x1 = x;
        y2 = y1;
        y1 = y;
        console.log(`x2: ${x2}, y2: ${y2}`)
    }
    const x = Math.min(x2, y2);
    return module - Math.abs(x);
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