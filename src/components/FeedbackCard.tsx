import React, { useState } from 'react';
import { Feedback } from '../types';
import { CheckCircle, Edit, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { feedbackAPI } from '../api';
import { format } from 'date-fns';

interface FeedbackCardProps {
  feedback: Feedback;
  isManager: boolean;
  onUpdate?: () => void;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, isManager, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    strengths: feedback.strengths,
    improvements: feedback.improvements,
    sentiment: feedback.sentiment,
  });
  const [loading, setLoading] = useState(false);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleAcknowledge = async () => {
    try {
      setLoading(true);
      await feedbackAPI.acknowledgeFeedback(feedback.id);
      onUpdate?.();
    } catch (error) {
      console.error('Error acknowledging feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await feedbackAPI.updateFeedback(feedback.id, editData);
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getSentimentIcon(feedback.sentiment)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(feedback.sentiment)}`}>
              {feedback.sentiment}
            </span>
          </div>
          {feedback.acknowledged && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Acknowledged</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(feedback.created_at), 'MMM d, yyyy')}</span>
          {isManager && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {!isManager && (
        <div className="mb-4 text-sm text-gray-600">
          <span className="font-medium">From: {feedback.manager.username}</span>
        </div>
      )}

      {isManager && (
        <div className="mb-4 text-sm text-gray-600">
          <span className="font-medium">To: {feedback.employee.username}</span>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strengths
            </label>
            <textarea
              value={editData.strengths}
              onChange={(e) => setEditData({ ...editData, strengths: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Areas to Improve
            </label>
            <textarea
              value={editData.improvements}
              onChange={(e) => setEditData({ ...editData, improvements: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sentiment
            </label>
            <select
              value={editData.sentiment}
              onChange={(e) => setEditData({ ...editData, sentiment: e.target.value as any })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
            <p className="text-gray-700 bg-green-50 p-3 rounded-md">{feedback.strengths}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Areas to Improve</h4>
            <p className="text-gray-700 bg-orange-50 p-3 rounded-md">{feedback.improvements}</p>
          </div>
          
          {!isManager && !feedback.acknowledged && (
            <button
              onClick={handleAcknowledge}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{loading ? 'Acknowledging...' : 'Mark as Read'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackCard;