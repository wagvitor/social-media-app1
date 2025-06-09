import { TopHeader } from "@/components/top-header";
import { CreatePostModal } from "@/components/create-post-modal";
import { useI18n } from "@/hooks/use-i18n";
import { useState } from "react";

export default function CreateContent() {
  const { t } = useI18n();
  const [createModalOpen, setCreateModalOpen] = useState(true);

  return (
    <div className="flex-1 overflow-y-auto">
      <TopHeader title={t('createContent')} />
      
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Click the create button to start creating content.</p>
        </div>
      </main>

      <CreatePostModal 
        open={createModalOpen} 
        onOpenChange={(open) => {
          setCreateModalOpen(open);
          if (!open) {
            // Navigate back to dashboard when modal closes
            window.history.back();
          }
        }} 
      />
    </div>
  );
}
