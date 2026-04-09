import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Activity, Target, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import type { ClassroomAnalyticsDTO } from '../../../types';

export function ClassroomAnalytics({ data }: { data: ClassroomAnalyticsDTO | null }) {
    if (!data || data.totalStudents === 0) {
        return (
            <Card className="shadow-sm border-slate-200 bg-slate-50/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Activity className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">Not enough data to generate analytics.</p>
                    <p className="text-sm text-slate-400">Add students to see class performance insights.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Class Engagement</p>
                            <h3 className="text-2xl font-bold text-slate-900">{Math.round(data.classEngagementScore)}%</h3>
                            <p className="text-xs text-slate-400 mt-1">{data.activeStudentsThisWeek} active this week</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Target className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Avg. Problems Solved</p>
                            <h3 className="text-2xl font-bold text-slate-900">{data.averageTotalSolved}</h3>
                            <p className="text-xs text-slate-400 mt-1">Per student</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><AlertTriangle className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Critical Weakness</p>
                            <h3 className="text-xl font-bold text-slate-900 truncate max-w-37.5">
                                {data.criticalWeaknesses?.[0]?.tagName || 'None'}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Requires attention</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Difficulty Breakdown */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Class Average by Difficulty</CardTitle>
                        <CardDescription>Average problems solved per student</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm"><span className="font-bold text-slate-700">Easy</span><span className="font-bold text-emerald-500">{data.averageEasy}</span></div>
                            <Progress value={(data.averageEasy / Math.max(data.averageTotalSolved, 1)) * 100} className="h-2.5 bg-emerald-100 [&>div]:bg-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm"><span className="font-bold text-slate-700">Medium</span><span className="font-bold text-amber-500">{data.averageMedium}</span></div>
                            <Progress value={(data.averageMedium / Math.max(data.averageTotalSolved, 1)) * 100} className="h-2.5 bg-amber-100 [&>div]:bg-amber-500" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm"><span className="font-bold text-slate-700">Hard</span><span className="font-bold text-rose-500">{data.averageHard}</span></div>
                            <Progress value={(data.averageHard / Math.max(data.averageTotalSolved, 1)) * 100} className="h-2.5 bg-rose-100 [&>div]:bg-rose-500" />
                        </div>
                    </CardContent>
                </Card>

                {/* Topic Analysis */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-500" /> Topic Proficiency</CardTitle>
                        <CardDescription>Aggregated across entire classroom</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Top Strengths</h4>
                                <div className="flex flex-wrap gap-2">
                                    {data.topStrengths?.map((skill, i) => (
                                        <div key={i} className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-700">{skill.tagName}</span>
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">{skill.problemsSolved}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="h-px w-full bg-slate-100" />

                            <div>
                                <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-3">Needs Attention</h4>
                                <div className="flex flex-wrap gap-2">
                                    {data.criticalWeaknesses?.map((skill, i) => (
                                        <div key={i} className="px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-700">{skill.tagName}</span>
                                            <span className="text-xs font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">{skill.problemsSolved}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 mt-3 italic">These are topics the class has encountered but solved the least.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}