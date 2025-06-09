import { Link, useLocation } from "wouter";
import { Share, BarChart3, Calendar, Plus, FolderOpen, Users, Gauge } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { LanguageSelector } from "./language-selector";
import { useQuery } from "@tanstack/react-query";

export function Sidebar() {
  const [location] = useLocation();
  const { t } = useI18n();

  const { data: user } = useQuery({
    queryKey: ["/api/users/me"],
  });

  const navigation = [
    { name: t('dashboard'), href: "/", icon: Gauge },
    { name: t('createContent'), href: "/create", icon: Plus },
    { name: t('schedule'), href: "/schedule", icon: Calendar },
    { name: t('analytics'), href: "/analytics", icon: BarChart3 },
    { name: t('contentLibrary'), href: "/library", icon: FolderOpen },
    { name: t('team'), href: "/team", icon: Users },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Share className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">SocialFlow</h1>
          </div>
        </div>
        
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={`${
                    isActive
                      ? "bg-blue-50 border-r-2 border-blue-500 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-l-md`}
                >
                  <Icon
                    className={`${
                      isActive ? "text-blue-400" : "text-gray-400"
                    } mr-3 h-5 w-5`}
                  />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </nav>
        
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3 w-full">
            <img 
              className="h-8 w-8 rounded-full object-cover" 
              src={user?.avatar || "https://via.placeholder.com/32"} 
              alt="Profile" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{user?.name || "Loading..."}</p>
              <p className="text-xs text-gray-500">{user?.role || ""}</p>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </div>
  );
}
