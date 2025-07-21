import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import FeedbackCard from '../components/FeedbackCard';
import { Feedback, DashboardStats } from '../types';
import { feedbackAPI } from '../api';
import { MessageSquare, TrendingUp, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feedbackData, statsData] = await Promise.all([
        feedbackAPI.getFeedback(),
        feedbackAPI.getDashboardStats()
      ]);
      
      // Sort feedback by date (newest first)
      const sortedFeedback = feedbackData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setFeedback(sortedFeedback);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupFeedbackByMonth = (feedback: Feedback[]) => {
    const grouped = feedback.reduce((groups, item) => {
      const date = parseISO(item.created_at);
      const monthYear = format(date, 'MMMM yyyy');
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(item);
      return groups;
    }, {} as Record<string, Feedback[]>);

    return Object.entries(grouped).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const groupedFeedback = groupFeedbackByMonth(feedback);

  return (
    <Layout>
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Feedback</h1>
          <p className="text-gray-600 mt-1">View and manage feedback from your manager</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_feedback}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Positive Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.positive_feedback}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Acknowledged</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_feedback - stats.unacknowledged_feedback}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Needs Response</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unacknowledged_feedback}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Feedback Timeline
            </h2>
          </div>
          
          <div className="p-6">
            {feedback.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No feedback received yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Check back later for updates from your manager
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {groupedFeedback.map(([monthYear, monthFeedback]) => (
                  <div key={monthYear}>
                    <div className="flex items-center mb-4">
                      <div className="h-0.5 bg-gray-200 flex-1"></div>
                      <h3 className="text-sm font-medium text-gray-500 bg-white px-4">
                        {monthYear}
                      </h3>
                      <div className="h-0.5 bg-gray-200 flex-1"></div>
                    </div>
                    
                    <div className="space-y-4 ml-4">
                      {monthFeedback.map((item, index) => (
                        <div key={item.id} className="relative">
                          {index !== monthFeedback.length - 1 && (
                            <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
                          )}
                          <div className="flex">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                              <MessageSquare className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-4 flex-1">
                              <FeedbackCard
                                feedback={item}
                                isManager={false}
                                onUpdate={loadData}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Unacknowledged Feedback Alert */}
        {stats && stats.unacknowledged_feedback > 0 && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                <h3 className="font-medium text-orange-800">
                  You have {stats.unacknowledged_feedback} unread feedback{stats.unacknowledged_feedback !== 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  Please review and acknowledge your feedback to keep your manager informed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;