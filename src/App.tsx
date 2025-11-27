import { useState, useEffect, useCallback } from 'react';
import { ChatSidebar, ChatSource } from './components/ChatSidebar';
import { ChatWindow } from './components/ChatWindow';
import { IntegrationDialog } from './components/IntegrationDialog';
import { AuthDialog } from './components/AuthDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { ChatMessage } from './components/ChatMessage';
import { useChat } from './hooks/useChat';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { LogOut, User, Settings, Menu, X } from 'lucide-react';
import { projectId, publicAnonKey } from './utils/supabase/info';

// Demo data for offline mode
const demoSources: ChatSource[] = [
  {
    id: 'demo-1',
    name: 'Gaming Community',
    type: 'discord',
    unreadCount: 3,
    isOnline: true,
    lastMessage: 'Hey everyone! Ready for tonight\'s raid?'
  },
  {
    id: 'demo-2',
    name: 'Work Team',
    type: 'slack',
    unreadCount: 0,
    isOnline: true,
    lastMessage: 'Meeting notes have been shared'
  },
  {
    id: 'demo-3',
    name: 'Welcome Chat',
    type: 'local',
    unreadCount: 0,
    isOnline: true,
    lastMessage: 'Welcome to the chat ecosystem!'
  }
];

const demoMessages: ChatMessage[] = [
  {
    id: 'demo-msg-1',
    content: 'Welcome to the Chat Ecosystem demo! 🎉',
    sender: {
      name: 'System',
      avatar: '',
      platform: 'local'
    },
    timestamp: new Date(Date.now() - 300000),
    isOwn: false
  },
  {
    id: 'demo-msg-2',
    content: 'This is a demonstration of how you can connect multiple chat platforms in one place.',
    sender: {
      name: 'System',
      avatar: '',
      platform: 'local'
    },
    timestamp: new Date(Date.now() - 240000),
    isOwn: false
  },
  {
    id: 'demo-msg-3',
    content: 'Sign up to start connecting your real chat accounts!',
    sender: {
      name: 'You',
      avatar: '',
      platform: 'local'
    },
    timestamp: new Date(Date.now() - 120000),
    isOwn: true
  }
];

