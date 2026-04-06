import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Code2, Loader2, AlertCircle, GraduationCap, Briefcase } from 'lucide-react';
import axios from 'axios';
import { AuthService } from '../services/endpoints';

type Role = 'STUDENT' | 'MENTOR';

export default function Register() {
    const navigate = useNavigate();

    // Form State
    const [role, setRole] = useState<Role>('STUDENT');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [leetcodeUsername, setLeetcodeUsername] = useState('');
    
    // UI State
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let response;
            
            // 1. Call the correct Spring Boot endpoint based on the selected role
            if (role === 'STUDENT') {
                response = await AuthService.registerStudent({ 
                    name, 
                    email, 
                    password, 
                    leetcodeUsername 
                });
            } else {
                response = await AuthService.registerMentor({ 
                    name, 
                    email, 
                    password 
                });
            }

            // 2. Extract the AuthResponse DTO from the backend (NOW WITH ROLE!)
            const { accessToken, mentorId, name: userName, role: userRole } = response.data;

            // 3. Save the tokens AND the role to local storage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify({ id: mentorId, name: userName, role: userRole }));

            // 4. Force a hard reload
            window.location.href = '/dashboard';
            
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Registration failed. This email might already be in use.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
                
                {/* Header Section */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                        Create an Account
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Join LeetTracker to manage your progress
                    </p>
                </div>

                {/* Role Toggle Switch */}
                <div className="flex rounded-lg bg-slate-100 p-1">
                    <button
                        type="button"
                        onClick={() => setRole('STUDENT')}
                        className={`flex flex-1 items-center justify-center space-x-2 rounded-md py-2 text-sm font-semibold transition-all ${
                            role === 'STUDENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <GraduationCap className="h-4 w-4" />
                        <span>Student</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('MENTOR')}
                        className={`flex flex-1 items-center justify-center space-x-2 rounded-md py-2 text-sm font-semibold transition-all ${
                            role === 'MENTOR' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Briefcase className="h-4 w-4" />
                        <span>Mentor</span>
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="flex items-center space-x-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Registration Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        
                        {/* Name Input */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* LeetCode Username (ONLY shows if Student is selected) */}
                        {role === 'STUDENT' && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">LeetCode Username</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Code2 className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required={role === 'STUDENT'}
                                        value={leetcodeUsername}
                                        onChange={(e) => setLeetcodeUsername(e.target.value)}
                                        className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="johndoe_lc"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-slate-500">Must exactly match your LeetCode profile URL.</p>
                            </div>
                        )}

                        {/* Password Input */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-lg border border-slate-300 py-2.5 pl-10 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating Account...
                            </span>
                        ) : (
                            `Register as ${role === 'STUDENT' ? 'Student' : 'Mentor'}`
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <p className="mt-4 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <button onClick={() => navigate('/login')} className="font-semibold text-blue-600 hover:text-blue-500">
                        Sign in instead
                    </button>
                </p>
            </div>
        </div>
    );
}