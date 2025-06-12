import React from 'react';
import { useApp } from '../context/AppContext';
import { ApplicationStatus } from '../types';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Award,
  Clock,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

export default function Analytics() {
  const { applications } = useApp();

  const getAnalytics = () => {
    const total = applications.length;
    const thisMonth = applications.filter(app => {
      const appDate = new Date(app.dateApplied || app.createdAt);
      const now = new Date();
      return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
    }).length;

    const lastMonth = applications.filter(app => {
      const appDate = new Date(app.dateApplied || app.createdAt);
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      return appDate.getMonth() === lastMonth.getMonth() && appDate.getFullYear() === lastMonth.getFullYear();
    }).length;

    const offers = applications.filter(app => app.status === 'offer').length;
    const interviews = applications.filter(app => 
      app.status === 'interview' || app.status === 'final_interview'
    ).length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    const active = applications.filter(app => 
      !['rejected', 'withdrawn', 'offer'].includes(app.status)
    ).length;

    const responseRate = total > 0 ? Math.round(((interviews + offers) / total) * 100) : 0;
    const successRate = total > 0 ? Math.round((offers / total) * 100) : 0;
    const monthlyGrowth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;

    // Average time to response (mock calculation)
    const avgResponseTime = 7; // days

    return {
      total,
      thisMonth,
      lastMonth,
      offers,
      interviews,
      rejected,
      active,
      responseRate,
      successRate,
      monthlyGrowth,
      avgResponseTime,
    };
  };

  const getStatusBreakdown = () => {
    const statusCounts: Record<ApplicationStatus, number> = {
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
      statusCounts[app.status]++;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: applications.length > 0 ? Math.round((count / applications.length) * 100) : 0,
    }));
  };

  const getMonthlyData = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthApps = applications.filter(app => {
        const appDate = new Date(app.dateApplied || app.createdAt);
        return appDate.getMonth() === month.getMonth() && 
               appDate.getFullYear() === month.getFullYear();
      }).length;
      
      months.push({
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        applications: monthApps,
      });
    }
    
    return months;
  };

  const analytics = getAnalytics();
  const statusBreakdown = getStatusBreakdown();
  const monthlyData = getMonthlyData();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Insights into your job search performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.total}</p>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${
                  analytics.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analytics.monthlyGrowth >= 0 ? '+' : ''}{analytics.monthlyGrowth}% from last month
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.responseRate}%</p>
              <p className="text-sm text-gray-500 mt-2">
                {analytics.interviews} interviews + {analytics.offers} offers
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.successRate}%</p>
              <p className="text-sm text-gray-500 mt-2">
                {analytics.offers} offers received
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.avgResponseTime}</p>
              <p className="text-sm text-gray-500 mt-2">days to first response</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Applications Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Monthly Applications
          </h2>
          <div className="space-y-4">
            {monthlyData.map((month, index) => {
              const maxApps = Math.max(...monthlyData.map(m => m.applications));
              const width = maxApps > 0 ? (month.applications / maxApps) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 w-1/3">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${width}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-right">
                    <span className="text-sm font-semibold text-gray-900">{month.applications}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Status Breakdown
          </h2>
          <div className="space-y-3">
            {statusBreakdown
              .filter(item => item.count > 0)
              .sort((a, b) => b.count - a.count)
              .map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Insights & Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">Application Velocity</h3>
            <p className="text-sm text-blue-700">
              You've applied to {analytics.thisMonth} positions this month. 
              {analytics.thisMonth < 10 && " Consider increasing your application rate to improve your chances."}
              {analytics.thisMonth >= 10 && " Great job maintaining consistent application volume!"}
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-900 mb-2">Success Metrics</h3>
            <p className="text-sm text-green-700">
              Your {analytics.responseRate}% response rate is 
              {analytics.responseRate >= 20 && " excellent - above industry average!"}
              {analytics.responseRate < 20 && analytics.responseRate >= 10 && " good - close to industry average."}
              {analytics.responseRate < 10 && " below average. Consider refining your applications."}
            </p>
          </div>
          
          {analytics.active > 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-900 mb-2">Active Pipeline</h3>
              <p className="text-sm text-yellow-700">
                You have {analytics.active} active applications in progress. 
                Don't forget to follow up on pending applications.
              </p>
            </div>
          )}
          
          {analytics.offers > 0 && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-medium text-purple-900 mb-2">Offer Analysis</h3>
              <p className="text-sm text-purple-700">
                Congratulations on receiving {analytics.offers} offer{analytics.offers > 1 ? 's' : ''}! 
                Your success rate of {analytics.successRate}% shows your strong candidacy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}