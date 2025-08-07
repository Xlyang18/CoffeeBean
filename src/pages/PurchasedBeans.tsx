import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoffeeBean, Settings } from '@/types';
import { coffeeBeanService, settingsService } from '@/services/storage';
import BeanCard from '@/components/BeanCard';
import { toast } from 'sonner';
import { Empty } from '@/components/Empty';

export default function PurchasedBeans() {
  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [settings, setSettings] = useState<Settings>(settingsService.get());
  
  // 加载已购买的咖啡豆
  useEffect(() => {
    const loadBeans = async () => {
      try {
        const purchasedBeans = await coffeeBeanService.getPurchased();
        // 按烘焙日期排序，最新的在前
        purchasedBeans.sort((a, b) => {
          if (!a.roastDate) return 1;
          if (!b.roastDate) return -1;
          return b.roastDate.getTime() - a.roastDate.getTime();
        });
        setBeans(purchasedBeans);
        setSettings(await settingsService.get());
      } catch (error) {
        toast.error('加载咖啡豆数据失败，请重试');
        console.error('Error loading beans:', error);
      }
    };
    
    loadBeans();
  }, []);
  
  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      await coffeeBeanService.delete(id);
      const updatedBeans = beans.filter(bean => bean.id !== id);
      setBeans(updatedBeans);
    } catch (error) {
      toast.error('删除咖啡豆失败，请重试');
      console.error('Error deleting bean:', error);
    }
  };
  
  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">已购买咖啡豆</h1>
        <Link
          to="/add-purchased"
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <i className="fa-solid fa-plus mr-1"></i> 添加咖啡豆
        </Link>
      </header>
      
      {beans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beans.map(bean => (
            <BeanCard
              key={bean.id}
              bean={bean}
              settings={settings}
              onDelete={handleDelete}
              onUpdate={(updatedBean) => {
                const updatedBeans = beans.map(b => b.id === updatedBean.id ? updatedBean : b);
                setBeans(updatedBeans);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
            <i className="fa-solid fa-coffee text-4xl text-gray-400"></i>
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">您还没有添加任何咖啡豆</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">开始添加您的第一份咖啡豆，追踪养豆期和最佳赏味时间</p>
          <Link
            to="/add-purchased"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-plus mr-2"></i> 添加咖啡豆
          </Link>
        </div>
      )}
    </div>
  );
}