import React from 'react';
import { History as HistoryIcon, FileSearch, FilePlus, MessageSquare, Clock, Download, ExternalLink, Trash2 } from 'lucide-react';
import { HistoryItem } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface HistoryProps {
  history: HistoryItem[];
  onRevisit: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

export function History({ history, onRevisit, onDelete }: HistoryProps) {
  const getTypeIcon = (type: HistoryItem['type']) => {
    switch (type) {
      case 'analysis': return <FileSearch size={18} className="text-blue-500" />;
      case 'generation': return <FilePlus size={18} className="text-green-500" />;
      case 'chat': return <MessageSquare size={18} className="text-purple-500" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('uz-UZ', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto custom-scrollbar p-6">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
              <HistoryIcon className="text-blue-600" size={32} />
              Activity History
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Revisit your previous legal analyses, generated documents, and chat sessions.
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400">
              <HistoryIcon size={32} />
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">No history items found yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 hover:border-blue-500 transition-all shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-800">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-zinc-900 dark:text-white truncate">{item.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(item.timestamp)}
                      </span>
                      <span className="capitalize px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-medium">
                        {item.type}
                      </span>
                      {item.metadata?.templateUsed && (
                        <span className="text-blue-600 dark:text-blue-400 font-medium">Template: {item.metadata.templateName}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onRevisit(item)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    title="View Details"
                  >
                    <ExternalLink size={16} />
                  </button>
                  {item.type === 'generation' && (
                    <button
                      className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
