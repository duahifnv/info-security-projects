import React, { useState, useEffect, useRef } from 'react';

// Компонент графического ключа
const PatternLock = ({ onPatternComplete, disabled }) => {
    const [selectedPoints, setSelectedPoints] = useState([]);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const containerRef = useRef(null);
    const [lines, setLines] = useState([]);

    const points = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    // Позиции точек для отрисовки линий
    const pointPositions = {
        0: { x: 0, y: 0 },
        1: { x: 1, y: 0 },
        2: { x: 2, y: 0 },
        3: { x: 0, y: 1 },
        4: { x: 1, y: 1 },
        5: { x: 2, y: 1 },
        6: { x: 0, y: 2 },
        7: { x: 1, y: 2 },
        8: { x: 2, y: 2 }
    };

    const calculateLines = (points) => {
        const newLines = [];
        for (let i = 0; i < points.length - 1; i++) {
            const from = points[i];
            const to = points[i + 1];
            newLines.push({ from, to });
        }
        return newLines;
    };

    const handleMouseDown = (point) => {
        if (disabled) return;
        setIsMouseDown(true);
        const newSelectedPoints = [point];
        setSelectedPoints(newSelectedPoints);
        setLines(calculateLines(newSelectedPoints));
    };

    const handleMouseEnter = (point) => {
        if (!isMouseDown || disabled) return;
        if (!selectedPoints.includes(point)) {
            const newSelectedPoints = [...selectedPoints, point];
            setSelectedPoints(newSelectedPoints);
            setLines(calculateLines(newSelectedPoints));
        }
    };

    const handleMouseUp = () => {
        if (disabled) return;
        setIsMouseDown(false);
        if (selectedPoints.length >= 4) {
            onPatternComplete(selectedPoints);
        }
        setTimeout(() => {
            setSelectedPoints([]);
            setLines([]);
        }, 300);
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isMouseDown) {
                handleMouseUp();
            }
        };

        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [handleMouseUp, isMouseDown, selectedPoints]);

    // Функция для получения координат точки
    const getPointCoordinates = (point) => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const container = containerRef.current;
        const cellSize = container.offsetWidth / 3;
        const pos = pointPositions[point];
        return {
            x: pos.x * cellSize + cellSize / 4,
            y: pos.y * cellSize + cellSize / 4
        };
    };

    return (
        <div
            className="pattern-lock"
            ref={containerRef}
            onMouseLeave={handleMouseUp}
        >
            {/* Отрисовка линий */}
            <svg className="lines-svg" width="100%" height="100%">
                {lines.map((line, index) => {
                    const from = getPointCoordinates(line.from);
                    const to = getPointCoordinates(line.to);
                    return (
                        <line
                            key={index}
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                            stroke="#6ee7b7"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                    );
                })}
            </svg>

            {/* Отрисовка точек */}
            {points.map((point) => (
                <div
                    key={point}
                    className={`point ${selectedPoints.includes(point) ? 'selected' : ''}`}
                    onMouseDown={() => handleMouseDown(point)}
                    onMouseEnter={() => handleMouseEnter(point)}
                    style={{
                        gridColumn: (point % 3) + 1,
                        gridRow: Math.floor(point / 3) + 1
                    }}
                />
            ))}
        </div>
    );
};

