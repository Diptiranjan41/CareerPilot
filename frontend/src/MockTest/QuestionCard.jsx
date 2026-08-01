import { useState } from "react";

const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  onSaveForLater,
  isFirst = false,
  isLast = false,
  showExplanation = false,
  isReviewed = false,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "hard":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "🟢";
      case "medium":
        return "🟡";
      case "hard":
        return "🔴";
      default:
        return "📘";
    }
  };

  const handleOptionClick = (optionIndex) => {
    if (onAnswerSelect) {
      onAnswerSelect(question.id, optionIndex);
    }
  };

  const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  const isCorrectAnswer = () => {
    return selectedAnswer === question.correct;
  };

  const getAnswerStatus = () => {
    if (selectedAnswer === undefined) return "not-answered";
    if (selectedAnswer === question.correct) return "correct";
    return "incorrect";
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[rgba(0,240,200,0.1)] to-[rgba(0,153,255,0.05)] p-6 border-b border-[rgba(0,240,200,0.1)]">
        <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-[#00F0C8]">
              Q{questionNumber}
            </span>
            <span className="text-white/40 text-sm">
              of {totalQuestions}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Difficulty Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(question.difficulty)}`}>
              <span className="mr-1">{getDifficultyIcon(question.difficulty)}</span>
              {question.difficulty?.toUpperCase()}
            </div>
            
            {/* Topic Badge */}
            {question.topic && (
              <div className="px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(0,240,200,0.1)] border border-[rgba(0,240,200,0.2)] text-[#00F0C8]">
                📚 {question.topic}
              </div>
            )}
            
            {/* Bookmark Button */}
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="p-2 rounded-lg hover:bg-[rgba(0,240,200,0.1)] transition-all duration-300"
              title={isBookmarked ? "Remove bookmark" : "Bookmark for later"}
            >
              <svg 
                className={`w-5 h-5 ${isBookmarked ? "text-yellow-400 fill-yellow-400" : "text-white/40"}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            
            {/* Review Flag */}
            {isReviewed && (
              <div className="px-2 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <span className="text-purple-400 text-xs font-semibold">⭐ Reviewed</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Question Text */}
        <h3 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
          {question.question}
        </h3>
        
        {/* Marks/Points */}
        {question.points && (
          <div className="mt-3 text-sm text-white/40">
            {question.points} {question.points === 1 ? "mark" : "marks"}
          </div>
        )}
      </div>

      {/* Options Section */}
      <div className="p-6">
        <div className="space-y-3">
          {question.options?.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === question.correct;
            const showCorrectHighlight = showExplanation && isCorrect;
            const showWrongHighlight = showExplanation && isSelected && !isCorrect;
            
            return (
              <button
                key={idx}
                onClick={() => !showExplanation && handleOptionClick(idx)}
                disabled={showExplanation}
                className={`
                  w-full text-left p-4 rounded-xl transition-all duration-300
                  flex items-start gap-3 group
                  ${isSelected && !showExplanation 
                    ? "bg-gradient-to-r from-[rgba(0,240,200,0.2)] to-[rgba(0,153,255,0.1)] border-2 border-[#00F0C8]" 
                    : "bg-[rgba(0,0,0,0.3)] border border-[rgba(0,240,200,0.1)] hover:border-[rgba(0,240,200,0.3)]"
                  }
                  ${showCorrectHighlight && "bg-green-500/20 border-2 border-green-500"}
                  ${showWrongHighlight && "bg-red-500/20 border-2 border-red-500"}
                `}
              >
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                  transition-all duration-300
                  ${isSelected && !showExplanation 
                    ? "bg-gradient-to-r from-[#00F0C8] to-[#0099FF] text-[#020B18]" 
                    : "bg-[rgba(0,240,200,0.1)] text-white/60 group-hover:bg-[rgba(0,240,200,0.2)]"
                  }
                  ${showCorrectHighlight && "bg-green-500 text-white"}
                  ${showWrongHighlight && "bg-red-500 text-white"}
                `}>
                  {getOptionLabel(idx)}
                </div>
                
                <div className="flex-1">
                  <p className={`
                    text-sm md:text-base leading-relaxed
                    ${isSelected && !showExplanation ? "text-white font-medium" : "text-white/80"}
                    ${showCorrectHighlight && "text-white font-medium"}
                    ${showWrongHighlight && "text-white"}
                  `}>
                    {option}
                  </p>
                </div>
                
                {/* Correct/Incorrect Icons for Review */}
                {showExplanation && (
                  <div className="flex-shrink-0">
                    {isCorrect && (
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {isSelected && !isCorrect && (
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Hint Section */}
        {question.hint && !showExplanation && (
          <div className="mt-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-sm text-white/40 hover:text-[#00F0C8] transition-colors duration-300 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showHint ? "Hide Hint" : "Show Hint"}
            </button>
            
            {showHint && (
              <div className="mt-2 p-3 rounded-lg bg-[rgba(0,240,200,0.05)] border border-[rgba(0,240,200,0.1)]">
                <p className="text-sm text-white/60">💡 {question.hint}</p>
              </div>
            )}
          </div>
        )}

        {/* Explanation Section (After Submission) */}
        {showExplanation && (
          <div className="mt-6 p-4 rounded-xl bg-[rgba(0,240,200,0.05)] border border-[rgba(0,240,200,0.1)]">
            <div className="flex items-start gap-2">
              <span className="text-2xl">📖</span>
              <div>
                <h4 className="font-semibold text-[#00F0C8] mb-2">Explanation</h4>
                <p className="text-sm text-white/70 leading-relaxed">{question.explanation}</p>
                
                {/* Additional Learning Resources */}
                {question.resources && (
                  <div className="mt-3 pt-3 border-t border-[rgba(0,240,200,0.1)]">
                    <p className="text-xs text-white/40">📚 Learn more: {question.resources}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Answer Status */}
        {!showExplanation && selectedAnswer !== undefined && (
          <div className="mt-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getAnswerStatus() === "correct" ? "bg-green-500" : "bg-red-500"}`} />
            <span className={`text-xs font-semibold ${getAnswerStatus() === "correct" ? "text-green-400" : "text-red-400"}`}>
              {getAnswerStatus() === "correct" ? "✓ Correct Answer" : "✗ Incorrect Answer"}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="bg-[rgba(0,0,0,0.2)] p-6 border-t border-[rgba(0,240,200,0.1)]">
        <div className="flex justify-between gap-4">
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className={`
              px-6 py-3 rounded-xl font-semibold transition-all duration-300
              flex items-center gap-2
              ${!isFirst 
                ? "bg-[rgba(0,240,200,0.1)] border border-[rgba(0,240,200,0.2)] text-white hover:bg-[rgba(0,240,200,0.2)]" 
                : "bg-[rgba(255,255,255,0.05)] text-white/30 cursor-not-allowed"
              }
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          
          <div className="flex gap-3">
            {onSaveForLater && (
              <button
                onClick={() => onSaveForLater(question.id)}
                className="px-4 py-3 rounded-xl font-semibold bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save
              </button>
            )}
            
            <button
              onClick={onNext}
              className={`
                px-6 py-3 rounded-xl font-bold transition-all duration-300
                flex items-center gap-2
                ${!isLast 
                  ? "bg-gradient-to-r from-[#00F0C8] to-[#0099FF] text-[#020B18] hover:shadow-xl" 
                  : "bg-gradient-to-r from-[#00F0C8] to-[#0099FF] text-[#020B18]"
                }
              `}
            >
              {isLast ? "Submit Test" : "Next"}
              {!isLast && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="mt-4 flex justify-center gap-1">
          {Array.from({ length: Math.min(totalQuestions, 10) }, (_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i + 1 === questionNumber
                  ? "w-6 bg-gradient-to-r from-[#00F0C8] to-[#0099FF]"
                  : "w-4 bg-[rgba(0,240,200,0.2)]"
              }`}
            />
          ))}
          {totalQuestions > 10 && (
            <span className="text-xs text-white/40 ml-2">+{totalQuestions - 10} more</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;