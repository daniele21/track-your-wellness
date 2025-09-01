import React from 'react';

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, min = 0, max = 999, step = 1 }) => {

    const handleIncrement = () => {
        const newValue = Math.min(value + step, max);
        onChange(newValue);
    };

    const handleDecrement = () => {
        const newValue = Math.max(value - step, min);
        onChange(newValue);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const parsedValue = parseFloat(e.target.value);
        if (!isNaN(parsedValue)) {
            onChange(Math.max(min, Math.min(parsedValue, max)));
        } else if (e.target.value === '') {
            onChange(0); // or handle as you see fit
        }
    }

    return (
        <div className="number-input-container">
            <button onClick={handleDecrement} aria-label="Decrementa">-</button>
            <input
                type="number"
                value={value}
                onChange={handleChange}
                min={min}
                max={max}
                step={step}
                aria-label="Valore numerico"
            />
            <button onClick={handleIncrement} aria-label="Incrementa">+</button>
        </div>
    );
};