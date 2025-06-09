import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TopHeader } from "@/components/top-header";
import { CreatePostModal } from "@/components/create-post-modal";
import { useI18n } from "@/hooks/use-i18n";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, FileText, Image, Video, Download, Eye, Edit, Trash2, Copy } from "lucide-react";
import type { Template } from "@/types";

const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  content: z.record(z.string()).refine(
    (content) => Object.keys(content).length > 0,
    "At least one language is required"
  ),
  category: z.string().optional(),
  isPublic: z.boolean().default(false),
});

type CreateTemplateForm = z.infer<typeof createTemplateSchema>;

export default function ContentLibrary() {
  const { t, getCurrentLanguage, getLanguageOptions } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([getCurrentLanguage()]);
  const [activeLanguage, setActiveLanguage] = useState(getCurrentLanguage());

  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const form = useForm<CreateTemplateForm>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      content: { [getCurrentLanguage()]: "" },
      category: "",
      isPublic: false,
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: CreateTemplateForm) => {
      return await apiRequest("POST", "/api/templates", data);
    },
    onSuccess: () => {
      toast({
        title: t('success'),
        description: "Template created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setTemplateModalOpen(false);
      form.reset();
      setSelectedLanguages([getCurrentLanguage()]);
      setActiveLanguage(getCurrentLanguage());
    },
    onError: () => {
      toast({
        title: t('error'),
        description: "Failed to create template",
        variant: "destructive",
      });
    },
  });

  const addLanguage = (langCode: string) => {
    if (!selectedLanguages.includes(langCode)) {
      setSelectedLanguages([...selectedLanguages, langCode]);
      const currentContent = form.getValues("content");
      form.setValue("content", { ...currentContent, [langCode]: "" });
    }
    setActiveLanguage(langCode);
  };

  const updateContent = (langCode: string, content: string) => {
    const currentContent = form.getValues("content");
    form.setValue("content", { ...currentContent, [langCode]: content });
  };

  const onSubmit = (data: CreateTemplateForm) => {
    createTemplateMutation.mutate(data);
  };

  const useTemplate = (template: Template) => {
    // This would typically open the create modal with pre-filled content
    setCreateModalOpen(true);
    toast({
      title: "Template Selected",
      description: `Using template: ${template.name}`,
    });
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "social", label: "Social Media" },
    { value: "marketing", label: "Marketing" },
    { value: "product", label: "Product Updates" },
    { value: "announcement", label: "Announcements" },
    { value: "event", label: "Events" },
  ];

  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const languageOptions = getLanguageOptions();

  // Mock media assets
  const mediaAssets = [
    { id: 1, name: "team-meeting.jpg", type: "image", size: "2.4 MB", url: "#" },
    { id: 2, name: "product-demo.mp4", type: "video", size: "15.7 MB", url: "#" },
    { id: 3, name: "company-logo.svg", type: "image", size: "45 KB", url: "#" },
    { id: 4, name: "webinar-recording.mp4", type: "video", size: "120 MB", url: "#" },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <TopHeader 
        title={t('contentLibrary')} 
        onCreateClick={() => setCreateModalOpen(true)} 
      />
      
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="media">Media Assets</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            {/* Templates Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 flex gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>

            {/* Templates Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-20 bg-gray-200 rounded mb-4"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery || selectedCategory !== "all" 
                      ? "Try adjusting your search criteria" 
                      : "Create your first template to get started"}
                  </p>
                  <Button onClick={() => setTemplateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {template.description || "No description provided"}
                          </p>
                        </div>
                        {template.isPublic && (
                          <Badge variant="secondary" className="ml-2">Public</Badge>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-2">Content Preview:</div>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 line-clamp-3">
                          {Object.values(template.content)[0] || "No content"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-1">
                          {Object.keys(template.content).map((lang) => {
                            const option = languageOptions.find(opt => opt.code === lang);
                            return (
                              <Badge key={lang} variant="outline" className="text-xs">
                                {option?.flag} {lang.toUpperCase()}
                              </Badge>
                            );
                          })}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => useTemplate(template)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Use
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            {/* Media Assets Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search media assets..." className="pl-10" />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mediaAssets.map((asset) => (
                <Card key={asset.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                      {asset.type === "image" ? (
                        <Image className="h-8 w-8 text-gray-400" />
                      ) : (
                        <Video className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <h4 className="font-medium text-sm text-gray-900 truncate mb-1">
                      {asset.name}
                    </h4>
                    <p className="text-xs text-gray-500 mb-3">{asset.size}</p>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        Use
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="drafts" className="space-y-6">
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts yet</h3>
                <p className="text-gray-500 mb-6">
                  Your saved drafts will appear here
                </p>
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Draft
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Template Modal */}
      <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Enter template name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => form.setValue("category", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                {...form.register("description")}
                placeholder="Describe what this template is for"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Content</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-4">
                {selectedLanguages.map((langCode) => {
                  const lang = languageOptions.find(l => l.code === langCode);
                  return (
                    <Badge
                      key={langCode}
                      variant={activeLanguage === langCode ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => setActiveLanguage(langCode)}
                    >
                      {lang?.flag} {lang?.name}
                    </Badge>
                  );
                })}
                <Select onValueChange={addLanguage}>
                  <SelectTrigger className="w-20 h-6 text-xs">
                    <SelectValue placeholder="+" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions
                      .filter(lang => !selectedLanguages.includes(lang.code))
                      .map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                rows={6}
                placeholder={`Template content (${activeLanguage.toUpperCase()})`}
                value={form.getValues("content")[activeLanguage] || ""}
                onChange={(e) => updateContent(activeLanguage, e.target.value)}
                className="resize-none"
              />
            </div>

            <div className="flex justify-between items-center pt-6 border-t">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  {...form.register("isPublic")}
                  className="rounded"
                />
                <Label htmlFor="isPublic" className="text-sm">
                  Make this template public for all team members
                </Label>
              </div>
              
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={() => setTemplateModalOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={createTemplateMutation.isPending}>
                  {createTemplateMutation.isPending ? t('loading') : 'Create Template'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <CreatePostModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
}
