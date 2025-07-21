import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { MessageSquare, User, Lock, AlertCircle, UserPlus, Mail, Users } from 'lucide-react';
import { authAPI } from '../api';

const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    role: 'employee' as 'manager' | 'employee',
    manager_id: undefined as number | undefined
  });
  const [managers, setManagers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const loadManagers = async () => {
    try {
      const managersData = await authAPI.getManagers();
      setManagers(managersData);
    } catch (error) {
      console.error('Error loading managers:', error);
    }
  };

  const handleShowSignup = () => {
    setShowSignup(true);
    loadManagers();
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('Submitting login for:', username.trim());
      await login({ username: username.trim() });
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed. Please check your username.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.username.trim() || !signupData.email.trim()) {
      setError('Username and email are required');
      return;
    }

    if (signupData.role === 'employee' && !signupData.manager_id) {
      setError('Please select a manager for employee accounts');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await authAPI.register({
        ...signupData,
        manager_id: signupData.role === 'manager' ? undefined : signupData.manager_id
      });
      
      // Auto-login after successful registration
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      window.location.reload();
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const demoAccounts = [
    { username: 'john_manager', role: 'Manager', description: 'Can create and manage team feedback' },
    { username: 'sarah_manager', role: 'Manager', description: 'Can create and manage team feedback' },
    { username: 'alice_emp', role: 'Employee', description: 'Can view and acknowledge personal feedback' },
    { username: 'bob_emp', role: 'Employee', description: 'Can view and acknowledge personal feedback' },
    { username: 'charlie_emp', role: 'Employee', description: 'Can view and acknowledge personal feedback' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {showSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-gray-600">
            {showSignup ? 'Join the feedback system' : 'Sign in to your feedback system account'}
          </p>
        </div>

        {/* Login/Signup Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={showSignup ? handleSignup : handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {showSignup ? (
              <>
                <div>
                  <label htmlFor="signup-username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="signup-username"
                      name="username"
                      type="text"
                      value={signupData.username}
                      onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Choose a username"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    value={signupData.role}
                    onChange={(e) => setSignupData({ ...signupData, role: e.target.value as 'manager' | 'employee', manager_id: undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                
                {signupData.role === 'employee' && (
                  <div>
                    <label htmlFor="manager" className="block text-sm font-medium text-gray-700 mb-1">
                      Manager
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="manager"
                        value={signupData.manager_id || ''}
                        onChange={(e) => setSignupData({ ...signupData, manager_id: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                        required
                      >
                        <option value="">Select a manager</option>
                        {managers.map((manager) => (
                          <option key={manager.id} value={manager.id}>
                            {manager.username} ({manager.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your username"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {showSignup ? 'Creating Account...' : 'Signing in...'}
                </div>
              ) : (
                <div className="flex items-center">
                  {showSignup ? <UserPlus className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                  {showSignup ? 'Create Account' : 'Sign In'}
                </div>
              )}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowSignup(!showSignup);
                  setError('');
                  setSignupData({ username: '', email: '', role: 'employee', manager_id: undefined });
                  setUsername('');
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                {showSignup ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
            </div>
          </form>
        </div>

        {!showSignup && (
          /* Demo Accounts */
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Demo Accounts</h3>
            <div className="space-y-3">
              {demoAccounts.map((account) => (
                <div key={account.username} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{account.username}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        account.role === 'Manager' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {account.role}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{account.description}</p>
                  </div>
                  <button
                    onClick={() => setUsername(account.username)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;