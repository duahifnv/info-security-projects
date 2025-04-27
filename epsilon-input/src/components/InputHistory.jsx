import React from 'react';
import '../styles/InputHistory.css';

export const InputHistory = ({ data }) => {
    return (
        <div className="history-container">
            <h3>История вводов:</h3>
            <div className="blocks-grid">
                {data.map((input, index) => (
                    <div key={input.id} className={`input-block ${input.failed ? 'failed' : ''}`.trim()}>
                        <div className={`block-header ${input.failed ? 'failed' : ''}`.trim()}>
                            Попытка #{index + 1}
                        </div>
                        <div className={`block-value ${input.failed ? 'failed' : ''}`.trim()}>
                            {input.value} мс/символ
                        </div>
                        <div className={`block-diff ${input.failed ? 'failed' : ''}`.trim()}>+/- {input.diff} мс</div>
                        <div className="block-timestamp">{input.timestamp}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};