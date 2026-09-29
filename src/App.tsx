import { useEffect, useState } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { ChatScreen } from './components/ChatScreen';
import { useChatsStore } from './store/chatsStore';
import type { Credentials } from './types';
import './styles.css';

const STORAGE_KEY = 'max-credentials';

export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      setCredentials(JSON.parse(raw) as Credentials);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleAuth = (creds: Credentials): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
    setCredentials(creds);
  };

  const handleLogout = (): void => {
    localStorage.removeItem(STORAGE_KEY);
    useChatsStore.getState().clearAll();
    setCredentials(null);
  };

  if (!credentials) return <AuthScreen onAuth={handleAuth} />;
  return <ChatScreen credentials={credentials} onLogout={handleLogout} />;
}