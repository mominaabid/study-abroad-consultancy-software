import React from 'react';
import { Sparkles, Calculator, Code2, BrainCircuit, GraduationCap, ArrowRight, Lightbulb } from 'lucide-react';
import { TUTOR_MODES } from '../../services/geminiService';

const SUGGESTED_PROMPTS = [
  {
    icon: Calculator,
    category: 'Math & Physics',
    title: 'Explain Quantum Physics Simply',
    prompt: 'Explain the concept of Quantum Entanglement in simple terms with everyday analogies.',
    color: '#06b6d4'
  },
  {
    icon: Code2,
    category: 'Coding & CS',
    title: 'Build a Python Web Scraper',
    prompt: 'Show me step-by-step how to write a simple web scraper in Python using BeautifulSoup.',
    color: '#a855f7'
  },
  {
    icon: BrainCircuit,
    category: 'Quiz Generator',
    title: 'Generate Biology Quiz',
    prompt: 'Create a 3-question multiple choice quiz on DNA replication. Wait for my answer before revealing explanations!',
    color: '#f59e0b'
  },
  {
    icon: GraduationCap,
    category: 'Study Strategy',
    title: '7-Day Exam Prep Schedule',
    prompt: 'Create an efficient 7-day study timetable for my upcoming Chemistry midterm exam using the Pomodoro technique.',
    color: '#10b981'
  }
];

export default function WelcomeView({ activeMode, onSelectPrompt }) {
  const modeInfo = TUTOR_MODES[activeMode] || TUTOR_MODES.general;

  return (
    <div className="welcome-container animate-fade-in">
      <div className="hero-section">
        <div className="hero-icon-badge animate-float">
          <Sparkles size={36} color="#818cf8" />
        </div>
        <h1 className="hero-title">
          Welcome to <span className="gradient-text">Educatia Bot</span>
        </h1>
        <p className="hero-subtitle">
          Your personal 24/7 AI tutor powered by Gemini. Ask any question, generate practice quizzes, debug code, or plan your studies.
        </p>

        <div className="active-mode-banner" style={{ '--mode-color': modeInfo.color }}>
          <Lightbulb size={16} color={modeInfo.color} />
          <span>Current Mode: <strong>{modeInfo.name}</strong> — {modeInfo.description}</span>
        </div>
      </div>

      <div className="cards-grid">
        {SUGGESTED_PROMPTS.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div 
              key={idx} 
              className="prompt-card glass-card"
              onClick={() => onSelectPrompt(card.prompt)}
              style={{ '--card-accent': card.color }}
            >
              <div className="card-header">
                <div className="card-icon" style={{ backgroundColor: `${card.color}20` }}>
                  <IconComp size={18} color={card.color} />
                </div>
                <span className="card-category">{card.category}</span>
              </div>
              <h3 className="card-title">{card.title}</h3>
              <p className="card-prompt">"{card.prompt}"</p>
              <div className="card-footer">
                <span>Ask Educatia</span>
                <ArrowRight size={14} className="arrow-icon" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
