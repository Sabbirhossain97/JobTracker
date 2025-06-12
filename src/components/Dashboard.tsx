import React from 'react';
import { useApp } from '../context/AppContext';
import { ApplicationStatus } from '../types';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Calendar,
  Target,
  Award
} from 'lucide-react';

const statusConfig = {
  interested: { label: 'Interested', color: 'bg-gray-100 text-gray-800', icon: Target },
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-800', icon: Briefcase },
  screening: { label: 'Screening', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  interview: { label: 'Interview', color: 'bg-purple-100 text-purple-800', icon: Calendar },
  final_interview: { label: 'Final Interview', color: 'bg-indigo-100 text-indigo-800', icon: Award },
  offer: { label: 'Offer', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

export default function Dashboard() {
  const { applications } = useApp();

  const getStatusCounts = () => {
    const counts: Record<ApplicationStatus, number> = {
      interested: 0,
      applied: 0,
      screening: 0,
      interview: 0,
      final_interview: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0,
    };

    applications.forEach(app => {
      counts[app.status]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();
  const totalApplications = applications.length;
  const activeApplications = applications.filter(app => 
    !['rejected', 'withdrawn', 'offer'].includes(app.status)
  ).length;

  const getRecentApplications = () => {
    return applications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  const getUpcomingInterviews = () => {
    return applications
      .filter(app => app.interviewDate && new Date(app.interviewDate) > new Date())
      .sort((a, b) => new Date(a.interviewDate!).getTime() - new Date(b.interviewDate!).getTime())
      .slice(0, 3);
  };

  const getSuccessRate = () => {
    const completedApplications = applications.filter(app => 
      ['offer', 'rejected', 'withdrawn'].includes(app.status)
    );
    const offers = applications.filter(app => app.status === 'offer');
    
    if (completedApplications.length === 0) return 0;
    return Math.round((offers.length / completedApplications.length) * 100);
  };

  const recentApplications = getRecentApplications();
  const upcomingInterviews = getUpcomingInterviews();
  const successRate = getSuccessRate();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Track your job search progress and insights</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">{totalApplications}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Applications</p>
              <p className="text-3xl font-bold text-gray-900">{activeApplications}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">{successRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Offers Received</p>
              <p className="text-3xl font-bold text-gray-900">{statusCounts.offer}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h2>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => {
              const config = statusConfig[status as ApplicationStatus];
              const Icon = config.icon;
              const percentage = totalApplications > 0 ? (count / totalApplications) * 100 : 0;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{config.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h2>
          {recentApplications.length > 0 ? (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{app.position}</p>
                    <p className="text-sm text-gray-600">{app.companyName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[app.status].color}`}>
                      {statusConfig[app.status].label}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(app.dateApplied).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No applications yet</p>
              <p className="text-sm text-gray-400">Start by adding your first job application</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Interviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingInterviews.map((app) => (
              <div key={app.id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{app.position}</p>
                    <p className="text-sm text-gray-600">{app.companyName}</p>
                    <div className="flex items-center mt-2 text-sm text-blue-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(app.interviewDate!).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}