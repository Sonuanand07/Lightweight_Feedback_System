import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import FeedbackCard from '../components/FeedbackCard';
import { User, Feedback, DashboardStats, FeedbackCreate } from '../types';
import { userAPI, feedbackAPI } from '../api';
import { Users, Plus, TrendingUp, MessageSquare, AlertCircle, Calendar } from 'lucide-react';

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FeedbackCreate>({
    employee_id: 0,
    strengths: '',
    improvements: '',
    sentiment: 'neutral'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersData, feedbackData, statsData] = await Promise.all([
        userAPI.getTeamMembers(),
        feedbackAPI.getFeedback(),
        feedbackAPI.getDashboardStats()
      ]);
      
      setTeamMembers(membersData);
      setFeedback(feedbackData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await feedbackAPI.createFeedback(formData);
      setShowFeedbackForm(false);
      setFormData({
        employee_id: 0,
        strengths: '',
        improvements: '',
        sentiment: 'neutral'
      });
      loadData();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleEmployeeSelect = async (employee: User) => {
    setSelectedEmployee(employee);
    try {
      const employeeFeedback = await feedbackAPI.getEmployeeFeedback(employee.id);
      setFeedback(employeeFeedback);
    } catch (error) {
      console.error('Error loading employee feedback:', error);
    }
  };

  const handleShowAllFeedback = () => {
    setSelectedEmployee(null);
    loadData();
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

  return (
    <Layout>
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage feedback for your team members</p>
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
                  <p className="text-sm text-gray-600">Positive Feedback</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.positive_feedback}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Needs Attention</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.negative_feedback}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Unacknowledged</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unacknowledged_feedback}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Members Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Team Members ({teamMembers.length})
                </h2>
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Feedback</span>
                </button>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleShowAllFeedback}
                  className={`w-full text-left p-3 rounded-md transition-colors ${
                    !selectedEmployee 
                      ? 'bg-blue-100 border-2 border-blue-300' 
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="font-medium text-gray-900">All Team Feedback</div>
                  <div className="text-sm text-gray-600">View all feedback you've given</div>
                </button>
                
                {teamMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleEmployeeSelect(member)}
                    className={`w-full text-left p-3 rounded-md transition-colors ${
                      selectedEmployee?.id === member.id 
                        ? 'bg-blue-100 border-2 border-blue-300' 
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{member.username}</div>
                    <div className="text-sm text-gray-600">{member.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                {selectedEmployee ? `Feedback for ${selectedEmployee.username}` : 'All Team Feedback'}
              </h2>
              
              {feedback.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {selectedEmployee 
                      ? `No feedback yet for ${selectedEmployee.username}` 
                      : 'No feedback has been created yet'}
                  </p>
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create First Feedback</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedback.map((item) => (
                    <FeedbackCard
                      key={item.id}
                      feedback={item}
                      isManager={true}
                      onUpdate={selectedEmployee ? () => handleEmployeeSelect(selectedEmployee) : loadData}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Form Modal */}
        {showFeedbackForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Feedback</h3>
                
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Member
                    </label>
                    <select
                      value={formData.employee_id}
                      onChange={(e) => setFormData({ ...formData, employee_id: parseInt(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value={0}>Select a team member</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.username} ({member.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Strengths
                    </label>
                    <textarea
                      value={formData.strengths}
                      onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="What are their key strengths?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Areas to Improve
                    </label>
                    <textarea
                      value={formData.improvements}
                      onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="What areas could they work on?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Overall Sentiment
                    </label>
                    <select
                      value={formData.sentiment}
                      onChange={(e) => setFormData({ ...formData, sentiment: e.target.value as any })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="positive">Positive</option>
                      <option value="neutral">Neutral</option>
                      <option value="negative">Negative</option>
                    </select>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Submit Feedback
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFeedbackForm(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManagerDashboard;