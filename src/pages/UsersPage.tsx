import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import supabase from '../lib/supabase';
import { Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  raw_user_meta_data: any;
  email_confirmed_at: string | null;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // Direct SQL query to fetch users from auth.users
        const { data, error } = await supabase.from('users_view').select('*');
        
        if (error) {
          throw error;
        }
        
        setUsers(data || []);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-400">Manage your application users.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
              <span className="text-gray-400">Loading users...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
              <CardTitle>Authentication Users</CardTitle>
              <CardDescription className="text-gray-400">
                {users.length} {users.length === 1 ? 'user' : 'users'} registered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-4 text-gray-400 font-medium">Email</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Full Name</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Created</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Last Sign In</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="p-4">{user.email}</td>
                          <td className="p-4">
                            {user.raw_user_meta_data?.full_name || '-'}
                          </td>
                          <td className="p-4">
                            {user.email_confirmed_at ? (
                              <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
                                Verified
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">
                                Pending
                              </Badge>
                            )}
                          </td>
                          <td className="p-4">{formatDate(user.created_at)}</td>
                          <td className="p-4">{formatDate(user.last_sign_in_at)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-gray-400">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default UsersPage; 