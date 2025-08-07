import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BeanForm from '@/components/BeanForm';

// 添加咖啡豆页面，支持添加到已购买或愿望单
export default function AddBean() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 从路径判断是添加到已购买还是愿望单
  const isPurchased = location.pathname.includes('purchased');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 表单提交后的回调
  const handleSubmit = () => {
    setIsSubmitting(true);
    // 短暂延迟后返回列表页
    setTimeout(() => {
      navigate(isPurchased ? '/purchased' : '/wishlist');
    }, 500);
  };
  
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isPurchased ? '添加咖啡豆' : '添加到愿望单'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isPurchased 
            ? '记录您新购买的咖啡豆信息' 
            : '记录您想要购买的咖啡豆'}
        </p>
      </header>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 max-w-2xl">
        <BeanForm
          type={isPurchased ? 'purchased' : 'wishlist'}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}