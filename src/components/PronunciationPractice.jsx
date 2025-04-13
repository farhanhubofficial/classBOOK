import React, { useState, useRef } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const words = ['apple', 'banana', 'orange', 'elephant', 'computer', 'school', 'music', 'river', 'planet'];

const PronunciationPractice = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [status, setStatus] = useState(null); // null | 'success' | 'fail'
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState('');
  const [spokenWord, setSpokenWord] = useState('');
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const speechRef = useRef(null);

  const handlePronounceWord = (wordFromNav = null) => {
    setStatus(null);
    setSpokenWord('');
    setMessage('Get ready to pronounce...');
    let randomWord = wordFromNav || words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);

    if (!wordFromNav) {
      const newHistory = [...history, randomWord];
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    }

    setTimeout(() => {
      setMessage('Listening...');
      recognizeSpeech(randomWord);
    }, 5000);
  };

  const recognizeSpeech = (expectedWord) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);

    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript.toLowerCase().trim();
      console.log('Recognized:', spoken);
      setSpokenWord(spoken);

      if (spoken === expectedWord.toLowerCase()) {
        setStatus('success');
        setMessage('Well done!');
      } else {
        setStatus('fail');
        setMessage(`You said: "${spoken}". Try again!`);
      }

      setIsListening(false);

      setTimeout(() => {
        speakWord(expectedWord);
      }, 2000);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setStatus('fail');
      setMessage(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('Recognition ended.');
      setIsListening(false);
    };

    recognition.start();
  };

  const speakWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-GB';

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      const britishFemale = voices.find(
        (voice) =>
          voice.lang === 'en-GB' && voice.name.toLowerCase().includes('female')
      );

      if (britishFemale) {
        utterance.voice = britishFemale;
      }

      speechRef.current = utterance;
      speechSynthesis.speak(utterance);
    };

    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.onvoiceschanged = loadVoices;
    } else {
      loadVoices();
    }
  };

  const pauseSpeaking = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel(); // cancel instead of pause for cross-browser support
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevWord = history[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      setCurrentWord(prevWord);
      setStatus(null);
      setSpokenWord('');
      setMessage('');
    }
  };

  const goToNext = () => {
    if (currentIndex < history.length - 1) {
      const nextWord = history[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setCurrentWord(nextWord);
      setStatus(null);
      setSpokenWord('');
      setMessage('');
    } else {
      handlePronounceWord();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white shadow-2xl rounded-2xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-blue-800 text-center">🎤 Pronunciation Practice</h2>

        <button
          onClick={() => handlePronounceWord()}
          className={`w-full py-3 rounded-lg font-semibold transition text-white ${
            isListening ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={isListening}
        >
          {isListening ? 'Listening...' : '🎙️ Start Practice'}
        </button>

        {currentWord && (
          <div className="mt-6">
            <p className="text-md text-gray-600 text-center mb-2">Your word:</p>
            <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-6 text-center">
              <span className="text-4xl font-extrabold text-blue-700 tracking-wide">
                {currentWord}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={goToPrevious}
            disabled={currentIndex <= 0}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
          >
            ⬅️ Prev
          </button>
          <button
            onClick={pauseSpeaking}
            className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 rounded"
          >
            ⏸️ Pause Speaking
          </button>
          <button
            onClick={goToNext}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Next ➡️
          </button>
        </div>

        {message && (
          <p className="text-center text-gray-700 font-medium mt-4">{message}</p>
        )}

        {status === 'success' && (
          <div className="text-green-600 mt-4 flex justify-center items-center gap-2 text-xl font-semibold">
            <FaCheckCircle /> Correct!
          </div>
        )}

        {status === 'fail' && (
          <div className="text-red-600 mt-4 flex flex-col justify-center items-center text-xl font-semibold space-y-1">
            <div className="flex items-center gap-2">
              <FaTimesCircle /> Incorrect!
            </div>
            <p className="text-base font-normal text-gray-600">
              You said: <span className="italic text-black">"{spokenWord}"</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PronunciationPractice;
