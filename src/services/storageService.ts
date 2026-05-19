
import { Product, ActivityLog } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'serene_products',
  ACTIVITIES: 'serene_activities',
  MODE: 'serene_persistence_mode'
};

export type PersistenceMode = 'cloud' | 'local';

export const storageService = {
  setMode(mode: PersistenceMode) {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
  },

  getMode(): PersistenceMode {
    return (localStorage.getItem(STORAGE_KEYS.MODE) as PersistenceMode) || 'cloud';
  },

  // Local Storage Methods
  getLocalProducts(): Product[] {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },

  setLocalProducts(products: Product[]) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getLocalActivities(): ActivityLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return data ? JSON.parse(data) : [];
  },

  setLocalActivities(activities: ActivityLog[]) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  },

  // Export/Import
  exportData(customProducts?: Product[], customActivities?: ActivityLog[]) {
    console.log('--- EXPORT START ---');
    try {
      const products = customProducts || this.getLocalProducts();
      const activities = customActivities || this.getLocalActivities();

      if (!products || products.length === 0) {
        alert('当前没有产品数据可以导出。');
        return;
      }

      const data = {
        products,
        activities,
        exportedAt: new Date().toISOString(),
        version: '1.1',
        mode: customProducts ? 'cloud_snapshot' : 'local'
      };
      
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `serene_plants_backup_${new Date().toLocaleDateString()}.json`);
      
      // Force append to body to ensure clickability in all browsers
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 1000);
      
      console.log('--- EXPORT LINK CLICKED ---');
    } catch (err) {
      console.error('Export logic failed:', err);
      alert('导出脚本运行出错，请尝试在电脑浏览器中打开。');
    }
  },

  async importData(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.products) {
            this.setLocalProducts(data.products);
            if (data.activities) this.setLocalActivities(data.activities);
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (err) {
          console.error('Import failed', err);
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  }
};
