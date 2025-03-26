import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Subscriber = {
  id: string;
  email: string;
  type?: string;
  created_at: string;
};

const SubscribersList = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscribers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('subscribers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setSubscribers(data || []);
      } catch (error) {
        console.error('Error fetching subscribers:', error);
        toast.error('Failed to load subscribers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscribers();
  }, []);

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Subscribers</CardTitle>
        <CardDescription className="text-gray-400">
          People who signed up for early access to custom AI models
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            No subscribers yet
          </div>
        ) : (
          <div className="rounded-lg border border-gray-800">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-gray-800/50">
                  <TableHead className="text-gray-400">Email</TableHead>
                  <TableHead className="text-gray-400">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow 
                    key={subscriber.id}
                    className="border-gray-800 hover:bg-gray-800/50"
                  >
                    <TableCell className="font-medium text-white">{subscriber.email}</TableCell>
                    <TableCell className="text-gray-400">
                      {format(new Date(subscriber.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscribersList; 