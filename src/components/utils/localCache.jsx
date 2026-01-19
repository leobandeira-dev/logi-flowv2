// Sistema de cache local otimizado para PWA - Módulo Armazém
const DB_NAME = 'LogFlowCache';
const DB_VERSION = 1;

// Stores por módulo
const STORES = {
  NOTAS_FISCAIS: 'notas_fiscais',
  VOLUMES: 'volumes',
  ETIQUETAS_MAE: 'etiquetas_mae',
  ORDENS: 'ordens',
  MOTORISTAS: 'motoristas',
  VEICULOS: 'veiculos',
  PARCEIROS: 'parceiros'
};

// TTL padrão: 5 minutos para dados críticos do armazém
const DEFAULT_TTL = 5 * 60 * 1000;

class LocalCache {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Criar stores se não existirem
        Object.values(STORES).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('key', 'key', { unique: true });
          }
        });
      };
    });
  }

  async ensureDB() {
    if (!this.db) {
      await this.initPromise;
    }
    return this.db;
  }

  async set(store, key, data, ttl = DEFAULT_TTL) {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);

      const record = {
        id: `${store}_${key}`,
        key,
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl
      };

      await objectStore.put(record);
      return true;
    } catch (error) {
      console.error('Erro ao salvar no cache:', error);
      return false;
    }
  }

  async get(store, key) {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const index = objectStore.index('key');

      return new Promise((resolve, reject) => {
        const request = index.get(key);
        request.onsuccess = () => {
          const record = request.result;
          
          // Verificar expiração
          if (!record || record.expiresAt < Date.now()) {
            resolve(null);
            return;
          }

          resolve(record.data);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Erro ao ler do cache:', error);
      return null;
    }
  }

  async getAll(store) {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);

      return new Promise((resolve, reject) => {
        const request = objectStore.getAll();
        request.onsuccess = () => {
          const records = request.result || [];
          const now = Date.now();
          
          // Filtrar expirados
          const validRecords = records
            .filter(r => r.expiresAt > now)
            .map(r => r.data);
          
          resolve(validRecords);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Erro ao ler todos do cache:', error);
      return [];
    }
  }

  async clear(store) {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      await objectStore.clear();
      return true;
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return false;
    }
  }

  async clearExpired() {
    try {
      const db = await this.ensureDB();
      const now = Date.now();

      for (const store of Object.values(STORES)) {
        const transaction = db.transaction([store], 'readwrite');
        const objectStore = transaction.objectStore(store);
        const request = objectStore.getAll();

        request.onsuccess = () => {
          const records = request.result || [];
          records.forEach(record => {
            if (record.expiresAt < now) {
              objectStore.delete(record.id);
            }
          });
        };
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao limpar expirados:', error);
      return false;
    }
  }
}

export const cache = new LocalCache();
export { STORES };