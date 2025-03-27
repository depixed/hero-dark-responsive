import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { getUsers, UserProfile } from '../lib/supabase';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof UserProfile>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await getUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load user data. Please try again later.');
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
          (user.full_name || '').toLowerCase().includes(query) ||
          user.user_id.toLowerCase().includes(query) ||
          (user.phone || '').toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Sort users
  useEffect(() => {
    const sorted = [...filteredUsers].sort((a, b) => {
      let fieldA = a[sortField];
      let fieldB = b[sortField];
      
      // Handle undefined or null values
      if (fieldA === undefined || fieldA === null) fieldA = '';
      if (fieldB === undefined || fieldB === null) fieldB = '';
      
      // Convert to strings for comparison if they're not already
      if (typeof fieldA !== 'string') fieldA = String(fieldA);
      if (typeof fieldB !== 'string') fieldB = String(fieldB);

      if (sortDirection === 'asc') {
        return fieldA.localeCompare(fieldB);
      } else {
        return fieldB.localeCompare(fieldA);
      }
    });
    
    setFilteredUsers(sorted);
  }, [sortField, sortDirection]);

  const handleSort = (field: keyof UserProfile) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: keyof UserProfile) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Registered Users</h1>
            <p className="text-gray-400">Manage your application users</p>
          </div>
          
          {/* Search */}
          <div className="w-full sm:w-auto flex items-center space-x-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-10 bg-gray-900 border-gray-800 text-white h-10 w-full"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th 
                        className="text-left p-4 text-gray-400 font-medium cursor-pointer"
                        onClick={() => handleSort('full_name')}
                      >
                        <div className="flex items-center">
                          Name {getSortIcon('full_name')}
                        </div>
                      </th>
                      <th 
                        className="text-left p-4 text-gray-400 font-medium cursor-pointer"
                        onClick={() => handleSort('user_id')}
                      >
                        <div className="flex items-center">
                          User ID {getSortIcon('user_id')}
                        </div>
                      </th>
                      <th 
                        className="text-left p-4 text-gray-400 font-medium cursor-pointer"
                        onClick={() => handleSort('phone')}
                      >
                        <div className="flex items-center">
                          Phone {getSortIcon('phone')}
                        </div>
                      </th>
                      <th 
                        className="text-left p-4 text-gray-400 font-medium cursor-pointer"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center">
                          Date Joined {getSortIcon('created_at')}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="p-4">{user.full_name || 'N/A'}</td>
                          <td className="p-4">{user.user_id.substring(0, 8)}...</td>
                          <td className="p-4">{user.phone || 'N/A'}</td>
                          <td className="p-4">{formatDate(user.created_at || user.updated_at)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-400">
                          No registered users available.
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