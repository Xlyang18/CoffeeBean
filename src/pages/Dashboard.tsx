import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CoffeeBean, CoffeeStats, Settings } from '@/types';
import { coffeeBeanService, settingsService } from '@/services/storage';
import { calculateCups, calculateCostPerCup } from '@/utils/brewCalculations';
import { getRestPeriodStatus, getBestTastePeriodStatus } from '@/utils/dateCalculations';
import StatsCard from '@/components/StatsCard';
import BeanCard from '@/components/BeanCard';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [purchasedBeans, setPurchasedBeans] = useState<CoffeeBean[]>([]);
  const [wishlistBeans, setWishlistBeans] = useState<CoffeeBean[]>([]);
  const [settings, setSettings] = useState<Settings>(settingsService.get());
  const [stats, setStats] = useState<CoffeeStats>({
    totalPurchased: 0,
    totalWishlist: 0,
    totalCost: 0,
    remainingCups: 0,
    beansInRestPeriod: 0,
    beansInBestPeriod: 0
  });
  const [flavorData, setFlavorData] = useState<{ name: string; value: number }[]>([]);
  
  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const purchased = await coffeeBeanService.getPurchased();
        const wishlist = await coffeeBeanService.getWishlist();
        const currentSettings = await settingsService.get();
        
        setPurchasedBeans(purchased);
        setWishlistBeans(wishlist);
        setSettings(currentSettings);
        
        // 计算统计数据
        calculateStats(purchased, currentSettings);
        // 计算风味分布数据
        calculateFlavorDistribution(purchased);
      } catch (error) {
        toast.error('加载数据失败，请刷新页面重试');
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);
  
  // 计算统计数据
  const calculateStats = (beans: CoffeeBean[], settings: Settings) => {
    const totalPurchased = beans.length;
    const totalWishlist = wishlistBeans.length;
    const totalCost = beans.reduce((sum, bean) => sum + bean.price, 0);
    let remainingCups = 0;
    let beansInRestPeriod = 0;
    let beansInBestPeriod = 0;
    
    beans.forEach(bean => {
      // 计算剩余杯数
      remainingCups += calculateCups(bean, settings);
      
      // 计算养豆期和最佳赏味期状态
      if (bean.roastDate) {
        const restStatus = getRestPeriodStatus(bean, settings);
        if (!restStatus.isCompleted) {
          beansInRestPeriod++;
        } else {
          const tasteStatus = getBestTastePeriodStatus(bean, settings);
          if (!tasteStatus.isExpired) {
            beansInBestPeriod++;
          }
        }
      }
    });
    
    setStats({
      totalPurchased,
      totalWishlist,
      totalCost,
      remainingCups,
      beansInRestPeriod,
      beansInBestPeriod
    });
  };
  
  // 计算风味分布数据
  const calculateFlavorDistribution = (beans: CoffeeBean[]) => {
    const flavorCount: Record<string, number> = {};
    
    beans.forEach(bean => {
      if (bean.flavorProfile && bean.flavorProfile.length > 0) {
        bean.flavorProfile.forEach(flavor => {
          flavorCount[flavor] = (flavorCount[flavor] || 0) + 1;
        });
      }
    });
    
    // 转换为图表所需格式并按数量排序
    const data = Object.entries(flavorCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // 只取前5种风味
    
    setFlavorData(data);
  };
  
  // 删除咖啡豆
  const handleDelete = async (id: string) => {
    try {
      await coffeeBeanService.delete(id);
      const updatedPurchased = purchasedBeans.filter(bean => bean.id !== id);
      const updatedWishlist = wishlistBeans.filter(bean => bean.id !== id);
      
      setPurchasedBeans(updatedPurchased);
      setWishlistBeans(updatedWishlist);
      
      // 重新计算统计数据
      calculateStats(updatedPurchased, settings);
      calculateFlavorDistribution(updatedPurchased);
    } catch (error) {
      toast.error('删除咖啡豆失败，请重试');
      console.error('Error deleting bean:', error);
    }
  };
  
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CoffeeBean</h1>
        <p className="text-gray-600 dark:text-gray-400">您的咖啡豆管理助手</p>
      </header>
      
      {/* 快捷操作 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          to="/add-purchased"
          className="bg-amber-600 hover:bg-amber-700 text-white p-6 rounded-xl transition-colors flex items-center justify-center"
        >
          <i className="fa-solid fa-plus-circle text-3xl mr-4"></i>
          <span className="text-lg">添加咖啡豆</span>
        </Link>
        
        <Link
          to="/add-wishlist"
          className="bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl transition-colors flex items-center justify-center"
        >
          <i className="fa-solid fa-list-plus text-3xl mr-4"></i>
          <span className="text-lg">添加愿望单</span>
        </Link>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="总咖啡豆"
          value={stats.totalPurchased}
          description="已购买的咖啡豆数量"
          icon={<i className="fa-solid fa-coffee"></i>}
        />
        
        <StatsCard
          title="剩余杯数"
          value={stats.remainingCups}
          description="按当前设置可制作"
          icon={<i className="fa-solid fa-mug-hot"></i>}
        />
        
        <StatsCard
          title="总花费"
          value={`¥${stats.totalCost.toFixed(2)}`}
          description="在咖啡豆上的投资"
          icon={<i className="fa-solid fa-yen-sign"></i>}
        />
        
        <StatsCard
          title="愿望单"
          value={stats.totalWishlist}
          description="计划购买的咖啡豆"
          icon={<i className="fa-solid fa-heart"></i>}
        />
      </div>
      
      {/* 图表和数据区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 风味分布图表 */}
        {flavorData.length > 0 && (
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">风味分布</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flavorData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    formatter={(value) => [`${value} 种`, '咖啡豆数量']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* 咖啡豆状态统计 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">咖啡豆状态</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">养豆期中</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{stats.beansInRestPeriod}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${stats.beansInRestPeriod / Math.max(1, stats.totalPurchased) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">最佳赏味期</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">{stats.beansInBestPeriod}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${stats.beansInBestPeriod / Math.max(1, stats.totalPurchased) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">已过赏味期</span>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {Math.max(0, stats.totalPurchased - stats.beansInRestPeriod - stats.beansInBestPeriod)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-red-600 h-2.5 rounded-full" 
                  style={{ width: `${Math.max(0, stats.totalPurchased - stats.beansInRestPeriod - stats.beansInBestPeriod) / Math.max(1, stats.totalPurchased) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 最近添加的咖啡豆和愿望单预览 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 最近添加的咖啡豆 */}
        {purchasedBeans.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">最近的咖啡豆</h2>
              <Link to="/purchased" className="text-amber-600 dark:text-amber-400 hover:underline">
                查看全部
              </Link>
            </div>
            
            <div className="space-y-4">
              {purchasedBeans.slice(0, 3).map(bean => (
               <BeanCard
                  key={bean.id}
                  bean={bean}
                  settings={settings}
                  onDelete={handleDelete}
                  onUpdate={(updatedBean) => {
                    const updatedPurchased = purchasedBeans.map(b => b.id === updatedBean.id ? updatedBean : b);
                    setPurchasedBeans(updatedPurchased);
                    calculateStats(updatedPurchased, settings);
                    calculateFlavorDistribution(updatedPurchased);
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* 愿望单预览 */}
        {wishlistBeans.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">愿望单</h2>
              <Link to="/wishlist" className="text-amber-600 dark:text-amber-400 hover:underline">
                查看全部
              </Link>
            </div>
            
            <div className="space-y-4">
              {wishlistBeans.slice(0, 3).map(bean => (
               <BeanCard
                  key={bean.id}
                  bean={bean}
                  settings={settings}
                  onDelete={handleDelete}
                  onMoveToPurchased={handleDelete}
                  onUpdate={(updatedBean) => {
                    const updatedWishlist = wishlistBeans.map(b => b.id === updatedBean.id ? updatedBean : b);
                    setWishlistBeans(updatedWishlist);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}