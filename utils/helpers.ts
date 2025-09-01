// --- FUNZIONI DI UTILITÀ --- //
export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const getDisplayDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (formatDate(date) === formatDate(today)) return 'Oggi';
    if (formatDate(date) === formatDate(yesterday)) return 'Ieri';

    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
};

export const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
};

export const generateUniqueId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const parseTargetReps = (reps: string): number => {
    if (reps.includes('-')) {
        return parseInt(reps.split('-')[1], 10) || 0;
    }
    return parseInt(reps, 10) || 0;
}