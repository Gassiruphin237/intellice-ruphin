import { useState, useRef, useEffect } from "react";
import { matchQuickAction } from "../utils/quickActions";

export const useVoiceChat = () => {
  const [messages, setMessages] = useState([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");

  const recognitionRef = useRef(null);
  const isSessionActiveRef = useRef(isSessionActive);
  const isSpeakingRef = useRef(isSpeaking);

  useEffect(() => {
    isSessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  const unlockAudioOniOS = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    }
  };

  useEffect(() => {
    const loadVoices = () => {
      if (!("speechSynthesis" in window)) return;
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
        setSelectedVoiceURI((prev) => {
          if (prev) return prev;
          const defaultFr = available.find((v) => v.lang.startsWith("fr"));
          return defaultFr ? defaultFr.voiceURI : available[0].voiceURI;
        });
      }
    };

    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && isSessionActiveRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }
  };

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
      }
    } else {
      utterance.lang = "fr-FR";
    }

    utterance.rate = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (isSessionActiveRef.current) startListening();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (isSessionActiveRef.current) startListening();
    };

    window.speechSynthesis.speak(utterance);
  };

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

      const response = await fetch("https://backend-cv-ai.vercel.app/api/chat-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages })
      });

      const data = await response.json();
      const botReply =
        data.reply || data.message || data.text || data.choices?.[0]?.message?.content;

      if (botReply) {
        setMessages([...updatedMessages, { role: "assistant", content: botReply }]);
        speakText(botReply);
      } else {
        speakText("Désolé, je n'ai pas pu lire la réponse.");
      }
    } catch (error) {
      speakText("Désolé, une erreur de connexion est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  // Traitement d'une action déclenchée (Bouton ou Voix)
  const executeQuickAction = (action, spokenResponse) => {
    stopSpeaking();
    action.run();
    if (spokenResponse) {
      speakText(spokenResponse);
    }
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "fr-FR";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
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

        const stopKeywords = ["stop", "arrête", "arrete", "tais-toi", "pause", "silence", "stoppe"];
        if (stopKeywords.some((word) => userText.includes(word))) {
          stopSpeaking();
          return;
        }

        if (userText && isSessionActiveRef.current && !isSpeakingRef.current) {
          // Détection d'une action rapide par la voix
          const matchedAction = matchQuickAction(userText);
          if (matchedAction) {
            executeQuickAction(
              matchedAction,
              `J'exécute l'action : ${matchedAction.label}.`
            );
          } else {
            handleSendMessage(userText);
          }
        }
      };

      recognitionRef.current = recognition;
    }
  }, [messages]);

  const toggleSession = () => {
    unlockAudioOniOS();

    if (!isSessionActive) {
      setIsSessionActive(true);
      isSessionActiveRef.current = true;
      const welcomeText =
        "Bonjour ! Je suis l'assistant virtuel de Ruphin. J'ai été conçu pour répondre à toutes vos questions sur son parcours professionnel. Vous pouvez aussi me demander de télécharger son CV, l'appeler ou lui envoyer un e-mail. Comment puis-je vous aider ?";

      setMessages([{ role: "assistant", content: welcomeText }]);
      speakText(welcomeText);
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

  return {
    messages,
    isSessionActive,
    isListening,
    isSpeaking,
    isLoading,
    voices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    stopSpeaking,
    toggleSession,
    executeQuickAction
  };
};