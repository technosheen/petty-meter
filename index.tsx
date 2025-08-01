import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

const TRANSLATIONS = {
  "en-US": {
    "title": "How petty are you?",
    "subtitle": "Share your grievance and let Claude be the judge",
    "inputLabel": "What's bothering you?",
    "inputPlaceholder": "My roommate ate the last slice of pizza I was saving...",
    "exampleLoudBreathing": "Loud breathing",
    "exampleDoorHolding": "Door holding",
    "exampleFishMicrowaver": "Fish microwaver",
    "exampleWrongTP": "Wrong TP",
    "grievanceLoudBreathing": "My roommate breathes too loudly",
    "grievanceDoorHolding": "Someone didn't say thank you when I held the door",
    "grievanceFishMicrowaver": "My coworker microwaves fish at lunch",
    "grievanceWrongTP": "They put the toilet paper roll on backwards",
    "errorMessage": "Please enter a grievance to analyze!",
    "analyzeButton": "Measure my pettiness!",
    "analyzingButton": "Analyzing pettiness...",
    "analysisTitle": "Analysis",
    "adviceTitle": "Advice",
    "tryAnotherButton": "Try another grievance",
    "failedAnalysis": "Failed to analyze grievance. Please try again!"
  },
  /* LOCALE_PLACEHOLDER_START */
  "es-ES": {
    "title": "¿Qué tan mezquino eres?",
    "subtitle": "Comparte tu queja y deja que Claude sea el juez",
    "inputLabel": "¿Qué te molesta?",
    "inputPlaceholder": "Mi compañero de cuarto se comió la última rebanada de pizza que estaba guardando...",
    "exampleLoudBreathing": "Respiración fuerte",
    "exampleDoorHolding": "Sujetar puerta",
    "exampleFishMicrowaver": "Pescado en microondas",
    "exampleWrongTP": "Papel higiénico mal",
    "grievanceLoudBreathing": "Mi compañero de cuarto respira muy fuerte",
    "grievanceDoorHolding": "Alguien no dijo gracias cuando le sostuve la puerta",
    "grievanceFishMicrowaver": "Mi compañero de trabajo calienta pescado en el microondas en el almuerzo",
    "grievanceWrongTP": "Pusieron el rollo de papel higiénico al revés",
    "errorMessage": "¡Por favor ingresa una queja para analizar!",
    "analyzeButton": "¡Mide mi mezquindad!",
    "analyzingButton": "Analizando mezquindad...",
    "analysisTitle": "Análisis",
    "adviceTitle": "Consejo",
    "tryAnotherButton": "Probar otra queja",
    "failedAnalysis": "Error al analizar la queja. ¡Por favor intenta de nuevo!"
  }
  /* LOCALE_PLACEHOLDER_END */
};

const appLocale = '{{APP_LOCALE}}';
const browserLocale = navigator.languages?.[0] || navigator.language || 'en-US';
const findMatchingLocale = (locale) => {
  if (TRANSLATIONS[locale]) return locale;
  const lang = locale.split('-')[0];
  const match = Object.keys(TRANSLATIONS).find(key => key.startsWith(lang + '-'));
  return match || 'en-US';
};
const locale = (appLocale !== '{{APP_LOCALE}}') ? findMatchingLocale(appLocale) : findMatchingLocale(browserLocale);
const t = (key) => TRANSLATIONS[locale]?.[key] || TRANSLATIONS['en-US'][key] || key;

