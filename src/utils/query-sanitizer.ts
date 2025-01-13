import { ParsedQs } from 'qs';

type SanitizeOptions = {
    trim?: boolean;
    lowercase?: boolean;
    removeSpecialChars?: boolean;
    maxLength?: number;
    allowEmpty?: boolean;
};

export class QuerySanitizer {
    private static readonly DEFAULT_OPTIONS: SanitizeOptions = {
        trim: true,
        lowercase: false,
        removeSpecialChars: false,
        maxLength: 255,
        allowEmpty: true
    };

    /**
     * Санитизирует строковое значение query параметра
     */
    static sanitizeString(
        value: string | ParsedQs | string[] | ParsedQs[] | undefined,
        options: SanitizeOptions = {}
    ): string | undefined {
        const opts = { ...this.DEFAULT_OPTIONS, ...options };

        // Преобразуем значение в строку
        let sanitized: string | undefined;

        if (Array.isArray(value)) {
            sanitized = value[0]?.toString();
        } else if (typeof value === 'string') {
            sanitized = value;
        } else if (value && typeof value === 'object') {
            sanitized = Object.values(value)[0]?.toString();
        }

        // Если значение не определено и пустые значения не разрешены
        if (!sanitized && !opts.allowEmpty) {
            return undefined;
        }

        // Применяем опции санитизации
        if (sanitized) {
            if (opts.trim) {
                sanitized = sanitized.trim();
            }

            if (opts.lowercase) {
                sanitized = sanitized.toLowerCase();
            }

            if (opts.removeSpecialChars) {
                sanitized = sanitized.replace(/[^\w\s-]/g, '');
            }

            if (opts.maxLength && sanitized.length > opts.maxLength) {
                sanitized = sanitized.slice(0, opts.maxLength);
            }
        }

        return sanitized;
    }

    /**
     * Санитизирует числовое значение query параметра
     */
    static sanitizeNumber(
        value: string | ParsedQs | string[] | ParsedQs[] | undefined,
        min?: number,
        max?: number
    ): number | undefined {
        const sanitized = this.sanitizeString(value, { trim: true });
        if (!sanitized) return undefined;

        const num = Number(sanitized);
        if (isNaN(num)) return undefined;

        if (typeof min === 'number' && num < min) return min;
        if (typeof max === 'number' && num > max) return max;

        return num;
    }

    /**
     * Санитизирует массив значений query параметра
     */
    static sanitizeArray(
        value: string | ParsedQs | string[] | ParsedQs[] | undefined,
        options: SanitizeOptions = {}
    ): string[] {
        if (!value) return [];

        const array = Array.isArray(value) ? value : [value];
        return array
            .map(item => this.sanitizeString(item, options))
            .filter((item): item is string => item !== undefined);
    }
}