import React, { useEffect, useState } from 'react';
import { 
    Target, BookOpen, LogOut, Code2, AlertCircle, 
    Medal, Clock, CheckCircle2, Link as LinkIcon, Send, Check,
    User
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { StudentService } from '../services/endpoints';
import type { StudentSummaryDTO, AssignmentDTO } from '../types';

const formatLeetcodeDate = (timestamp: number | string | any): string => {
    if (!timestamp) return 'Unknown Date';
    if (typeof timestamp === 'number') return new Date(timestamp * 1000).toLocaleDateString();
    if (typeof timestamp === 'string') return new Date(timestamp).toLocaleDateString();
    return 'Invalid Date';
};

// --- HEATMAP GENERATOR HELPER ---
const generateHeatmapDays = (progressHistory: any[]) => {
    const days = [];
    const today = new Date();
    
    // Create a dictionary of { "YYYY-MM-DD": count } for O(1) lookup
    const progressMap: Record<string, number> = {};
    progressHistory?.forEach(record => {
        // Handle MongoDB $date object OR raw string
        const dateStr = typeof record.date === 'object' ? record.date.$date : record.date;
        const localDate = new Date(dateStr).toISOString().split('T')[0];
        progressMap[localDate] = record.questionSolved;
    });

    // Generate the last 84 days (12 weeks)
    for (let i = 83; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        days.push({
            date: dateKey,
            count: progressMap[dateKey] || 0
        });
    }
    return days;
};

// Helper to determine heatmap cell color intensity
const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-slate-100';
    if (count <= 2) return 'bg-green-300';
    if (count <= 5) return 'bg-green-400';
    if (count <= 8) return 'bg-green-500';
    return 'bg-green-600';
};

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [dashboardData, setDashboardData] = useState<StudentSummaryDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Validation State
    const [validationUrls, setValidationUrls] = useState<Record<string, string>>({});
    const [validatingId, setValidatingId] = useState<string | null>(null);

    const fetchDashboard = async () => {
        try {
            const response = await StudentService.getDashboard();
            setDashboardData(response.data);
        } catch (err) {
            setError('Failed to load dashboard data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    // --- ASSIGNMENT VALIDATION LOGIC ---
    const handleUrlChange = (assignmentId: string, url: string) => {
        setValidationUrls(prev => ({ ...prev, [assignmentId]: url }));
    };

    const handleValidate = async (classroomId: string, assignmentId: string) => {
        const url = validationUrls[assignmentId];
        if (!url) return alert("Please paste your LeetCode submission URL first.");

        setValidatingId(assignmentId);
        try {
            await StudentService.validateSubmission(classroomId, assignmentId, url);
            alert("Validation Successful! Great job.");
            // Clear input and refetch to remove it from the pending list
            setValidationUrls(prev => ({ ...prev, [assignmentId]: '' }));
            fetchDashboard();
        } catch (err) {
            alert(axios.isAxiosError(err) ? err.response?.data?.message : 'Validation failed.');
        } finally {
            setValidatingId(null);
        }
    };

    // --- CHECK IF ASSIGNMENT IS COMPLETED ---
    // This perfectly mimics your Java backend logic on the frontend!
    const isAssignmentCompleted = (assignment: AssignmentDTO) => {
        // 1. Manually Completed?
        if (dashboardData?.manuallyCompletedAssignments?.includes(assignment.id)) return true;
        
        // 2. Auto-Completed by recent activity?
        const autoCompleted = dashboardData?.recentSubmissions?.some(sub => 
            sub.titleSlug === assignment.titleSlug &&
            sub.timestamp >= assignment.startTimestamp && 
            sub.timestamp <= assignment.endTimestamp
        );
        return !!autoCompleted;
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                    <p className="font-medium text-slate-500">Decrypting LeetCode stats...</p>
                </div>
            </div>
        );
    }

    const totalSolved = dashboardData?.problemStats?.find(s => s.difficulty === 'All')?.count || 0;
    const rating = Math.round(dashboardData?.currentContestRating || 0);
    const heatmapDays = generateHeatmapDays(dashboardData?.progressHistory || []);

    // Extract all pending assignments across all classrooms
    const pendingAssignments: { classroomId: string, className: string, assignment: AssignmentDTO }[] = [];
    dashboardData?.classrooms?.forEach(cls => {
        cls.assignments?.forEach(assignment => {
            if (!isAssignmentCompleted(assignment)) {
                pendingAssignments.push({ classroomId: cls.id, className: cls.className, assignment });
            }
        });
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Top Navigation Bar */}
            <nav className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Code2 className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold text-slate-900">LeetTracker</span>
                    </div>
                    <div className="flex items-center space-x-6">
                        <span className="text-sm font-medium text-slate-600">
                            Hello, {dashboardData?.name || user?.name}
                        </span>
                        <button
                            onClick={logout}
                            className="flex items-center space-x-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="mx-auto mt-8 max-w-7xl px-6">
                
                {error && (
                    <div className="mb-6 flex items-center space-x-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {/* Profile Header */}
                <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            {dashboardData?.avatarUrl ? (
                                <img src={dashboardData.avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full border-2 border-slate-200 object-cover shadow-sm"/>
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center border-2 border-slate-200">
                                    <User className="h-10 w-10 text-blue-600" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">{dashboardData?.name}</h1>
                                <a 
                                    href={`https://leetcode.com/${dashboardData?.leetcodeUsername}`} 
                                    target="_blank" rel="noreferrer"
                                    className="mt-1 flex items-center text-blue-600 hover:underline"
                                >
                                    @{dashboardData?.leetcodeUsername}
                                </a>
                            </div>
                        </div>
                        <div className="text-right flex gap-8">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Solved</p>
                                <p className="text-2xl font-bold text-slate-900">{totalSolved}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Contest Rating</p>
                                <p className="text-2xl font-bold text-slate-900">{rating}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    
                    {/* LEFT COLUMN: Main Activity */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* 1. THE HEATMAP */}
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Target className="h-5 w-5 text-green-500" /> Daily Activity (Last 12 Weeks)
                            </h2>
                            <div className="flex overflow-x-auto pb-2">
                                <div className="grid grid-flow-col gap-1.5" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}>
                                    {heatmapDays.map((day, idx) => (
                                        <div 
                                            key={idx}
                                            title={`${day.date}: ${day.count} submissions`}
                                            className={`h-4 w-4 rounded-sm cursor-help transition-all hover:ring-2 hover:ring-slate-400 ${getHeatmapColor(day.count)}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end items-center gap-2 mt-4 text-xs text-slate-500 font-medium">
                                <span>Less</span>
                                <div className="h-3 w-3 rounded-sm bg-slate-100"></div>
                                <div className="h-3 w-3 rounded-sm bg-green-300"></div>
                                <div className="h-3 w-3 rounded-sm bg-green-400"></div>
                                <div className="h-3 w-3 rounded-sm bg-green-500"></div>
                                <div className="h-3 w-3 rounded-sm bg-green-600"></div>
                                <span>More</span>
                            </div>
                        </div>

                        {/* 2. PENDING ASSIGNMENTS HUB */}
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-blue-50/30">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-blue-600" /> Pending Assignments
                                    <span className="ml-auto bg-blue-100 text-blue-800 py-0.5 px-2.5 rounded-full text-xs font-bold">
                                        {pendingAssignments.length} Due
                                    </span>
                                </h2>
                            </div>
                            
                            <div className="divide-y divide-slate-100">
                                {pendingAssignments.map((item, idx) => (
                                    <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.className}</span>
                                                <h3 className="text-lg font-bold text-slate-900 mt-1">{item.assignment.titleSlug}</h3>
                                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                    <Clock className="h-3.5 w-3.5" /> Due: {formatLeetcodeDate(item.assignment.endTimestamp)}
                                                </p>
                                            </div>
                                            <a 
                                                href={item.assignment.questionLink} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                                            >
                                                Solve on LeetCode <LinkIcon className="h-3.5 w-3.5" />
                                            </a>
                                        </div>

                                        {/* Validation Input */}
                                        <div className="mt-4 bg-slate-100 p-1 rounded-lg flex items-center">
                                            <input 
                                                type="text" 
                                                placeholder="Paste your submission URL here..."
                                                value={validationUrls[item.assignment.id] || ''}
                                                onChange={(e) => handleUrlChange(item.assignment.id, e.target.value)}
                                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 outline-none"
                                            />
                                            <button 
                                                onClick={() => handleValidate(item.classroomId, item.assignment.id)}
                                                disabled={validatingId === item.assignment.id}
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                                            >
                                                {validatingId === item.assignment.id ? <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <Check className="h-4 w-4" />}
                                                Validate
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {pendingAssignments.length === 0 && (
                                    <div className="p-12 text-center text-slate-500">
                                        <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
                                        <h3 className="text-lg font-bold text-slate-900">All Caught Up!</h3>
                                        <p>You have no pending assignments right now.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Recent Subs & Badges */}
                    <div className="space-y-8">
                        
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-600" /> Recent Submissions
                                </h2>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-100 overflow-y-auto">
                                {dashboardData?.recentSubmissions?.map((sub, idx) => (
                                    <a 
                                        key={idx} 
                                        href={sub.questionLink}
                                        target="_blank" rel="noreferrer"
                                        className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            <span className="font-medium text-slate-700 truncate max-w-45">{sub.title}</span>
                                        </div>
                                        <span className="text-xs text-slate-400 whitespace-nowrap">
                                            {formatLeetcodeDate(sub.timestamp)}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Medal className="h-5 w-5 text-yellow-500" /> Earned Badges
                            </h2>
                            <div className="grid grid-cols-3 gap-4">
                                {dashboardData?.badges?.slice(0, 6).map((badge, idx) => (
                                    <div key={idx} className="flex flex-col items-center text-center group">
                                        <div className="relative h-14 w-14 transition-transform group-hover:scale-110">
                                            <img src={badge.icon.startsWith('http') ? badge.icon : `https://leetcode.com${badge.icon}`} alt={badge.title} className="object-contain" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}