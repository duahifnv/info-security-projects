import React from 'react';
import InputField from './InputField';
import StatPanel from './StatPanel';
import '../styles/InputPage.css';


export const InputPage = () => {
    const [inputValue, setInputValue] = React.useState('');
    const [inputStats, setInputStats] = React.useState(null);

    const handleInputChange = (value) => {
        setInputValue(value);
    };

    const handleSubmit = (result) => {
        console.log('Submitted text:', result.text);
        console.log('Input stats:', result.stats);
        setInputStats(result.stats);

        // Здесь можно добавить дополнительную обработку
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