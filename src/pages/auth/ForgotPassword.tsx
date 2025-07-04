import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      const success = await resetPassword(email);
      if (success) {
        setIsSubmitted(true);
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white px-8 py-10 shadow-md">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Reset Password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isSubmitted ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Request Submitted</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      If an account exists with the email {email}, you will receive password reset instructions.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      to="/login"
                      className="inline-flex items-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <KeyRound className="h-5 w-5 text-blue-500 group-hover:text-blue-400" aria-hidden="true" />
                  </span>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>

              <div className="flex items-center justify-center">
                <Link
                  to="/login"
                  className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;