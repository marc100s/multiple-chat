import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Paperclip, Smile } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
}

export function ChatInput({ onSendMessage, placeholder = "Type a message..." }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t bg-background">
      <Button type="button" variant="ghost" size="sm" className="flex-shrink-0">
        <Paperclip className="size-4" />
      </Button>
      
      <div className="flex-1 relative">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="absolute right-1 top-1/2 -translate-y-1/2 size-8"
        >
          <Smile className="size-4" />
        </Button>
      </div>
      
      <Button type="submit" size="sm" disabled={!message.trim()}>
        <Send className="size-4" />
      </Button>
    </form>
  );
}