import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TopHeader } from "@/components/top-header";
import { CreatePostModal } from "@/components/create-post-modal";
import { useI18n } from "@/hooks/use-i18n";
import { Calendar, CheckCircle, Eye, Users, BarChart, FolderOpen, CalendarPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Activity, AnalyticsOverview, TeamPerformance, Post, SocialPlatform } from "@/types";

export default function Dashboard() {
  const { t } = useI18n();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: overview } = useQuery<AnalyticsOverview>({
    queryKey: ["/api/analytics/overview"],
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: todaysPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts/today"],
  });

  const { data: platforms } = useQuery<SocialPlatform[]>({
    queryKey: ["/api/social-platforms"],
  });

  const { data: teamPerformance } = useQuery<TeamPerformance[]>({
    queryKey: ["/api/analytics/team-performance"],
  });

  const stats = [
    {
      name: t('scheduledPosts'),
      value: overview?.scheduledPosts || 0,
      icon: Calendar,
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: t('publishedToday'),
      value: overview?.publishedToday || 0,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      name: t('totalReach'),
      value: overview?.totalReach || "0",
      icon: Eye,
      color: "bg-purple-100 text-purple-600",
    },
    {
      name: t('teamMembers'),
      value: overview?.teamMembers || 0,
      icon: Users,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const quickActions = [
    {
      name: t('bulkSchedule'),
      icon: CalendarPlus,
      action: () => console.log("Bulk schedule"),
    },
    {
      name: t('useTemplate'),
      icon: FolderOpen,
      action: () => console.log("Use template"),
    },
    {
      name: t('viewAnalytics'),
      icon: BarChart,
      action: () => console.log("View analytics"),
    },
  ];

  const getStatusBadge = (status: string, approvalStatus?: string) => {
    if (approvalStatus === "pending") {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{t('pending')}</Badge>;
    }
    if (approvalStatus === "approved") {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">{t('approved')}</Badge>;
    }
    if (status === "scheduled") {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">{t('scheduled')}</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
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

  return (
    <div className="flex-1 overflow-y-auto">
      <TopHeader 
        title={t('dashboard')} 
        onCreateClick={() => setCreateModalOpen(true)} 
      />
      
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                        <dd className="text-lg font-semibold text-gray-900">{stat.value}</dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity & Schedule */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>{t('recentActivity')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {activities?.map((activity, index) => (
                      <li key={activity.id} className={index !== activities.length - 1 ? "pb-8" : ""}>
                        <div className="relative">
                          <div className="relative flex space-x-3">
                            <div>
                              <img 
                                className="h-8 w-8 rounded-full object-cover" 
                                src={activity.user?.avatar || "https://via.placeholder.com/32"} 
                                alt={activity.user?.name || "User"} 
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm text-gray-500">
                                <span className="font-medium text-gray-900">{activity.user?.name}</span> {activity.description}
                              </div>
                              <div className="mt-1 text-sm text-gray-500">
                                <time>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</time>
                              </div>
                            </div>
                            {activity.metadata?.platform && (
                              <div className="flex space-x-1">
                                <i className={getPlatformIcon(activity.metadata.platform)}></i>
                              </div>
                            )}
                            {activity.metadata?.platforms && (
                              <div className="flex space-x-1">
                                {activity.metadata.platforms.map((platform: string) => (
                                  <i key={platform} className={getPlatformIcon(platform)}></i>
                                ))}
                              </div>
                            )}
                          </div>
                          {index !== activities.length - 1 && (
                            <div className="absolute top-0 left-0 w-0.5 h-full bg-gray-200 ml-4"></div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('todaysSchedule')}</CardTitle>
                <Button variant="ghost" size="sm">{t('viewAll')}</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaysPosts?.map((post) => (
                    <div key={post.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{post.title || "Untitled Post"}</p>
                          <span className="text-xs text-gray-500">
                            {post.scheduledAt ? new Date(post.scheduledAt).toLocaleTimeString() : ""}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center space-x-2">
                          {post.platforms.map((platform) => (
                            <i key={platform} className={`${getPlatformIcon(platform)} text-sm`}></i>
                          ))}
                          <span className="text-xs text-gray-500">
                            {Object.keys(post.content).join(", ").toUpperCase()}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                          {Object.values(post.content)[0]?.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(post.status, post.approvalStatus)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('quickActions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.name}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={action.action}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {action.name}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Connected Platforms */}
            <Card>
              <CardHeader>
                <CardTitle>{t('connectedPlatforms')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {platforms?.map((platform) => (
                  <div key={platform.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <i className={`${platform.icon} text-lg`}></i>
                      <span className="text-sm font-medium">{platform.displayName}</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={platform.isConnected ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                    >
                      {platform.isConnected ? t('connected') : t('pending')}
                    </Badge>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full text-left justify-start p-0">
                  + {t('addPlatform')}
                </Button>
              </CardContent>
            </Card>

            {/* Team Performance */}
            <Card>
              <CardHeader>
                <CardTitle>{t('teamPerformance')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamPerformance?.map((member) => (
                  <div key={member.user.id} className="flex items-center space-x-3">
                    <img 
                      className="h-8 w-8 rounded-full object-cover" 
                      src={member.user.avatar || "https://via.placeholder.com/32"} 
                      alt={member.user.name} 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={member.completion} className="flex-1 h-2" />
                        <span className="text-xs text-gray-500">{member.posts} posts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <CreatePostModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
}
