import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { DailyLog, Theme, MEAL_TYPES, BodyMeasurement } from '../types/index';
import { formatDate } from '../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface StatsViewProps {
    dailyLogs: Record<string, DailyLog>;
    theme: Theme;
    bodyMeasurements: BodyMeasurement[];
    onOpenMeasurementModal: (date?: string) => void;
    onDeleteMeasurement: (date: string) => void;
    activeTab: 'misure' | 'analisi';
}

export const StatsView: React.FC<StatsViewProps> = ({ dailyLogs, theme, bodyMeasurements, onOpenMeasurementModal, onDeleteMeasurement, activeTab }) => {
    
    const nutritionChartData = useMemo(() => {
        const isDark = theme === 'dark';
        const labels: string[] = [];
        const calorieData: number[] = [];
        const proteinData: number[] = [];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }));
            const log = dailyLogs[formatDate(d)];
            if (log) {
                const totals = { kcal: 0, protein: 0 };
                for (const mealType of MEAL_TYPES) {
                    const meal = log[mealType];
                    if (meal) {
                        for (const item of meal) {
                            totals.kcal += item.kcal;
                            totals.protein += item.protein;
                        }
                    }
                }
                calorieData.push(totals.kcal);
                proteinData.push(totals.protein);
            } else {
                calorieData.push(0);
                proteinData.push(0);
            }
        }
        
        return {
            labels,
            datasets: [
                {
                    label: 'Calorie (kcal)',
                    data: calorieData,
                    borderColor: isDark ? '#42A5F5' : '#2196F3',
                    backgroundColor: isDark ? 'rgba(66, 165, 245, 0.2)' : 'rgba(33, 150, 243, 0.2)',
                    fill: true,
                    tension: 0.3,
                },
                 {
                    label: 'Proteine (g)',
                    data: proteinData,
                    borderColor: '#EF5350',
                    backgroundColor: 'rgba(239, 83, 80, 0.2)',
                    fill: true,
                    tension: 0.3,
                }
            ],
        };
    }, [dailyLogs, theme]);
    
    const measurementChartData = useMemo(() => {
        const isDark = theme === 'dark';
        const sortedMeasurements = [...bodyMeasurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const labels = sortedMeasurements.map(m => new Date(m.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }));
        const weightData = sortedMeasurements.map(m => m.weight);
        const bodyFatData = sortedMeasurements.map(m => m.bodyFat);
        const muscleMassData = sortedMeasurements.map(m => m.muscleMass);

        return {
            labels,
            datasets: [
                {
                    label: 'Peso (kg)',
                    data: weightData,
                    borderColor: isDark ? '#42A5F5' : '#2196F3',
                    backgroundColor: isDark ? 'rgba(66, 165, 245, 0.2)' : 'rgba(33, 150, 243, 0.2)',
                    fill: false,
                    tension: 0.1,
                    yAxisID: 'y', // Left axis
                },
                {
                    label: 'Massa Muscolare (kg)',
                    data: muscleMassData,
                    borderColor: '#673AB7',
                    backgroundColor: 'rgba(103, 58, 183, 0.2)',
                    fill: false,
                    tension: 0.1,
                    yAxisID: 'y', // Left axis
                    hidden: !muscleMassData.some(mm => mm !== undefined && mm !== null),
                },
                {
                    label: 'Grasso Corporeo (%)',
                    data: bodyFatData,
                    borderColor: '#FFC107',
                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                    fill: false,
                    tension: 0.1,
                    yAxisID: 'y1', // Right axis
                    hidden: !bodyFatData.some(bf => bf !== undefined && bf !== null),
                }
            ],
        };
    }, [bodyMeasurements, theme]);
    
    const latestMeasurement = bodyMeasurements.length > 0 ? bodyMeasurements[bodyMeasurements.length -1] : null;
    const hasTodaysMeasurement = useMemo(() => {
        const todayKey = formatDate(new Date());
        return bodyMeasurements.some(m => m.date === todayKey);
    }, [bodyMeasurements]);

    return (
        <div className="stats-view">
            {activeTab === 'misure' && (
                <>
                    <div className="card">
                        <h3>Riepilogo Misure</h3>
                        {latestMeasurement ? (
                             <>
                                <div className="latest-measurement-display" style={{ paddingBottom: '16px' }}>
                                    <div className="measurement-item">
                                        <span className="measurement-value">{latestMeasurement.weight.toFixed(1)}</span>
                                        <span className="measurement-name">Peso (kg)</span>
                                    </div>
                                    {latestMeasurement.muscleMass != null && (
                                        <div className="measurement-item">
                                            <span className="measurement-value">{latestMeasurement.muscleMass.toFixed(1)}</span>
                                            <span className="measurement-name">Muscoli (kg)</span>
                                        </div>
                                    )}
                                    {latestMeasurement.bodyFat != null && (
                                        <div className="measurement-item">
                                            <span className="measurement-value">{latestMeasurement.bodyFat.toFixed(1)}</span>
                                            <span className="measurement-name">Grasso (%)</span>
                                        </div>
                                    )}
                                </div>
                                 <button className="btn-secondary" style={{width: '100%'}} onClick={() => onOpenMeasurementModal()}>
                                    <span className="material-symbols-outlined">monitor_weight</span>
                                    {hasTodaysMeasurement ? 'Aggiorna Misurazione' : 'Registra Misurazione'}
                                </button>
                            </>
                        ) : (
                             <div className="empty-state">
                                <p>Nessuna misurazione registrata.</p>
                                <button className="btn-primary" style={{marginTop: '16px'}} onClick={() => onOpenMeasurementModal()}>
                                    Registra la tua prima misurazione
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <h3>Storico Misurazioni</h3>
                        {bodyMeasurements.length === 0 ? (
                            <p className="empty-state">Lo storico delle misurazioni apparirà qui.</p>
                        ) : (
                            <ul className="measurement-history-list">
                                {[...bodyMeasurements].reverse().map(m => (
                                    <li key={m.date} className="measurement-history-item">
                                        <div className="measurement-history-info">
                                            <strong>{new Date(m.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
                                            <span>
                                                Peso: {m.weight} kg
                                                {m.muscleMass != null ? ` • Muscoli: ${m.muscleMass} kg` : ''}
                                                {m.bodyFat != null ? ` • Grasso: ${m.bodyFat}%` : ''}
                                            </span>
                                        </div>
                                        <div className="measurement-history-actions">
                                            <button className="btn-secondary" style={{padding: '6px 12px'}} onClick={() => onOpenMeasurementModal(m.date)}>Modifica</button>
                                            <button className="btn-danger-icon" onClick={() => onDeleteMeasurement(m.date)}>
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
            
            {activeTab === 'analisi' && (
                <div className="stats-view">
                    <div className="card">
                        <h3>Andamento Misure Corporee</h3>
                        <div className="line-chart-container">
                             <Line 
                                data={measurementChartData} 
                                options={{
                                    responsive: true,
                                    scales: { 
                                        y: { position: 'left', title: { display: true, text: 'Kg' } }, 
                                        y1: { position: 'right', title: { display: true, text: '%' }, grid: { drawOnChartArea: false } } 
                                    } 
                                }}
                            />
                        </div>
                    </div>
                     <div className="card">
                        <h3>Andamento Nutrizionale (Ultimi 7 Giorni)</h3>
                        <div className="line-chart-container">
                             <Line data={nutritionChartData} options={{ responsive: true }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};