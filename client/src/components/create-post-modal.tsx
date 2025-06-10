import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { CalendarIcon, Upload, Smile, Hash, X, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const createPostSchema = z.object({
  title: z.string().optional(),
  content: z.record(z.string()).refine(
    (content) => Object.keys(content).length > 0,
    "At least one language is required"
  ),
  platforms: z.array(z.string()).min(1, "At least one platform is required"),
  scheduleType: z.enum(["now", "schedule"]),
  scheduledAt: z.date().optional(),
  timezone: z.string().optional(),
  requireApproval: z.boolean().default(false),
  approverId: z.number().optional(),
});

type CreatePostForm = z.infer<typeof createPostSchema>;

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
  const { t, getCurrentLanguage, getLanguageOptions } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([getCurrentLanguage()]);
  const [activeLanguage, setActiveLanguage] = useState(getCurrentLanguage());

  const { data: platforms } = useQuery({
    queryKey: ["/api/social-platforms"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const form = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: { [getCurrentLanguage()]: "" },
      platforms: [],
      scheduleType: "now",
      requireApproval: false,
      timezone: "UTC-8",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostForm) => {
      const postData = {
        title: data.title,
        content: data.content,
        platforms: data.platforms,
        status: data.scheduleType === "now" ? "published" : "scheduled",
        scheduledAt: data.scheduleType === "schedule" ? data.scheduledAt : undefined,
        approvalStatus: data.requireApproval ? "pending" : "approved",
        approverId: data.requireApproval ? data.approverId : undefined,
      };

      return await apiRequest("POST", "/api/posts", postData);
    },
    onSuccess: () => {
      toast({
        title: t('success'),
        description: "Post created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      onOpenChange(false);
      form.reset();
      setSelectedLanguages([getCurrentLanguage()]);
      setActiveLanguage(getCurrentLanguage());
    },
    onError: () => {
      toast({
        title: t('error'),
        description: "Failed to create post",
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

  const removeLanguage = (langCode: string) => {
    if (selectedLanguages.length > 1) {
      setSelectedLanguages(selectedLanguages.filter(lang => lang !== langCode));
      const currentContent = form.getValues("content");
      const newContent = { ...currentContent };
      delete newContent[langCode];
      form.setValue("content", newContent);
      
      if (activeLanguage === langCode) {
        setActiveLanguage(selectedLanguages.filter(lang => lang !== langCode)[0]);
      }
    }
  };

  const updateContent = (langCode: string, content: string) => {
    const currentContent = form.getValues("content");
    form.setValue("content", { ...currentContent, [langCode]: content });
  };

  const getCharacterCount = () => {
    const content = form.getValues("content")[activeLanguage] || "";
    return content.length;
  };

  const getCharacterLimit = () => {
    const selectedPlatforms = form.getValues("platforms");
    if (selectedPlatforms.includes("twitter")) return 280;
    if (selectedPlatforms.includes("tiktok")) return 150;
    if (selectedPlatforms.includes("pinterest")) return 500;
    return 2000;
  };

  const onSubmit = (data: CreatePostForm) => {
    createPostMutation.mutate(data);
  };

  const languageOptions = getLanguageOptions();
  const connectedPlatforms = platforms?.filter((p: any) => p.isConnected) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{t('createPost')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Content Creation */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">Title (Optional)</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Post title..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">{t('content')}</Label>
                
                {/* Language Selector */}
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  {selectedLanguages.map((langCode) => {
                    const lang = languageOptions.find(l => l.code === langCode);
                    return (
                      <Badge
                        key={langCode}
                        variant={activeLanguage === langCode ? "default" : "secondary"}
                        className="cursor-pointer flex items-center gap-1"
                        onClick={() => setActiveLanguage(langCode)}
                      >
                        {lang?.flag} {lang?.name}
                        {selectedLanguages.length > 1 && (
                          <X 
                            className="h-3 w-3 ml-1 cursor-pointer" 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeLanguage(langCode);
                            }}
                          />
                        )}
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
                  placeholder={`What's happening? (${activeLanguage.toUpperCase()})`}
                  value={form.getValues("content")[activeLanguage] || ""}
                  onChange={(e) => updateContent(activeLanguage, e.target.value)}
                  className="resize-none"
                />
                
                <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                  <span>
                    {getCharacterLimit() - getCharacterCount()} characters remaining
                  </span>
                  <div className="flex space-x-4">
                    <Button type="button" variant="ghost" size="sm">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm">
                      <Hash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">{t('media')}</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mt-2">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Drag and drop images or click to upload</p>
                  <input type="file" className="hidden" multiple accept="image/*,video/*" />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">{t('platforms')}</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {connectedPlatforms.map((platform: any) => (
                    <label
                      key={platform.id}
                      className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <Checkbox
                        value={platform.name}
                        onCheckedChange={(checked) => {
                          const current = form.getValues("platforms");
                          if (checked) {
                            form.setValue("platforms", [...current, platform.name]);
                          } else {
                            form.setValue("platforms", current.filter(p => p !== platform.name));
                          }
                        }}
                      />
                      <i className={`${platform.icon} ml-3 mr-2 text-lg`}></i>
                      <span className="text-sm font-medium">{platform.displayName}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview & Scheduling */}
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium">{t('preview')}</Label>
                <div className="space-y-4 mt-2">
                  {form.getValues("platforms").includes("twitter") && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <i className="fab fa-twitter text-blue-400 text-sm"></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">Your Company</span>
                            <span className="text-gray-500 text-sm">@yourcompany</span>
                          </div>
                          <p className="text-sm mt-1">
                            {form.getValues("content")[activeLanguage] || "Your content will appear here..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {form.getValues("platforms").includes("linkedin") && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <i className="fab fa-linkedin text-blue-600 text-sm"></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">Your Company</span>
                          </div>
                          <p className="text-sm mt-1">
                            {form.getValues("content")[activeLanguage] || "Your content will appear here..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {form.getValues("platforms").includes("tiktok") && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-black text-white">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <i className="fab fa-tiktok text-black text-sm"></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">@yourcompany</span>
                            <span className="text-gray-300 text-xs">• Following</span>
                          </div>
                          <p className="text-sm mt-1">
                            {form.getValues("content")[activeLanguage] || "Your content will appear here..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {form.getValues("platforms").includes("pinterest") && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                          <i className="fab fa-pinterest text-white text-sm"></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">Your Company</span>
                          </div>
                          <p className="text-sm mt-1">
                            {form.getValues("content")[activeLanguage] || "Your content will appear here..."}
                          </p>
                          <div className="mt-2 text-xs text-gray-500">📌 Pin to board</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">{t('schedule')}</Label>
                <RadioGroup
                  value={form.getValues("scheduleType")}
                  onValueChange={(value: "now" | "schedule") => form.setValue("scheduleType", value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="now" id="now" />
                    <Label htmlFor="now" className="text-sm">{t('postNow')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="schedule" id="schedule" />
                    <Label htmlFor="schedule" className="text-sm">Schedule</Label>
                  </div>
                </RadioGroup>

                {form.watch("scheduleType") === "schedule" && (
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-medium">Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !form.getValues("scheduledAt") && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {form.getValues("scheduledAt") ? (
                                format(form.getValues("scheduledAt")!, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={form.getValues("scheduledAt")}
                              onSelect={(date) => form.setValue("scheduledAt", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Time</Label>
                        <Input
                          type="time"
                          onChange={(e) => {
                            const currentDate = form.getValues("scheduledAt") || new Date();
                            const [hours, minutes] = e.target.value.split(":");
                            const newDate = new Date(currentDate);
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            form.setValue("scheduledAt", newDate);
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Timezone</Label>
                      <Select 
                        value={form.getValues("timezone")} 
                        onValueChange={(value) => form.setValue("timezone", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC-8">UTC-8 (Pacific Time)</SelectItem>
                          <SelectItem value="UTC-5">UTC-5 (Eastern Time)</SelectItem>
                          <SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
                          <SelectItem value="UTC+1">UTC+1 (CET)</SelectItem>
                          <SelectItem value="UTC+9">UTC+9 (JST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Team Review</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={form.getValues("requireApproval")}
                      onCheckedChange={(checked) => form.setValue("requireApproval", !!checked)}
                    />
                    <Label className="text-sm">{t('requireApproval')}</Label>
                  </div>
                  {form.watch("requireApproval") && (
                    <Select 
                      value={form.getValues("approverId")?.toString()} 
                      onValueChange={(value) => form.setValue("approverId", parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select approver" />
                      </SelectTrigger>
                      <SelectContent>
                        {users?.filter((user: any) => user.role === "admin" || user.role === "manager").map((user: any) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="button" variant="outline">
              {t('saveAsDraft')}
            </Button>
            <Button 
              type="submit" 
              disabled={createPostMutation.isPending}
              className="min-w-[120px]"
            >
              {createPostMutation.isPending ? t('loading') : t('schedulePost')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
