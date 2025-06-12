import React from 'react';
import { useApp } from '../context/AppContext';
import { ApplicationStatus, JobApplication } from '../types';
import { Calendar, MapPin, DollarSign, Edit, ExternalLink, Clock } from 'lucide-react';

const statusColumns = [
  { id: 'interested', label: 'Interested', color: 'bg-slate-50 border-slate-200', headerColor: 'bg-slate-100' },
  { id: 'applied', label: 'Applied', color: 'bg-blue-50 border-blue-200', headerColor: 'bg-blue-100' },
  { id: 'screening', label: 'Screening', color: 'bg-amber-50 border-amber-200', headerColor: 'bg-amber-100' },
  { id: 'interview', label: 'Interview', color: 'bg-purple-50 border-purple-200', headerColor: 'bg-purple-100' },
  { id: 'final_interview', label: 'Final Interview', color: 'bg-indigo-50 border-indigo-200', headerColor: 'bg-indigo-100' },
  { id: 'offer', label: 'Offer', color: 'bg-emerald-50 border-emerald-200', headerColor: 'bg-emerald-100' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-50 border-red-200', headerColor: 'bg-red-100' },
  { id: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-50 border-gray-300', headerColor: 'bg-gray-100' },
];

const priorityColors = {
  high: 'border-l-4 border-l-red-500 bg-red-50',
  medium: 'border-l-4 border-l-amber-500 bg-amber-50',
  low: 'border-l-4 border-l-emerald-500 bg-emerald-50',
};

export default function KanbanBoard() {
  const { applications, updateApplication } = useApp();

  const getApplicationsByStatus = (status: ApplicationStatus) => {
    return applications.filter(app => app.status === status);
  };

  const handleStatusChange = (applicationId: string, newStatus: ApplicationStatus) => {
    updateApplication(applicationId, { status: newStatus });
  };

  const handleDragStart = (e: React.DragEvent, application: JobApplication) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(application));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    const applicationData = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (applicationData.status !== status) {
      handleStatusChange(applicationData.id, status);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
        <p className="text-gray-600 mt-2">Drag and drop applications to update their status</p>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-6 min-w-max pb-8">
          {statusColumns.map((column) => {
            const columnApplications = getApplicationsByStatus(column.id as ApplicationStatus);
            
            return (
              <div
                key={column.id}
                className={`w-80 rounded-xl border-2 ${column.color} bg-white shadow-sm`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id as ApplicationStatus)}
              >
                {/* Column Header */}
                <div className={`${column.headerColor} px-4 py-3 rounded-t-xl border-b border-gray-200`}>
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                      {column.label}
                    </h2>
                    <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600 shadow-sm">
                      {columnApplications.length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className="p-4 space-y-4 min-h-96 max-h-screen overflow-y-auto">
                  {columnApplications.map((app) => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app)}
                      className={`bg-white rounded-lg p-4 shadow-sm border cursor-move hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 ${priorityColors[app.priority]}`}
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                            {app.position}
                          </h3>
                          <p className="text-sm text-gray-600 font-medium mt-1 truncate">
                            {app.companyName}
                          </p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors ml-2 flex-shrink-0">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Card Details */}
                      <div className="space-y-2 text-xs text-gray-500">
                        {app.location && (
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-2 flex-shrink-0" />
                            <span className="truncate">{app.location}</span>
                          </div>
                        )}
                        
                        {app.salary && (
                          <div className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-2 flex-shrink-0" />
                            <span className="truncate">{app.salary}</span>
                          </div>
                        )}
                        
                        {app.dateApplied && (
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-2 flex-shrink-0" />
                            <span>Applied {formatDate(app.dateApplied)}</span>
                          </div>
                        )}

                        {app.interviewDate && new Date(app.interviewDate) > new Date() && (
                          <div className="flex items-center text-purple-600">
                            <Clock className="w-3 h-3 mr-2 flex-shrink-0" />
                            <span>Interview {formatDate(app.interviewDate)}</span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {app.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {app.tags.slice(0, 3).map((tag, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {app.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                              +{app.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Priority Indicator */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            app.priority === 'high' ? 'bg-red-500' :
                            app.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></div>
                          <span className="text-xs text-gray-500 capitalize font-medium">
                            {app.priority} priority
                          </span>
                        </div>

                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-xs transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* Notes Preview */}
                      {app.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 border-l-2 border-gray-300">
                          {app.notes.length > 60 ? `${app.notes.substring(0, 60)}...` : app.notes}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {columnApplications.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium">No applications</p>
                      <p className="text-xs mt-1">Drag applications here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}