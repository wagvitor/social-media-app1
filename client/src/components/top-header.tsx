import { Button } from "@/components/ui/button";
import { Bell, Menu, Plus } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

interface TopHeaderProps {
  title: string;
  onCreateClick?: () => void;
  onMenuClick?: () => void;
}

export function TopHeader({ title, onCreateClick, onMenuClick }: TopHeaderProps) {
  const { t } = useI18n();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          </div>
          <div className="flex items-center space-x-4">
            {onCreateClick && (
              <Button onClick={onCreateClick} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>{t('createPost')}</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
