import { db } from '../lib/supabase';
import { ActivityLog, LandscapeShowcaseConfig, Product } from '../types';

export const supabaseService = {
  async getProducts(): Promise<Product[]> {
    return db.products.get();
  },

  async subscribeToProducts(callback: (products: Product[]) => void) {
    return db.products.subscribe(callback);
  },

  async saveProduct(product: Product): Promise<void> {
    await db.products.save(product);
  },

  async deleteProduct(id: string): Promise<void> {
    await db.products.delete(id);
  },

  async getActivities(): Promise<ActivityLog[]> {
    return db.activities.get();
  },

  async subscribeToActivities(callback: (activities: ActivityLog[]) => void) {
    return db.activities.subscribe(callback);
  },

  async addActivity(activity: ActivityLog): Promise<void> {
    await db.activities.add(activity);
  },

  async getLandscapeShowcases(): Promise<LandscapeShowcaseConfig[]> {
    return db.landscapeShowcase.getAll();
  },

  async saveLandscapeShowcase(config: LandscapeShowcaseConfig): Promise<void> {
    await db.landscapeShowcase.save(config);
  },

  async deleteLandscapeShowcase(id: string): Promise<void> {
    await db.landscapeShowcase.delete(id);
  },

  async subscribeToLandscapeShowcase(callback: (configs: LandscapeShowcaseConfig[]) => void) {
    return db.landscapeShowcase.subscribe(callback);
  },

  async exportData() {
    const products = await db.products.get();
    const activities = await db.activities.get();

    return {
      products,
      activities,
      exportedAt: new Date().toISOString(),
    };
  },
};
