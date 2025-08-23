import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '../components/ChatMessage';
import { ChatSource } from '../components/ChatSidebar';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface UseChatProps {
  accessToken: string | null;
  userId: string | null;
}

export function useChat({ accessToken, userId }: UseChatProps) {
  const [sources, setSources] = useState<ChatSource[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-b21717d1`;

  // Fetch user's chat sources
  const fetchSources = useCallback(async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${baseUrl}/sources`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sources');
      }

      const result = await response.json();
      setSources(result.sources || []);
    } catch (err: any) {
      console.error('Error fetching sources:', err);
      setError(err.message);
    }
  }, [accessToken, baseUrl]);

  // Fetch messages for a specific source
  const fetchMessages = useCallback(async (sourceId: string) => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/messages/${sourceId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const result = await response.json();
      const formattedMessages: ChatMessage[] = result.messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender: {
          name: msg.senderName,
          avatar: '',
          platform: msg.platform
        },
        timestamp: new Date(msg.timestamp),
        isOwn: msg.isOwn
      }));

      setMessages(formattedMessages);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, baseUrl]);

  // Send a message
  const sendMessage = useCallback(async (content: string, sourceId: string, platform: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          content,
          sourceId,
          platform
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      
      // Add the message locally
      const newMessage: ChatMessage = {
        id: result.message.id,
        content: result.message.content,
        sender: {
          name: result.message.senderName,
          avatar: '',
          platform: result.message.platform
        },
        timestamp: new Date(result.message.timestamp),
        isOwn: true
      };

      setMessages(prev => [...prev, newMessage]);

      // Update the source's last message
      setSources(prev => prev.map(source => 
        source.id === sourceId 
          ? { ...source, lastMessage: content }
          : source
      ));

    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message);
    }
  }, [accessToken, baseUrl]);

  // Add a new integration source
  const addSource = useCallback(async (name: string, type: string, token: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${baseUrl}/sources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name,
          type,
          token
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add source');
      }

      const result = await response.json();
      
      const newSource: ChatSource = {
        id: result.source.id,
        name: result.source.name,
        type: result.source.type,
        unreadCount: 0,
        isOnline: result.source.isOnline,
        lastMessage: ''
      };

      setSources(prev => [...prev, newSource]);
      return newSource;

    } catch (err: any) {
      console.error('Error adding source:', err);
      setError(err.message);
      return null;
    }
  }, [accessToken, baseUrl]);

  // Initialize default sources for new users
  const initializeDefaultSources = useCallback(async () => {
    if (!accessToken || sources.length > 0) return;

    const defaultSources = [
      { name: 'Welcome Chat', type: 'local', token: 'local' }
    ];

    for (const source of defaultSources) {
      await addSource(source.name, source.type, source.token);
    }
  }, [accessToken, sources.length, addSource]);

  // Load sources when component mounts or auth changes
  useEffect(() => {
    if (accessToken) {
      fetchSources().then(() => {
        // Initialize default sources if none exist
        setTimeout(initializeDefaultSources, 100);
      });
    } else {
      setSources([]);
      setMessages([]);
    }
  }, [accessToken, fetchSources, initializeDefaultSources]);

  // Poll for new messages every 5 seconds (in production, use WebSocket)
  useEffect(() => {
    if (!accessToken || sources.length === 0) return;

    const interval = setInterval(() => {
      // Refresh messages for active source
      const activeSource = sources[0]; // For now, just refresh first source
      if (activeSource) {
        fetchMessages(activeSource.id);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [accessToken, sources, fetchMessages]);

  return {
    sources,
    messages,
    loading,
    error,
    sendMessage,
    addSource,
    fetchMessages,
    clearError: () => setError(null)
  };
}