import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { TopHeader } from "@/components/top-header";
import { CreatePostModal } from "@/components/create-post-modal";
import { useI18n } from "@/hooks/use-i18n";
import { CalendarIcon, Clock, Edit, Trash2 } from "lucide-react";
import { format, isSameDay } from "date-fns";
import type { Post } from "@/types";

export default function Schedule() {
  const { t } = useI18n();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: scheduledPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts/scheduled"],
  });

  const postsForSelectedDate = scheduledPosts?.filter(post => 
    post.scheduledAt && isSameDay(new Date(post.scheduledAt), selectedDate)
  ) || [];

  const getStatusBadge = (status: string, approvalStatus?: string) => {
    if (approvalStatus === "pending") {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{t('pending')}</Badge>;
    }
    if (approvalStatus === "approved") {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">{t('approved')}</Badge>;
    }
    return <Badge variant="secondary">{t(status)}</Badge>;
  };

  const getPlatformIcon = (platform: string) => {
    const iconMap: Record<string, string> = {
      twitter: "fab fa-twitter text-blue-400",
      facebook: "fab fa-facebook text-blue-600",
      linkedin: "fab fa-linkedin text-blue-600",
      instagram: "fab fa-instagram text-pink-500",
      tiktok: "fab fa-tiktok text-black",
      pinterest: "fab fa-pinterest text-red-600",
    };
    return iconMap[platform] || "fas fa-share";
  };

  const getDatesWithPosts = () => {
    if (!scheduledPosts) return [];
    return scheduledPosts
      .filter(post => post.scheduledAt)
      .map(post => new Date(post.scheduledAt!));
  };

  const hasPostsOnDate = (date: Date) => {
    return getDatesWithPosts().some(postDate => isSameDay(postDate, date));
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <TopHeader 
        title={t('schedule')} 
        onCreateClick={() => setCreateModalOpen(true)} 
      />
      
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                {t('schedule')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                modifiers={{
                  hasPost: getDatesWithPosts(),
                }}
                modifiersStyles={{
                  hasPost: {
                    backgroundColor: 'hsl(207, 90%, 54%)',
                    color: 'white',
                    borderRadius: '50%',
                  },
                }}
              />
              
              <div className="mt-4 space-y-2">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    Days with scheduled posts
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {postsForSelectedDate.length} {postsForSelectedDate.length === 1 ? 'post' : 'posts'} scheduled
                </p>
              </CardHeader>
              <CardContent>
                {postsForSelectedDate.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No posts scheduled</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Schedule your first post for this date.
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setCreateModalOpen(true)}>
                        {t('createPost')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {postsForSelectedDate
                      .sort((a, b) => {
                        if (!a.scheduledAt || !b.scheduledAt) return 0;
                        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
                      })
                      .map((post) => (
                        <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {post.title || "Untitled Post"}
                                </h4>
                                <span className="text-sm text-gray-500">
                                  {post.scheduledAt ? format(new Date(post.scheduledAt), "h:mm a") : ""}
                                </span>
                                {getStatusBadge(post.status, post.approvalStatus)}
                              </div>
                              
                              <div className="mt-2 flex items-center space-x-2">
                                {post.platforms.map((platform) => (
                                  <i key={platform} className={`${getPlatformIcon(platform)} text-sm`}></i>
                                ))}
                                <span className="text-xs text-gray-500">
                                  {Object.keys(post.content).join(", ").toUpperCase()}
                                </span>
                              </div>
                              
                              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                {Object.values(post.content)[0]?.substring(0, 150)}...
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Bulk Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {t('bulkSchedule')}
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Edit className="mr-2 h-4 w-4" />
                    Bulk Edit
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Bulk Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <CreatePostModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
}
