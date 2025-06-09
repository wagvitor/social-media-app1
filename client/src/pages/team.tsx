import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { TopHeader } from "@/components/top-header";
import { CreatePostModal } from "@/components/create-post-modal";
import { useI18n } from "@/hooks/use-i18n";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, UserPlus, Settings, MoreVertical, Mail, Clock, 
  CheckCircle, XCircle, AlertCircle, Calendar, BarChart3 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { User, TeamPerformance, Activity } from "@/types";

const inviteUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["member", "manager", "admin"]),
});

type InviteUserForm = z.infer<typeof inviteUserSchema>;

export default function Team() {
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);

  const { data: teamMembers } = useQuery({
    queryKey: ["/api/teams/1/members"],
  });

  const { data: teamPerformance } = useQuery<TeamPerformance[]>({
    queryKey: ["/api/analytics/team-performance"],
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const form = useForm<InviteUserForm>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      role: "member",
    },
  });

  const inviteUserMutation = useMutation({
    mutationFn: async (data: InviteUserForm) => {
      // Mock invitation - in real app would send email invitation
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast({
        title: t('success'),
        description: "Team member invitation sent successfully",
      });
      setInviteModalOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: t('error'),
        description: "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InviteUserForm) => {
    inviteUserMutation.mutate(data);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "inactive":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Mock data for pending invitations
  const pendingInvitations = [
    {
      id: 1,
      email: "john.doe@company.com",
      role: "member",
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: "pending"
    },
    {
      id: 2,
      email: "jane.smith@company.com",
      role: "manager",
      sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      status: "pending"
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <TopHeader 
        title={t('team')} 
        onCreateClick={() => setCreateModalOpen(true)} 
      />
      
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            {/* Members Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span className="text-lg font-medium">Team Members</span>
                  <Badge variant="secondary">{teamMembers?.length || 0}</Badge>
                </div>
              </div>
              
              <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers?.map((member: any) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.user.avatar} alt={member.user.name} />
                          <AvatarFallback>
                            {member.user.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-gray-900">{member.user.name}</h3>
                          <p className="text-sm text-gray-500">{member.user.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getRoleColor(member.role)}>
                          {member.role}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon("active")}
                          <span className="text-xs text-gray-500">Active</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <div className="flex items-center justify-between mb-1">
                          <span>Timezone</span>
                          <span>{member.user.timezone || "UTC"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Joined</span>
                          <span>{formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Mail className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="h-3 w-3 mr-1" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('teamPerformance')}</CardTitle>
              </CardHeader>
              <CardContent>
                {teamPerformance ? (
                  <div className="space-y-6">
                    {teamPerformance.map((member) => (
                      <div key={member.user.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.user.avatar} alt={member.user.name} />
                          <AvatarFallback>
                            {member.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{member.user.name}</h4>
                              <p className="text-sm text-gray-500">{member.user.role}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{member.completion}%</p>
                              <p className="text-xs text-gray-500">Success Rate</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <p className="font-medium text-gray-900">{member.posts}</p>
                              <p className="text-gray-500">Total Posts</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-gray-900">{member.published}</p>
                              <p className="text-gray-500">Published</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-gray-900">{member.posts - member.published}</p>
                              <p className="text-gray-500">Pending</p>
                            </div>
                          </div>
                          
                          <Progress value={member.completion} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No performance data</h3>
                    <p className="text-gray-500">Performance metrics will appear here once team members start creating content.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pending Invitations</CardTitle>
                <Button onClick={() => setInviteModalOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </CardHeader>
              <CardContent>
                {pendingInvitations.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending invitations</h3>
                    <p className="text-gray-500 mb-6">Invite team members to start collaborating.</p>
                    <Button onClick={() => setInviteModalOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Send First Invitation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingInvitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Mail className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{invitation.email}</p>
                            <p className="text-sm text-gray-500">
                              Invited {formatDistanceToNow(invitation.sentAt, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getRoleColor(invitation.role)}>
                            {invitation.role}
                          </Badge>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Pending
                          </Badge>
                          <Button variant="outline" size="sm">
                            Resend
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Default Timezone</Label>
                  <p className="text-sm text-gray-500 mb-3">Set the default timezone for new team members</p>
                  <Select defaultValue="UTC-8">
                    <SelectTrigger className="w-full max-w-sm">
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

                <div>
                  <Label className="text-base font-medium">Approval Workflow</Label>
                  <p className="text-sm text-gray-500 mb-3">Configure content approval requirements</p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="require-approval" className="rounded" defaultChecked />
                      <Label htmlFor="require-approval">Require approval for all posts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="auto-approve" className="rounded" />
                      <Label htmlFor="auto-approve">Auto-approve posts from managers</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Notification Settings</Label>
                  <p className="text-sm text-gray-500 mb-3">Configure team notification preferences</p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="new-member" className="rounded" defaultChecked />
                      <Label htmlFor="new-member">Notify when new members join</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="post-published" className="rounded" defaultChecked />
                      <Label htmlFor="post-published">Notify when posts are published</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="approval-needed" className="rounded" defaultChecked />
                      <Label htmlFor="approval-needed">Notify when approval is needed</Label>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Invite Member Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="colleague@company.com"
                className="mt-1"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value: "member" | "manager" | "admin") => form.setValue("role", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member - Can create and edit content</SelectItem>
                  <SelectItem value="manager">Manager - Can approve content and manage team</SelectItem>
                  <SelectItem value="admin">Admin - Full access to all features</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.role.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => setInviteModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={inviteUserMutation.isPending}>
                {inviteUserMutation.isPending ? t('loading') : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <CreatePostModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
}
