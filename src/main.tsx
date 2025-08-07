import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import App from "./App.tsx";
import "./index.css";
import { settingsService } from './services/storage';

// 应用初始化组件，处理数据自动导入
function AppInitializer() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 尝试自动导入数据
        const imported = await settingsService.autoImportData();
        if (imported) {
          toast.success('数据已自动导入');
        } else {
          console.log('未找到可导入的数据或用户取消了导入');
        }
      } catch (error) {
        console.error('初始化错误:', error);
        toast.error('初始化时发生错误');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg mb-4">
            <i className="fa-solid fa-coffee text-4xl text-amber-600 animate-pulse"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">正在初始化应用</h2>
          <p className="text-gray-600 dark:text-gray-400">正在加载您的咖啡豆数据...</p>
        </div>
      </div>
    );
  }
  
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppInitializer />
      <Toaster />
    </BrowserRouter>
  </StrictMode>
);
