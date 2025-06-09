import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopHeader } from "@/components/top-header";
import { useI18n } from "@/hooks/use-i18n";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Eye, Heart, Share2, MessageCircle } from "lucide-react";
import type { AnalyticsOverview, TeamPerformance } from "@/types";

export default function Analytics() {
  const { t } = useI18n();

  const { data: overview } = useQuery<AnalyticsOverview>({
    queryKey: ["/api/analytics/overview"],
  });

  const { data: teamPerformance } = useQuery<TeamPerformance[]>({
    queryKey: ["/api/analytics/team-performance"],
  });

  // Mock analytics data
  const weeklyEngagement = [
    { day: 'Mon', likes: 120, shares: 45, comments: 32 },
    { day: 'Tue', likes: 180, shares: 67, comments: 28 },
    { day: 'Wed', likes: 145, shares: 52, comments: 41 },
    { day: 'Thu', likes: 220, shares: 78, comments: 35 },
    { day: 'Fri', likes: 195, shares: 65, comments: 29 },
    { day: 'Sat', likes: 167, shares: 48, comments: 33 },
    { day: 'Sun', likes: 134, shares: 42, comments: 26 },
  ];

  const platformData = [
    { name: 'Twitter', value: 35, color: '#1DA1F2' },
    { name: 'LinkedIn', value: 28, color: '#0077B5' },
    { name: 'Facebook', value: 22, color: '#1877F2' },
    { name: 'Instagram', value: 15, color: '#E4405F' },
  ];

  const monthlyGrowth = [
    { month: 'Jan', followers: 1200, engagement: 85 },
    { month: 'Feb', followers: 1350, engagement: 92 },
    { month: 'Mar', followers: 1480, engagement: 88 },
    { month: 'Apr', followers: 1620, engagement: 95 },
    { month: 'May', followers: 1780, engagement: 102 },
    { month: 'Jun', followers: 1950, engagement: 98 },
  ];

  const topPosts = [
    {
      id: 1,
      title: "Remote Work Best Practices",
      platform: "LinkedIn",
      engagement: 1240,
      reach: 5600,
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "New Product Launch 🚀",
      platform: "Twitter",
      engagement: 890,
      reach: 3200,
      date: "2024-01-14",
    },
    {
      id: 3,
      title: "Team Collaboration Tips",
      platform: "Facebook",
      engagement: 670,
      reach: 2800,
      date: "2024-01-13",
    },
  ];

  const metrics = [
    {
      name: "Total Reach",
      value: "45.2K",
      change: "+12.3%",
      icon: Eye,
      color: "text-blue-600",
    },
    {
      name: "Engagement Rate",
      value: "4.8%",
      change: "+0.8%",
      icon: Heart,
      color: "text-red-600",
    },
    {
      name: "Shares",
      value: "1.2K",
      change: "+18.5%",
      icon: Share2,
      color: "text-green-600",
    },
    {
      name: "Comments",
      value: "432",
      change: "+5.2%",
      icon: MessageCircle,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <TopHeader title={t('analytics')} />
      
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {metric.change}
                      </p>
                    </div>
                    <Icon className={`w-8 h-8 ${metric.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyEngagement}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="likes" fill="#3B82F6" />
                  <Bar dataKey="shares" fill="#10B981" />
                  <Bar dataKey="comments" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Platform Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Monthly Growth */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="followers" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPosts.map((post, index) => (
                  <div key={post.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {post.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{post.platform}</p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-sm font-medium text-gray-900">{post.engagement}</p>
                        <p className="text-xs text-gray-500">engagements</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Performance */}
        {teamPerformance && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{t('teamPerformance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamPerformance.map((member) => (
                  <div key={member.user.id} className="text-center p-4 border border-gray-200 rounded-lg">
                    <img
                      className="h-16 w-16 rounded-full mx-auto object-cover"
                      src={member.user.avatar || "https://via.placeholder.com/64"}
                      alt={member.user.name}
                    />
                    <h3 className="mt-3 text-sm font-medium text-gray-900">{member.user.name}</h3>
                    <p className="text-xs text-gray-500">{member.user.role}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{member.posts}</p>
                        <p className="text-xs text-gray-500">Posts</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{member.completion}%</p>
                        <p className="text-xs text-gray-500">Success Rate</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
