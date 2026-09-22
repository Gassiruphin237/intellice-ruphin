import React from "react";
import { useVoiceChat } from "../hooks/useVoiceChat";
import { QuickActionsBar } from "./QuickActionsBar";
import { Mic, Volume2 } from "lucide-react";

export const CVChat = () => {
  const {
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
  } = useVoiceChat();

  return (
    <div className="flex flex-col items-center justify-between min-h-[100dvh] bg-[#F4F4F6] text-slate-800 p-4 sm:p-6 font-sans select-none box-border">
      {/* Zone centrale */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-xl w-full text-center py-4">
        {/* Orbe d'animation */}
        <div
          onClick={isSpeaking ? stopSpeaking : undefined}
          title={isSpeaking ? "Cliquez pour interrompre" : ""}
          className={`relative flex items-center justify-center my-4 sm:my-8 ${
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
            className={`relative w-44 h-44 sm:w-60 sm:h-60 rounded-full bg-gradient-to-br from-indigo-300 via-purple-400 to-purple-600 shadow-xl overflow-hidden transition-all duration-300 flex items-center justify-center ${
              isSpeaking
                ? "scale-105 shadow-purple-400/50 shadow-2xl ring-4 ring-purple-300/50"
                : "hover:scale-[1.02]"
            }`}
          >
            <svg className="absolute bottom-0 w-full opacity-40 text-white/40" viewBox="0 0 1440 320">
              <path
                fill="currentColor"
                d="M0,160L80,176C160,192,320,224,480,213.3C640,203,800,149,960,138.7C1120,128,1280,160,1360,176L1440,192L1440,320L1360,320C320,320,160,320,0,320Z"
              ></path>
            </svg>
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 tracking-tight">
          Discute avec Moi
        </h1>

        {/* Texte d'origine conservé exactement */}
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm sm:max-w-md px-2">
          Posez vos questions pour découvrir mon parcours. Dites <strong>"Stop"</strong> ou cliquez sur la sphère pour interrompre l'assistant à tout moment.
        </p>

        {/* Boutons d'actions rapides avec Lucide Icons */}
        <QuickActionsBar onSelectAction={(action) => executeQuickAction(action)} />
      </main>

      {/* Trait de séparation */}
      <div className="w-12 sm:w-16 h-1 bg-slate-200 rounded-full mb-4 sm:mb-6"></div>

      {/* Barre de contrôle inférieure */}
      <footer className="bg-white rounded-2xl shadow-lg border border-slate-100 px-3 sm:px-4 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 max-w-lg w-full">
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-slate-600 text-xs font-medium px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors max-w-[65%] sm:max-w-none">
          <Mic className="w-4 h-4 text-slate-500 flex-shrink-0" />

          {isLoading ? (
            <span className="text-[11px] sm:text-xs text-purple-600 font-semibold animate-pulse">Réflexion...</span>
          ) : isSpeaking ? (
            <button onClick={stopSpeaking} className="text-[11px] sm:text-xs text-red-500 font-semibold hover:underline">
              Ruphin parle... (Cliquer pour stopper)
            </button>
          ) : isListening ? (
            <span className="text-[11px] sm:text-xs text-emerald-600 font-semibold animate-pulse">Écoute en cours...</span>
          ) : (
            <select
              value={selectedVoiceURI}
              onChange={(e) => setSelectedVoiceURI(e.target.value)}
              className="bg-transparent text-[11px] sm:text-xs text-slate-700 outline-none cursor-pointer max-w-[140px] sm:max-w-[190px] truncate"
            >
              {voices.length === 0 && <option value="">Chargement des voix...</option>}
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          <button
            onClick={toggleSession}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-semibold text-white shadow-md transition-all ${
              isSessionActive ? "bg-red-500 hover:bg-red-600 shadow-red-200" : "bg-purple-700 hover:bg-purple-800 shadow-purple-200"
            }`}
          >
            <Volume2 className="w-4 h-4 stroke-[2.5]" />
            <span>{isSessionActive ? "Arrêter" : "Commencer"}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};