import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Send, 
  Copy, 
  Trash2, 
  History as HistoryIcon, 
  X, 
  Loader2, 
  ChevronDown, 
  Shield, 
  Check,
  Download,
  MessageSquare,
  Code2,
  Fingerprint,
  XCircle
} from 'lucide-react';
import './index.css';

const MODELS = [
  { label: 'Claude 4 Sonnet', value: 'claude-3-5-sonnet-20241022' },
  { label: 'Gemini 2.5 Flash', value: 'gemini-1.5-flash' },
  { label: 'GPT-4.1 Turbo', value: 'gpt-4o' },
];

const SEVERITY_LEVELS = {
  LOW: { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'LOW' },
  MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'MEDIUM' },
  HIGH: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'HIGH' },
  CRITICAL: { color: 'text-red-600', bg: 'bg-red-600/10', label: 'CRITICAL' },
};

// Custom Dropdown Component with Vercel-like styling
function VercelDropdown({ options, value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef();

  React.useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative w-48">
      <button
        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 hover:border-zinc-700 transition-all"
        onClick={() => setOpen(o => !o)}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected?.label || 'Select model'}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      {open && (
        <ul className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg animate-fadeIn">
          {options.map(opt => (
            <li
              key={opt.value}
              className={`px-3 py-2 text-sm cursor-pointer ${
                value === opt.value 
                  ? 'bg-zinc-800 text-white' 
                  : 'text-zinc-300 hover:bg-zinc-800'
              } transition-colors`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              role="option"
              aria-selected={value === opt.value}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SecurityScore({ score }) {
  const getScoreColor = (score) => {
    if (score >= 90) return 'from-green-400 to-green-500';
    if (score >= 70) return 'from-yellow-400 to-yellow-500';
    if (score >= 50) return 'from-orange-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return { text: 'SECURE', color: 'text-green-400' };
    if (score >= 70) return { text: 'MODERATE', color: 'text-yellow-400' };
    if (score >= 50) return { text: 'VULNERABLE', color: 'text-orange-400' };
    return { text: 'CRITICAL', color: 'text-red-400' };
  };

  const scoreInfo = getScoreLabel(score);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${scoreInfo.color}`}>
          {scoreInfo.text}
        </span>
        <span className="text-2xl font-bold cyber-gradient">{score}</span>
      </div>
      <div className="relative w-full h-2 bg-[#1a1b26] rounded-full overflow-hidden">
        <div
          className={`absolute h-full rounded-full bg-gradient-to-r ${getScoreColor(score)} score-bar`}
          style={{ '--score-percent': `${score}%` }}
        />
      </div>
    </div>
  );
}

function WelcomeContent() {
  return (
    <div className="text-center space-y-6 py-5">
      <div className="inline-block p-4 rounded-full bg-[#1a1b26] mb-4 cyber-border">
        <Fingerprint className="w-12 h-12 cyber-gradient" />
      </div>
      <h2 className="text-3xl font-bold font-orbitron mt-[-10px]">Welcome to CodeScope</h2>
      <p className="text-zinc-400 max-w-md mx-auto font-space">
        Your AI-powered vulnerability scanner. Select code from GitHub to analyze potential security risks and get detailed recommendations.
      </p>
      <div className="flex flex-col items-center space-y-3 text-sm text-zinc-500 font-space">
        <p className="flex items-center space-x-2">
          <Code2 className="w-4 h-4" />
          <span>Real-time code analysis</span>
        </p>
        <p className="flex items-center space-x-2">
          <Shield className="w-4 h-4" />
          <span>Security score assessment</span>
        </p>
        <p className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4" />
          <span>Detailed vulnerability reports</span>
        </p>
      </div>
    </div>
  );
}

function formatCodeBlock(code) {
  return (
    <pre className="code-block relative group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="p-1 rounded bg-zinc-700/50 hover:bg-zinc-700 transition-colors"
          title="Copy code"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
      <code>{code}</code>
    </pre>
  );
}

function VulnerabilityItem({ title, severity, description, recommendation }) {
  const level = SEVERITY_LEVELS[severity];
  return (
    <div className={`p-4 rounded-lg ${level.bg} border border-${level.color}/20 mb-4`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-white">{title}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${level.color}`}>
          {level.label}
        </span>
      </div>
      <p className="text-zinc-300 mb-2">{description}</p>
      {recommendation && (
        <div className="mt-2">
          <span className="text-sm font-medium text-zinc-400">Recommendation:</span>
          <p className="text-sm text-zinc-300">{recommendation}</p>
        </div>
      )}
    </div>
  );
}

function QueryInput({ onSubmit, loading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query);
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask about vulnerabilities or get clarification..."
        className="w-full p-3 pr-24 bg-[#1a1b26] border border-zinc-800 rounded-lg text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#00ff9d] transition-colors"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !query.trim()}
        className="absolute right-2 top-2 px-3 py-1 bg-[#00ff9d]/10 text-[#00ff9d] rounded hover:bg-[#00ff9d]/20 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Ask
      </button>
    </form>
  );
}

function Popup() {
  const [model, setModel] = useState(MODELS[0].value);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [securityScore, setSecurityScore] = useState(null);
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([]);

  // Load history from localStorage
  useEffect(() => {
    const h = localStorage.getItem('codescope_history');
    if (h) setHistory(JSON.parse(h));
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('codescope_history', JSON.stringify(history));
  }, [history]);

  const calculateSecurityScore = (analysisResult) => {
    // Extract potential indicators from the analysis result
    const lowRiskIndicators = (analysisResult.match(/low risk|minor|suggestion/gi) || []).length;
    const mediumRiskIndicators = (analysisResult.match(/moderate|warning|consider/gi) || []).length;
    const highRiskIndicators = (analysisResult.match(/critical|severe|vulnerability|exploit/gi) || []).length;

    // Calculate weighted score
    const baseScore = 100;
    const deductions = {
      low: lowRiskIndicators * 5,
      medium: mediumRiskIndicators * 10,
      high: highRiskIndicators * 15
    };

    const totalDeduction = Math.min(
      baseScore,
      deductions.low + deductions.medium + deductions.high
    );

    return Math.max(0, baseScore - totalDeduction);
  };

  const handleSend = async () => {
    setLoading(true);
    setError('');
    setResult('');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const [{ result: selectedCode }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString(),
      });

      if (!selectedCode || selectedCode.trim().length === 0) {
        throw new Error('Please select some code to analyze first.');
      }

      chrome.runtime.sendMessage(
        { action: 'analyzeCode', code: selectedCode },
        (response) => {
          setLoading(false);
          
          if (chrome.runtime.lastError) {
            setError(`Extension error: ${chrome.runtime.lastError.message}`);
            return;
          }

          if (response.error) {
            setError(response.error);
            return;
          }

          const score = calculateSecurityScore(response.result);
          setSecurityScore(score);
          setResult(response.result);
          
          // Format and store in history
          const historyItem = {
            code: selectedCode,
            result: response.result,
            score,
            model,
            time: Date.now()
          };
          
          setHistory(h => [historyItem, ...h.slice(0, 9)]);
        }
      );
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const formatResult = (text) => {
    // Split the text into sections based on common patterns
    const sections = text.split(/(?=\n[A-Z][A-Z\s]+:)/);
    
    return sections.map((section, idx) => {
      // Check if the section contains code
      const hasCode = section.includes('```');
      if (hasCode) {
        // Split into code and non-code parts
        const parts = section.split(/(```[\s\S]*?```)/);
        return (
          <div key={idx} className="mb-4">
            {parts.map((part, i) => {
              if (part.startsWith('```') && part.endsWith('```')) {
                // Format code block
                const code = part.replace(/```(?:[\w]+)?\n([\s\S]*?)```/, '$1').trim();
                return formatCodeBlock(code);
              }
              // Format regular text
              return <p key={i} className="text-zinc-300 mb-2">{part}</p>;
            })}
          </div>
        );
      }
      // Regular text section
      return <p key={idx} className="text-zinc-300 mb-4">{section}</p>;
    });
  };

  const handleClose = () => {
    window.close();
  };

  const handleHistoryClick = (historyItem) => {
    setResult(historyItem.result);
    setSecurityScore(historyItem.score);
  };

  const handleDownloadReport = () => {
    if (!result) return;

    const report = `
CodeScope Security Analysis Report
Generated: ${new Date().toLocaleString()}
Model: ${MODELS.find(m => m.value === model)?.label}
Security Score: ${securityScore}

${result}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codescope-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleQuery = async (userQuery) => {
    setConversation(prev => [...prev, { type: 'user', content: userQuery }]);
    // Here you would typically send the query to your AI backend
    // For now, we'll just add a mock response
    setConversation(prev => [...prev, {
      type: 'assistant',
      content: `I'll help you understand the vulnerabilities in the code. What specific aspect would you like me to explain?`
    }]);
  };

  return (
    <div className="min-h-[600px] w-[600px] bg-[#0a0b14] text-white p-6 flex flex-col">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Fingerprint className="w-8 h-8 cyber-gradient" />
          <div>
            <h1 className="text-2xl font-bold cyber-gradient neon-text font-orbitron">CODESCOPE</h1>
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-space">Beta</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <VercelDropdown options={MODELS} value={model} onChange={setModel} />
          <button
            onClick={handleClose}
            className="p-1.5 text-zinc-500 hover:text-white transition-colors"
            title="Close"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {error && (
          <div className="bg-red-900/50 border border-red-800 p-3 rounded-md text-red-200 flex items-start">
            <X className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {!result && !loading && <WelcomeContent />}

        <button
          onClick={handleSend}
          disabled={loading}
          className={`w-full p-4 rounded-lg cyber-border relative overflow-hidden ${
            loading ? 'cursor-wait' : 'hover:bg-[#12152e]'
          }`}
        >
          <span className="relative z-10 font-medium flex items-center justify-center space-x-2 font-space">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>ANALYZING CODE...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>SCAN CODE</span>
              </>
            )}
          </span>
          {loading && <div className="scan-effect" />}
        </button>

        {result && (
          <div className="animate-fadeIn space-y-6">
            <div className="flex items-center justify-between">
              {securityScore !== null && (
                <div className="flex-1 p-4 rounded-lg cyber-border">
                  <h2 className="text-sm uppercase tracking-wider text-zinc-500 mb-3 font-space">Security Score</h2>
                  <SecurityScore score={securityScore} />
                </div>
              )}
              <button
                onClick={handleDownloadReport}
                className="ml-4 p-2 cyber-border hover:bg-[#12152e] transition-colors"
                title="Download Report"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 rounded-lg cyber-border overflow-x-auto">
              <div className="prose prose-invert max-w-none">
                {formatResult(result)}
              </div>
            </div>

            <QueryInput onSubmit={handleQuery} loading={loading} />

            {conversation.length > 0 && (
              <div className="space-y-4 mt-4">
                {conversation.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-zinc-800 ml-8'
                        : 'bg-[#1a1b26] cyber-border mr-8'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-4 pt-4 border-t border-zinc-800/50">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-zinc-400 hover:text-white transition-colors flex items-center space-x-1"
          >
            <HistoryIcon className="w-4 h-4" />
            <span className="font-space">{showHistory ? 'Hide History' : 'Show History'}</span>
          </button>
          {history.length > 0 && (
            <button
              onClick={() => {
                setHistory([]);
                localStorage.removeItem('codescope_history');
              }}
              className="text-zinc-400 hover:text-white transition-colors flex items-center space-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span className="font-space">Clear History</span>
            </button>
          )}
        </div>

        {showHistory && history.length > 0 && (
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => handleHistoryClick(h)}
                className="w-full text-left p-3 bg-zinc-900 border border-zinc-800 rounded-md text-sm hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-space">{MODELS.find(m => m.value === h.model)?.label}</span>
                    {h.score && (
                      <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                        h.score >= 90 ? 'bg-green-500/20 text-green-400' :
                        h.score >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                        h.score >= 50 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        Score: {h.score}
                      </span>
                    )}
                  </div>
                  <span>{new Date(h.time).toLocaleString()}</span>
                </div>
                <div className="text-zinc-300 line-clamp-2 font-mono text-xs bg-zinc-950 p-2 rounded">
                  {h.code}
                </div>
              </button>
            ))}
          </div>
        )}
      </footer>
    </div>
  );
}

export default Popup;

// Mount for Vite
import { createRoot } from 'react-dom/client';
if (document.getElementById('root')) {
  createRoot(document.getElementById('root')).render(<Popup />);
} 