import { openDB, IDBPDatabase } from 'idb';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { toast } from 'sonner';

const DB_NAME = 'naija_safety_offline';
const STORE_NAME = 'incident_queue';

interface OfflineIncident {
  id?: number;
  data: any;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase>;

const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
};

export const queueIncident = async (incidentData: any) => {
  const db = await initDB();
  await db.add(STORE_NAME, {
    data: incidentData,
    timestamp: Date.now()
  });
  
  // Try to sync immediately if online
  if (navigator.onLine) {
    syncIncidents();
  } else {
    toast.info("You're offline. Incident queued for sync.");
  }
};

export const syncIncidents = async () => {
  if (!navigator.onLine) return;

  const idb = await initDB();
  const tx = idb.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const queued = await store.getAll();

  if (queued.length === 0) return;

  console.log(`[Offline Sync] Attempting to sync ${queued.length} incidents`);

  for (const item of queued) {
    try {
      await addDoc(collection(db, 'incidents'), {
        ...item.data,
        synced_at: serverTimestamp(),
        offline_created_at: new Date(item.timestamp)
      });
      await store.delete(item.id!);
      console.log(`[Offline Sync] Successfully synced incident ${item.id}`);
    } catch (error) {
      console.error(`[Offline Sync] Failed to sync incident ${item.id}`, error);
    }
  }
  
  toast.success("Offline reports synced successfully!");
};

// Listen for online event
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncIncidents);
}
