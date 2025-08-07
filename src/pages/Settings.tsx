import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from '@/types';
import { settingsService } from '@/services/storage';
import { toast } from 'sonner';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>({
    gramsPerBrew: 15,
    restPeriodDays: 7
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // 加载当前设置
  // 数据导出功能
  const handleExportData = () => {
    try {
      const data = settingsService.exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coffee_beans_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('数据导出成功');
    } catch (error) {
      toast.error('数据导出失败，请重试');
      console.error('Error exporting data:', error);
    }
  };

  // 数据导入功能
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = settingsService.importAllData(content);
        if (success) {
          toast.success('数据导入成功，页面将刷新');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          toast.error('数据导入失败，文件格式不正确');
        }
      } catch (error) {
        toast.error('数据导入失败，请检查文件格式');
        console.error('Error importing data:', error);
      }
    };
    reader.readAsText(file);
    // 清除input值，允许重复选择同一文件
    e.target.value = '';
  };
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const currentSettings = await settingsService.get();
        setSettings(currentSettings);
      } catch (error) {
        toast.error('加载设置失败，请重试');
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // 处理设置变更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: parseInt(value, 10) || 0
    }));
  };
  
  // 保存设置
  const handleSave = async () => {
    if (settings.gramsPerBrew <= 0 || settings.restPeriodDays <= 0) {
      toast.error('请输入有效的数值');
      return;
    }
    
    setIsSaving(true);
    
    try {
      await settingsService.save(settings);
      toast.success('设置已保存');
      navigate('/');
    } catch (error) {
      toast.error('保存失败，请重试');
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">设置</h1>
        <p className="text-gray-600 dark:text-gray-400">自定义您的咖啡豆管理偏好</p>
      </header>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 max-w-2xl">
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              每次冲泡咖啡消耗克数 (g)
            </label>
            <input
              type="number"
              name="gramsPerBrew"
              value={settings.gramsPerBrew}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              每杯咖啡使用的咖啡豆克数，用于计算可制作杯数和单杯成本
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              养豆期天数
            </label>
            <input
              type="number"
              name="restPeriodDays"
              value={settings.restPeriodDays}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              咖啡豆烘焙后需要养豆的天数，用于计算养豆状态
            </p>
          </div>
        </div>
         
         <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
           <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">数据管理</h3>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4 text-sm"> 
             <p className="text-green-800 dark:text-green-300 mb-2"><i className="fa-solid fa-check-circle mr-2"></i>高级数据存储已启用:</p>
              <ul className="list-disc pl-6 text-green-700 dark:text-green-400 space-y-1">
                <li>数据现在存储在IndexedDB中，提供更可靠的持久化存储</li>
                <li>每次数据变更时自动备份到您的下载文件夹</li>
                <li>应用启动时自动尝试导入最近的备份文件</li>
                <li>数据文件路径: 下载文件夹/coffee_beans_backup_日期.json</li>
               <li>您可以在设置中手动触发导入/导出操作</li>
             </ul>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <button
               onClick={handleExportData}
               className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-center"
             >
               <i className="fa-solid fa-download mr-2"></i> 导出数据
             </button>
              
             <label className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-center cursor-pointer">
               <i className="fa-solid fa-upload mr-2"></i> 导入数据
               <input
                 type="file"
                 accept=".json"
                 onChange={handleImportData}
                 className="hidden"
               />
             </label>
           </div>
           
           <div className="flex items-center">
             <input 
               type="checkbox" 
               id="autoExport" 
               className="mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
               defaultChecked={true}
             />
             <label htmlFor="autoExport" className="text-sm text-gray-700 dark:text-gray-300">
               数据变更时自动备份到浏览器存储
             </label>
           </div>
         </div>
         
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end mt-6">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-70"
          >
            {isSaving ? (
              <span><i className="fa-solid fa-spinner fa-spin mr-2"></i> 保存中...</span>
            ) : (
              <span><i className="fa-solid fa-save mr-2"></i> 保存设置</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}