'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { 
  MessageCircle, 
  Clock, 
  Bot, 
  User, 
  Zap, 
  RefreshCcw, 
  PauseCircle, 
  PlayCircle,
  AlertCircle,
  Timer,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const API_URL = '/api';

const LiveChatHandover = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchPausedChats();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchPausedChats = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/user/live-chats`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.pausedConversations);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch paused chats');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeBot = async (pageId, customerPsid) => {
    try {
      const response = await fetch(`${API_URL}/dashboard/user/live-chats/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`
        },
        body: JSON.stringify({ pageId, customerPsid })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchPausedChats();
      } else {
        alert(data.error || 'Failed to resume bot');
      }
    } catch (err) {
      alert('Error resuming bot');
    }
  };

  const getTimeElapsed = (timestamp) => {
    const start = new Date(timestamp);
    const diff = Math.floor((currentTime - start) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
  };

  const getCooldownProgress = (timestamp) => {
    const start = new Date(timestamp);
    const diff = Math.floor((currentTime - start) / 1000);
    const total = 300; // 5 minutes in seconds
    const progress = Math.min((diff / total) * 100, 100);
    return progress;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <ShieldAlert className="text-indigo-600 dark:text-indigo-500" />
            AI Takeover Control
          </h1>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-1">Manage active human-intervened chats and bot status.</p>
        </div>
        
        <button 
          onClick={fetchPausedChats}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
        >
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Status
        </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/30">
              <PauseCircle size={24} />
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-white">{conversations.length}</div>
            <div className="text-sm text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mt-1">Paused Chats</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 p-6 rounded-[2rem] flex flex-col justify-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-400">
              <Timer size={20} />
            </div>
            <div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-200">5 Minutes</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">Standard Cooldown</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 p-6 rounded-[2rem] flex flex-col justify-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-400">
              <Bot size={20} />
            </div>
            <div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-200">Auto-Resume</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">Smart AI Re-entry</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Paused Chats */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          <h2 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Active Paused Conversations</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : conversations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {conversations.map((chat) => (
              <div key={chat.customerPsid} className="bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/50 p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                        <User size={32} />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-rose-600 border-4 border-white dark:border-zinc-950 flex items-center justify-center">
                        <PauseCircle size={10} className="text-white" />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-200">Customer #{chat.customerPsid.slice(-6)}</span>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase">PSID: {chat.customerPsid}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500 font-medium">
                          <Clock size={14} />
                          Paused: {getTimeElapsed(chat.lastInteractionTime)} ago
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 font-bold">
                          <AlertCircle size={14} />
                          Human In-Control
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 lg:w-1/3">
                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                        <span>Cooldown Progress</span>
                        <span className={getCooldownProgress(chat.lastInteractionTime) >= 100 ? 'text-emerald-600 dark:text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}>
                          {Math.floor(getCooldownProgress(chat.lastInteractionTime))}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            getCooldownProgress(chat.lastInteractionTime) >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${getCooldownProgress(chat.lastInteractionTime)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleResumeBot(chat.pageId, chat.customerPsid)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 whitespace-nowrap"
                    >
                      <PlayCircle size={18} />
                      Resume Bot
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800/50 border-dashed p-12 rounded-[3rem] text-center">
            <div className="w-16 h-16 rounded-3xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300 dark:text-zinc-700 mx-auto mb-4 border border-zinc-200 dark:border-zinc-800">
              <Bot size={32} />
            </div>
            <h3 className="text-lg font-bold text-zinc-400 dark:text-zinc-500">All Bots Active</h3>
            <p className="text-zinc-500 dark:text-zinc-600 text-sm mt-1 max-w-xs mx-auto">There are currently no conversations being handled by humans. The AI is in full control.</p>
          </div>
        )}
      </div>

      {/* Pro Tip Card */}
      <div className="bg-gradient-to-r from-white dark:from-zinc-900 to-indigo-50 dark:to-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 p-8 rounded-[2.5rem] flex items-center justify-between group overflow-hidden relative transition-colors">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Zap size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Smart Takeover Mode</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1 max-w-md leading-relaxed">
              When a human replies via Facebook Inbox, NexaChat automatically pauses the bot for <span className="text-indigo-600 dark:text-indigo-400 font-bold underline underline-offset-4 decoration-indigo-500/50">5 minutes</span> to prevent AI interference.
            </p>
          </div>
        </div>
        <button className="relative z-10 p-4 rounded-2xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white transition-all group-hover:translate-x-2">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default LiveChatHandover;
