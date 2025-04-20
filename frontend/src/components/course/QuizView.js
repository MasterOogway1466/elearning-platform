import React, { useState, useEffect } from 'react';
import './CourseStyles.css';

const QuizView = ({ chapterId, onComplete }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Please log in to view the quiz');
        }

        const response = await fetch(`http://localhost:8080/api/quizzes/chapter/${chapterId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch quiz');
        }

        const data = await response.json();
        setQuiz(data);
        // Initialize answers with empty values
        const initialAnswers = {};
        data.questions.forEach((_, index) => {
          initialAnswers[index] = '';
        });
        setAnswers(initialAnswers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [chapterId]);

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;
    
    quiz.questions.forEach((question, index) => {
      totalPoints += question.points;
      if (answers[index] === question.correctAnswer) {
        earnedPoints += question.points;
      }
    });
    
    return {
      earned: earnedPoints,
      total: totalPoints,
      percentage: Math.round((earnedPoints / totalPoints) * 100)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalScore = calculateScore();
    setScore(finalScore);
    setSubmitted(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please log in to submit the quiz');
      }

      const response = await fetch(`http://localhost:8080/api/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          answers,
          score: finalScore
        })
      });

      if (response.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit quiz');
      }

      if (onComplete) {
        onComplete(finalScore);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading-spinner">
          <i className="bi bi-arrow-repeat"></i>
          <span>Loading quiz...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quiz-container">
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No quiz available for this chapter.
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h3>
          <i className="bi bi-question-circle me-2"></i>
          {quiz.title}
        </h3>
        {submitted && (
          <div className={`score-badge ${score.percentage >= 70 ? 'text-success' : 'text-danger'}`}>
            Score: {score.earned}/{score.total} ({score.percentage}%)
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {quiz.questions.map((question, index) => (
          <div key={index} className="question-card">
            <div className="question-header">
              <h3>Question {index + 1}</h3>
              <span className="points-badge">{question.points} points</span>
            </div>
            <p className="question-text">{question.text}</p>
            
            <div className="options-container">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="option-item">
                  <input
                    type="radio"
                    id={`q${index}-o${optionIndex}`}
                    name={`question-${index}`}
                    value={optionIndex}
                    checked={answers[index] === optionIndex}
                    onChange={() => handleAnswerChange(index, optionIndex)}
                    disabled={submitted}
                    className="option-radio"
                  />
                  <label 
                    htmlFor={`q${index}-o${optionIndex}`}
                    className={`option-label ${
                      submitted && optionIndex === question.correctAnswer ? 'correct' : ''
                    } ${
                      submitted && answers[index] === optionIndex && 
                      answers[index] !== question.correctAnswer ? 'incorrect' : ''
                    }`}
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
            
            {submitted && (
              <div className="feedback">
                {answers[index] === question.correctAnswer ? (
                  <div className="correct-feedback">
                    Correct! +{question.points} points
                  </div>
                ) : (
                  <div className="incorrect-feedback">
                    Incorrect. The correct answer is: {question.correctAnswer}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {!submitted && (
          <div className="quiz-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={Object.values(answers).some(answer => !answer)}
            >
              <i className="bi bi-check-circle me-1"></i>
              Submit Quiz
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default QuizView; 