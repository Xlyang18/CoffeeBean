import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavigationProps {
  mobile?: boolean;
}

export default function Navigation({ mobile = false }: NavigationProps) {
  return (
    <nav className={cn({
      "flex flex-col p-4": true,
      "space-y-1": mobile,
      "space-y-2": !mobile
    })}>
      <div className="mb-8 px-4">
         <h1 className="text-xl font-bold text-amber-800 dark:text-amber-400">咖啡豆管理</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">您的咖啡豆管理助手</p>
      </div>
      
      <NavLink
        to="/"
        className={({ isActive }) => cn(
          "flex items-center px-4 py-3 rounded-lg transition-colors",
          isActive 
            ? "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 font-medium" 
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
        )}
      >
        <i className="fa-solid fa-home w-5 h-5 mr-3"></i>
        <span>首页</span>
      </NavLink>
      
      <NavLink
        to="/purchased"
        className={({ isActive }) => cn(
          "flex items-center px-4 py-3 rounded-lg transition-colors",
          isActive 
            ? "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 font-medium" 
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
        )}
      >
        <i className="fa-solid fa-coffee w-5 h-5 mr-3"></i>
        <span>我的豆子</span>
      </NavLink>
      
      <NavLink
        to="/wishlist"
        className={({ isActive }) => cn(
          "flex items-center px-4 py-3 rounded-lg transition-colors",
          isActive 
            ? "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 font-medium" 
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
        )}
      >
        <i className="fa-solid fa-list w-5 h-5 mr-3"></i>
        <span>愿望单</span>
      </NavLink>
      
      <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
      
      <NavLink
        to="/add-purchased"
        className="flex items-center px-4 py-3 rounded-lg text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
      >
        <i className="fa-solid fa-plus-circle w-5 h-5 mr-3"></i>
        <span>添加咖啡豆</span>
      </NavLink>
      
      <NavLink
        to="/add-wishlist"
        className="flex items-center px-4 py-3 rounded-lg text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      >
        <i className="fa-solid fa-list-plus w-5 h-5 mr-3"></i>
        <span>添加愿望</span>
      </NavLink>
      
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            "flex items-center px-4 py-3 rounded-lg transition-colors",
            isActive 
              ? "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 font-medium" 
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
          )}
        >
          <i className="fa-solid fa-cog w-5 h-5 mr-3"></i>
          <span>设置</span>
        </NavLink>
      </div>
    </nav>
  );
}