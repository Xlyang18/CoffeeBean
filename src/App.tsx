import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import PurchasedBeans from "@/pages/PurchasedBeans";
import WishlistBeans from "@/pages/WishlistBeans";
import AddBean from "@/pages/AddBean";
import Settings from "@/pages/Settings";
import Navigation from "@/components/Navigation";
import { useState } from "react";

export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 侧边导航 - 桌面端显示 */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <Navigation />
      </aside>
      
      {/* 移动端导航按钮 */}
      <button 
        className="md:hidden fixed bottom-4 right-4 p-3 bg-amber-600 text-white rounded-full shadow-lg z-20"
        onClick={() => setIsNavOpen(!isNavOpen)}
      >
        <i className="fa-solid fa-bars"></i>
      </button>
      
      {/* 移动端侧边导航 */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-300 ${isNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`absolute top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-end p-4">
            <button onClick={() => setIsNavOpen(false)}>
              <i className="fa-solid fa-times text-gray-500 dark:text-gray-400"></i>
            </button>
          </div>
          <Navigation mobile />
        </div>
      </div>
      
      {/* 主内容区域 */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/purchased" element={<PurchasedBeans />} />
            <Route path="/wishlist" element={<WishlistBeans />} />
            <Route path="/add-purchased" element={<AddBean />} />
            <Route path="/add-wishlist" element={<AddBean />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
