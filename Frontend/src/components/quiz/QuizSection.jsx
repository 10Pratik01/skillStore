import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QuizPlayer from './QuizPlayer';
import CommentThread from '../CommentThread';

const QuizSection = ({ lesson, user, courseId, onMarkComplete }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`/api/quizzes/lesson/${lesson.id}`);
        const quizzes = res.data || [];
        if (quizzes.length > 0) {
          setQuiz(quizzes[0]);
        }
      } catch (e) {
        console.error('Failed to load quiz:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [lesson.id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl">❓</div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-purple-600 block">Quiz</span>
            <h1 className="text-2xl font-extrabold text-textMain">{lesson.title}</h1>
          </div>
        </div>

        {quiz ? (
          <QuizPlayer
            quiz={quiz}
            user={user}
            courseId={courseId}
            onComplete={() => onMarkComplete(lesson.id)}
          />
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-soft">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-extrabold text-textMain mb-3">Quiz not set up yet</h3>
            <p className="text-secondary">The instructor hasn't added questions to this quiz yet.</p>
          </div>
        )}
        <CommentThread lessonId={lesson.id} courseId={courseId} currentUser={user} />
      </div>
    </div>
  );
};

export default QuizSection;
