
import React, { useState, useCallback, useRef } from 'react';
import { Heart, Stars, Music, Volume2, VolumeX } from 'lucide-react';
import { AppState } from './types';
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppState>(AppState.QUESTION);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [yesButtonScale, setYesButtonScale] = useState(1);
  const [noClickCount, setNoClickCount] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  React.useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        // Only try to play if it's not already playing (to avoid re-triggering audio context warnings unnecessarily)
        if (audioRef.current.paused) {
          audioRef.current.play().catch(() => { });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playPopSound = () => {
    initAudio();
    const ctx = audioCtxRef.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const playSuccessSound = () => {
    initAudio();
    const ctx = audioCtxRef.current!;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);

      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.4);
    });
  };

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  const moveNoButton = useCallback(() => {
    playPopSound();
    if (!isMusicPlaying && noClickCount === 0) setIsMusicPlaying(true);

    const newX = Math.random() * (window.innerWidth - 150);
    const newY = Math.random() * (window.innerHeight - 80);
    setNoButtonPos({ x: newX, y: newY });
    setNoClickCount(prev => prev + 1);
    setYesButtonScale(prev => prev + 0.18);
  }, [isMusicPlaying, noClickCount]);

  const handleYes = () => {
    playSuccessSound();
    if (!isMusicPlaying) setIsMusicPlaying(true);
    setStatus(AppState.SUCCESS);

    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const phrases = [
    "ទេ ❌", "ច្បាស់អត់? 🤨", "ពិតមែនហ្ហី? 😮", "គិតម្ដងទៀតមើល៍! 🤔", "ឱកាសចុងក្រោយណា! ⚠️",
    "ប្រហែលជាអត់ទេដឹង? 🙊", "អូននឹងស្តាយក្រោយណា! 🥺", "សាកគិតមើលម្ដងទៀតមើល៍ 🧐",
    "ពិតជាច្បាស់មែនអត់? 😟", "កុំធ្វើចឹងអី! 😰", "សុំចិត្តណា! 🙏", "កុំចិត្តដាច់អី! 😿",
    "ប្ដូរចិត្តវិញទេ? 🔄", "ជាចម្លើយចុងក្រោយមែនអត់? 💔", "អូនធ្វើឲ្យបងខូចចិត្តហើយ 😭",
    "ហេតុអ្វីធ្វើបាបបងចឹង? 😫", "បងនឹងយំឥឡូវហ្នឹង... 😢", "ឈប់លេងសើចទៅអូនសម្លាញ់! ✋",
    "បងនឹងទិញនំឲ្យញ៉ាំច្រើនៗ! 🍟🥤", "មើលភ្នែកបងមើល៍ 🥺✨", "អូនឯងចិត្តអាក្រក់ណាស់! 👿",
    "ចុចខុសប៊ូតុងហើយមែនទេ? ⬅️", "ប៊ូតុងពណ៌ក្រហមស្អាតជាងតើ! 🔴", "កុំធ្វើអី បងសុំអង្វរ... 🛐",
    "បេះដូងបងកំពុងតែប្រេះស្រាំ... 🥀", "អូនជាមនុស្សតែម្នាក់គត់របស់បង 💖", "កុំឲ្យបងអស់សង្ឃឹមអី! 🕯️",
    "ចុច 'ព្រម' ទៅមានសំណាងល្អ! 🍀", "បងសន្យាថានឹងស្រលាញ់អូនរហូត! ♾️", "នឹកបងខ្លះទៅ... 💭",
    "កុំធ្វើជាខ្មោចលងបងអី! 👻", "អូនស្អាតណាស់ពេលញញឹម 😊", "បងនឹងធ្វើជាមនុស្សល្អសម្រាប់អូន! 🛠️",
    "កុំចិត្តដាច់ពេកអី ម្ចាស់ថ្លៃអើយ! 🙇‍♂️", "បងចាញ់ហើយ... ចុច 'ព្រម' ទៅ! 🏳️", "បងនៅចាំអូនជានិច្ច... ⏳",
    "ពាក្យថា 'ទេ' គ្មានក្នុងវចនានុក្រមបងទេ! 🚫",
  ];

  const handleInteraction = () => {
    // Initialize and Resume AudioContext (important for iOS/Safari)
    if (!audioCtxRef.current) {
      initAudio();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    // Handle background music
    if (audioRef.current && audioRef.current.paused && isMusicPlaying) {
      audioRef.current.play().catch((err) => {
        console.error("Music playback failed:", err);
      });
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-white cursor-pointer"
      style={{
        backgroundImage: "url('/bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <div className="absolute inset-0 backdrop-blur-[1px] pointer-events-none"></div>
      <div className="fixed opacity-0 pointer-events-none w-0 h-0">
        <audio
          ref={audioRef}
          src="/music.mp3"
          loop
        />
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); toggleMusic(); }}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300 ${isMusicPlaying ? 'bg-pink-500 text-white animate-pulse' : 'bg-gray-200 text-gray-500'}`}
      >
        {isMusicPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        {[...Array(20)].map((_, i) => (
          <Heart key={i} className="absolute text-red-400 floating" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 40 + 20}px`, animationDelay: `${Math.random() * 5}s` }} />
        ))}
      </div>

      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 z-10 text-center border-4 border-white" onClick={(e) => { e.stopPropagation(); handleInteraction(); }} onTouchStart={(e) => { e.stopPropagation(); handleInteraction(); }}>
        {status === AppState.QUESTION ? (
          <>
            <div className="mb-6 relative inline-block">
              <div className="w-[250px]  mx-auto overflow-hidden ">
                <img src="/roth.png" alt="My Valentine Proposal" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/400?grayscale'; }} />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-red-500 text-white p-2 rounded-full animate-bounce">
                <Heart fill="currentColor" size={24} />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-2 khmer-font leading-tight">សួស្តី my Besdong Cute </h1>
            <p className="text-gray-600 mb-8 font-semibold khmer-font text-lg">បងមានអីសួរអូន...</p>
            <h2 className="text-2xl font-bold text-pink-700 mb-10 khmer-font leading-relaxed">ពៅបងស្រឡាញ់អូន! អូនឡាញ់បងអត់ Babe 💗😖?</h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative min-h-[100px]">
              <button
                onClick={handleYes}
                style={{ transform: `scale(${yesButtonScale})` }}
                className="transition-all duration-300 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2 text-xl khmer-font"
              >
                <Heart fill="white" size={20} className="animate-heart-pulse" /> ព្រម!
              </button>

              <button
                onMouseEnter={moveNoButton}
                onClick={(e) => {
                  e.stopPropagation();
                  moveNoButton();
                  if (noClickCount >= 0) {
                    alert("ម៉េចក៏ដាច់ចិត្តម្ល៉េះ! ចុច 'ព្រម' ទៅណា៎ babe... 🥺👉👈");
                  }
                }}
                style={noClickCount > 0 ? { position: 'fixed', left: noButtonPos.x, top: noButtonPos.y, transition: 'all 0.2s ease-out', zIndex: 50 } : {}}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-4 px-10 rounded-full shadow-md whitespace-nowrap khmer-font"
              >
                {phrases[Math.min(noClickCount, phrases.length - 1)]}
              </button>
            </div>
          </>
        ) : (
          <div className="animate-in fade-in zoom-in duration-700">
            <div className="mb-6">
              <div className="w-64  mx-auto overflow-hidden relative">
                <img src="/roth1.png" alt="My Valentine Proposal" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/400'; }} />
                <div className="absolute inset-0 flex items-center justify-center">
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-red-600 mb-6 khmer-font">បងស្រលាញ់អូនខ្លាំងណាស់! ❤️</h1>
            <div className="p-8 bg-white rounded-2xl border-2 border-gray-100 mb-8 shadow-inner">
              <p className="text-2xl text-pink-800 italic font-bold khmer-font">"អូនគឺជាពិភពលោកទាំងមូលរបស់បង!"</p>
            </div>

            <p className="text-gray-600 mb-8 khmer-font text-xl">ជួបគ្នាថ្ងៃ Valentine ណា៎ម្ចាស់ Besdong បង! 😘🌹</p>

            <button onClick={() => { setStatus(AppState.QUESTION); setNoClickCount(0); setYesButtonScale(1); }} className="text-pink-400 hover:text-pink-600 text-sm font-bold underline khmer-font">សាកល្បងម្ដងទៀត</button>
          </div>
        )}
      </div>

      <footer className="mt-12 text-center text-gray-400 text-sm z-10 bg-white/50 px-4 py-2 rounded-full khmer-font">
        <a href="https://t.me/O_Pheakdey" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline font-bold">O_Pheakdey</a>
      </footer>

      {status === AppState.SUCCESS && (
        <div className="fixed inset-0 pointer-events-none z-0">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="absolute animate-bounce" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${Math.random() * 3 + 2}s` }}>
              <span className="text-4xl">🥰</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
