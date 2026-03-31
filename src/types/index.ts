export type Role = 'SUPER_ADMIN' | 'MENTOR' | 'STUDENT';

export interface AuthResponse {
    accessToken: string;
    mentorId: string;
    name: string;
}

export interface ApiErrorResponse {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path?: string;
}

// --- LeetCode Specific Models ---

export interface SocialMedia {
    github?: string;
    linkedin?: string;
    twitter?: string;
}

export interface ProgressRecord {
    date: { $date: string } | string;
    questionSolved: number;
}

export interface Badge {
    title: string;
    icon: string;
    timestamp: string;
}

export interface ContestRecord {
    title: string;
    timestamp: { $numberLong: string } | number;
    rating: number;
    ranking: number;
    problemsSolved: number;
    totalProblems: number;
}

export interface ProblemStat {
    difficulty: string;
    count: number;
    beatsPercentage: number;
}

export interface RecentSubmission {
    title: string;
    titleSlug: string;
    timestamp: { $numberLong: string } | number;
    questionLink: string;
}

export interface AssignmentDTO {
    id: string;
    titleSlug: string;
    questionLink: string;
    // Catch both standard Java numbers AND raw MongoDB $numberLong objects
    startTimestamp: { $numberLong: string } | number;
    endTimestamp: { $numberLong: string } | number;
}

export interface ClassroomSummaryDTO {
    id: string;
    name: string;
    description: string;
    assignments: AssignmentDTO[];
}

// --- The Master Student Object ---
export interface StudentSummaryDTO {
    // Works for both raw MongoDB $oid and standard String IDs
    _id?: { $oid: string } | string; 
    id?: string; 
    
    name: string;
    email: string;
    leetcodeUsername: string;
    role: Role;
    
    about?: string;
    rank?: string;
    currentContestRating?: number;
    socialMedia?: SocialMedia;
    progressHistory?: ProgressRecord[];
    badges?: Badge[];
    contestHistory?: ContestRecord[];
    problemStats?: ProblemStat[];
    recentSubmissions?: RecentSubmission[];
    classrooms?: ClassroomSummaryDTO[];
    
    // Fallbacks in case future lightweight DTOs send these directly
    totalSolved?: number; 
    contestRating?: number; 
}

// --- Request Payloads ---
export interface LoginRequest {
    email: string;
    password: string;
}

export interface MentorRegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface StudentRegisterRequest extends MentorRegisterRequest {
    leetcodeUsername: string;
}