import React, { useState, useRef, useEffect } from "react";

export const CVChat = () => {
  const [messages, setMessages] = useState([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const recognitionRef = useRef(null);
  const isSessionActiveRef = useRef(isSessionActive);

  // Synchroniser la ref avec l'état pour les callbacks asynchrones
  useEffect(() => {
    isSessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  // Initialisation de la reconnaissance vocale
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "fr-FR";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        const userText = event.results[0][0].transcript;
        if (userText && isSessionActiveRef.current) {
          handleSendMessage(userText);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Relancer l'écoute vocale automatiquement si la session est toujours active
  const startListening = () => {
    if (recognitionRef.current && isSessionActiveRef.current && !isSpeaking && !isLoading) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Ignorer si déjà en cours de démarrage
      }
    }
  };

  // Synthèse vocale automatique
  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\*\*/g, "").replace(/#/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "fr-FR";
    utterance.rate = 1.0;

    utterance.onstart = () => setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
      // Relance l'écoute une fois que l'IA a fini de parler
      if (isSessionActiveRef.current) {
        setTimeout(startListening, 300);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (isSessionActiveRef.current) {
        setTimeout(startListening, 300);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Traitement et envoi de la voix
  const handleSendMessage = async (text) => {
    stopSpeaking();
    setIsLoading(true);

    const userMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      const apiMessages = updatedMessages.map(({ role, content }) => ({
        role,
        content,
      }));

      const response = await fetch("https://backend-cv-ai.vercel.app/api/chat-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages([...updatedMessages, { role: "assistant", content: data.reply }]);
        speakText(data.reply);
      }
    } catch (error) {
      console.error("Erreur API :", error);
      const errorMsg = "Désolé, une erreur est survenue lors de la connexion.";
      speakText(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Activer ou désactiver la session globale
  const toggleSession = () => {
    if (!isSessionActive) {
      setIsSessionActive(true);
      isSessionActiveRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    } else {
      setIsSessionActive(false);
      isSessionActiveRef.current = false;
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[100dvh] bg-[#F4F4F6] text-slate-800 p-4 sm:p-6 font-sans select-none box-border">
      
      {/* Zone centrale : Uniquement l'Orbe et les explications */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-xl w-full text-center py-4">
        
        {/* L'Orbe Violet Style Ruphin */}
        <div className="relative flex items-center justify-center my-6 sm:my-10">
          
          {/* Ondes de voix quand l'IA parle */}
          {isSpeaking && (
            <>
              <div className="absolute w-60 h-60 sm:w-80 sm:h-80 rounded-full bg-purple-300/40 animate-ping duration-1000"></div>
              <div className="absolute w-52 h-52 sm:w-68 sm:h-68 rounded-full bg-indigo-400/30 animate-pulse"></div>
            </>
          )}

          {/* Animation lors de l'écoute ou du traitement */}
          {(isListening || isLoading) && (
            <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full border-2 border-dashed border-purple-500/60 animate-spin"></div>
          )}

          {/* Sphère principale */}
          <div
            className={`relative w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-indigo-300 via-purple-400 to-purple-600 shadow-xl overflow-hidden transition-all duration-500 flex items-center justify-center ${
              isSpeaking
                ? "scale-105 shadow-purple-400/50 shadow-2xl"
                : "hover:scale-[1.02]"
            }`}
          >
            {/* Motif de vague de fond */}
            <svg
              className="absolute bottom-0 w-full opacity-40 text-white/40"
              viewBox="0 0 1440 320"
            >
              <path
                fill="currentColor"
                d="M0,160L80,176C160,192,320,224,480,213.3C640,203,800,149,960,138.7C1120,128,1280,160,1360,176L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C320,320,160,320,0,320Z"
              ></path>
            </svg>
          </div>
        </div>

        {/* Titre et Explications */}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3 tracking-tight">
          Discute avec Moi
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm sm:max-w-md px-2">
  Lancez la discussion et parlez naturellement. Modifiez les options vocales dans
  le menu de configuration.
</p>

      </main>

      {/* Trait de séparation */}
      <div className="w-12 sm:w-16 h-1 bg-slate-200 rounded-full mb-4 sm:mb-6"></div>

      {/* Barre de contrôle du bas */}
      <footer className="bg-white rounded-2xl shadow-lg border border-slate-100 px-3 sm:px-4 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 max-w-lg w-full">
        
        {/* Statut du Micro / Sélection */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-slate-600 text-xs font-medium cursor-pointer hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors max-w-[60%] sm:max-w-none">
          <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span className="truncate text-[11px] sm:text-xs">
            {isLoading
              ? "Réflexion..."
              : isSpeaking
              ? "Ruphin parle..."
              : isListening
              ? "Écoute en cours..."
              : "Par défaut – Par défaut..."}
          </span>
          <svg className="w-3 h-3 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center space-x-2 ml-auto">
          <button 
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Désactiver la vidéo/caméra"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            onClick={toggleSession}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-semibold text-white shadow-md transition-all ${
              isSessionActive
                ? "bg-red-500 hover:bg-red-600 shadow-red-200"
                : "bg-purple-700 hover:bg-purple-800 shadow-purple-200"
            }`}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 3v18m-4-14v10m8-10v10m-12-6v2m16-2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>{isSessionActive ? "Arrêter" : "Commencer"}</span>
          </button>
        </div>

      </footer>

    </div>
  );
};