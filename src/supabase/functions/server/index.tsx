import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Initialize storage buckets on startup
async function initializeStorage() {
  try {
    const avatarBucketName = 'make-b21717d1-avatars';
    
    // Check if avatar bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarBucketExists = buckets?.some(bucket => bucket.name === avatarBucketName);
    
    if (!avatarBucketExists) {
      console.log('Creating avatar storage bucket...');
      const { error } = await supabase.storage.createBucket(avatarBucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (error) {
        console.error('Failed to create avatar bucket:', error);
      } else {
        console.log('Avatar storage bucket created successfully');
      }
    } else {
      console.log('Avatar storage bucket already exists');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Initialize storage on server start
initializeStorage();

// Auth routes
app.post('/make-server-b21717d1/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Auth error during signup:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Server error during signup:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/make-server-b21717d1/messages', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user?.id) {
      console.log('Authorization error while posting message:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { content, sourceId, platform } = await c.req.json();
    
    const message = {
      id: `msg_${Date.now()}_${user.id}`,
      content,
      sourceId,
      senderId: user.id,
      senderName: user.user_metadata?.name || 'Unknown User',
      senderAvatar: user.user_metadata?.avatar || '',
      platform,
      timestamp: new Date().toISOString(),
      isOwn: false // Will be set to true on client side for sender
    };

    // Store message in KV store
    await kv.set(`message:${message.id}`, message);
    
    // Add to source's message list
    const sourceMessagesKey = `source:${sourceId}:messages`;
    const existingMessages = await kv.get(sourceMessagesKey) || [];
    const updatedMessages = [...existingMessages, message.id].slice(-100); // Keep last 100 messages
    await kv.set(sourceMessagesKey, updatedMessages);

    return c.json({ message });
  } catch (error) {
    console.log('Error posting message:', error);
    return c.json({ error: 'Failed to post message' }, 500);
  }
});

app.get('/make-server-b21717d1/messages/:sourceId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user?.id) {
      console.log('Authorization error while fetching messages:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const sourceId = c.req.param('sourceId');
    const sourceMessagesKey = `source:${sourceId}:messages`;
    const messageIds = await kv.get(sourceMessagesKey) || [];
    
    const messages = [];
    for (const messageId of messageIds) {
      const message = await kv.get(`message:${messageId}`);
      if (message) {
        // Mark as own message if sent by current user
        message.isOwn = message.senderId === user.id;
        messages.push(message);
      }
    }

    return c.json({ messages });
  } catch (error) {
    console.log('Error fetching messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

app.post('/make-server-b21717d1/sources', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user?.id) {
      console.log('Authorization error while creating source:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name, type, token } = await c.req.json();
    
    const source = {
      id: `src_${Date.now()}_${user.id}`,
      name,
      type,
      userId: user.id,
      token, // In production, encrypt this
      isOnline: true,
      unreadCount: 0,
      lastMessage: '',
      createdAt: new Date().toISOString()
    };

    await kv.set(`source:${source.id}`, source);
    
    // Add to user's sources list
    const userSourcesKey = `user:${user.id}:sources`;
    const existingSources = await kv.get(userSourcesKey) || [];
    await kv.set(userSourcesKey, [...existingSources, source.id]);

    return c.json({ source });
  } catch (error) {
    console.log('Error creating source:', error);
    return c.json({ error: 'Failed to create source' }, 500);
  }
});

app.get('/make-server-b21717d1/sources', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user?.id) {
      console.log('Authorization error while fetching sources:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userSourcesKey = `user:${user.id}:sources`;
    const sourceIds = await kv.get(userSourcesKey) || [];
    
    const sources = [];
    for (const sourceId of sourceIds) {
      const source = await kv.get(`source:${sourceId}`);
      if (source) {
        // Don't return sensitive token data
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { token, ...safeSource } = source;
        sources.push(safeSource);
      }
    }

    return c.json({ sources });
  } catch (error) {
    console.log('Error fetching sources:', error);
    return c.json({ error: 'Failed to fetch sources' }, 500);
  }
});

// Health check
app.get('/make-server-b21717d1/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);