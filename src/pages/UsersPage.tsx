import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { getUsers, User } from '../lib/supabase';
import { Search, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { toast } from "react-hot-toast";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sortField, setSortField] = useState<keyof User>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users data. Please try again later.');
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
          (user.full_name && user.full_name.toLowerCase().includes(query)) ||
          user.email.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Sort users
  useEffect(() => {
    const sorted = [...filteredUsers].sort((a, b) => {
      const fieldA = a[sortField] || '';
      const fieldB = b[sortField] || '';
      
      // Convert to strings for comparison if they're not already
      const strA = typeof fieldA === 'string' ? fieldA : String(fieldA);
      const strB = typeof fieldB === 'string' ? fieldB : String(fieldB);

      if (sortDirection === 'asc') {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    });
    
    setFilteredUsers(sorted);
  }, [sortField, sortDirection]);

  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: keyof User) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
  };

  // Format the date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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

        {/* Search and filters */}
        <div className="flex justify-between items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-800 text-white w-full md:w-80"
            />
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
          <>
            {/* Users table */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th 
                        className="text-left p-4 text-gray-400 font-medium cursor-pointer"
                        onClick={() => handleSort('full_name')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Name</span>
                          {getSortIcon('full_name')}
                        </div>
                      </th>
                      <th 
                        className="text-left p-4 text-gray-400 font-medium cursor-pointer"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Email</span>
                          {getSortIcon('email')}
                        </div>
                      </th>
                      <th 
                        className="text-left p-4 text-gray-400 font-medium cursor-pointer"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Registered</span>
                          {getSortIcon('created_at')}
                        </div>
                      </th>
                      <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="p-4 text-white">{user.full_name || 'N/A'}</td>
                          <td className="p-4 text-white">{user.email}</td>
                          <td className="p-4 text-gray-400">{formatDate(user.created_at || '')}</td>
                          <td className="p-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewUser(user)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-gray-400">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl">User Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                Detailed information about the user.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-800">
                <span className="text-gray-400">Name</span>
                <span className="col-span-2 text-white">{selectedUser.full_name || 'N/A'}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-800">
                <span className="text-gray-400">Email</span>
                <span className="col-span-2 text-white">{selectedUser.email}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-800">
                <span className="text-gray-400">Phone</span>
                <span className="col-span-2 text-white">{selectedUser.phone || 'N/A'}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-800">
                <span className="text-gray-400">Role</span>
                <span className="col-span-2 text-white">{selectedUser.role || 'user'}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-800">
                <span className="text-gray-400">Registered</span>
                <span className="col-span-2 text-white">{formatDate(selectedUser.created_at || '')}</span>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                onClick={() => setSelectedUser(null)}
                className="bg-gray-800 hover:bg-gray-700 text-white"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
};

export default UsersPage; 