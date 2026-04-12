import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Loader2, ExternalLink, ArrowLeft, BrainCircuit, User as UserIcon, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { ScrollArea } from '../../ui/scroll-area';
import { StudentService } from '@/services/endpoints.ts';
import type { StudentExtendedDTO } from '@/types';

// Components
import { ProfileStats } from '../student/ProfileStats';
import { ActivityHeatmap } from '../student/ActivityHeatmap';
import { BadgesList } from '../student/BadgesList'; 

interface StudentDetailsViewProps {
    username: string;
    onBack: () => void;
}

export function StudentDetailsView({ username, onBack }: StudentDetailsViewProps) {
    const [data, setData] = useState<StudentExtendedDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentProfile = async () => {
            setLoading(true);
            try {
                const res = await StudentService.getExtendedProfile(username);
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch student details", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentProfile();
    }, [username]);

    // Data Calculations
    const easyStats = data?.problemStats?.find(s => s.difficulty === 'Easy') || { count: 0, beatsPercentage: 0 };
    const medStats = data?.problemStats?.find(s => s.difficulty === 'Medium') || { count: 0, beatsPercentage: 0 };
    const hardStats = data?.problemStats?.find(s => s.difficulty === 'Hard') || { count: 0, beatsPercentage: 0 };
    
    const easyCount = easyStats.count;
    const medCount = medStats.count;
    const hardCount = hardStats.count;
    const totalSolved = (easyCount + medCount + hardCount) || 1;
    const rating = Math.round(data?.currentContestRating || 0);

    const formatDate = (ts: number | string) => {
        if (!ts) return 'Unknown Date';
        return typeof ts === 'number' ? new Date(ts * 1000).toLocaleDateString() : new Date(ts).toLocaleDateString();
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col overflow-y-auto animate-in fade-in duration-200 transition-colors">
            
            {/* 1. STICKY HEADER */}
            <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm transition-colors duration-200">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        onClick={onBack} 
                        className="hover:bg-slate-100 text-slate-600"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </Button>
                    <div className="hidden sm:block h-8 w-px bg-slate-200 mx-2" />
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Student Insight</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">Viewing LeetCode statistics for @{username}</p>
                    </div>
                </div>

                {data && (
                    <Button asChild variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                        <a href={`https://leetcode.com/${data.leetcodeUsername}`} target="_blank" rel="noopener noreferrer">
                            <span className="hidden sm:inline">Open LeetCode Profile</span>
                            <span className="sm:hidden">LeetCode</span>
                            <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                    </Button>
                )}
            </header>

            {/* 2. MAIN CONTENT AREA */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[60vh]">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                        <p className="text-slate-500 font-medium text-lg">Decrypting LeetCode stats...</p>
                    </div>
                ) : data ? (
                    <div className="pb-12">
                        {/* Top Stats Banner */}
                        <ProfileStats data={data} totalSolved={totalSolved} rating={rating} />

                        {/* Student Bio / About section */}
                        {data.about && (
                            <Card className="shadow-sm border-slate-200 mt-6 md:mt-8 bg-white">
                                <CardContent className="p-5 flex gap-4 items-start">
                                    <div className="p-2 bg-slate-50 rounded-full shrink-0 border border-slate-100">
                                        <UserIcon className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 mb-1">About</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed">{data.about}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-6 md:mt-8">
                            
                            {/* ================= LEFT COLUMN (Wider) ================= */}
                            <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8 min-w-0">
                                {/* Activity Heatmap */}
                                <ActivityHeatmap progressHistory={data.progressHistory} />
                                
                                {/* Top Skills / Topics Card */}
                                <Card className="shadow-sm border-slate-200">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <BrainCircuit className="w-5 h-5 text-indigo-500" />
                                            Top Practiced Skills
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2.5">
                                            {data.skills && data.skills.length > 0 ? (
                                                data.skills
                                                    .sort((a, b) => b.problemsSolved - a.problemsSolved)
                                                    .slice(0, 15)
                                                    .map((skill, idx) => (
                                                        <Badge key={idx} variant="secondary" className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 transition-colors">
                                                            {skill.tagName}
                                                            <span className="ml-2 py-0.5 px-2 bg-white rounded-md text-xs font-bold text-indigo-600 shadow-sm border border-indigo-50">
                                                                {skill.problemsSolved}
                                                            </span>
                                                        </Badge>
                                                    ))
                                            ) : (
                                                <div className="w-full py-8 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                                    <BrainCircuit className="w-8 h-8 mb-2 opacity-50" />
                                                    <span className="text-sm font-medium">No topic data available</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* MOVED: Recent Submissions (Fills the empty space!) */}
                                <Card className="shadow-sm border-slate-200 flex-1">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Clock className="w-5 h-5 text-blue-500" /> Recent Submissions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ScrollArea className="h-72">
                                            <div className="divide-y divide-slate-100">
                                                {data?.recentSubmissions?.map((sub, idx) => (
                                                    <a key={idx} href={sub.questionLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                            <p className="text-sm font-bold text-slate-900 truncate">{sub.title}</p>
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-400 whitespace-nowrap ml-4">
                                                            {formatDate(sub.timestamp)}
                                                        </span>
                                                    </a>
                                                ))}
                                                {(!data?.recentSubmissions || data.recentSubmissions.length === 0) && (
                                                    <div className="p-8 text-center text-slate-400 text-sm">No recent submissions found.</div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </div>
                            
                            {/* ================= RIGHT COLUMN (Narrower) ================= */}
                            <div className="flex flex-col gap-6 lg:gap-8 min-w-0">
                                
                                {/* Difficulty Breakdown */}
                                <Card className="shadow-sm border-slate-200">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Difficulty Breakdown</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-bold text-slate-700">Easy</span>
                                                <span className="font-bold text-emerald-500">{easyCount} <span className="text-slate-400 font-medium ml-1">({easyStats.beatsPercentage}% beats)</span></span>
                                            </div>
                                            <Progress value={(easyCount / totalSolved) * 100} className="h-2.5 bg-emerald-100 [&>div]:bg-emerald-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-bold text-slate-700">Medium</span>
                                                <span className="font-bold text-amber-500">{medCount} <span className="text-slate-400 font-medium ml-1">({medStats.beatsPercentage}% beats)</span></span>
                                            </div>
                                            <Progress value={(medCount / totalSolved) * 100} className="h-2.5 bg-amber-100 [&>div]:bg-amber-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-bold text-slate-700">Hard</span>
                                                <span className="font-bold text-rose-500">{hardCount} <span className="text-slate-400 font-medium ml-1">({hardStats.beatsPercentage}% beats)</span></span>
                                            </div>
                                            <Progress value={(hardCount / totalSolved) * 100} className="h-2.5 bg-rose-100 [&>div]:bg-rose-500" />
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                {/* Earned Badges (Only appears ONCE now!) */}
                                <BadgesList badges={data.badges} />
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
                        <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="font-medium text-lg text-slate-600">Failed to load student data.</p>
                        <p className="text-sm">They may need to log in and sync their profile with LeetCode.</p>
                    </div>
                )}
            </main>
        </div>
    );
}