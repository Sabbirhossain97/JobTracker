import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ApplicationStatus, Priority } from '../types';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Calendar,
  MapPin,
  DollarSign,
  User,
  Mail
} from 'lucide-react';

const statusConfig = {
  interested: { label: 'Interested', color: 'bg-gray-100 text-gray-800' },
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-800' },
  screening: { label: 'Screening', color: 'bg-yellow-100 text-yellow-800' },
  interview: { label: 'Interview', color: 'bg-purple-100 text-purple-800' },
  final_interview: { label: 'Final Interview', color: 'bg-indigo-100 text-indigo-800' },
  offer: { label: 'Offer', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' },
};

const priorityConfig = {
  high: { label: 'High', color: 'text-red-600' },
  medium: { label: 'Medium', color: 'text-yellow-600' },
  low: { label: 'Low', color: 'text-green-600' },
};

export default function ApplicationsList() {
  const { applications, deleteApplication } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || app.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      deleteApplication(id);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Applications</h1>
        <p className="text-gray-600 mt-2">Manage and track all your job applications</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by company, position, location, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              {Object.entries(statusConfig).map(([status, config]) => (
                <option key={status} value={status}>{config.label}</option>
              ))}
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priority</option>
              {Object.entries(priorityConfig).map(([priority, config]) => (
                <option key={priority} value={priority}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>
      </div>

      {/* Applications Grid */}
      {filteredApplications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((app) => (
            <div key={app.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{app.position}</h3>
                  <p className="text-gray-600 font-medium">{app.companyName}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(app.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[app.status].color}`}>
                  {statusConfig[app.status].label}
                </span>
                <span className={`text-xs font-medium ${priorityConfig[app.priority].color}`}>
                  {priorityConfig[app.priority].label} Priority
                </span>
              </div>

              <div className="space-y-2 text-sm">
                {app.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {app.location}
                  </div>
                )}
                
                {app.salary && (
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {app.salary}
                  </div>
                )}
                
                {app.dateApplied && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Applied {new Date(app.dateApplied).toLocaleDateString()}
                  </div>
                )}
                
                {app.contactPerson && (
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    {app.contactPerson}
                  </div>
                )}
                
                {app.contactEmail && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {app.contactEmail}
                  </div>
                )}
              </div>

              {app.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {app.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                  {app.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{app.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {app.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
                  {app.notes.length > 100 ? `${app.notes.substring(0, 100)}...` : app.notes}
                </div>
              )}

              <div className="mt-4 flex justify-between items-center">
                {app.jobUrl && (
                  <a
                    href={app.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Job
                  </a>
                )}
                
                {app.interviewDate && new Date(app.interviewDate) > new Date() && (
                  <div className="text-xs text-purple-600 font-medium">
                    Interview: {new Date(app.interviewDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600">
            {applications.length === 0 
              ? "You haven't added any applications yet."
              : "Try adjusting your search or filters."
            }
          </p>
        </div>
      )}
    </div>
  );
}