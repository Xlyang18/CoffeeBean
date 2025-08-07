import { CoffeeBean, Settings } from '@/types';

// 计算可制作的咖啡杯数
export const calculateCups = (bean: CoffeeBean, settings: Settings): number => {
  if (settings.gramsPerBrew <= 0) return 0;
  return Math.floor(bean.weight / settings.gramsPerBrew);
};

// 计算每杯咖啡的成本
export const calculateCostPerCup = (bean: CoffeeBean, settings: Settings): number => {
  const cups = calculateCups(bean, settings);
  if (cups <= 0) return 0;
  return bean.price / cups;
};

// 计算咖啡豆剩余克数
export const calculateRemainingGrams = (
  bean: CoffeeBean, 
  settings: Settings, 
  cupsUsed: number = 0
): number => {
  const usedGrams = cupsUsed * settings.gramsPerBrew;
  return Math.max(0, bean.weight - usedGrams);
};

// 计算剩余可制作杯数
export const calculateRemainingCups = (
  bean: CoffeeBean, 
  settings: Settings, 
  cupsUsed: number = 0
): number => {
  const remainingGrams = calculateRemainingGrams(bean, settings, cupsUsed);
  return Math.floor(remainingGrams / settings.gramsPerBrew);
};