import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Upload, Plus, Tag, Calendar, Star, Edit, Trash2 } from 'lucide-react';

export default function Documents() {
  const { resumes, coverLetters, addResume, addCoverLetter } = useApp();
  const [activeTab, setActiveTab] = useState<'resumes' | 'cover-letters'>('resumes');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    fileName: '',
    tags: [] as string[],
    isDefault: false,
  });
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'resumes') {
      addResume({
        name: formData.name,
        fileName: formData.fileName,
        tags: formData.tags,
        isDefault: formData.isDefault,
      });
    } else {
      addCoverLetter({
        name: formData.name,
        fileName: formData.fileName,
        tags: formData.tags,
      });
    }
    
    setFormData({ name: '', fileName: '', tags: [], isDefault: false });
    setShowAddForm(false);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
        <p className="text-gray-600 mt-2">Manage your resumes and cover letters</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('resumes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'resumes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resumes ({resumes.length})
            </button>
            <button
              onClick={() => setActiveTab('cover-letters')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cover-letters'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cover Letters ({coverLetters.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Add Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {activeTab === 'resumes' ? 'Resume' : 'Cover Letter'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add New {activeTab === 'resumes' ? 'Resume' : 'Cover Letter'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Senior Developer Resume 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Name
              </label>
              <input
                type="text"
                value={formData.fileName}
                onChange={(e) => setFormData(prev => ({ ...prev, fileName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., john_doe_resume_v2.pdf"
              />
            </div>

            {activeTab === 'resumes' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                  Set as default resume
                </label>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add tag (e.g., frontend, senior, startup)"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Document
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'resumes' ? resumes : coverLetters).map((document) => (
          <div key={document.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{document.name}</h3>
                  {'isDefault' in document && document.isDefault && (
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-500 mr-1" />
                      <span className="text-xs text-yellow-600">Default</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-gray-400 hover:text-blue-600 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {document.fileName && (
              <p className="text-sm text-gray-600 mb-3">{document.fileName}</p>
            )}

            {document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {document.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              Created {new Date(document.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {(activeTab === 'resumes' ? resumes : coverLetters).length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FileText className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {activeTab === 'resumes' ? 'resumes' : 'cover letters'} yet
          </h3>
          <p className="text-gray-600 mb-4">
            Add your first {activeTab === 'resumes' ? 'resume' : 'cover letter'} to get started
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {activeTab === 'resumes' ? 'Resume' : 'Cover Letter'}
          </button>
        </div>
      )}
    </div>
  );
}