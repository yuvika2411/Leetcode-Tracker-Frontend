import { useEffect, useState } from 'react';
import { Loader2, Trophy, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { StudentService } from '../services/endpoints';
import type { StudentExtendedDTO, AssignmentDTO } from '@/types';

// Import our highly modular components
import { ProfileStats } from '../components/dashboard/student/ProfileStats';
import { ActivityHeatmap } from '../components/dashboard/student/ActivityHeatmap';
import { PendingAssignments } from '../components/dashboard/student/PendingAssignments';
import { ClassroomList } from '../components/dashboard/student/ClassroomList';
import { BadgesList } from '../components/dashboard/student/BadgesList';
import { StudentRightSidebar } from '../components/dashboard/student/StudentRightSidebar';
import { ThemeToggle } from "@/components/ui/ThemeToggle.tsx";

export function StudentDashboard() {
    const { logout } = useAuth();
    const [dashboardData, setDashboardData] = useState<StudentExtendedDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);

    const fetchDashboard = async () => {
        try {
            const response = await StudentService.getDashboard();
            setDashboardData(response.data);
        } catch (err) { console.error('Failed to load dashboard', err); }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        void fetchDashboard();
    }, []);

    const handleSync = async () => {
        if (!dashboardData?.leetcodeUsername) return;
        setIsSyncing(true);
        try {
            const response = await StudentService.syncProfile(dashboardData.leetcodeUsername);
            setDashboardData(response.data);
        } catch (err) {
            console.log(err);
            alert("Failed to sync with LeetCode.");
        }
        finally { setIsSyncing(false); }
    };

    const isAssignmentCompleted = (assignment: AssignmentDTO) => {
        if (dashboardData?.manuallyCompletedAssignments?.includes(assignment.id)) return true;
        return !!dashboardData?.recentSubmissions?.some(sub =>
            sub.titleSlug === assignment.titleSlug &&
            sub.timestamp >= assignment.startTimestamp &&
            sub.timestamp <= assignment.endTimestamp
        );
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-500" />
                    <p className="font-medium text-slate-500 dark:text-slate-400">Decrypting LeetCode stats...</p>
                </div>
            </div>
        );
    }

    // Calculations
    const easyCount = dashboardData?.problemStats?.find(s => s.difficulty === 'Easy')?.count || 0;
    const medCount = dashboardData?.problemStats?.find(s => s.difficulty === 'Medium')?.count || 0;
    const hardCount = dashboardData?.problemStats?.find(s => s.difficulty === 'Hard')?.count || 0;
    const totalSolved = (easyCount + medCount + hardCount) || 1;
    const rating = Math.round(dashboardData?.currentContestRating || 0);

    // Filters
    const pendingAssignments: { classroomId: string, className: string, assignment: AssignmentDTO }[] = [];
    dashboardData?.classrooms?.forEach(cls => {
        if (selectedClassroomId && cls.id !== selectedClassroomId) return;
        cls.assignments?.forEach(assignment => {
            if (!isAssignmentCompleted(assignment)) {
                pendingAssignments.push({ classroomId: cls.id!, className: cls.className, assignment });
            }
        });
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 transition-colors duration-200">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#2563eb] p-2 rounded-lg"><Trophy className="w-5 h-5 text-white" /></div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">LeetTracker</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle/>
                        <div className="flex items-center gap-3">
                            <Avatar className="border border-slate-200 dark:border-slate-700">
                                <AvatarImage src={dashboardData?.avatarUrl} />
                                <AvatarFallback className="bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 font-bold">{dashboardData?.name?.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{dashboardData?.name}</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">@{dashboardData?.leetcodeUsername}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={logout} className="hover:bg-red-50 dark:hover:bg-rose-500/10 hover:text-red-600 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400">
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* 1. Profile Banner */}
                <ProfileStats data={dashboardData} totalSolved={totalSolved} rating={rating} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">

                        {/* 2. Heatmap */}
                        <ActivityHeatmap progressHistory={dashboardData?.progressHistory} />

                        {/* 3. Assignments */}
                        <PendingAssignments
                            assignments={pendingAssignments}
                            isSyncing={isSyncing}
                            onSync={handleSync}
                            selectedClassroomId={selectedClassroomId}
                            onClearFilter={() => setSelectedClassroomId(null)}
                        />

                        {/* 4. Classrooms */}
                        <ClassroomList
                            classrooms={dashboardData?.classrooms}
                            selectedClassroomId={selectedClassroomId}
                            onSelectClassroom={setSelectedClassroomId}
                        />
                    </div>

                    <div className="space-y-8">
                        {/* 5. Right Sidebar Elements */}
                        <StudentRightSidebar data={dashboardData} totalSolved={totalSolved} />
                        <BadgesList badges={dashboardData?.badges} />
                    </div>
                </div>
            </main>
        </div>
    );
}