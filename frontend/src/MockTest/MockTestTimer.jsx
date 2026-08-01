import { useState, useEffect } from "react";

const MockTestTimer = ({ 
  initialTime, // in seconds
  onTimeUp, 
  isActive = true,
  onTick,
  showWarning = true,
  warningThreshold = 60 // 60 seconds = 1 minute warning
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isWarning, setIsWarning] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    setTimeLeft(initialTime);
    setIsWarning(false);
    setIsExpired(false);
  }, [initialTime]);

  useEffect(() => {
    if (!isActive || isExpired) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        
        const newTime = prev - 1;
        
        // Check for warning threshold
        if (showWarning && newTime <= warningThreshold && !isWarning) {
          setIsWarning(true);
        }
        
        // Call onTick callback
        if (onTick) onTick(newTime);
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isExpired, onTimeUp, onTick, showWarning, warningThreshold, isWarning]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return (timeLeft / initialTime) * 100;
  };

  const getTimerColor = () => {
    if (isExpired) return "text-red-500";
    if (isWarning) return "text-yellow-400 animate-pulse";
    if (timeLeft <= initialTime * 0.25) return "text-orange-400";
    return "text-[#00F0C8]";
  };

  const getProgressColor = () => {
    if (isExpired) return "bg-red-500";
    if (isWarning) return "bg-yellow-400";
    if (timeLeft <= initialTime * 0.25) return "bg-orange-400";
    return "bg-gradient-to-r from-[#00F0C8] to-[#0099FF]";
  };

  return (
    <div className="glass-card rounded-2xl p-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <svg 
            className={`w-5 h-5 ${getTimerColor()}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span className="text-white/70 text-sm font-semibold">Time Remaining</span>
        </div>
        
        {isWarning && !isExpired && (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-yellow-400 text-xs font-semibold">Hurry up!</span>
          </div>
        )}
      </div>

      <div className="text-center mb-3">
        <div className={`text-4xl md:text-5xl font-black font-mono ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </div>
        {isExpired && (
          <div className="text-red-400 text-sm mt-2 font-semibold">
            ⏰ Time's Up!
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-[rgba(0,240,200,0.1)] rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        
        {/* Time markers */}
        <div className="flex justify-between mt-2 text-xs text-white/40">
          <span>{formatTime(initialTime)}</span>
          <span>{formatTime(initialTime / 2)}</span>
          <span>0:00</span>
        </div>
      </div>

      {/* Warning Animation */}
      {isWarning && !isExpired && (
        <div className="mt-3 text-center animate-pulse">
          <span className="text-yellow-400 text-xs font-semibold">
            ⚡ Less than {Math.floor(warningThreshold / 60)} minute{warningThreshold > 60 ? 's' : ''} remaining!
          </span>
        </div>
      )}
    </div>
  );
};

export default MockTestTimer;