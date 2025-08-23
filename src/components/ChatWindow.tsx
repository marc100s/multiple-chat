import { ScrollArea } from './ui/scroll-area';
import { ChatMessage, ChatMessage as ChatMessageType } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Hash, Users } from 'lucide-react';

interface ChatWindowProps {
  messages: ChatMessageType[];
  chatName: string;
  chatType: 'discord' | 'slack' | 'teams' | 'telegram' | 'local';
  memberCount?: number;
  isOnline: boolean;
  onSendMessage: (message: string) => void;
}

const sourceIcons = {
  discord: '🎮',
  slack: '💼',
  teams: '👥',
  telegram: '✈️',
  local: '💬'
};

export function ChatWindow({ 
  messages, 
  chatName, 
  chatType, 
  memberCount, 
  isOnline, 
  onSendMessage 
}: ChatWindowProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="border-b bg-background/50 p-4">
        <div className="flex items-center gap-3">
          <div className="text-xl">{sourceIcons[chatType]}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-medium">{chatName}</h2>
              {isOnline && (
                <div className="size-2 bg-green-500 rounded-full"></div>
              )}
            </div>
            {memberCount && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="size-3" />
                <span>{memberCount} sources connected</span>
              </div>
            )}
          </div>
          {chatType === 'local' && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Hash className="size-4" />
              <span>Local Chat</span>
            </div>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-0">
        <div className="min-h-full">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div className="max-w-md">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="font-medium mb-2">No messages yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start a conversation by sending a message below.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
      
      <ChatInput 
        onSendMessage={onSendMessage} 
        placeholder={`Message ${chatName}...`}
      />
    </div>
  );
}