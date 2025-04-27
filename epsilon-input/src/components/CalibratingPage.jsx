import { useState } from 'react';
import { InputField } from './InputField';
import { InputHistory } from "./InputHistory";
import '../styles/CalibratingPage.css';


export const CalibratingPage = () => {
    const [inputValue, setInputValue] = useState('');
    const [inputStats, setInputStats] = useState(null);
    const [inputHistory, updateInputHistory] = useState([]);
    const [calibrating, setCalibrating] = useState(null);
    const [epsilon, setEpsilon] = useState(50);

    const handleInputChange = (value) => {
        setInputValue(value);
    };

    const handleSubmit = (result) => {
        console.log('Submitted text:', result.text);
        console.log('Input stats:', result.stats);
        setInputStats(result.stats);

        updateInputHistory(prevInputs => [
            ...prevInputs,
            {
                id: Date.now(),
                value: result.stats.avgSpeedMs,
                timestamp: new Date().toLocaleTimeString()
            }
        ]);
        if (inputHistory.length > 1) {
            const avgCalibSpeedMs = inputHistory.reduce((a, b) => a.avgSpeedMs + b.avgSpeedMs) / 3;
            setCalibrating({
                avgSpeedMs: avgCalibSpeedMs,
                epsilon: epsilon
            });
        }
    };

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
                            <p>Прогресс калибровки: <span>{(inputHistory.length / 3 * 100).toFixed(1)}%</span> </p>
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
                            <p>Допустимая погрешность ввода: {calibrating.epsilon} мс/символ</p>
                        </div>
                        <InputHistory data={inputHistory} />
                    </>
                )}
            </div>
        </div>
    );
};