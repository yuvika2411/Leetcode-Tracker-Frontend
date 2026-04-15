import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Users, BookOpen, ArrowLeft, Loader2, UserCheck, AlertTriangle } from 'lucide-react';
import { AdminService } from '@/services/endpoints';
import type { SystemOverviewDTO, MentorDTO, ClassroomDashboardDTO } from '@/types';
import axios from 'axios';

export function AdminOverview({ onBack }: { onBack: () => void }) {
    const [data, setData] = useState<SystemOverviewDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await AdminService.getOverview();
                setData(response.data);
            } catch (err) {
                console.error(err);
                setError(axios.isAxiosError(err) && err.response?.status === 403
                    ? "Access Denied: You must be a SUPER_ADMIN to view this data."
                    : "Failed to load system overview.");
            } finally {
                setIsLoading(false);
            }
        };
        void fetchAdminData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8">
                <Button variant="ghost" onClick={onBack} className="mb-6 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                </Button>
                <div className="flex flex-col items-center justify-center p-12 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl">
                    <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
                    <h2 className="text-xl font-bold text-rose-700 dark:text-rose-400 mb-2">Authorization Error</h2>
                    <p className="text-rose-600 dark:text-rose-300">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-in fade-in duration-300">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <Button variant="ghost" onClick={onBack} className="mb-2 -ml-4 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Return to Mentor View
                    </Button>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-indigo-500" /> System Administration
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Platform-wide overview and statistics.</p>
                </div>
            </div>

            {/* Top Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl"><Users className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Students</p>
                            <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">{data.totalStudents}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl"><UserCheck className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Mentors</p>
                            <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">{data.totalMentors}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-4 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl"><BookOpen className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Classrooms</p>
                            <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">{data.totalClassrooms}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* All Mentors List */}
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-zinc-400" /> Platform Mentors
                        </CardTitle>
                        <CardDescription className="dark:text-zinc-400">All registered instructors</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[400px]">
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {/* FIXED: Added explicit MentorDTO type */}
                                {data.allMentors.map((mentor: MentorDTO) => (
                                    <div key={mentor.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-700">
                                                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold">{mentor.name.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-zinc-900 dark:text-white">{mentor.name}</p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{mentor.email}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 border-transparent">
                                            {mentor.classroomIds?.length || 0} Classes
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* All Classrooms List */}
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-zinc-400" /> Global Classrooms
                        </CardTitle>
                        <CardDescription className="dark:text-zinc-400">All active classes across the platform</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[400px]">
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {/* FIXED: Added explicit ClassroomDashboardDTO type */}
                                {data.allClassrooms.map((cls: ClassroomDashboardDTO) => (
                                    <div key={cls.classroomId} className="p-4 flex flex-col gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-zinc-900 dark:text-white">{cls.className}</p>
                                            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20">
                                                {cls.enrolledStudents?.length || 0} Students
                                            </Badge>
                                        </div>
                                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Mentor: <span className="text-zinc-700 dark:text-zinc-300">{cls.mentorName}</span></p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}