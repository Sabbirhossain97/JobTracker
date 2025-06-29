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
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean };

interface State {
  applications: JobApplication[];
  resumes: Resume[];
  coverLetters: CoverLetter[];
  user: any;
  loading: boolean;
  initialized: boolean;
}

const initialState: State = {
  applications: [],
  resumes: [],
  coverLetters: [],
  user: null,
  loading: true,
  initialized: false,
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
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize auth and load data
  useEffect(() => {
    let mounted = true;
    
    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Check if user is authenticated with timeout
        const authPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 5000)
        );
        
        const { data: { user } } = await Promise.race([authPromise, timeoutPromise]) as any;
        
        if (!mounted) return;
        
        dispatch({ type: 'SET_USER', payload: user });

        if (user) {
          // Load user data from Supabase with timeout
          await Promise.race([
            loadUserData(user.id),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Data loading timeout')), 10000)
            )
          ]);
        } else {
          // Load from localStorage for demo purposes
          loadLocalData();
        }
        
        if (mounted) {
          dispatch({ type: 'SET_INITIALIZED', payload: true });
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        if (mounted) {
          // Fallback to localStorage
          loadLocalData();
          dispatch({ type: 'SET_INITIALIZED', payload: true });
        }
      } finally {
        if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    initializeApp();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        dispatch({ type: 'SET_USER', payload: session.user });
        dispatch({ type: 'SET_LOADING', payload: true });
        
        try {
          await loadUserData(session.user.id);
        } catch (error) {
          console.error('Error loading user data after sign in:', error);
        } finally {
          if (mounted) {
            dispatch({ type: 'SET_LOADING', payload: false });
            dispatch({ type: 'SET_INITIALIZED', payload: true });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_APPLICATIONS', payload: [] });
        dispatch({ type: 'SET_RESUMES', payload: [] });
        dispatch({ type: 'SET_COVER_LETTERS', payload: [] });
        loadLocalData();
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_INITIALIZED', payload: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      // Load all data in parallel with individual error handling
      const [applicationsResult, resumesResult, coverLettersResult] = await Promise.allSettled([
        supabase
          .from('applications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('resumes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('cover_letters')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
      ]);

      // Handle applications
      if (applicationsResult.status === 'fulfilled' && applicationsResult.value.data) {
        const formattedApps = applicationsResult.value.data.map(app => ({
          id: app.id,
          companyName: app.company_name,
          position: app.position,
          jobDescription: app.job_description || '',
          jobUrl: app.job_url,
          status: app.status,
          dateApplied: app.date_applied,
          resumeUsed: app.resume_used,
          coverLetterUsed: app.cover_letter_used,
          notes: app.notes || '',
          salary: app.salary,
          location: app.location,
          contactPerson: app.contact_person,
          contactEmail: app.contact_email,
          interviewDate: app.interview_date,
          followUpDate: app.follow_up_date,
          priority: app.priority || 'medium',
          tags: app.tags || [],
          createdAt: app.created_at,
          updatedAt: app.updated_at,
        }));
        dispatch({ type: 'SET_APPLICATIONS', payload: formattedApps });
      } else {
        console.error('Error loading applications:', applicationsResult.status === 'rejected' ? applicationsResult.reason : 'Unknown error');
        dispatch({ type: 'SET_APPLICATIONS', payload: [] });
      }

      // Handle resumes
      if (resumesResult.status === 'fulfilled' && resumesResult.value.data) {
        const formattedResumes = resumesResult.value.data.map(resume => ({
          id: resume.id,
          name: resume.name,
          fileName: resume.file_name || '',
          tags: resume.tags || [],
          isDefault: resume.is_default || false,
          createdAt: resume.created_at,
        }));
        dispatch({ type: 'SET_RESUMES', payload: formattedResumes });
      } else {
        console.error('Error loading resumes:', resumesResult.status === 'rejected' ? resumesResult.reason : 'Unknown error');
        dispatch({ type: 'SET_RESUMES', payload: [] });
      }

      // Handle cover letters
      if (coverLettersResult.status === 'fulfilled' && coverLettersResult.value.data) {
        const formattedCoverLetters = coverLettersResult.value.data.map(cl => ({
          id: cl.id,
          name: cl.name,
          fileName: cl.file_name || '',
          tags: cl.tags || [],
          createdAt: cl.created_at,
        }));
        dispatch({ type: 'SET_COVER_LETTERS', payload: formattedCoverLetters });
      } else {
        console.error('Error loading cover letters:', coverLettersResult.status === 'rejected' ? coverLettersResult.reason : 'Unknown error');
        dispatch({ type: 'SET_COVER_LETTERS', payload: [] });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Set empty arrays as fallback
      dispatch({ type: 'SET_APPLICATIONS', payload: [] });
      dispatch({ type: 'SET_RESUMES', payload: [] });
      dispatch({ type: 'SET_COVER_LETTERS', payload: [] });
    }
  };

  const loadLocalData = () => {
    try {
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
    } catch (error) {
      console.error('Error loading local data:', error);
    }
  };

  // Save to localStorage when not authenticated
  useEffect(() => {
    if (!state.user && !state.loading && state.initialized) {
      try {
        localStorage.setItem('jobTracker_applications', JSON.stringify(state.applications));
      } catch (error) {
        console.error('Error saving applications to localStorage:', error);
      }
    }
  }, [state.applications, state.user, state.loading, state.initialized]);

  useEffect(() => {
    if (!state.user && !state.loading && state.initialized) {
      try {
        localStorage.setItem('jobTracker_resumes', JSON.stringify(state.resumes));
      } catch (error) {
        console.error('Error saving resumes to localStorage:', error);
      }
    }
  }, [state.resumes, state.user, state.loading, state.initialized]);

  useEffect(() => {
    if (!state.user && !state.loading && state.initialized) {
      try {
        localStorage.setItem('jobTracker_coverLetters', JSON.stringify(state.coverLetters));
      } catch (error) {
        console.error('Error saving cover letters to localStorage:', error);
      }
    }
  }, [state.coverLetters, state.user, state.loading, state.initialized]);

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
        if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName;
        if (updates.position !== undefined) dbUpdates.position = updates.position;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.dateApplied !== undefined) dbUpdates.date_applied = updates.dateApplied;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.salary !== undefined) dbUpdates.salary = updates.salary;
        if (updates.location !== undefined) dbUpdates.location = updates.location;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
        
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