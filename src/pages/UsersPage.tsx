import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getAllUsers, User, UserProfile } from '../lib/supabase';
import { format } from 'date-fns';
import { Calendar, Mail, Phone, User as UserIcon, Clock } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { toast } from 'react-hot-toast';

type UserWithProfile = User & { profile?: UserProfile };

const UsersPage = () => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users data. Please check your Supabase permissions.');
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        user =>
          user.email?.toLowerCase().includes(query) ||
          user.profile?.full_name?.toLowerCase().includes(query) ||
          user.profile?.phone?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Format the date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  // Get email verification status
  const getEmailVerificationStatus = (user: User) => {
    if (!user.email_confirmed_at) {
      return <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Pending</Badge>;
    }
    return <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">Verified</Badge>;
  };

  // Help notification for admins if there's limited information
  const showInfoMessageIfNeeded = () => {
    if (users.length > 0 && users[0].email === 'Email hidden - insufficient permissions') {
      return (
        <div className="bg-blue-900/30 border border-blue-700 text-blue-200 p-4 rounded-lg mb-4">
          <p>
            <strong>Administrator Notice:</strong> You're seeing limited user information because your Supabase account doesn't have access to the auth.users table.
          </p>
          <p className="text-sm mt-2">
            To see complete user details, set up the users_view as described in the documentation.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Users</h1>
            <p className="text-gray-400">Manage your registered users.</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center">
          <div className="relative w-full md:w-80">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-900 border-gray-800 text-white pl-10"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <>
            {showInfoMessageIfNeeded()}
            
            {filteredUsers.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800 text-white">
                <CardContent className="py-10 text-center">
                  <UserIcon className="h-10 w-10 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">No users found matching your search.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                <Card className="bg-gray-900 border-gray-800 text-white">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left p-4 text-gray-400 font-medium">User</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Email</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Phone</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Verification</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                    {user.profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">{user.profile?.full_name || 'Unnamed'}</p>
                                    <p className="text-xs text-gray-400">ID: {user.id.substring(0, 8)}...</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-gray-300">{user.email}</td>
                              <td className="p-4 text-gray-300">{user.profile?.phone || 'N/A'}</td>
                              <td className="p-4">{getEmailVerificationStatus(user)}</td>
                              <td className="p-4 text-gray-300">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                                  {formatDate(user.created_at)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default UsersPage; 