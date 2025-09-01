const DB_NAME = 'diario-ai-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

const getDb = (): Promise<IDBDatabase> => {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(new Error("Error opening DB"));
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('keyval')) {
                    db.createObjectStore('keyval', { keyPath: 'key' });
                }
                if (!db.objectStoreNames.contains('dailyLogs')) {
                    db.createObjectStore('dailyLogs', { keyPath: 'date' });
                }
                if (!db.objectStoreNames.contains('workoutRoutines')) {
                    db.createObjectStore('workoutRoutines', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('workoutHistory')) {
                    db.createObjectStore('workoutHistory', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('bodyMeasurements')) {
                    db.createObjectStore('bodyMeasurements', { keyPath: 'date' });
                }
            };
        });
    }
    return dbPromise;
};

export const dbService = {
    get: async <T>(storeName: string, key: IDBValidKey): Promise<T | undefined> => {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    set: async (storeName: string, value: any): Promise<void> => {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.put(value);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },
    
    delete: async (storeName: string, key: IDBValidKey): Promise<void> => {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },
    
    getAll: async <T>(storeName: string): Promise<T[]> => {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    clear: async (storeName: string): Promise<void> => {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },
};
