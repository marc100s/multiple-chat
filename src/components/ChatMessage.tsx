import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

export interface ChatMessage {
  id: string;
  content: string;
  sender: {
    name: string;
    avatar?: string;
    platform: 'discord' | 'slack' | 'teams' | 'telegram' | 'local';
  };
  timestamp: Date;
  isOwn: boolean;
}

interface ChatMessageProps {
  message: ChatMessage;
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

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`flex gap-3 p-3 ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="size-8 flex-shrink-0">
        <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
        <AvatarFallback className={platformColors[message.sender.platform]}>
          {message.sender.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col gap-1 max-w-[70%] ${message.isOwn ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{message.sender.name}</span>
          <Badge variant="secondary" className="text-xs">
            {platformNames[message.sender.platform]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div className={`rounded-lg px-3 py-2 ${
          message.isOwn 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        }`}>
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    </div>
  );
}