// Компонент регистрации
const RegisterForm = ({ onRegister }) => {
    const [username, setUsername] = useState('');
    const [pattern, setPattern] = useState(null);
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username || !pattern) {
            setMessage('Введите имя и установите графический ключ');
            return;
        }
        onRegister(username, pattern);
    };

    return (
        <div className="form-container">
            <h2>Регистрация</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Имя пользователя:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Установите графический ключ (4-9 точек):</label>
                    <PatternLock
                        onPatternComplete={setPattern}
                        disabled={false}
                    />
                </div>
                <button type="submit">Зарегистрироваться</button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

// Компонент входа
const LoginForm = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [pattern, setPattern] = useState(null);
    const [attempts, setAttempts] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockTimeLeft, setBlockTimeLeft] = useState(0);
    const [message, setMessage] = useState('');

    useEffect(() => {
        let timer;
        if (isBlocked && blockTimeLeft > 0) {
            timer = setTimeout(() => {
                setBlockTimeLeft(blockTimeLeft - 1);
            }, 1000);
        } else if (blockTimeLeft === 0 && isBlocked) {
            setIsBlocked(false);
            setAttempts(0);
        }
        return () => clearTimeout(timer);
    }, [isBlocked, blockTimeLeft]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username || !pattern) {
            setMessage('Введите имя и введите графический ключ');
            return;
        }
        if (isBlocked) {
            setMessage(`Попробуйте через ${blockTimeLeft} секунд`);
            return;
        }

        const success = onLogin(username, pattern);
        if (!success) {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            if (newAttempts >= 3) {
                setIsBlocked(true);
                setBlockTimeLeft(5);
                setMessage(`Неверный ключ! Попробуйте через 5 секунд`);
            } else {
                setMessage(`Неверный ключ! Осталось попыток: ${3 - newAttempts}`);
            }
        }
    };

    return (
        <div className="form-container">
            <h2>Вход</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Имя пользователя:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Введите графический ключ:</label>
                    <PatternLock
                        onPatternComplete={setPattern}
                        disabled={isBlocked}
                    />
                </div>
                <button type="submit" disabled={isBlocked}>
                    {isBlocked ? `Заблокировано (${blockTimeLeft}с)` : 'Войти'}
                </button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

// Главная страница
const HomePage = ({ username, onLogout }) => {
    return (
        <div className="home-page">
            <h1>Добро пожаловать, {username}!</h1>
            <p>Вы успешно вошли в систему с помощью графического ключа.</p>
            <button onClick={onLogout}>Выйти</button>
        </div>
    );
};

// Основной компонент приложения
export const App = () => {
    const [user, setUser] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [users, setUsers] = useState(() => {
        const storedUsers = localStorage.getItem('patternLockUsers');
        return storedUsers ? JSON.parse(storedUsers) : {};
    });

    // Сохраняем пользователей в localStorage при изменении
    useEffect(() => {
        localStorage.setItem('patternLockUsers', JSON.stringify(users));
    }, [users]);

    const registerUser = (username, pattern) => {
        if (users[username]) {
            alert('Пользователь с таким именем уже существует');
            return false;
        }

        // Простое "шифрование" - в реальном приложении используйте более безопасные методы
        const encryptedPattern = btoa(JSON.stringify(pattern));

        setUsers({
            ...users,
            [username]: encryptedPattern
        });

        alert('Регистрация успешна! Теперь вы можете войти.');
        setIsRegistering(false);
        return true;
    };

    const loginUser = (username, pattern) => {
        if (!users[username]) {
            return false;
        }

        const encryptedPattern = users[username];
        const savedPattern = JSON.parse(atob(encryptedPattern));

        if (JSON.stringify(savedPattern) === JSON.stringify(pattern)) {
            setUser(username);
            return true;
        }

        return false;
    };

    const logoutUser = () => {
        setUser(null);
    };

    return (
        <div className="app">
            {user ? (
                <HomePage username={user} onLogout={logoutUser} />
            ) : isRegistering ? (
                <RegisterForm onRegister={registerUser} />
            ) : (
                <LoginForm onLogin={loginUser} />
            )}

            {!user && (
                <div className="toggle-form">
                    <button onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
                    </button>
                </div>
            )}
        </div>
    );
};

// Стили
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');
  
  :root {
    --bg-color: #1a1a2e;
    --card-color: #16213e;
    --text-color: #e6e6e6;
    --primary-color: #6ee7b7;
    --primary-hover: #34d399;
    --error-color: #f87171;
    --disabled-color: #4b5563;
    --point-color: #2d3748;
    --point-selected: #6ee7b7;
    --input-bg: #1e293b;
    --input-border: #334155;
  }

  body {
    font-family: 'Montserrat', sans-serif;
    background-color: var(--bg-color);
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    color: var(--text-color);
  }

  .app {
    background-color: var(--card-color);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    padding: 2rem;
    width: 100%;
    max-width: 420px;
    transition: all 0.3s ease;
  }

  .form-container {
    display: flex;
    flex-direction: column;
  }

  h1, h2 {
    color: var(--primary-color);
    text-align: center;
    margin-bottom: 1.5rem;
    font-weight: 600;
  }

  h1 {
    font-size: 1.8rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-color);
  }

  input {
    width: 100%;
    padding: 0.75rem;
    background-color: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 6px;
    font-size: 1rem;
    color: var(--text-color);
    transition: border-color 0.3s;
    font-family: 'Montserrat', sans-serif;
  }

  input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  button {
    background-color: var(--primary-color);
    color: #111827;
    border: none;
    padding: 0.85rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    width: 100%;
    transition: all 0.3s;
    font-weight: 500;
    font-family: 'Montserrat', sans-serif;
    letter-spacing: 0.5px;
  }

  button:hover {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
  }

  button:disabled {
    background-color: var(--disabled-color);
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }

  .message {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: 6px;
    text-align: center;
    background-color: rgba(239, 68, 68, 0.1);
    color: var(--error-color);
    font-weight: 500;
  }

  .toggle-form {
    margin-top: 1.5rem;
    text-align: center;
  }

  .toggle-form button {
    background: none;
    color: var(--primary-color);
    text-decoration: none;
    padding: 0;
    width: auto;
    font-size: 0.9rem;
  }

  .toggle-form button:hover {
    text-decoration: underline;
    background: none;
    transform: none;
  }

  .pattern-lock {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 16px;
    width: 240px;
    height: 240px;
    margin: 1.5rem auto;
    position: relative;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 10px;
  }

  .lines-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .point {
    width: 32px;
    height: 32px;
    background-color: var(--point-color);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    z-index: 1;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  .point.selected {
    background-color: var(--point-selected);
    transform: scale(1.1);
  }

  .point.selected::after {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: #111827;
    border-radius: 50%;
    top: 10px;
    left: 10px;
  }

  .home-page {
    text-align: center;
  }

  .home-page p {
    margin-bottom: 2rem;
    font-size: 1.1rem;
    line-height: 1.6;
  }

  .home-page button {
    max-width: 200px;
    margin: 0 auto;
  }
`;

// Добавляем стили в документ
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);