import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Plus, Hash } from 'lucide-react';

export interface ChatSource {
  id: string;
  name: string;
  type: 'discord' | 'slack' | 'teams' | 'telegram' | 'local';
  unreadCount: number;
  isOnline: boolean;
  lastMessage?: string;
}

interface ChatSidebarProps {
  sources: ChatSource[];
  activeSourceId: string;
  onSourceSelect: (sourceId: string) => void;
  onAddSource: () => void;
}

const sourceIcons = {
  discord: '🎮',
  slack: '💼',
  teams: '👥',
  telegram: '✈️',
  local: '💬'
};

export function ChatSidebar({ sources, activeSourceId, onSourceSelect, onAddSource }: ChatSidebarProps) {
  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Chat Sources</h2>
          <Button onClick={onAddSource} size="sm" variant="outline">
            <Plus className="size-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="size-2 bg-green-500 rounded-full"></div>
          <span>{sources.filter(s => s.isOnline).length} sources online</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="mb-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2">INTEGRATIONS</h3>
            {sources.filter(s => s.type !== 'local').map((source) => (
              <Button
                key={source.id}
                variant={activeSourceId === source.id ? "secondary" : "ghost"}
                className="w-full justify-start mb-1 h-auto p-3"
                onClick={() => onSourceSelect(source.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="text-lg">{sourceIcons[source.type]}</div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{source.name}</span>
                      {source.isOnline && (
                        <div className="size-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                    {source.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">
                        {source.lastMessage}
                      </p>
                    )}
                  </div>
                  {source.unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {source.unreadCount}
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2">LOCAL CHATS</h3>
            {sources.filter(s => s.type === 'local').map((source) => (
              <Button
                key={source.id}
                variant={activeSourceId === source.id ? "secondary" : "ghost"}
                className="w-full justify-start mb-1 h-auto p-3"
                onClick={() => onSourceSelect(source.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Hash className="size-4 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <span className="font-medium">{source.name}</span>
                    {source.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">
                        {source.lastMessage}
                      </p>
                    )}
                  </div>
                  {source.unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {source.unreadCount}
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}