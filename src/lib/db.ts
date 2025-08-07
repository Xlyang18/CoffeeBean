// 本地数据存储服务（使用IndexedDB实现持久化存储）
class IndexedDB {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;
  
  constructor(dbName: string = 'coffee_bean_db', version: number = 1) {
    this.dbName = dbName;
    this.version = version;
    this.initDB();
  }
  
  // 初始化数据库
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        // 创建对象存储空间
        if (!db.objectStoreNames.contains('coffee_beans')) {
          db.createObjectStore('coffee_beans', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = request.result;
        this.initDefaults();
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('IndexedDB initialization error:', request.error);
        reject(request.error);
      };
    });
  }
  
  // 获取数据库连接
  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    await this.initDB();
    if (!this.db) throw new Error('Failed to initialize IndexedDB');
    return this.db;
  }
  
  // 初始化默认设置
  async initDefaults(): Promise<void> {
    const settings = await this.getAll('settings');
    if (settings.length === 0) {
      await this.add('settings', {
        gramsPerBrew: 15,
        restPeriodDays: 7
      });
    }
  }
  
  // 获取所有数据
  async getAll<T>(table: string): Promise<T[]> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(table, 'readonly');
      const store = transaction.objectStore(table);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result.map(this.parseDates));
      };
      
      request.onerror = () => {
        console.error('Error getting all items:', request.error);
        resolve([]);
      };
    });
  }
  
  // 获取单条数据
  async getById<T>(table: string, id: string): Promise<T | null> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(table, 'readonly');
      const store = transaction.objectStore(table);
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result ? this.parseDates(request.result) : null);
      };
      
      request.onerror = () => {
        console.error('Error getting item by id:', request.error);
        resolve(null);
      };
    });
  }
  
  // 添加数据
  async add<T>(table: string, item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const now = new Date();
      const newItem = {
         ...item,
         id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
         createdAt: now.toISOString(),
         updatedAt: now.toISOString()
      } as T;
      
      const transaction = db.transaction(table, 'readwrite');
      const store = transaction.objectStore(table);
      const request = store.add(newItem);
      
      request.onsuccess = () => {
        // 自动导出数据备份
        this.autoExportData();
        resolve(newItem);
      };
      
      request.onerror = () => {
        console.error('Error adding item:', request.error);
        throw request.error;
      };
    });
  }
  
  // 更新数据
  async update<T>(table: string, id: string, updates: Partial<T>): Promise<T | null> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(table, 'readwrite');
      const store = transaction.objectStore(table);
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (!item) {
          resolve(null);
          return;
        }
        
        const updatedItem = {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString()
        } as T;
        
        const updateRequest = store.put(updatedItem);
        
        updateRequest.onsuccess = () => {
          // 自动导出数据备份
          this.autoExportData();
          resolve(updatedItem);
        };
        
        updateRequest.onerror = () => {
          console.error('Error updating item:', updateRequest.error);
          resolve(null);
        };
      };
      
      getRequest.onerror = () => {
        console.error('Error getting item for update:', getRequest.error);
        resolve(null);
      };
    });
  }
  
  // 删除数据
  async delete(table: string, id: string): Promise<boolean> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(table, 'readwrite');
      const store = transaction.objectStore(table);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        // 自动导出数据备份
        this.autoExportData();
        resolve(true);
      };
      
      request.onerror = () => {
        console.error('Error deleting item:', request.error);
        resolve(false);
      };
    });
  }
  
  // 转换日期字符串为Date对象
  private parseDates(item: any): any {
    if (item.createdAt) item.createdAt = new Date(item.createdAt);
    if (item.updatedAt) item.updatedAt = new Date(item.updatedAt);
    if (item.roastDate) item.roastDate = new Date(item.roastDate);
    if (item.purchaseDate) item.purchaseDate = new Date(item.purchaseDate);
    return item;
  }
  
  // 导出所有数据
  async exportAllData(): Promise<string> {
    const coffeeBeans = await this.getAll('coffee_beans');
    const settings = await this.getAll('settings');
    
    const exportData = {
      coffeeBeans,
      settings,
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  // 自动导出数据到文件
  async autoExportData(): Promise<void> {
    try {
      const data = await this.exportAllData();
      // 保存到下载文件夹
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // 使用File System Access API尝试保存到指定位置（如果浏览器支持）
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: `coffee_beans_backup_${new Date().toISOString().split('T')[0]}.json`,
            types: [{
              description: 'JSON Files',
              accept: { 'application/json': ['.json'] },
            }],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          console.log('Data automatically saved to file system');
        } catch (error) {
          console.log('User canceled file save or browser does not support File System Access API');
          // 回退到常规下载
          this.downloadFile(blob);
        }
      } else {
        // 浏览器不支持File System Access API，使用常规下载
        this.downloadFile(blob);
      }
    } catch (error) {
      console.error('Error in auto-export:', error);
    }
  }
  
  // 下载文件辅助函数
  private downloadFile(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coffee_beans_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  // 导入数据
  async importAllData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      const db = await this.getDB();
      
      if (data.coffeeBeans && Array.isArray(data.coffeeBeans)) {
        const transaction = db.transaction('coffee_beans', 'readwrite');
        const store = transaction.objectStore('coffee_beans');
        
        // 先清空现有数据
        await store.clear();
        
        // 添加新数据
        for (const bean of data.coffeeBeans) {
          store.add(bean);
        }
      }
      
      if (data.settings && Array.isArray(data.settings) && data.settings.length > 0) {
        const transaction = db.transaction('settings', 'readwrite');
        const store = transaction.objectStore('settings');
        
        // 先清空现有数据
        await store.clear();
        
        // 添加新数据
        for (const setting of data.settings) {
          store.add(setting);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// 创建数据库实例
const db = new IndexedDB();

export default db;