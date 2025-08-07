import { useState } from 'react';
import { CoffeeBean, Settings } from '@/types';
import { getBeanStatusText, formatDate } from '@/utils/dateCalculations';
import { calculateCups, calculateCostPerCup } from '@/utils/brewCalculations';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { coffeeBeanService } from '@/services/storage';
import BeanForm from './BeanForm';

interface BeanCardProps {
  bean: CoffeeBean;
  settings: Settings;
  onDelete?: (id: string) => void;
  onMoveToPurchased?: (id: string) => void;
  onUpdate?: (bean: CoffeeBean) => void;
}

export default function BeanCard({ 
  bean, 
  settings, 
  onDelete,
  onMoveToPurchased,
  onUpdate
}: BeanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const statusText = getBeanStatusText(bean, settings);
  const cups = calculateCups(bean, settings);
  const costPerCup = calculateCostPerCup(bean, settings);
  
  // 确定状态标签的样式
  const getStatusBadgeClass = () => {
    if (!bean.roastDate) {
      return "bg-gray-200 text-gray-800";
    }
    
    if (statusText.includes("养豆期")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    } else if (statusText.includes("最佳赏味期")) {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    } else if (statusText.includes("已过")) {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    }
    return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };
  
  const handleMoveToPurchased = async () => {
    if (!onMoveToPurchased) return;
    
    try {
      const updated = await coffeeBeanService.moveToPurchased(bean.id);
      if (updated) {
        toast.success(`${bean.name} 已添加到我的豆子`);
        onMoveToPurchased(bean.id);
      }
    } catch (error) {
      toast.error('操作失败，请重试');
      console.error('Error moving to purchased:', error);
    }
  };
  
  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (window.confirm(`确定要删除 ${bean.name} 吗？`)) {
      try {
        const deleted = await coffeeBeanService.delete(bean.id);
        if (deleted) {
          toast.success(`${bean.name} 已删除`);
          onDelete(bean.id);
        }
      } catch (error) {
        toast.error('删除失败，请重试');
        console.error('Error deleting bean:', error);
      }
    }
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSubmitEdit = async () => {
    setIsEditing(false);
    toast.success(`${bean.name} 已更新`);
    if (onUpdate) {
      const updatedBean = await coffeeBeanService.getById(bean.id);
      if (updatedBean) onUpdate(updatedBean);
    }
  };
  
  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 transform hover:scale-[1.01]">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">编辑咖啡豆</h3>
            <button 
              onClick={() => setIsEditing(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
          <BeanForm 
            type={bean.type} 
            onSubmit={handleSubmitEdit} 
            initialData={bean} 
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 h-full flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{bean.name}</h3>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusBadgeClass()}`}>
            {statusText}
          </span>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-5">
           <div className="grid grid-cols-2 gap-4 text-base">
            <div className="text-gray-700 dark:text-gray-300 text-base">
              <span className="font-medium">价格:</span> ¥{bean.price.toFixed(2)}
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-base">
              <span className="font-medium">克重:</span> {bean.weight}g
            </div>
            {bean.type === 'purchased' && (
              <>
              <div className="text-gray-700 dark:text-gray-300 text-base">
                <span className="font-medium">杯数:</span> {cups}杯
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-base">
                <span className="font-medium">单杯成本:</span> ¥{costPerCup.toFixed(2)}
              </div>
              </>
            )}
          </div>
          
          {bean.roastDate && (
            <div className="text-gray-600 dark:text-gray-400 text-sm mt-3">
              <span className="font-medium">烘焙日期:</span> {formatDate(bean.roastDate)}
            </div>
          )}
        </div>
        
        {bean.flavorProfile && bean.flavorProfile.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">风味特点</h4>
            <div className="flex flex-wrap gap-2">
              {bean.flavorProfile.map((flavor, index) => (
                <span 
                  key={index} 
                  className="text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors"
                >
                  {flavor}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="px-6 pb-6 mt-auto">
        <div className="flex justify-end gap-3">
          <button 
            onClick={handleEdit}
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <i className="fa-solid fa-edit mr-2"></i> 编辑
          </button>
          
          {bean.type === 'wishlist' ? (
            <button 
              onClick={handleMoveToPurchased}
              className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <i className="fa-solid fa-arrow-right mr-2"></i> 加入我的豆子
            </button>
          ) : null}
          
          <button 
            onClick={handleDelete}
            className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <i className="fa-solid fa-trash mr-2"></i> 删除
          </button>
        </div>
      </div>
    </div>
  );
}