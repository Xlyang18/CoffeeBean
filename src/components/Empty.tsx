import { cn } from "@/lib/utils";

// Empty component
export function Empty({ message = "暂无数据" }: { message?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center")}>
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
        <i className="fa-solid fa-box-open text-4xl text-gray-400"></i>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{message}</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md">添加内容以开始使用此功能</p>
    </div>
  );
}