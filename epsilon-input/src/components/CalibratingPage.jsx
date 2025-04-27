import {useCallback, useEffect, useState} from 'react';
import { InputField } from './InputField';
import { InputHistory } from "./InputHistory";
import '../styles/CalibratingPage.css';


export const CalibratingPage = () => {
    const [inputValue, setInputValue] = useState('');
    const [inputStats, setInputStats] = useState(null);
    const [inputHistory, setInputHistory] = useState([]);
    const [calibrating, setCalibrating] = useState(null);
    const [epsilon, setEpsilon] = useState(50);
    const calibratingTries = 3;

    const handleInputChange = (value) => {
        setInputValue(value);
    };

    const handleEpsilonChange = (e) => {
        let value = parseInt(e.target.value);
        value = Math.min(Math.max(value, 0), 1000);
        setEpsilon(isNaN(value) ? 0 : value);
    };

    const processCalibration = (newHistory) => {
        if (newHistory.length === calibratingTries) {
            const avgCalibSpeedMs = newHistory.reduce(
                (sum, input) => sum + parseFloat(input.value),
                0
            ) / calibratingTries;

            setCalibrating({
                avgSpeedMs: avgCalibSpeedMs.toFixed(2),
                epsilon: epsilon
            });

            return newHistory.map(input => ({
                ...input,
                diff: Math.abs(input.value - avgCalibSpeedMs).toFixed(2)
            }));
        }
        return newHistory;
    };

    const handleSubmit = (result) => {
        setInputHistory(prev => {
            const diff = calculateDiff(result.stats.avgSpeedMs);
            const newInput = {
                id: Date.now(),
                value: result.stats.avgSpeedMs,
                diff: diff,
                failed: diff > epsilon,
                timestamp: new Date().toLocaleTimeString()
            };
            const newHistory = [...prev, newInput];
            return processCalibration(newHistory);
        });
        setInputStats(result.stats);
    };

    const calculateDiff = (avgSpeedMs) => {
        return calibrating ? Math.abs(avgSpeedMs - calibrating.avgSpeedMs).toFixed(2) : null;
    }

    return (
        <div className="panel dark-theme">
            <h2 className="panel-title">Аналитическая панель ввода</h2>

            <div className="panel-content">
                <InputField
                    value={inputValue}
                    onChange={handleInputChange}
                    onSubmit={handleSubmit}
                    placeholder={calibrating ?
                        "Введите текст..." : "Введите фразу 'Мама мыла раму' в своем привычном темпе"}
                />

                {!calibrating && (
                    <>
                        <div className="input-block calib">
                            <p>Прогресс калибровки: <span>{(inputHistory.length / calibratingTries * 100).toFixed(1)}%</span>
                            </p>
                        </div>
                        {inputStats && (
                            <div className="input-block stat">
                                <h3>Статистика ввода:</h3>
                                <p>Символов: {inputStats.totalChars}</p>
                                <p>Средняя скорость: {inputStats.avgSpeedMs} мс/символ</p>
                            </div>
                        )}
                    </>
                )}
                {calibrating && (
                    <>
                        <div className="input-block calib-result">
                            <h3>Результат калибровки:</h3>
                            <p>Средняя скорость: {calibrating.avgSpeedMs} мс/символ</p>
                            <div className="epsilon-control">
                                <label htmlFor="epsilon-input">Допустимая погрешность:</label>
                                <input
                                    id="epsilon-input"
                                    type="number"
                                    min="0"
                                    max="1000"
                                    value={epsilon}
                                    onChange={handleEpsilonChange}
                                />
                                <span>мс/символ</span>
                            </div>
                        </div>
                        <InputHistory data={inputHistory} />
                    </>
                )}
            </div>
        </div>
    );
};