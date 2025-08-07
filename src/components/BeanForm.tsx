import { useState } from 'react';
import { CoffeeBean } from '@/types';
import { coffeeBeanService } from '@/services/storage';
import { toast } from 'sonner';
import { formatDate } from '@/utils/dateCalculations';

interface BeanFormProps {
  type: 'purchased' | 'wishlist';
  onSubmit: () => void;
  initialData?: CoffeeBean;
}

export default function BeanForm({ type, onSubmit, initialData }: BeanFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    price: initialData?.price.toString() || '',
    weight: initialData?.weight.toString() || '',
    flavorProfile: initialData?.flavorProfile.length ? [...initialData.flavorProfile] : [''],
    roastDate: initialData?.roastDate ? formatDate(initialData.roastDate).split('/').reverse().join('-') : '',
    notes: initialData?.notes || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 处理风味标签变化
  const handleFlavorChange = (index: number, value: string) => {
    const newFlavors = [...formData.flavorProfile];
    newFlavors[index] = value;
    setFormData(prev => ({
      ...prev,
      flavorProfile: newFlavors
    }));
  };
  
  // 添加新的风味标签输入
  const addFlavorInput = () => {
    setFormData(prev => ({
      ...prev,
      flavorProfile: [...prev.flavorProfile, '']
    }));
  };
  
  // 移除风味标签输入
  const removeFlavorInput = (index: number) => {
    if (formData.flavorProfile.length <= 1) return;
    
    const newFlavors = formData.flavorProfile.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      flavorProfile: newFlavors
    }));
  };
  
  // 验证表单
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('请输入咖啡豆名称');
      return false;
    }
    
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      toast.error('请输入有效的价格');
      return false;
    }
    
    if (!formData.weight || isNaN(parseInt(formData.weight)) || parseInt(formData.weight) <= 0) {
      toast.error('请输入有效的克重');
      return false;
    }
    
    if (type === 'purchased' && !formData.roastDate) {
      toast.error('请选择烘焙日期');
      return false;
    }
    
    const nonEmptyFlavors = formData.flavorProfile.filter(f => f.trim() !== '');
    if (nonEmptyFlavors.length === 0) {
      toast.error('请至少输入一种风味');
      return false;
    }
    
    return true;
  };
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // 准备要保存的数据
      const beanData: Partial<CoffeeBean> = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        weight: parseInt(formData.weight),
        flavorProfile: formData.flavorProfile.filter(f => f.trim() !== ''),
        notes: formData.notes.trim()
      };
      
      // 如果是已购买的咖啡豆，添加烘焙日期
      if (type === 'purchased' && formData.roastDate) {
        beanData.roastDate = new Date(formData.roastDate);
        
        // 如果是新添加的购买豆，设置购买日期
        if (!initialData) {
          beanData.purchaseDate = new Date();
        }
      }
      
      // 如果有初始数据，执行更新操作，否则执行添加操作
      if (initialData) {
        await coffeeBeanService.update(initialData.id, beanData as CoffeeBean);
      } else {
        const newBeanData: Omit<CoffeeBean, 'id' | 'createdAt' | 'updatedAt'> = {
          ...(beanData as Omit<CoffeeBean, 'id' | 'createdAt' | 'updatedAt'>),
          type,
        };
        
        if (type === 'purchased' && formData.roastDate) {
          newBeanData.roastDate = new Date(formData.roastDate);
          newBeanData.purchaseDate = new Date();
        }
        
        await coffeeBeanService.add(newBeanData);
      }
      
      // 通知成功并调用回调
      toast.success(initialData 
        ? `${formData.name.trim()} 已更新` 
        : `${type === 'purchased' ? '咖啡豆已添加' : '愿望已添加到愿望单'}`);
      onSubmit();
    } catch (error) {
      toast.error('保存失败，请重试');
      console.error('Error saving coffee bean:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
          咖啡豆名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="例如：埃塞俄比亚耶加雪菲"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-all"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
            价格 (元) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-all"
            required
          />
        </div>
        
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
            克重 (g) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            min="1"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-all"
            required
          />
        </div>
        
        {type === 'purchased' && (
          <div className="md:col-span-2">
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
              烘焙日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="roastDate"
              value={formData.roastDate}
              onChange={handleChange}
              max={formatDate(new Date()).split('/').reverse().join('-')} // 今天及以前
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-all"
              required
            />
          </div>
        )}
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
            风味取向 <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={addFlavorInput}
            className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors"
          >
            <i className="fa-solid fa-plus-circle mr-1"></i> 添加风味
          </button>
        </div>
        
        <div className="space-y-2">
          {formData.flavorProfile.map((flavor, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={flavor}
                onChange={(e) => handleFlavorChange(index, e.target.value)}
                placeholder={`风味 ${index + 1}`}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-all"
              />
              {formData.flavorProfile.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFlavorInput(index)}
                  className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          例如：柑橘、巧克力、花香、坚果、焦糖等
        </p>
      </div>
      
      <div>
        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
          备注 (可选)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          placeholder="添加关于这款咖啡豆的备注信息..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-all"
        ></textarea>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-70 text-base"
      >
        {isSubmitting ? (
          <span><i className="fa-solid fa-spinner fa-spin mr-2"></i> 保存中...</span>
        ) : (
          <span><i className={`fa-solid ${initialData ? 'fa-save' : type === 'purchased' ? 'fa-plus-circle' : 'fa-heart'} mr-2`}></i>
            {initialData ? '保存修改' : type === 'purchased' ? '添加咖啡豆' : '添加到愿望单'}
          </span>
        )}
      </button>
    </form>
  );
}