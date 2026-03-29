export type Role = 'SUPER_ADMIN' | 'MENTOR' | 'STUDENT';

export interface AuthResponse{
    accessToken: string,
    mentorId: string, // Used for both Student and Mentor IDs based on your backend
    name: string
}

export interface ApiErrorResponse{
    timeStamp:string;
    status: number;
    error: string;
    message: string;
    path?: string;
}

// Student Models
export interface StudentSummaryDTO {
    id: string;
    name: string;
    email: string;
    leetcodeUsername: string;
    totalSolved: number;
    contestRating: number;
    role: Role;
    classrooms: ClassroomSummaryDTO[];
}

// Classroom & Assignment Models
export interface ClassroomSummaryDTO {
    id: string;
    name: string;
    description: string;
    assignments: AssignmentDTO[];
}

export interface AssignmentDTO {
    id: string;
    title: string;
    titleSlug: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    deadline: string; 
    status?: 'COMPLETED' | 'PENDING'; // We calculate this on the frontend or backend
}

//  Request Payloads 
export interface LoginRequest {
    email: string;
    password: string;
}

export interface MentorRegisterRequest {
    name: string;
    email: string;
    password: string;
}

// A student requires everything a mentor does, plus their LeetCode ID
export interface StudentRegisterRequest extends MentorRegisterRequest {
    leetcodeUsername: string;
}