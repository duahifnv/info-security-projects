import React from 'react';
import '../styles/InputHistory.css';

export const InputHistory = ({ data }) => {
    return (
        <div className="history-container">
            <h3>История вводов:</h3>
            <div className="blocks-grid">
                {data.map((item, index) => (
                    <div key={item.id} className="input-block">
                        <div className="block-header">Попытка #{index + 1}</div>
                        <div className="block-value">{item.value} мс/символ</div>
                        <div className="block-time">{item.timestamp}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};