/**
 * ValidatedInput Component
 * A reusable input component with built-in validation feedback
 */

import React, { useState, useCallback } from 'react';
import { AlertCircle, Check } from 'lucide-react';

interface ValidatedInputProps {
    type?: 'text' | 'number' | 'email';
    value: string | number;
    onChange: (value: string | number) => void;
    validate?: (value: string | number) => { valid: boolean; error?: string };
    label?: string;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    min?: number;
    max?: number;
    step?: number | string;
    required?: boolean;
    disabled?: boolean;
    showSuccessIndicator?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
    type = 'text',
    value,
    onChange,
    validate,
    label,
    placeholder,
    className = '',
    inputClassName = '',
    min,
    max,
    step,
    required = false,
    disabled = false,
    showSuccessIndicator = false,
}) => {
    const [touched, setTouched] = useState(false);

    const result = validate ? validate(value) : { valid: true };
    const errorMsg = result.valid ? null : result.error || 'Valoare invalidă';
    const showError = touched && !result.valid;
    const showSuccess = showSuccessIndicator && touched && result.valid;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;

        if (type === 'number') {
            // Handle empty string for number inputs
            if (rawValue === '') {
                onChange(0);
            } else {
                const numValue = parseFloat(rawValue);
                if (!isNaN(numValue)) {
                    onChange(numValue);
                }
            }
        } else {
            onChange(rawValue);
        }
    };

    const handleBlur = () => {
        setTouched(true);
    };

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {label}
                    {required && <span className="text-destructive ml-0.5">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    type={type}
                    value={type === 'number' && value === 0 ? '' : value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    step={step}
                    disabled={disabled}
                    className={`
                        w-full px-3 py-2 rounded-lg border transition-all text-sm
                        ${showError
                            ? 'border-destructive bg-destructive/5 focus:border-destructive focus:ring-destructive/20'
                            : showSuccess
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-background hover:border-primary/50 focus:border-primary focus:ring-primary/20'
                        }
                        focus:outline-none focus:ring-2
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${inputClassName}
                    `}
                />
                {showError && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
                )}
                {showSuccess && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                )}
            </div>
            {showError && (
                <p className="text-xs text-destructive mt-1 animate-in fade-in slide-in-from-top-1">
                    {errorMsg}
                </p>
            )}
        </div>
    );
};

/**
 * Quick validation wrapper for number inputs
 */
interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    errorMessage?: string;
    label?: string;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    disabled?: boolean;
    showSuccessIndicator?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
    value,
    onChange,
    min = 0,
    max = Infinity,
    errorMessage,
    ...props
}) => {
    const validate = useCallback((val: string | number): { valid: boolean; error?: string } => {
        const num = typeof val === 'string' ? parseFloat(val) : val;

        if (isNaN(num)) {
            return { valid: false, error: 'Introduceți un număr valid' };
        }
        if (min !== undefined && num < min) {
            return { valid: false, error: errorMessage || `Valoarea minimă este ${min}` };
        }
        if (max !== undefined && num > max) {
            return { valid: false, error: errorMessage || `Valoarea maximă este ${max}` };
        }

        return { valid: true };
    }, [min, max, errorMessage]);

    return (
        <ValidatedInput
            type="number"
            value={value}
            onChange={(v) => onChange(typeof v === 'number' ? v : parseFloat(String(v)) || 0)}
            validate={validate}
            min={min}
            max={max}
            {...props}
        />
    );
};

/**
 * Inline validation message component
 */
export const ValidationMessage: React.FC<{
    error?: string | null;
    success?: string | null;
}> = ({ error, success }) => {
    if (error) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-destructive mt-1 animate-in fade-in">
                <AlertCircle className="w-3 h-3" />
                {error}
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-primary mt-1 animate-in fade-in">
                <Check className="w-3 h-3" />
                {success}
            </div>
        );
    }

    return null;
};
