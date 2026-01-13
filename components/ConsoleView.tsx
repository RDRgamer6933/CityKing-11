
import React, { useEffect, useRef } from 'react';
import { ConsoleLog } from '../types';

interface ConsoleViewProps {
  logs: ConsoleLog[];
}

const ConsoleView: React.FC<ConsoleViewProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black mb-1">Developer Console</h2>
          <p className="text-zinc-500">Live monitoring of JVM process and launcher hooks.</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors">Clear Logs</button>
           <button className="px-4 py-2 bg-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-500 transition-colors">Export .log</button>
        </div>
      </div>

      <div className="flex-1 bg-black rounded-3xl border border-zinc-800 p-6 overflow-y-auto custom-scrollbar shadow-inner">
        <div className="console-font space-y-1">
          {logs.length === 0 ? (
            <p className="text-zinc-700 animate-pulse">Waiting for process start...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-4 text-sm whitespace-pre-wrap">
                <span className="text-zinc-600 min-w-[80px] select-none">[{log.timestamp}]</span>
                <span className={`font-bold min-w-[60px] text-center rounded text-[10px] py-0.5 select-none ${
                  log.level === 'INFO' ? 'text-blue-400 bg-blue-400/10' :
                  log.level === 'ERROR' ? 'text-red-400 bg-red-400/10' :
                  log.level === 'WARN' ? 'text-amber-400 bg-amber-400/10' :
                  'text-zinc-500 bg-zinc-500/10'
                }`}>
                  {log.level}
                </span>
                <span className={`${
                  log.level === 'ERROR' ? 'text-red-300' :
                  log.level === 'WARN' ? 'text-amber-200' :
                  'text-zinc-300'
                }`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};

export default ConsoleView;
