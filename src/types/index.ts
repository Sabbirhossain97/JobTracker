export interface JobApplication {
  id: string;
  companyName: string;
  position: string;
  jobDescription: string;
  jobUrl?: string;
  status: ApplicationStatus;
  dateApplied: string;
  resumeUsed?: string;
  coverLetterUsed?: string;
  notes: string;
  salary?: string;
  location?: string;
  contactPerson?: string;
  contactEmail?: string;
  interviewDate?: string;
  followUpDate?: string;
  priority: Priority;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 
  | 'interested'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'final_interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type Priority = 'high' | 'medium' | 'low';

export interface Resume {
  id: string;
  name: string;
  fileName: string;
  tags: string[];
  createdAt: string;
  isDefault: boolean;
}

export interface CoverLetter {
  id: string;
  name: string;
  fileName: string;
  tags: string[];
  createdAt: string;
}

export interface AppContextType {
  applications: JobApplication[];
  resumes: Resume[];
  coverLetters: CoverLetter[];
  user: any;
  loading: boolean;
  addApplication: (application: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateApplication: (id: string, updates: Partial<JobApplication>) => void;
  deleteApplication: (id: string) => void;
  addResume: (resume: Omit<Resume, 'id' | 'createdAt'>) => void;
  addCoverLetter: (coverLetter: Omit<CoverLetter, 'id' | 'createdAt'>) => void;
}