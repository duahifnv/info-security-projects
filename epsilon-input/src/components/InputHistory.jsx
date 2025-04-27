import React from 'react';
import '../styles/CalibrationBlocks.css';

export const InputHistory = ({ data }) => {
    return (
        <div className="calibration-container">
            <h3>Прошлые вводы:</h3>
            <div className="blocks-grid">
                {data.map((item, index) => (
                    <div key={item.id} className="calibration-block">
                        <div className="block-header">Попытка #{index + 1}</div>
                        <div className="block-value">{item.value} мс/символ</div>
                        <div className="block-time">{item.timestamp}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};