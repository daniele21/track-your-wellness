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

export const formatDuration = (totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00";

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');

    if (hours > 0) {
        const paddedHours = String(hours).padStart(2, '0');
        return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    }
    
    return `${paddedMinutes}:${paddedSeconds}`;
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