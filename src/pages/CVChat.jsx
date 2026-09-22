import React, { useState, useRef, useEffect } from "react";

export const CVChat = () => {
  const [messages, setMessages] = useState([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Gestion dynamique des voix
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");

  const recognitionRef = useRef(null);
  const isSessionActiveRef = useRef(isSessionActive);
  const isSpeakingRef = useRef(isSpeaking);

  // Synchroniser les refs pour les callbacks
  useEffect(() => {
    isSessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Chargement des voix
  useEffect(() => {
    const loadVoices = () => {
      if (!("speechSynthesis" in window)) return;

      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);

        setSelectedVoiceURI((prev) => {
          if (prev) return prev;
          const defaultFr = availableVoices.find((v) =>
            v.lang.startsWith("fr")
          );
          return defaultFr ? defaultFr.voiceURI : availableVoices[0].voiceURI;
        });
      }
    };

    loadVoices();

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Initialisation de la reconnaissance vocale
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Écoute continue pour intercepter "Stop"
      recognition.interimResults = false;
      recognition.lang = "fr-FR";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
        // Relancer si la session est toujours active et qu'on ne parle pas
        if (isSessionActiveRef.current && !isSpeakingRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognition.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const userText = event.results[lastResultIndex][0].transcript
          .trim()
          .toLowerCase();

        // Mots-clés d'interruption instantanée
        const stopKeywords = [
          "stop",
          "arrête",
          "arrete",
          "tais-toi",
          "pause",
          "silence",
          "stoppe"
        ];
        const hasStopCommand = stopKeywords.some((word) =>
          userText.includes(word)
        );

        if (hasStopCommand) {
          stopSpeaking();
          return;
        }

        // Envoi du message uniquement si l'IA ne parle pas déjà
        if (userText && isSessionActiveRef.current && !isSpeakingRef.current) {
          handleSendMessage(userText);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Couper la parole
  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Démarrer l'écoute
  const startListening = () => {
    if (recognitionRef.current && isSessionActiveRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }
  };

  // Lecture vocale
  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;

    stopSpeaking();

    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/#/g, "")
      .replace(/https?:\/\/\S+/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (selectedVoiceURI) {
      const chosenVoice = voices.find((v) => v.voiceURI === selectedVoiceURI);
      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang;
      } else {
        utterance.lang = "fr-FR";
      }
    } else {
      utterance.lang = "fr-FR";
    }

    utterance.rate = 1.05; // Légèrement accéléré pour plus de dynamisme

    utterance.onstart = () => setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
      if (isSessionActiveRef.current) {
        startListening();
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (isSessionActiveRef.current) {
        startListening();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Traitement et envoi vers le backend
  const handleSendMessage = async (text) => {
    stopSpeaking();
    setIsLoading(true);

    const userMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      const apiMessages = updatedMessages.map(({ role, content }) => ({
        role,
        content
      }));

      const response = await fetch(
        "https://backend-cv-ai.vercel.app/api/chat-cv",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages })
        }
      );

      const data = await response.json();

      if (data.reply) {
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: data.reply }
        ]);
        speakText(data.reply);
      }
    } catch (error) {
      console.error("Erreur API :", error);
      const errorMsg = "Désolé, une erreur de connexion est survenue.";
      speakText(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la session active
  const toggleSession = () => {
    if (!isSessionActive) {
      setIsSessionActive(true);
      isSessionActiveRef.current = true;
      startListening();
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
      {/* Zone centrale */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-xl w-full text-center py-4">
        {/* L'Orbe Violet (Cliquable pour stopper la parole) */}
        <div
          onClick={isSpeaking ? stopSpeaking : undefined}
          title={isSpeaking ? "Cliquez pour interrompre" : ""}
          className={`relative flex items-center justify-center my-6 sm:my-10 ${
            isSpeaking ? "cursor-pointer" : ""
          }`}
        >
          {isSpeaking && (
            <>
              <div className="absolute w-60 h-60 sm:w-80 sm:h-80 rounded-full bg-purple-300/40 animate-ping duration-1000"></div>
              <div className="absolute w-52 h-52 sm:w-68 sm:h-68 rounded-full bg-indigo-400/30 animate-pulse"></div>
            </>
          )}

          {(isListening || isLoading) && (
            <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full border-2 border-dashed border-purple-500/60 animate-spin"></div>
          )}

          <div
            className={`relative w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-indigo-300 via-purple-400 to-purple-600 shadow-xl overflow-hidden transition-all duration-300 flex items-center justify-center ${
              isSpeaking
                ? "scale-105 shadow-purple-400/50 shadow-2xl ring-4 ring-purple-300/50"
                : "hover:scale-[1.02]"
            }`}
          >
            <svg
              className="absolute bottom-0 w-full opacity-40 text-white/40"
              viewBox="0 0 1440 320"
            >
              <path
                fill="currentColor"
                d="M0,160L80,176C160,192,320,224,480,213.3C640,203,800,149,960,138.7C1120,128,1280,160,1360,176L1440,192L1440,320L1360,320C320,320,160,320,0,320Z"
              ></path>
            </svg>
          </div>
        </div>

        {/* Titre et Explications */}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3 tracking-tight">
          Discute avec Moi
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm sm:max-w-md px-2">
          Posez vos questions pour découvrir mon parcours. Dites **"Stop"** ou
          cliquez sur la sphère pour interrompre l'assistant à tout moment.
        </p>
      </main>

      {/* Trait de séparation */}
      <div className="w-12 sm:w-16 h-1 bg-slate-200 rounded-full mb-4 sm:mb-6"></div>

      {/* Barre de contrôle du bas */}
      <footer className="bg-white rounded-2xl shadow-lg border border-slate-100 px-3 sm:px-4 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 max-w-lg w-full">
        {/* Sélecteur de Voix / Statut */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-slate-600 text-xs font-medium px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors max-w-[65%] sm:max-w-none">
          <svg
            className="w-4 h-4 text-slate-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>

          {isLoading ? (
            <span className="text-[11px] sm:text-xs text-purple-600 font-semibold animate-pulse">
              Réflexion...
            </span>
          ) : isSpeaking ? (
            <button
              onClick={stopSpeaking}
              className="text-[11px] sm:text-xs text-red-500 font-semibold hover:underline flex items-center space-x-1"
            >
              <span>Ruphin parle... (Cliquer pour stopper)</span>
            </button>
          ) : isListening ? (
            <span className="text-[11px] sm:text-xs text-emerald-600 font-semibold animate-pulse">
              Écoute en cours...
            </span>
          ) : (
            <select
              value={selectedVoiceURI}
              onChange={(e) => setSelectedVoiceURI(e.target.value)}
              className="bg-transparent text-[11px] sm:text-xs text-slate-700 outline-none cursor-pointer max-w-[140px] sm:max-w-[190px] truncate"
            >
              {voices.length === 0 && (
                <option value="">Chargement des voix...</option>
              )}
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center space-x-2 ml-auto">
          <button
            onClick={toggleSession}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-semibold text-white shadow-md transition-all ${
              isSessionActive
                ? "bg-red-500 hover:bg-red-600 shadow-red-200"
                : "bg-purple-700 hover:bg-purple-800 shadow-purple-200"
            }`}
          >
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 3v18m-4-14v10m8-10v10m-12-6v2m16-2v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>{isSessionActive ? "Arrêter" : "Commencer"}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};