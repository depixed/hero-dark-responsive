import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { getLeads, Lead } from '../lib/supabase';
import { UsersIcon, CalendarIcon, TrendingUpIcon } from 'lucide-react';

const AdminDashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await getLeads();
        setLeads(data);
      } catch (error) {
        console.error('Error fetching leads:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Calculate dashboard metrics
  const totalLeads = leads.length;
  const leadsToday = leads.filter(lead => {
    const leadDate = new Date(lead.created_at);
    const today = new Date();
    return (
      leadDate.getDate() === today.getDate() &&
      leadDate.getMonth() === today.getMonth() &&
      leadDate.getFullYear() === today.getFullYear()
    );
  }).length;

  // Recent leads (last 5)
  const recentLeads = leads.slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome to your incorporation admin dashboard.</p>
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
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-gray-900 border-gray-800 text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <UsersIcon className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalLeads}</div>
                  <p className="text-xs text-gray-400">
                    Total leads collected
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Today's Leads</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leadsToday}</div>
                  <p className="text-xs text-gray-400">
                    New leads today
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUpIcon className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalLeads > 0 ? `${Math.round((leadsToday / totalLeads) * 100)}%` : '0%'}
                  </div>
                  <p className="text-xs text-gray-400">
                    Today's leads vs total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Leads */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Recent Leads</h2>
              <Card className="bg-gray-900 border-gray-800 text-white">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left p-4 text-gray-400 font-medium">Name</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Email</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Phone</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentLeads.length > 0 ? (
                          recentLeads.map((lead) => (
                            <tr key={lead.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                              <td className="p-4">{lead.name}</td>
                              <td className="p-4">{lead.email}</td>
                              <td className="p-4">{lead.phone}</td>
                              <td className="p-4">{new Date(lead.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-gray-400">
                              No leads available yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 