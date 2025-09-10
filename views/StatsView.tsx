import React, { useMemo, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { DailyLog, Theme, MEAL_TYPES, BodyMeasurement } from '../types/index';
import { formatDate } from '../types/utils/helpers';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

interface StatsViewProps {
    dailyLogs: Record<string, DailyLog>;
    theme: Theme;
    bodyMeasurements: BodyMeasurement[];
    onOpenMeasurementModal: (date?: string) => void;
    onDeleteMeasurement: (date: string) => void;
    activeTab: 'misure' | 'analisi';
}

export const StatsView: React.FC<StatsViewProps> = ({ dailyLogs, theme, bodyMeasurements, onOpenMeasurementModal, onDeleteMeasurement, activeTab }) => {

    const macronutrientChartData = useMemo(() => {
        const isDark = theme === 'dark';
        const labels: string[] = [];
        const carbsData: number[] = [];
        const proteinData: number[] = [];
        const fatsData: number[] = [];
        
        // Debug: Log current date and calculated dates
        const today = new Date();
        console.log('Today:', today.toISOString(), 'Formatted:', formatDate(today));
        console.log('Available dailyLogs keys:', Object.keys(dailyLogs));
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateKey = formatDate(d);
            const displayLabel = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
            
            console.log(`Day ${i}: Date object:`, d.toISOString(), 'Key:', dateKey, 'Label:', displayLabel);
            
            labels.push(displayLabel);
            const log = dailyLogs[dateKey];
            
            console.log(`Log for ${dateKey}:`, log ? 'Found' : 'Not found');
            
            if (log) {
                const totals = { carbs: 0, protein: 0, fats: 0 };
                for (const mealType of MEAL_TYPES) {
                    const meal = log[mealType];
                    if (meal) {
                        for (const item of meal) {
                            totals.carbs += item.carbs;
                            totals.protein += item.protein;
                            totals.fats += item.fats;
                        }
                    }
                }
                carbsData.push(totals.carbs);
                proteinData.push(totals.protein);
                fatsData.push(totals.fats);
            } else {
                carbsData.push(0);
                proteinData.push(0);
                fatsData.push(0);
            }
        }
        
        return {
            labels,
            datasets: [
                {
                    label: 'Carboidrati (g)',
                    data: carbsData,
                    backgroundColor: isDark ? '#60a5fa' : '#3b82f6',
                    borderColor: isDark ? '#3b82f6' : '#1d4ed8',
                    borderWidth: 1,
                },
                {
                    label: 'Proteine (g)',
                    data: proteinData,
                    backgroundColor: isDark ? '#f87171' : '#ef4444',
                    borderColor: isDark ? '#ef4444' : '#dc2626',
                    borderWidth: 1,
                },
                {
                    label: 'Grassi (g)',
                    data: fatsData,
                    backgroundColor: isDark ? '#fbbf24' : '#f59e0b',
                    borderColor: isDark ? '#f59e0b' : '#d97706',
                    borderWidth: 1,
                }
            ],
        };
    }, [dailyLogs, theme]);

    const calorieChartData = useMemo(() => {
        const isDark = theme === 'dark';
        const labels: string[] = [];
        const calorieData: number[] = [];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }));
            const log = dailyLogs[formatDate(d)];
            if (log) {
                let totalCalories = 0;
                for (const mealType of MEAL_TYPES) {
                    const meal = log[mealType];
                    if (meal) {
                        for (const item of meal) {
                            totalCalories += item.kcal;
                        }
                    }
                }
                calorieData.push(totalCalories);
            } else {
                calorieData.push(0);
            }
        }
        
        return {
            labels,
            datasets: [
                {
                    label: 'Calorie (kcal)',
                    data: calorieData,
                    backgroundColor: isDark ? 'rgba(167, 139, 250, 0.8)' : 'rgba(139, 92, 246, 0.8)',
                    borderColor: isDark ? '#a78bfa' : '#8b5cf6',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                },
            ],
        };
    }, [dailyLogs, theme]);
    
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

    // Chart options for improved UX/UI (must be above carouselCharts)
    const macroOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'top' as const, 
                labels: { 
                    font: { size: 14 },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'rect'
                } 
            },
            tooltip: { 
                mode: 'index' as const, 
                intersect: false, 
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
                cornerRadius: 8,
                displayColors: true
            },
        },
        scales: {
            x: { 
                stacked: true, 
                title: { display: true, text: 'Giorni', font: { size: 14 } }, 
                ticks: { font: { size: 12 } },
                grid: { display: false }
            },
            y: { 
                stacked: true, 
                title: { display: true, text: 'Grammi', font: { size: 14 } }, 
                beginAtZero: true, 
                ticks: { font: { size: 12 } },
                grid: { color: 'rgba(0,0,0,0.1)' }
            }
        },
        interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false }
    };
    const calorieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { 
                callbacks: { label: function(context: any) { return `${context.parsed.y} kcal`; } },
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
                cornerRadius: 8
            },
        },
        scales: {
            x: { 
                title: { display: true, text: 'Giorni', font: { size: 14 } }, 
                ticks: { font: { size: 12 } },
                grid: { display: false }
            },
            y: { 
                title: { display: true, text: 'Calorie (kcal)', font: { size: 14 } }, 
                beginAtZero: true, 
                ticks: { font: { size: 12 } },
                grid: { color: 'rgba(0,0,0,0.1)' }
            }
        }
    };
    const measureOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'top' as const, 
                labels: { 
                    font: { size: 14 },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                } 
            },
            tooltip: { 
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
                cornerRadius: 8,
                displayColors: true
            },
        },
        scales: {
            x: {
                title: { display: true, text: 'Data', font: { size: 14 } }, 
                ticks: { font: { size: 12 } },
                grid: { display: false }
            },
            y: { 
                position: 'left' as const, 
                title: { display: true, text: 'Peso/Muscoli (kg)', font: { size: 14 } }, 
                ticks: { font: { size: 12 } },
                grid: { color: 'rgba(0,0,0,0.1)' }
            },
            y1: { 
                position: 'right' as const, 
                title: { display: true, text: 'Grasso (%)', font: { size: 14 } }, 
                grid: { drawOnChartArea: false },
                ticks: { font: { size: 12 } }
            }
        }
    };

    // Expanded chart state
    const [expandedChart, setExpandedChart] = useState<null | 'macros' | 'calories' | 'measures'>(null);
    const [carouselIndex, setCarouselIndex] = useState(0);

    // Carousel chart data
    const carouselCharts = [
        {
            key: 'macros',
            icon: <span className="material-symbols-outlined" style={{ color: 'var(--carbs-color)', fontSize: '28px' }}>grain</span>,
            title: 'Macronutrienti per Giorno (Ultimi 7 Giorni)',
            chart: <Bar data={macronutrientChartData} options={macroOptions} />,
        },
        {
            key: 'calories',
            icon: <span className="material-symbols-outlined" style={{ color: 'var(--primary-color)', fontSize: '28px' }}>local_fire_department</span>,
            title: 'Calorie per Giorno (Ultimi 7 Giorni)',
            chart: <Bar data={calorieChartData} options={calorieOptions} />,
        },
        {
            key: 'measures',
            icon: <span className="material-symbols-outlined" style={{ color: '#673AB7', fontSize: '28px' }}>trending_up</span>,
            title: 'Andamento Misure Corporee',
            chart: <Line data={measurementChartData} options={measureOptions} />,
        },
    ];

    // Modal for expanded chart
    const renderExpandedChart = () => {
        if (!expandedChart) return null;
        let chart;
        let title;
        if (expandedChart === 'macros') {
            chart = <Bar data={macronutrientChartData} options={macroOptions} />;
            title = 'Macronutrienti per Giorno';
        } else if (expandedChart === 'calories') {
            chart = <Bar data={calorieChartData} options={calorieOptions} />;
            title = 'Calorie per Giorno';
        } else if (expandedChart === 'measures') {
            chart = <Line data={measurementChartData} options={measureOptions} />;
            title = 'Andamento Misure Corporee';
        }
        return (
            <div className="modal-overlay" style={{ position: 'fixed', zIndex: 9999, top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="modal-landscape" style={{ background: 'var(--surface-color)', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(59,130,246,0.12)', minWidth: '80vw', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    <button className="btn-secondary" style={{ position: 'absolute', top: 24, right: 32, zIndex: 2 }} onClick={() => setExpandedChart(null)}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <h2 style={{ marginBottom: '24px', fontWeight: 700, fontSize: '2rem', color: 'var(--primary-color)' }}>{title}</h2>
                    <div style={{ width: '100%', height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {chart}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="stats-view" style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 0' }}>
            {renderExpandedChart()}
            {activeTab === 'misure' && (
                <>
                    <div className="card" style={{ marginBottom: '28px', padding: '28px 24px', borderRadius: '18px', boxShadow: '0 4px 16px rgba(59,130,246,0.08)', border: '2px solid var(--primary-gradient-start)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--primary-color)', fontSize: '28px' }}>monitor_weight</span>
                            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.3rem', color: 'var(--primary-color)' }}>Riepilogo Misure</h3>
                        </div>
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

                    <div className="card" style={{ marginBottom: '28px', padding: '28px 24px', borderRadius: '18px', boxShadow: '0 4px 16px rgba(59,130,246,0.08)', border: '2px solid var(--primary-gradient-start)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--primary-color)', fontSize: '28px' }}>history</span>
                            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.3rem', color: 'var(--primary-color)' }}>Storico Misurazioni</h3>
                        </div>
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
                <div className="stats-carousel" style={{ position: 'relative', width: '100%', height: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button
                        className="carousel-arrow"
                        style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', zIndex: 2 }}
                        onClick={() => setCarouselIndex((i) => (i === 0 ? carouselCharts.length - 1 : i - 1))}
                        aria-label="Precedente"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '38px', color: 'var(--primary-color)' }}>chevron_left</span>
                    </button>
                    <div className="card" style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '38px 32px', borderRadius: '22px', boxShadow: '0 4px 24px rgba(59,130,246,0.10)', border: '2px solid var(--primary-gradient-start)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', transition: 'box-shadow 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px', width: '100%' }}>
                            {carouselCharts[carouselIndex].icon}
                            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.5rem', color: 'var(--primary-color)' }}>{carouselCharts[carouselIndex].title}</h3>
                        </div>
                        <div className="line-chart-container" style={{ background: 'var(--surface-color)', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(59,130,246,0.06)', width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {carouselCharts[carouselIndex].chart}
                        </div>
                    </div>
                    <button
                        className="carousel-arrow"
                        style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', zIndex: 2 }}
                        onClick={() => setCarouselIndex((i) => (i === carouselCharts.length - 1 ? 0 : i + 1))}
                        aria-label="Successivo"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '38px', color: 'var(--primary-color)' }}>chevron_right</span>
                    </button>
                </div>
            )}
        </div>
    );
};
