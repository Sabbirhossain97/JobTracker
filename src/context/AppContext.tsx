import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { JobApplication, Resume, CoverLetter, AppContextType } from '../types';
import { supabase } from '../lib/supabase';

const AppContext = createContext<AppContextType | undefined>(undefined);

type Action = 
  | { type: 'SET_APPLICATIONS'; payload: JobApplication[] }
  | { type: 'ADD_APPLICATION'; payload: JobApplication }
  | { type: 'UPDATE_APPLICATION'; payload: { id: string; updates: Partial<JobApplication> } }
  | { type: 'DELETE_APPLICATION'; payload: string }
  | { type: 'SET_RESUMES'; payload: Resume[] }
  | { type: 'ADD_RESUME'; payload: Resume }
  | { type: 'SET_COVER_LETTERS'; payload: CoverLetter[] }
  | { type: 'ADD_COVER_LETTER'; payload: CoverLetter }
  | { type: 'SET_USER'; payload: any }
  | { type: 'SET_LOADING'; payload: boolean };

interface State {
  applications: JobApplication[];
  resumes: Resume[];
  coverLetters: CoverLetter[];
  user: any;
  loading: boolean;
}

const initialState: State = {
  applications: [],
  resumes: [],
  coverLetters: [],
  user: null,
  loading: true,
};

