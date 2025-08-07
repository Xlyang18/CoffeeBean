import { CoffeeBean, Settings } from '@/types';

// 计算两个日期之间的天数差
export const getDaysDifference = (date1: Date, date2: Date = new Date()): number => {
  const oneDay = 24 * 60 * 60 * 1000; // 毫秒数
  const diffTime = date2.getTime() - date1.getTime();
  return Math.ceil(diffTime / oneDay);
};

// 计算养豆期状态
export const getRestPeriodStatus = (bean: CoffeeBean, settings: Settings): {
  isCompleted: boolean;
  daysRemaining: number;
  daysElapsed: number;
} => {
  if (!bean.roastDate) {
    return { isCompleted: false, daysRemaining: 0, daysElapsed: 0 };
  }
  
  const daysElapsed = getDaysDifference(bean.roastDate);
  const daysRemaining = Math.max(0, settings.restPeriodDays - daysElapsed);
  
  return {
    isCompleted: daysElapsed >= settings.restPeriodDays,
    daysRemaining,
    daysElapsed
  };
};

// 计算最佳赏味期状态
export const getBestTastePeriodStatus = (bean: CoffeeBean, settings: Settings): {
  isExpired: boolean;
  daysRemaining: number;
  daysElapsed: number;
  totalDays: number;
} => {
  if (!bean.roastDate) {
    return { isExpired: false, daysRemaining: 0, daysElapsed: 0, totalDays: 60 };
  }
  
  // 最佳赏味期从养豆期结束后开始，持续60天
  const restPeriodEndDate = new Date(bean.roastDate);
  restPeriodEndDate.setDate(restPeriodEndDate.getDate() + settings.restPeriodDays);
  
  const daysElapsed = getDaysDifference(restPeriodEndDate);
  const totalDays = 60; // 最佳赏味期为2个月(约60天)
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  
  return {
    isExpired: daysElapsed > totalDays,
    daysRemaining,
    daysElapsed,
    totalDays
  };
};

// 格式化日期为本地字符串
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
};

// 计算咖啡豆状态文本
export const getBeanStatusText = (bean: CoffeeBean, settings: Settings): string => {
  if (!bean.roastDate) return "未设置烘焙日期";
  
  const restStatus = getRestPeriodStatus(bean, settings);
  
  if (!restStatus.isCompleted) {
    return `养豆期: ${restStatus.daysRemaining}天剩余`;
  }
  
  const tasteStatus = getBestTastePeriodStatus(bean, settings);
  
  if (tasteStatus.isExpired) {
    return "已过最佳赏味期";
  }
  
  return `最佳赏味期: ${tasteStatus.daysRemaining}天剩余`;
};