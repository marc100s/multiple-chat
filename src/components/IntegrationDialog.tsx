import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface IntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddIntegration: (integration: {
    type: 'discord' | 'slack' | 'teams' | 'telegram';
    name: string;
    token: string;
  }) => void;
}

const integrations = [
  {
    type: 'discord' as const,
    name: 'Discord',
    description: 'Connect to Discord servers and channels',
    icon: '🎮',
    status: 'available'
  },
  {
    type: 'slack' as const,
    name: 'Slack',
    description: 'Integrate with Slack workspaces',
    icon: '💼',
    status: 'available'
  },
  {
    type: 'teams' as const,
    name: 'Microsoft Teams',
    description: 'Connect to Teams channels and chats',
    icon: '👥',
    status: 'available'
  },
  {
    type: 'telegram' as const,
    name: 'Telegram',
    description: 'Connect to Telegram groups and channels',
    icon: '✈️',
    status: 'available'
  }
];

export function IntegrationDialog({ open, onOpenChange, onAddIntegration }: IntegrationDialogProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [token, setToken] = useState('');

  const handleAdd = () => {
    if (selectedType && name && token) {
      onAddIntegration({
        type: selectedType as any,
        name,
        token
      });
      setSelectedType(null);
      setName('');
      setToken('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Integration</DialogTitle>
          <DialogDescription>
            Connect your favorite chat platforms to manage all conversations in one place.
          </DialogDescription>
        </DialogHeader>
        
        {!selectedType ? (
          <div className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              Choose a platform to integrate with your chat ecosystem:
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {integrations.map((integration) => (
                <Card 
                  key={integration.type}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedType(integration.type)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{integration.icon}</div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {integration.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm">
                      {integration.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">
                {integrations.find(i => i.type === selectedType)?.icon}
              </div>
              <div>
                <h3 className="font-medium">
                  {integrations.find(i => i.type === selectedType)?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure your integration
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="integration-name">Integration Name</Label>
                <Input
                  id="integration-name"
                  placeholder="e.g., My Discord Server"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="integration-token">Access Token / API Key</Label>
                <Input
                  id="integration-token"
                  type="password"
                  placeholder="Enter your API token..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This token will be stored securely and only used to access your {selectedType} data.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setSelectedType(null)}>
                Back
              </Button>
              <Button onClick={handleAdd} disabled={!name || !token}>
                Add Integration
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}