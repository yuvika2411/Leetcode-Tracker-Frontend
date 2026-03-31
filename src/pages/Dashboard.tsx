import { useEffect, useState } from 'react';
import { Trophy, Target, BookOpen, LogOut, Code2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { StudentService } from '../services/endpoints';
import type { StudentSummaryDTO } from '../types';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [dashboardData, setDashboardData] = useState<StudentSummaryDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(''); // State to hold our error message

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await StudentService.getDashboard();
                setDashboardData(response.data);
            } catch (err) { // <-- NEW: Removed the ': any'
                
                // NEW: Strictly check if this is an error from our Spring Boot backend
                if (axios.isAxiosError(err) && err.response?.data?.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Failed to load dashboard data.');
                }
                
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                    <p className="text-slate-500 font-medium">Decrypting LeetCode stats...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation Bar */}
            <nav className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Code2 className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold text-slate-900">LeetTracker</span>
                    </div>
                    <div className="flex items-center space-x-6">
                        <span className="text-sm font-medium text-slate-600">
                            Hello, {user?.name}
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

            <main className="mx-auto max-w-6xl p-6">
                
                {/* FIX: This is the Error Banner that uses the 'error' variable! */}
                {error && (
                    <div className="mb-6 flex items-center space-x-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
                    <p className="mt-1 text-slate-500">
                        LeetCode ID: <span className="font-semibold text-slate-700">{dashboardData?.leetcodeUsername || 'N/A'}</span>
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    
                    {/* Stat Card 1: Total Solved */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Solved</p>
                                <p className="mt-2 text-4xl font-bold text-slate-900">
                                    {dashboardData?.totalSolved || 0}
                                </p>
                            </div>
                            <div className="rounded-full bg-green-50 p-3">
                                <Target className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Stat Card 2: Contest Rating */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Contest Rating</p>
                                <p className="mt-2 text-4xl font-bold text-slate-900">
                                    {dashboardData?.contestRating || 0}
                                </p>
                            </div>
                            <div className="rounded-full bg-yellow-50 p-3">
                                <Trophy className="h-8 w-8 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    {/* Stat Card 3: Active Classrooms */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Enrolled Classrooms</p>
                                <p className="mt-2 text-4xl font-bold text-slate-900">
                                    {dashboardData?.classrooms?.length || 0}
                                </p>
                            </div>
                            <div className="rounded-full bg-blue-50 p-3">
                                <BookOpen className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Classrooms Section */}
                <div className="mt-12">
                    <h2 className="mb-6 text-2xl font-bold text-slate-900">My Classrooms</h2>
                    {dashboardData?.classrooms && dashboardData.classrooms.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {dashboardData.classrooms.map((classroom) => (
                                <div key={classroom.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900">{classroom.name}</h3>
                                    <p className="mt-2 text-sm text-slate-500">{classroom.description}</p>
                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                                        <span className="text-sm font-medium text-slate-600">
                                            {classroom.assignments?.length || 0} Pending Assignments
                                        </span>
                                        <button className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-500">
                                            View Assignments &rarr;
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                            <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-4 text-lg font-bold text-slate-900">No Classrooms Yet</h3>
                            <p className="mt-2 text-slate-500">You haven't been enrolled in any classrooms by a mentor.</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}