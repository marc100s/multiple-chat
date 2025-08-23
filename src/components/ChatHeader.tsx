import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MoreVertical, Settings, UserPlus, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ChatHeaderProps {
  chatName: string;
  chatType: 'discord' | 'slack' | 'teams' | 'telegram' | 'local';
  memberCount?: number;
  isOnline: boolean;
}

const platformColors = {
  discord: 'bg-[#5865F2]',
  slack: 'bg-[#4A154B]',
  teams: 'bg-[#6264A7]',
  telegram: 'bg-[#0088CC]',
  local: 'bg-primary'
};

const platformNames = {
  discord: 'Discord',
  slack: 'Slack',
  teams: 'Teams',
  telegram: 'Telegram',
  local: 'Local'
};

export function ChatHeader({ chatName, chatType, memberCount, isOnline }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <h1 className="font-medium">{chatName}</h1>
          <Badge 
            variant="secondary" 
            className={`text-xs text-white ${platformColors[chatType]}`}
          >
            {platformNames[chatType]}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className={`size-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
          {memberCount && (
            <>
              <span>•</span>
              <span>{memberCount} members</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Search className="size-4" />
        </Button>
        
        <Button variant="ghost" size="sm">
          <UserPlus className="size-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings className="size-4 mr-2" />
              Chat Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              View Members
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Leave Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}