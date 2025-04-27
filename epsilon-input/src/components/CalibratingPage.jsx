import { useState } from 'react';
import { InputField } from './InputField';
import '../styles/CalibratingPage.css';
import {CalibrationBlocks} from "./CalibrationBlocks";

export const CalibratingPage = () => {
    const [inputValue, setInputValue] = useState('');
    const [inputStats, setInputStats] = useState(null);
    const [calibAvgs, setCalibAvgs] = useState([]);

    const handleInputChange = (value) => {
        setInputValue(value);
    };

    const handleSubmit = (result) => {
        console.log('Submitted text:', result.text);
        console.log('Input stats:', result.stats);
        setInputStats(result.stats);

        setCalibAvgs(prev => [
            ...prev,
            {
                id: Date.now(), // Уникальный идентификатор
                value: result.stats.avgSpeedMs,
                timestamp: new Date().toLocaleTimeString()
            }
        ]);
    };

    return (
        <div className="panel dark-theme">
            <h2 className="panel-title">Аналитическая панель ввода</h2>

            <div className="panel-content">
                <InputField
                    value={inputValue}
                    onChange={handleInputChange}
                    onSubmit={handleSubmit}
                    placeholder="Введите текст..."
                />

                {calibAvgs.length > 0 && <CalibrationBlocks data={calibAvgs} />}

                {inputStats && (
                    <div className="input-stats">
                        <h3>Статистика ввода:</h3>
                        <p>Символов: {inputStats.totalChars}</p>
                        <p>Средняя скорость: {inputStats.avgSpeedMs} мс/символ</p>
                        <p>Удалений: {inputStats.deleteCount} ({inputStats.deletePercentage}%)</p>
                    </div>
                )}
            </div>
        </div>
    );
};