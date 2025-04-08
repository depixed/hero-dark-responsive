import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import supabase from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Save } from 'lucide-react';

interface AiSettings {
  id?: string;
  openai_api_key?: string;
  google_gemini_api_key?: string;
  default_ai_provider?: 'openai' | 'gemini';
}

const AiSettingsPage = () => {
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [openAiKey, setOpenAiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [defaultProvider, setDefaultProvider] = useState<'openai' | 'gemini'>('openai');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
        setOpenAiKey(data.openai_api_key || '');
        setGeminiKey(data.google_gemini_api_key || '');
        setDefaultProvider(data.default_ai_provider || 'openai');
      } else {
        setSettings({});
        setOpenAiKey('');
        setGeminiKey('');
        setDefaultProvider('openai');
      }
    } catch (error: any) {
      console.error('Error fetching AI settings:', error);
      toast.error('Failed to load AI settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const updatedSettings = {
        openai_api_key: openAiKey,
        google_gemini_api_key: geminiKey,
        default_ai_provider: defaultProvider,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (settings && settings.id) {
        const { data, error } = await supabase
          .from('ai_settings')
          .update(updatedSettings)
          .eq('id', settings.id)
          .select();
          
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('ai_settings')
          .insert([updatedSettings])
          .select();
          
        if (error) throw error;
        result = data;
        if (result && result[0]) {
          setSettings(result[0]);
        }
      }

      toast.success('AI settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving AI settings:', error);
      toast.error('Failed to save AI settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">AI Settings</h1>

        {loading ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 text-center text-gray-400">
              Loading settings...
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
              <CardTitle>API Keys & Defaults</CardTitle>
              <CardDescription className="text-gray-400">
                Manage API keys and select the default AI provider for chat features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="openai-key" className="text-gray-300">OpenAI API Key</Label>
                <Input
                  id="openai-key"
                  type="password"
                  value={openAiKey}
                  onChange={(e) => setOpenAiKey(e.target.value)}
                  placeholder="sk-..."
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gemini-key" className="text-gray-300">Google Gemini API Key</Label>
                <Input
                  id="gemini-key"
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-provider" className="text-gray-300">Default AI Provider</Label>
                <Select 
                  value={defaultProvider} 
                  onValueChange={(value: 'openai' | 'gemini') => setDefaultProvider(value)}
                >
                  <SelectTrigger id="default-provider" className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select default AI" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 pt-1">
                  Choose the default AI model used for chat unless specified otherwise.
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-800 pt-4">
              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                className="ml-auto bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
              >
                {saving ? 'Saving...' : <><Save className="h-4 w-4" /> Save Settings</>}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AiSettingsPage; 