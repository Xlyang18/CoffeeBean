import { CoffeeBean, Settings } from '@/types';
import db from '@/lib/db';

// 转换日期字符串为 Date 对象
const parseDates = (item: any): any => {
  if (item.createdAt) item.createdAt = new Date(item.createdAt);
  if (item.updatedAt) item.updatedAt = new Date(item.updatedAt);
  if (item.roastDate) item.roastDate = new Date(item.roastDate);
  if (item.purchaseDate) item.purchaseDate = new Date(item.purchaseDate);
  return item;
};

// 咖啡豆数据服务
export const coffeeBeanService = {
  // 获取所有咖啡豆
  getAll: async (): Promise<CoffeeBean[]> => {
    return db.getAll<CoffeeBean>('coffee_beans');
  },
  
  // 获取已购买的咖啡豆
  getPurchased: async (): Promise<CoffeeBean[]> => {
    const beans = await coffeeBeanService.getAll();
    return beans.filter(bean => bean.type === 'purchased');
  },
  
  // 获取愿望单咖啡豆
  getWishlist: async (): Promise<CoffeeBean[]> => {
    const beans = await coffeeBeanService.getAll();
    return beans.filter(bean => bean.type === 'wishlist');
  },
  
  // 获取单个咖啡豆
  getById: async (id: string): Promise<CoffeeBean | null> => {
    return db.getById<CoffeeBean>('coffee_beans', id);
  },
  
  // 添加咖啡豆
  add: async (bean: Omit<CoffeeBean, 'id' | 'createdAt' | 'updatedAt'>): Promise<CoffeeBean> => {
    return db.add<CoffeeBean>('coffee_beans', bean);
  },
  
  // 更新咖啡豆
  update: async (id: string, updates: Partial<CoffeeBean>): Promise<CoffeeBean | null> => {
    return db.update<CoffeeBean>('coffee_beans', id, updates);
  },
  
  // 将愿望单咖啡豆转为已购买
  moveToPurchased: async (id: string, purchaseDate: Date = new Date()): Promise<CoffeeBean | null> => {
    return coffeeBeanService.update(id, {
      type: 'purchased',
      purchaseDate: purchaseDate.toISOString()
    });
  },
  
  // 删除咖啡豆
  delete: async (id: string): Promise<boolean> => {
    return db.delete('coffee_beans', id);
  }
};

// 设置存储服务
export const settingsService = {
  // 获取设置
  get: async (): Promise<Settings> => {
    const settingsList = await db.getAll<Settings>('settings');
    return settingsList.length > 0 ? settingsList[0] : {
      gramsPerBrew: 15,
      restPeriodDays: 7
    };
  },
  
  // 保存设置
  save: async (settings: Partial<Settings>): Promise<Settings> => {
    const currentSettings = await settingsService.get();
    const settingsList = await db.getAll<Settings>('settings');
    
    const updatedSettings = { ...currentSettings, ...settings };
    
    if (settingsList.length > 0) {
      await db.update<Settings>('settings', settingsList[0].id, updatedSettings);
    } else {
      await db.add<Settings>('settings', updatedSettings);
    }
    
    return updatedSettings;
  },
  
  // 导出所有数据
  exportAllData: async (): Promise<string> => {
    return db.exportAllData();
  },

  // 自动导出数据到文件
  autoExportData: async (): Promise<void> => {
    return db.autoExportData();
  },

  // 导入所有数据
  importAllData: async (jsonData: string): Promise<boolean> => {
    return db.importAllData(jsonData);
  },
  
  // 自动导入数据
  autoImportData: async (): Promise<boolean> => {
    try {
      // 使用File System Access API尝试打开最近的备份文件
      if ('showOpenFilePicker' in window) {
        try {
          const [handle] = await (window as any).showOpenFilePicker({
            types: [{
              description: 'JSON Files',
              accept: { 'application/json': ['.json'] },
            }],
            startIn: 'downloads',
          });
          const file = await handle.getFile();
          const contents = await file.text();
          return await db.importAllData(contents);
        } catch (error) {
          console.log('User canceled file selection or no file selected');
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error in auto-import:', error);
      return false;
    }
  }
}