const PettinessMeter = () => {
  const [grievance, setGrievance] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [displayScore, setDisplayScore] = useState(0);

  const exampleGrievances = [
    { label: t('exampleLoudBreathing'), text: t('grievanceLoudBreathing') },
    { label: t('exampleDoorHolding'), text: t('grievanceDoorHolding') },
    { label: t('exampleFishMicrowaver'), text: t('grievanceFishMicrowaver') },
    { label: t('exampleWrongTP'), text: t('grievanceWrongTP') }
  ];

  const analyzeGrievance = async () => {
    if (!grievance.trim()) {
      setError(t('errorMessage'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const prompt = `You are a humorous but fair judge of pettiness. Analyze the following grievance and rate it on a scale from 0 to 100, where:
      - 0-20: Legitimate concern (This is actually serious!)
      - 21-40: Reasonable gripe (Fair enough, that's annoying)
      - 41-60: Getting petty (Okay, but maybe chill a bit?)
      - 61-80: Pretty petty (You might want to let this one go...)
      - 81-100: Peak pettiness (Seriously? Let it go!)

      Grievance: "${grievance}"

      Respond ONLY with a valid JSON object in this exact format:
      {
        "score": [number between 0-100],
        "category": "[one of the category names above]",
        "judgment": "[A funny but not mean 1-2 sentence judgment about their grievance]",
        "advice": "[A humorous but helpful suggestion in 1 sentence]"
      }

      DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON.

      Please respond in ${locale} language`;

      const response = await window.claude.complete(prompt);
      const data = JSON.parse(response);
      setResult(data);
      
      // Animate the score
      animateScore(data.score);
    } catch (err) {
      setError(t('failedAnalysis'));
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const animateScore = (targetScore) => {
    const duration = 1500; // 1.5 seconds
    const startTime = Date.now();
    const startScore = 0;

    const updateScore = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Ease-out animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.round(startScore + (targetScore - startScore) * easeOut);
      
      setDisplayScore(currentScore);
      
      if (progress < 1) {
        requestAnimationFrame(updateScore);
      }
    };
    
    requestAnimationFrame(updateScore);
  };

  const getGaugeRotation = (score) => {
    // Convert 0-100 to -90 to 90 degrees
    return (score * 1.8) - 90;
  };

  const getGaugeColor = (score) => {
    if (score <= 20) return '#9333EA'; // Purple shade 1
    if (score <= 40) return '#A855F7'; // Purple shade 2
    if (score <= 60) return '#C084FC'; // Purple shade 3
    if (score <= 80) return '#E9D5FF'; // Purple shade 4
    return '#FFFFFF'; // White for peak pettiness
  };
  
  const getGaugeFillDasharray = (score) => {
    // Arc length is approximately 220
    const arcLength = 220;
    const fillLength = (score / 100) * arcLength;
    return `${fillLength} ${arcLength}`;
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#E9D5FF' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-2" style={{ color: '#45260C' }}>
          {t('title')}
        </h1>
        <p className="text-center mb-8" style={{ color: '#45260C' }}>
          {t('subtitle')}
        </p>

        {/* Single Container for Everything */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Gauge Meter */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-80 h-48 mb-4">
              <svg viewBox="0 0 200 130" className="w-full h-full">
                {/* Background arc */}
                <path
                  d="M 30 100 A 70 70 0 0 1 170 100"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                
                {/* Animated fill arc */}
                <path
                  d="M 30 100 A 70 70 0 0 1 170 100"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray={getGaugeFillDasharray(displayScore)}
                  className="transition-all duration-1500 ease-out"
                />
                
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="25%" stopColor="#8B5CF6" />
                    <stop offset="50%" stopColor="#A78BFA" />
                    <stop offset="75%" stopColor="#C4B5FD" />
                    <stop offset="100%" stopColor="#DDD6FE" />
                  </linearGradient>
                </defs>
                
                {/* Labels positioned outside the meter */}
                <text x="28" y="125" textAnchor="middle" className="text-xs font-medium" fill="#45260C">0</text>
                <text x="100" y="15" textAnchor="middle" className="text-xs font-medium" fill="#45260C">50</text>
                <text x="172" y="125" textAnchor="middle" className="text-xs font-medium" fill="#45260C">100</text>
              </svg>
              
              {/* Score display - moved down */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center mt-16">
                  <span className="text-5xl font-bold block" style={{ color: '#A855F7' }}>
                    {result ? displayScore : 0}%
                  </span>
                  {result && (
                    <span className="text-sm font-medium mt-1 block" style={{ color: '#A855F7' }}>
                      {result.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-3" style={{ color: '#45260C' }}>
              {t('inputLabel')}
            </label>
            
            {!result ? (
              <>
                <textarea
                  value={grievance}
                  onChange={(e) => setGrievance(e.target.value)}
                  placeholder={t('inputPlaceholder')}
                  className="w-full p-4 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
              style={{ borderColor: 'rgba(168, 85, 247, 0.3)', focusBorderColor: '#A855F7' }}
                  rows={4}
                />
                
                {/* Example buttons */}
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {exampleGrievances.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setGrievance(example.text)}
                        className="px-3 py-1 text-sm border rounded-full transition-colors"
                        style={{ 
                          borderColor: '#A855F7',
                          color: '#45260C',
                          backgroundColor: 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#FAF5FF';
                          e.target.style.color = '#A855F7';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.color = '#45260C';
                        }}
                      >
                        {example.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {error && (
                  <div className="mt-3 flex items-center text-red-600">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={analyzeGrievance}
                  disabled={loading}
                  className={`mt-4 w-full py-4 rounded-lg font-bold text-white transition-all transform hover:scale-105`}
                  style={{
                    backgroundColor: loading ? '#C084FC' : '#A855F7',
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#9333EA')}
                  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#A855F7')}
                >
                  {loading ? t('analyzingButton') : t('analyzeButton')}
                </button>
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="italic" style={{ color: '#45260C' }}>"{grievance}"</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          {result && (
            <div className="animate-fadeIn">
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-6">
                  <div>
                    <p className="text-lg font-semibold mb-3" style={{ color: '#45260C' }}>{t('analysisTitle')}</p>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p style={{ color: '#45260C' }}>
                        {result.judgment}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-lg font-semibold mb-3" style={{ color: '#45260C' }}>{t('adviceTitle')}</p>
                    <div className="bg-purple-100 rounded-lg p-4">
                      <p style={{ color: '#45260C' }}>
                        {result.advice}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setGrievance('');
                    setResult(null);
                    setDisplayScore(0);
                  }}
                  className="mt-6 w-full py-3 border-2 rounded-lg font-semibold transition-colors"
                  style={{ 
                    borderColor: '#A855F7', 
                    color: '#A855F7' 
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#FAF5FF'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {t('tryAnotherButton')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PettinessMeter;
