import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoffeeBean, Settings } from '@/types';
import { coffeeBeanService, settingsService } from '@/services/storage';
import BeanCard from '@/components/BeanCard';
import { toast } from 'sonner';
import { Empty } from '@/components/Empty';

export default function WishlistBeans() {
  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [settings, setSettings] = useState<Settings>(settingsService.get());
  
  // 加载愿望单咖啡豆
  useEffect(() => {
    const loadBeans = async () => {
      try {
        const wishlistBeans = await coffeeBeanService.getWishlist();
        // 按添加日期排序，最新的在前
        wishlistBeans.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setBeans(wishlistBeans);
        setSettings(await settingsService.get());
      } catch (error) {
        toast.error('加载愿望单数据失败，请重试');
        console.error('Error loading wishlist:', error);
      }
    };
    
    loadBeans();
  }, []);
  
  // 处理删除或移动到已购买
  const handleRemove = async (id: string) => {
    try {
      await coffeeBeanService.delete(id);
      const updatedBeans = beans.filter(bean => bean.id !== id);
      setBeans(updatedBeans);
    } catch (error) {
      toast.error('操作失败，请重试');
      console.error('Error removing bean:', error);
    }
  };
  
  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">咖啡豆愿望单</h1>
        <Link
          to="/add-wishlist"
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <i className="fa-solid fa-plus mr-1"></i> 添加愿望
        </Link>
      </header>
      
      {beans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beans.map(bean => (
            <BeanCard
              key={bean.id}
              bean={bean}
              settings={settings}
              onDelete={handleRemove}
              onMoveToPurchased={handleRemove}
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
            <i className="fa-solid fa-heart text-4xl text-gray-400"></i>
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">您的愿望单还是空的</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">添加您想要尝试的咖啡豆到愿望单，方便日后参考</p>
          <Link
            to="/add-wishlist"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-plus mr-2"></i> 添加愿望
          </Link>
        </div>
      )}
    </div>
  );
}