export default function App() {
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { name?: string; avatar?: string; notifications?: Record<string, boolean> } } | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [activeSourceId, setActiveSourceId] = useState<string>('');
  const [demoMode, setDemoMode] = useState(true);
  const [demoMessagesState, setDemoMessagesState] = useState<ChatMessage[]>(demoMessages);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [showKeyboardShortcut, setShowKeyboardShortcut] = useState(false);

  const { 
    sources, 
    messages, 
    error, 
    sendMessage, 
    addSource, 
    fetchMessages,
    clearError 
  } = useChat({ accessToken, userId: user?.id ?? null });

  // Toggle sidebar function
  const toggleSidebar = useCallback(() => {
    setSidebarVisible(prev => !prev);
    // Show keyboard shortcut indicator briefly
    setShowKeyboardShortcut(true);
    setTimeout(() => setShowKeyboardShortcut(false), 2000);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+B to toggle sidebar
      if (event.ctrlKey && event.key === 'b') {
        event.preventDefault();
        toggleSidebar();
      }
      // Escape to close dialogs
      if (event.key === 'Escape') {
        if (showSettingsDialog) setShowSettingsDialog(false);
        if (showIntegrationDialog) setShowIntegrationDialog(false);
        if (showAuthDialog) setShowAuthDialog(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, showSettingsDialog, showIntegrationDialog, showAuthDialog]);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          `https://${projectId}.supabase.co`,
          publicAnonKey
        );

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          setUser(session.user);
          setAccessToken(session.access_token);
          setDemoMode(false);
        } else {
          // Start in demo mode
          setActiveSourceId('demo-3');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // Start in demo mode if there's an error
        setActiveSourceId('demo-3');
      }
    };

    checkSession();
  }, []);

  // Set active source when sources are loaded (authenticated mode)
  useEffect(() => {
    if (!demoMode && sources.length > 0 && !activeSourceId) {
      setActiveSourceId(sources[0].id);
    }
  }, [sources, activeSourceId, demoMode]);

  // Fetch messages when active source changes (authenticated mode)
  useEffect(() => {
    if (!demoMode && activeSourceId && accessToken) {
      fetchMessages(activeSourceId);
    }
  }, [activeSourceId, accessToken, fetchMessages, demoMode]);

  const handleAuthSuccess = (userData: { id: string; user_metadata?: Record<string, unknown> }, token: string) => {
    setUser(userData);
    setAccessToken(token);
    setDemoMode(false);
  };

  const handleUserUpdate = (userData: { id: string; user_metadata?: Record<string, unknown> }) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );

      await supabase.auth.signOut();
      setUser(null);
      setAccessToken(null);
      setActiveSourceId('demo-3');
      setDemoMode(true);
      setDemoMessagesState(demoMessages);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSendMessage = (content: string) => {
    if (demoMode) {
      // Demo mode - add message locally
      const newMessage: ChatMessage = {
        id: `demo-msg-${Date.now()}`,
        content,
        sender: {
          name: 'You',
          avatar: '',
          platform: 'local'
        },
        timestamp: new Date(),
        isOwn: true
      };
      setDemoMessagesState(prev => [...prev, newMessage]);
    } else {
      // Authenticated mode
      const activeSource = sources.find(s => s.id === activeSourceId);
      if (activeSource && accessToken) {
        sendMessage(content, activeSourceId, activeSource.type);
      }
    }
  };

  const handleAddIntegration = async (integration: {
    type: 'discord' | 'slack' | 'teams' | 'telegram';
    name: string;
    token: string;
  }) => {
    if (demoMode) {
      // In demo mode, prompt to sign up
      setShowAuthDialog(true);
      return;
    }

    const newSource = await addSource(integration.name, integration.type, integration.token);
    if (newSource) {
      setActiveSourceId(newSource.id);
    }
  };

  const handleSourceSelect = (sourceId: string) => {
    setActiveSourceId(sourceId);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const currentSources = demoMode ? demoSources : sources;
  const currentMessages = demoMode ? demoMessagesState : messages;
  const activeSource = currentSources.find(s => s.id === activeSourceId);

  if (!activeSource && currentSources.length === 0) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-medium mb-2">Loading your chats...</h2>
          <p className="text-sm text-muted-foreground">Setting up your chat ecosystem</p>
        </div>
      </div>
    );
  }

  if (!activeSource) {
    return (
      <div className="size-full flex bg-background">
        {sidebarVisible && (
          <ChatSidebar
            sources={currentSources}
            activeSourceId={activeSourceId}
            onSourceSelect={handleSourceSelect}
            onAddSource={() => setShowIntegrationDialog(true)}
          />
        )}
        
        <div className="flex-1 flex flex-col">
          {/* Top bar with toggle */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="flex items-center gap-2"
              >
                {sidebarVisible ? <X className="size-4" /> : <Menu className="size-4" />}
                {sidebarVisible ? 'Hide Sources' : 'Show Sources'}
              </Button>
              {showKeyboardShortcut && (
                <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded animate-in fade-in duration-200">
                  Ctrl+B
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {demoMode ? (
                <>
                  <div className="flex items-center gap-2 text-sm bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border">
                    <span>Demo Mode</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowAuthDialog(true)}>
                    Sign Up
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 text-sm bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border">
                    <Avatar className="size-6">
                      <AvatarImage src={user?.user_metadata?.avatar} alt={user?.user_metadata?.name} />
                      <AvatarFallback className="text-xs">
                        {user?.user_metadata?.name ? getInitials(user.user_metadata.name) : <User className="size-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user?.user_metadata?.name || user?.email}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowSettingsDialog(true)}>
                    <Settings className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="size-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="font-medium mb-2">No chat selected</h2>
              <p className="text-sm text-muted-foreground">Choose a chat source to start messaging</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full flex bg-background">
      {/* Sidebar */}
      {sidebarVisible && (
        <ChatSidebar
          sources={currentSources}
          activeSourceId={activeSourceId}
          onSourceSelect={handleSourceSelect}
          onAddSource={() => setShowIntegrationDialog(true)}
        />
      )}
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar with toggle and user info */}
        <div className="p-4 border-b flex items-center justify-between bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="flex items-center gap-2"
            >
              {sidebarVisible ? <X className="size-4" /> : <Menu className="size-4" />}
              {sidebarVisible ? 'Hide Sources' : 'Show Sources'}
            </Button>
            {showKeyboardShortcut && (
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded animate-in fade-in duration-200">
                Ctrl+B
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {demoMode ? (
              <>
                <div className="flex items-center gap-2 text-sm bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border">
                  <span>Demo Mode</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowAuthDialog(true)}>
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 text-sm bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border">
                  <Avatar className="size-6">
                    <AvatarImage src={user?.user_metadata?.avatar} alt={user?.user_metadata?.name} />
                    <AvatarFallback className="text-xs">
                      {user?.user_metadata?.name ? getInitials(user.user_metadata.name) : <User className="size-3" />}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user?.user_metadata?.name || user?.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowSettingsDialog(true)}>
                  <Settings className="size-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="size-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Chat window */}
        <ChatWindow
          messages={currentMessages}
          chatName={activeSource.name}
          chatType={activeSource.type}
          memberCount={currentSources.length}
          isOnline={activeSource.isOnline}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Dialogs */}
      <IntegrationDialog
        open={showIntegrationDialog}
        onOpenChange={setShowIntegrationDialog}
        onAddIntegration={handleAddIntegration}
      />

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onAuthSuccess={handleAuthSuccess}
      />

      {!demoMode && (
        <SettingsDialog
          open={showSettingsDialog}
          onOpenChange={setShowSettingsDialog}
          user={user}
          accessToken={accessToken}
          onUserUpdate={handleUserUpdate}
        />
      )}

      {/* Error notification */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm">
          {error}
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2 text-xs" 
            onClick={clearError}
          >
            ✕
          </Button>
        </div>
      )}

      {/* Keyboard shortcut helper */}
      <div className="fixed bottom-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border">
        Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+B</kbd> to toggle sidebar
      </div>
    </div>
  );
}