function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_APPLICATIONS':
      return { ...state, applications: action.payload };
    case 'ADD_APPLICATION':
      return { ...state, applications: [...state.applications, action.payload] };
    case 'UPDATE_APPLICATION':
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === action.payload.id
            ? { ...app, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : app
        ),
      };
    case 'DELETE_APPLICATION':
      return {
        ...state,
        applications: state.applications.filter(app => app.id !== action.payload),
      };
    case 'SET_RESUMES':
      return { ...state, resumes: action.payload };
    case 'ADD_RESUME':
      return { ...state, resumes: [...state.resumes, action.payload] };
    case 'SET_COVER_LETTERS':
      return { ...state, coverLetters: action.payload };
    case 'ADD_COVER_LETTER':
      return { ...state, coverLetters: [...state.coverLetters, action.payload] };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize auth and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        dispatch({ type: 'SET_USER', payload: user });

        if (user) {
          // Load user data from Supabase
          await loadUserData(user.id);
        } else {
          // Load from localStorage for demo purposes
          loadLocalData();
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        // Fallback to localStorage
        loadLocalData();
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeApp();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        dispatch({ type: 'SET_USER', payload: session.user });
        await loadUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_APPLICATIONS', payload: [] });
        dispatch({ type: 'SET_RESUMES', payload: [] });
        dispatch({ type: 'SET_COVER_LETTERS', payload: [] });
        loadLocalData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      // Load applications
      const { data: applications } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (applications) {
        const formattedApps = applications.map(app => ({
          id: app.id,
          companyName: app.company_name,
          position: app.position,
          jobDescription: app.job_description,
          jobUrl: app.job_url,
          status: app.status,
          dateApplied: app.date_applied,
          resumeUsed: app.resume_used,
          coverLetterUsed: app.cover_letter_used,
          notes: app.notes,
          salary: app.salary,
          location: app.location,
          contactPerson: app.contact_person,
          contactEmail: app.contact_email,
          interviewDate: app.interview_date,
          followUpDate: app.follow_up_date,
          priority: app.priority,
          tags: app.tags || [],
          createdAt: app.created_at,
          updatedAt: app.updated_at,
        }));
        dispatch({ type: 'SET_APPLICATIONS', payload: formattedApps });
      }

      // Load resumes
      const { data: resumes } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (resumes) {
        const formattedResumes = resumes.map(resume => ({
          id: resume.id,
          name: resume.name,
          fileName: resume.file_name,
          tags: resume.tags || [],
          isDefault: resume.is_default,
          createdAt: resume.created_at,
        }));
        dispatch({ type: 'SET_RESUMES', payload: formattedResumes });
      }

      // Load cover letters
      const { data: coverLetters } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (coverLetters) {
        const formattedCoverLetters = coverLetters.map(cl => ({
          id: cl.id,
          name: cl.name,
          fileName: cl.file_name,
          tags: cl.tags || [],
          createdAt: cl.created_at,
        }));
        dispatch({ type: 'SET_COVER_LETTERS', payload: formattedCoverLetters });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadLocalData = () => {
    const savedApplications = localStorage.getItem('jobTracker_applications');
    const savedResumes = localStorage.getItem('jobTracker_resumes');
    const savedCoverLetters = localStorage.getItem('jobTracker_coverLetters');

    if (savedApplications) {
      dispatch({ type: 'SET_APPLICATIONS', payload: JSON.parse(savedApplications) });
    }
    if (savedResumes) {
      dispatch({ type: 'SET_RESUMES', payload: JSON.parse(savedResumes) });
    }
    if (savedCoverLetters) {
      dispatch({ type: 'SET_COVER_LETTERS', payload: JSON.parse(savedCoverLetters) });
    }
  };

  // Save to localStorage when not authenticated
  useEffect(() => {
    if (!state.user && !state.loading) {
      localStorage.setItem('jobTracker_applications', JSON.stringify(state.applications));
    }
  }, [state.applications, state.user, state.loading]);

  useEffect(() => {
    if (!state.user && !state.loading) {
      localStorage.setItem('jobTracker_resumes', JSON.stringify(state.resumes));
    }
  }, [state.resumes, state.user, state.loading]);

  useEffect(() => {
    if (!state.user && !state.loading) {
      localStorage.setItem('jobTracker_coverLetters', JSON.stringify(state.coverLetters));
    }
  }, [state.coverLetters, state.user, state.loading]);

  const addApplication = async (applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const application: JobApplication = {
      ...applicationData,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };

    if (state.user) {
      try {
        const { error } = await supabase.from('applications').insert({
          id: application.id,
          user_id: state.user.id,
          company_name: application.companyName,
          position: application.position,
          job_description: application.jobDescription,
          job_url: application.jobUrl,
          status: application.status,
          date_applied: application.dateApplied,
          resume_used: application.resumeUsed,
          cover_letter_used: application.coverLetterUsed,
          notes: application.notes,
          salary: application.salary,
          location: application.location,
          contact_person: application.contactPerson,
          contact_email: application.contactEmail,
          interview_date: application.interviewDate,
          follow_up_date: application.followUpDate,
          priority: application.priority,
          tags: application.tags,
          created_at: application.createdAt,
          updated_at: application.updatedAt,
        });

        if (error) throw error;
      } catch (error) {
        console.error('Error adding application:', error);
      }
    }

    dispatch({ type: 'ADD_APPLICATION', payload: application });
  };

  const updateApplication = async (id: string, updates: Partial<JobApplication>) => {
    if (state.user) {
      try {
        const dbUpdates: any = {};
        if (updates.companyName) dbUpdates.company_name = updates.companyName;
        if (updates.position) dbUpdates.position = updates.position;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.dateApplied) dbUpdates.date_applied = updates.dateApplied;
        if (updates.notes) dbUpdates.notes = updates.notes;
        if (updates.salary) dbUpdates.salary = updates.salary;
        if (updates.location) dbUpdates.location = updates.location;
        if (updates.priority) dbUpdates.priority = updates.priority;
        if (updates.tags) dbUpdates.tags = updates.tags;
        
        dbUpdates.updated_at = new Date().toISOString();

        const { error } = await supabase
          .from('applications')
          .update(dbUpdates)
          .eq('id', id)
          .eq('user_id', state.user.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating application:', error);
      }
    }

    dispatch({ type: 'UPDATE_APPLICATION', payload: { id, updates } });
  };

  const deleteApplication = async (id: string) => {
    if (state.user) {
      try {
        const { error } = await supabase
          .from('applications')
          .delete()
          .eq('id', id)
          .eq('user_id', state.user.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting application:', error);
      }
    }

    dispatch({ type: 'DELETE_APPLICATION', payload: id });
  };

  const addResume = async (resumeData: Omit<Resume, 'id' | 'createdAt'>) => {
    const resume: Resume = {
      ...resumeData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    if (state.user) {
      try {
        const { error } = await supabase.from('resumes').insert({
          id: resume.id,
          user_id: state.user.id,
          name: resume.name,
          file_name: resume.fileName,
          tags: resume.tags,
          is_default: resume.isDefault,
          created_at: resume.createdAt,
        });

        if (error) throw error;
      } catch (error) {
        console.error('Error adding resume:', error);
      }
    }

    dispatch({ type: 'ADD_RESUME', payload: resume });
  };

  const addCoverLetter = async (coverLetterData: Omit<CoverLetter, 'id' | 'createdAt'>) => {
    const coverLetter: CoverLetter = {
      ...coverLetterData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    if (state.user) {
      try {
        const { error } = await supabase.from('cover_letters').insert({
          id: coverLetter.id,
          user_id: state.user.id,
          name: coverLetter.name,
          file_name: coverLetter.fileName,
          tags: coverLetter.tags,
          created_at: coverLetter.createdAt,
        });

        if (error) throw error;
      } catch (error) {
        console.error('Error adding cover letter:', error);
      }
    }

    dispatch({ type: 'ADD_COVER_LETTER', payload: coverLetter });
  };

  const value: AppContextType = {
    applications: state.applications,
    resumes: state.resumes,
    coverLetters: state.coverLetters,
    user: state.user,
    loading: state.loading,
    addApplication,
    updateApplication,
    deleteApplication,
    addResume,
    addCoverLetter,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}