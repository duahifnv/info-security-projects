import React, { useState, useEffect, useRef } from 'react';
import '../styles/InputField.css';

export const InputField = ({ value, onChange, placeholder, onSubmit }) => {
    const [inputLog, setInputLog] = useState([]);
    const inputRef = useRef(null);

    // Обработчик изменения значения
    const handleChange = (e) => {
        const newValue = e.target.value;
        onChange(newValue);
    };

    // Обработчик нажатия клавиш
    const handleKeyDown = (e) => {
        const key = e.key;
        const newLog = {
            key,
            timestamp: Date.now(),
            action: key === 'Backspace' ? 'delete' : 'add'
        };

        setInputLog(prev => [...prev, newLog]);

        // Обработка сабмита по Enter
        if (key === 'Enter' && value.trim() && value.length >= 2) {
            handleSubmit();
        }
    };

    // Обработчик сабмита
    const handleSubmit = () => {
        if (value.trim()) {
            // Передаём текущее значение и лог ввода
            onSubmit({
                text: value,
                inputLog,
                stats: calculateStats(inputLog)
            });

            // Очищаем поле и лог
            onChange('');
            setInputLog([]);
        }
    };

    // Расчёт статистики
    const calculateStats = (log) => {
        if (log.length < 2) return null;

        const durations = [];
        for (let i = 1; i < log.length; i++) {
            durations.push(log[i].timestamp - log[i-1].timestamp);
        }

        const avgSpeed = durations.reduce((a, b) => a + b, 0) / durations.length;
        const deletes = log.filter(entry => entry.action === 'delete').length;

        return {
            totalChars: value.length,
            avgSpeedMs: avgSpeed.toFixed(2),
            deleteCount: deletes,
            deletePercentage: ((deletes / log.length) * 100).toFixed(1)
        };
    };

    // Автофокус при монтировании
    useEffect(() => {
        inputRef.current.focus();
    }, []);

    return (
        <div className="input-field">
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
            />
            <div className="input-icon">
                <svg viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
            </div>
            <button
                onClick={handleSubmit}
                className="submit-button"
                disabled={!value.trim() || value.length < 2}
            >
                Отправить
            </button>
        </div>
    );
};