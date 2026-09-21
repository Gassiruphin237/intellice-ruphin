import { ChefHat } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Mark({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center font-bold leading-none ${className}`}
      aria-hidden="true"
    >
      {children}
    </span>
  )
}

export default function LoginView() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/dashboard')
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-navy-dark text-slate-900 lg:grid-cols-12">
      <section className="relative hidden overflow-hidden border-r border-navy-border/70 p-12 lg:col-span-7 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-linear-to-br from-white via-navy-light to-navy-dark" />
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-terracotta/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta shadow-lg shadow-terracotta/25">
            {/* <Mark className="h-5 w-5 text-sm text-white">A</Mark> */}
             <ChefHat className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-slate-950">
              KEV FOODS
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Système de gestion de restaurant
            </p>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-md space-y-6">
          

          <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-950 lg:text-5xl">
            Pilotez votre restaurant d'un simple geste.
          </h2>

          {/* <p className="text-xs font-medium leading-relaxed text-slate-600">
            Une interface bento fluide pour la gestion de caisse en temps réel,
            l'analyse automatique des stocks, et l'ingénierie culinaire propulsée
            par l'intelligence artificielle Gemini.
          </p> */}

          <div className="grid grid-cols-3 gap-4 border-t border-navy-border/70 pt-4">
            <div>
              <p className="font-mono text-lg font-bold text-slate-950">0 ms</p>
              <p className="text-[10px] font-semibold text-slate-500">Temps de réponse</p>
            </div>
            <div>
              <p className="font-mono text-lg font-bold text-slate-950">100%</p>
              <p className="text-[10px] font-semibold text-slate-500">Caisse hors-ligne</p>
            </div>
            <div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-[11px] font-medium text-slate-500">
          © 2026 L'Atelier Culinaire S.A.S. • Tous droits réservés.
        </p>
      </section>

      <section className="flex flex-col justify-center bg-navy-dark px-6 py-12 md:px-12 lg:col-span-5 xl:px-16">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <div className="mb-6 flex items-center justify-center gap-2.5 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-terracotta text-white">
                <ChefHat className="w-5.5 h-5.5 text-white" />
              </div>
              <span className="text-md font-bold tracking-wider text-slate-950">KEV FOODS</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-950">
              Connectez-Vous
            </h3>
            <p className="text-xs text-slate-500">
              Authentifiez-vous pour ouvrir le Tableau de bord.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Adresse Email
              </label>
              <div className="relative">
                <Mark className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-xs text-slate-500">
                  @
                </Mark>
                <input
                  type="email"
                  placeholder="Entrez votre adresse email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-navy-border/80 bg-white py-3 pl-10 pr-4 text-xs text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-terracotta/60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Mot de Passe
                </label>
                <button
                  type="button"
                  className="text-[10px] font-bold text-terracotta transition-colors hover:text-terracotta-light"
                >
                  Oublié ?
                </button>
              </div>
              <div className="relative">
                <Mark className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-xs text-slate-500">
                  #
                </Mark>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="entrez votre mot de passe"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-navy-border/80 bg-white py-3 pl-10 pr-14 text-xs text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-terracotta/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 transition-colors hover:text-slate-700"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  <span className="text-[10px] font-bold">
                    {showPassword ? 'Masquer' : 'Afficher'}
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-1 rounded-xl border border-navy-border/70 bg-navy-light/80 p-3">
              <span className="text-[9px] font-bold uppercase text-terracotta">
                Terminal de démo
              </span>
              <p className="text-[10px] leading-normal text-slate-500">
                Cet écran sert uniquement à travailler le design. Aucune
                vérification utilisateur n'est effectuée.
              </p>
            </div>

            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-terracotta py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-terracotta/20 transition-all hover:bg-terracotta-dark"
            >
              Se connecter
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
