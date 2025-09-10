import { WorkoutRoutine } from './index';

export const PRESET_WORKOUTS: WorkoutRoutine[] = [
    // CrossFit WODs
    {
        id: 'preset_fran',
        name: 'Fran',
        description: 'Classic CrossFit benchmark WOD: 21-15-9 Thrusters e Pull-ups',
        category: 'crossfit',
        difficulty: 'intermedio',
        estimatedDuration: 15,
        isPreset: true,
        exercises: [
            {
                id: 'ex_thruster',
                name: 'Thruster',
                sets: 3,
                reps: '21-15-9',
                notes: '42.5kg per uomini, 30kg per donne. Eseguire 21 rep, poi 15, poi 9'
            },
            {
                id: 'ex_pullup',
                name: 'Pull-up',
                sets: 3,
                reps: '21-15-9',
                notes: 'Stesso schema del thruster. Alternare con i thruster'
            }
        ]
    },
    {
        id: 'preset_murph',
        name: 'Murph',
        description: 'Hero WOD in memoria del Navy SEAL Michael Murphy',
        category: 'crossfit',
        difficulty: 'avanzato',
        estimatedDuration: 45,
        isPreset: true,
        exercises: [
            {
                id: 'ex_run1',
                name: 'Corsa',
                sets: 1,
                reps: '1 miglio',
                notes: 'Corsa iniziale di riscaldamento'
            },
            {
                id: 'ex_pullup_murph',
                name: 'Pull-up',
                sets: 20,
                reps: '5',
                notes: '100 pull-up totali, spezzate come preferisci'
            },
            {
                id: 'ex_pushup_murph',
                name: 'Push-up',
                sets: 20,
                reps: '10',
                notes: '200 push-up totali, spezzate come preferisci'
            },
            {
                id: 'ex_squat_murph',
                name: 'Air Squat',
                sets: 20,
                reps: '15',
                notes: '300 squat totali, spezzate come preferisci'
            },
            {
                id: 'ex_run2',
                name: 'Corsa',
                sets: 1,
                reps: '1 miglio',
                notes: 'Corsa finale'
            }
        ]
    },
    {
        id: 'preset_cindy',
        name: 'Cindy',
        description: 'AMRAP 20 minuti: 5 Pull-ups, 10 Push-ups, 15 Squats',
        category: 'crossfit',
        difficulty: 'principiante',
        estimatedDuration: 20,
        isPreset: true,
        exercises: [
            {
                id: 'ex_pullup_cindy',
                name: 'Pull-up',
                sets: 1,
                reps: '5',
                notes: 'AMRAP 20 min - ripetere il ciclo il più possibile'
            },
            {
                id: 'ex_pushup_cindy',
                name: 'Push-up',
                sets: 1,
                reps: '10',
                notes: 'Parte del ciclo AMRAP'
            },
            {
                id: 'ex_squat_cindy',
                name: 'Air Squat',
                sets: 1,
                reps: '15',
                notes: 'Parte del ciclo AMRAP'
            }
        ]
    },

    // Bodybuilding/Forza
    {
        id: 'preset_push_day',
        name: 'Push Day (Petto, Spalle, Tricipiti)',
        description: 'Allenamento di spinta per parte superiore del corpo',
        category: 'bodybuilding',
        difficulty: 'intermedio',
        estimatedDuration: 90,
        isPreset: true,
        exercises: [
            {
                id: 'ex_bench_press',
                name: 'Panca Piana',
                sets: 4,
                reps: '8-10',
                notes: 'Esercizio principale, progressione di carico'
            },
            {
                id: 'ex_shoulder_press',
                name: 'Shoulder Press',
                sets: 4,
                reps: '10-12',
                notes: 'Con manubri o bilanciere'
            },
            {
                id: 'ex_incline_press',
                name: 'Panca Inclinata',
                sets: 3,
                reps: '10-12',
                notes: 'Inclinazione 30-45 gradi'
            },
            {
                id: 'ex_lateral_raises',
                name: 'Alzate Laterali',
                sets: 3,
                reps: '12-15',
                notes: 'Movimento controllato, focus sul deltoide medio'
            },
            {
                id: 'ex_tricep_dips',
                name: 'Dips ai Tricipiti',
                sets: 3,
                reps: '10-15',
                notes: 'Alle parallele o su panca'
            },
            {
                id: 'ex_tricep_extension',
                name: 'French Press',
                sets: 3,
                reps: '12-15',
                notes: 'Estensioni per tricipiti con manubrio'
            }
        ]
    },
    {
        id: 'preset_pull_day',
        name: 'Pull Day (Schiena, Bicipiti)',
        description: 'Allenamento di tirata per parte superiore del corpo',
        category: 'bodybuilding',
        difficulty: 'intermedio',
        estimatedDuration: 90,
        isPreset: true,
        exercises: [
            {
                id: 'ex_deadlift',
                name: 'Stacco da Terra',
                sets: 4,
                reps: '5-8',
                notes: 'Esercizio principale, tecnica perfetta'
            },
            {
                id: 'ex_pullup_bodybuilding',
                name: 'Trazioni alla Sbarra',
                sets: 4,
                reps: '8-12',
                notes: 'Presa prona, movimento controllato'
            },
            {
                id: 'ex_bent_row',
                name: 'Rematore con Bilanciere',
                sets: 4,
                reps: '10-12',
                notes: 'Busto inclinato 45 gradi'
            },
            {
                id: 'ex_lat_pulldown',
                name: 'Lat Pulldown',
                sets: 3,
                reps: '10-12',
                notes: 'Alla lat machine, focus sui dorsali'
            },
            {
                id: 'ex_bicep_curls',
                name: 'Curl per Bicipiti',
                sets: 3,
                reps: '12-15',
                notes: 'Con bilanciere o manubri'
            },
            {
                id: 'ex_hammer_curls',
                name: 'Hammer Curl',
                sets: 3,
                reps: '12-15',
                notes: 'Presa neutra con manubri'
            }
        ]
    },
    {
        id: 'preset_leg_day',
        name: 'Leg Day (Gambe e Glutei)',
        description: 'Allenamento completo per parte inferiore del corpo',
        category: 'bodybuilding',
        difficulty: 'intermedio',
        estimatedDuration: 90,
        isPreset: true,
        exercises: [
            {
                id: 'ex_squat',
                name: 'Squat',
                sets: 4,
                reps: '8-10',
                notes: 'Esercizio principale, discesa controllata'
            },
            {
                id: 'ex_romanian_deadlift',
                name: 'Stacco Rumeno',
                sets: 4,
                reps: '10-12',
                notes: 'Focus sui femorali e glutei'
            },
            {
                id: 'ex_leg_press',
                name: 'Leg Press',
                sets: 3,
                reps: '12-15',
                notes: 'Range completo di movimento'
            },
            {
                id: 'ex_lunges',
                name: 'Affondi',
                sets: 3,
                reps: '12 per gamba',
                notes: 'Alternati o walking lunges'
            },
            {
                id: 'ex_leg_curl',
                name: 'Leg Curl',
                sets: 3,
                reps: '12-15',
                notes: 'Isolamento femorali'
            },
            {
                id: 'ex_calf_raises',
                name: 'Calf Raises',
                sets: 4,
                reps: '15-20',
                notes: 'In piedi, movimento completo'
            }
        ]
    },

    // Functional/Conditioning
    {
        id: 'preset_hiit_cardio',
        name: 'HIIT Cardio',
        description: 'Circuito ad alta intensità per il condizionamento',
        category: 'cardio',
        difficulty: 'intermedio',
        estimatedDuration: 30,
        isPreset: true,
        exercises: [
            {
                id: 'ex_burpees',
                name: 'Burpees',
                sets: 4,
                reps: '30 sec',
                notes: '30 sec lavoro, 30 sec riposo'
            },
            {
                id: 'ex_mountain_climbers',
                name: 'Mountain Climbers',
                sets: 4,
                reps: '30 sec',
                notes: 'Ritmo elevato, core stabile'
            },
            {
                id: 'ex_jump_squats',
                name: 'Jump Squats',
                sets: 4,
                reps: '30 sec',
                notes: 'Esplosivité nel salto'
            },
            {
                id: 'ex_high_knees',
                name: 'High Knees',
                sets: 4,
                reps: '30 sec',
                notes: 'Ginocchia al petto, ritmo veloce'
            },
            {
                id: 'ex_plank_jacks',
                name: 'Plank Jacks',
                sets: 4,
                reps: '30 sec',
                notes: 'In posizione plank, saltelli con le gambe'
            }
        ]
    },

    // Powerlifting
    {
        id: 'preset_powerlifting_basic',
        name: 'Powerlifting Base',
        description: 'I tre grandi alzate del powerlifting',
        category: 'powerlifting',
        difficulty: 'avanzato',
        estimatedDuration: 120,
        isPreset: true,
        exercises: [
            {
                id: 'ex_squat_powerlifting',
                name: 'Squat (Powerlifting)',
                sets: 5,
                reps: '3-5',
                notes: 'Focus sulla tecnica, progressione graduale'
            },
            {
                id: 'ex_bench_powerlifting',
                name: 'Panca Piana (Powerlifting)',
                sets: 5,
                reps: '3-5',
                notes: 'Setup preciso, pausa al petto'
            },
            {
                id: 'ex_deadlift_powerlifting',
                name: 'Stacco da Terra (Powerlifting)',
                sets: 5,
                reps: '1-3',
                notes: 'Tecnica perfetta, progressione lenta'
            }
        ]
    },

    // Functional Training
    {
        id: 'preset_functional',
        name: 'Allenamento Funzionale',
        description: 'Movimenti funzionali per la vita quotidiana',
        category: 'funzionale',
        difficulty: 'principiante',
        estimatedDuration: 45,
        isPreset: true,
        exercises: [
            {
                id: 'ex_kettlebell_swing',
                name: 'Kettlebell Swing',
                sets: 3,
                reps: '15-20',
                notes: 'Movimento esplosivo dai fianchi'
            },
            {
                id: 'ex_turkish_getup',
                name: 'Turkish Get-up',
                sets: 3,
                reps: '5 per lato',
                notes: 'Movimento lento e controllato'
            },
            {
                id: 'ex_farmer_walk',
                name: 'Farmer\'s Walk',
                sets: 3,
                reps: '30 metri',
                notes: 'Carico pesante, postura eretta'
            },
            {
                id: 'ex_goblet_squat',
                name: 'Goblet Squat',
                sets: 3,
                reps: '12-15',
                notes: 'Con kettlebell o manubrio al petto'
            },
            {
                id: 'ex_single_arm_row',
                name: 'Single Arm Row',
                sets: 3,
                reps: '10 per lato',
                notes: 'Con manubrio, core stabile'
            }
        ]
    },

    // Yoga/Mobility
    {
        id: 'preset_yoga_flow',
        name: 'Yoga Flow Mattutino',
        description: 'Sequenza dolce per iniziare la giornata',
        category: 'yoga',
        difficulty: 'principiante',
        estimatedDuration: 30,
        isPreset: true,
        exercises: [
            {
                id: 'ex_sun_salutation',
                name: 'Saluto al Sole',
                sets: 3,
                reps: '5 cicli',
                notes: 'Sequenza completa, respiro sincronizzato'
            },
            {
                id: 'ex_warrior_poses',
                name: 'Posizioni del Guerriero',
                sets: 1,
                reps: '1 min per lato',
                notes: 'Guerriero I, II, III'
            },
            {
                id: 'ex_tree_pose',
                name: 'Posizione dell\'Albero',
                sets: 1,
                reps: '1 min per lato',
                notes: 'Equilibrio e concentrazione'
            },
            {
                id: 'ex_child_pose',
                name: 'Posizione del Bambino',
                sets: 1,
                reps: '2 min',
                notes: 'Rilassamento e stretching'
            },
            {
                id: 'ex_savasana',
                name: 'Savasana',
                sets: 1,
                reps: '5 min',
                notes: 'Rilassamento finale, respirazione profonda'
            }
        ]
    }
];

export const getPresetWorkoutsByCategory = (category: string) => {
    return PRESET_WORKOUTS.filter(workout => workout.category === category);
};

export const getAllPresetWorkouts = () => {
    return PRESET_WORKOUTS;
};
