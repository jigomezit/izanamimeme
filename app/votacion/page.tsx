"use client";

import { useState, useEffect, useRef } from "react";
import { BackgroundBeamsWithCollision } from "@/components/background-beams-with-collision";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { VoteCountdown } from "@/components/vote-countdown";

type Candidato = "Jimmy" | "Alex" | "Mariano";

interface VotoStats {
  candidato: string;
  votos: number;
}

// Constantes para el cache - Ajusta la duración aquí
const CACHE_KEY = "izanami_voto";
const CACHE_DURATION_HORAS = 1; // Duración en horas (cambia este valor para ajustar)
const CACHE_DURATION = CACHE_DURATION_HORAS * 60 * 60 * 1000; // Convertir a milisegundos

interface VotoCache {
  candidato: Candidato;
  timestamp: number;
}

// Funciones helper para manejar el cache
const guardarVotoEnCache = (candidato: Candidato): void => {
  const votoCache: VotoCache = {
    candidato,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(votoCache));
  } catch (e) {
    console.error("Error guardando en cache:", e);
  }
};

const obtenerVotoDelCache = (): VotoCache | null => {
  try {
    const cacheData = localStorage.getItem(CACHE_KEY);
    if (!cacheData) return null;

    const votoCache: VotoCache = JSON.parse(cacheData);
    const tiempoTranscurrido = Date.now() - votoCache.timestamp;

    // Si pasó más del tiempo configurado, el cache expiró
    if (tiempoTranscurrido > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return votoCache;
  } catch (e) {
    console.error("Error leyendo cache:", e);
    return null;
  }
};

export default function VotacionPage() {
  const [votando, setVotando] = useState(false);
  const [votoRealizado, setVotoRealizado] = useState(false);
  const [stats, setStats] = useState<VotoStats[]>([]);
  const [cargandoStats, setCargandoStats] = useState(true);
  const [votosAnteriores, setVotosAnteriores] = useState<Record<string, number>>({});
  const [candidatoVotado, setCandidatoVotado] = useState<Candidato | null>(null);
  const candidatoRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const candidatos: { nombre: Candidato; imagen: string }[] = [
    { nombre: "Jimmy", imagen: "/jimmy.jpg" },
    { nombre: "Alex", imagen: "/alex.jpg" },
    { nombre: "Mariano", imagen: "/mariano.jpg" },
  ];

  useEffect(() => {
    // Verificar si hay un voto en cache al cargar la página
    const votoCache = obtenerVotoDelCache();
    if (votoCache) {
      // Hay un voto válido en cache
      setVotoRealizado(true);
      setCandidatoVotado(votoCache.candidato);
    }

    cargarStats();
    // Actualizar stats cada 5 segundos
    const interval = setInterval(cargarStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Disparar muchos confetis cuando se muestra el resultado del voto
  useEffect(() => {
    if (votoRealizado && candidatoVotado) {
      // Esperar un poco para que la animación se vea
      setTimeout(() => {
        // Disparar confetis desde el centro
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { x: 0.5, y: 0.5 },
              colors: ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#f97316", "#eab308"],
            });
          }, i * 100);
        }

        // Disparar desde las esquinas
        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 45,
            spread: 70,
            origin: { x: 0, y: 0 },
            colors: ["#06b6d4", "#3b82f6", "#8b5cf6"],
          });
          confetti({
            particleCount: 100,
            angle: 135,
            spread: 70,
            origin: { x: 1, y: 0 },
            colors: ["#ec4899", "#f59e0b", "#10b981"],
          });
          confetti({
            particleCount: 100,
            angle: 225,
            spread: 70,
            origin: { x: 1, y: 1 },
            colors: ["#ef4444", "#f97316", "#eab308"],
          });
          confetti({
            particleCount: 100,
            angle: 315,
            spread: 70,
            origin: { x: 0, y: 1 },
            colors: ["#06b6d4", "#8b5cf6", "#ec4899"],
          });
        }, 500);

        // Disparo adicional desde arriba
        setTimeout(() => {
          confetti({
            particleCount: 200,
            angle: 90,
            spread: 80,
            origin: { x: 0.5, y: 0 },
            colors: ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"],
          });
        }, 1000);
      }, 300);
    }
  }, [votoRealizado, candidatoVotado]);

  const cargarStats = async () => {
    try {
      const { data, error } = await supabase
        .from("votacion")
        .select("candidato");

      if (error) throw error;

      // Guardar votos anteriores antes de actualizar
      const votosPrevios: Record<string, number> = {};
      stats.forEach((stat) => {
        votosPrevios[stat.candidato] = stat.votos;
      });
      setVotosAnteriores(votosPrevios);

      // Contar votos por candidato
      const conteo: Record<string, number> = {};
      data?.forEach((voto) => {
        conteo[voto.candidato] = (conteo[voto.candidato] || 0) + 1;
      });

      const statsArray: VotoStats[] = candidatos.map((c) => ({
        candidato: c.nombre,
        votos: conteo[c.nombre] || 0,
      }));

      setStats(statsArray);
      setCargandoStats(false);
    } catch (error) {
      console.error("Error cargando stats:", error);
      setCargandoStats(false);
    }
  };

  const dispararConfetiDesdeCandidatos = () => {
    // Disparar confeti desde la posición de cada candidato
    candidatos.forEach((c) => {
      const ref = candidatoRefs.current[c.nombre];
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Disparar confeti desde cada candidato
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: x / window.innerWidth, y: y / window.innerHeight },
          colors: ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"],
        });

        // Disparo adicional con delay para efecto cascada
        setTimeout(() => {
          confetti({
            particleCount: 50,
            spread: 55,
            origin: { x: x / window.innerWidth, y: y / window.innerHeight },
            colors: ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"],
          });
        }, 200);
      }
    });

    // Disparo adicional desde las esquinas
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#06b6d4", "#3b82f6", "#8b5cf6"],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#ec4899", "#f59e0b", "#10b981"],
      });
    }, 100);
  };

  const handleVotar = async (candidato: Candidato) => {
    if (votando || votoRealizado) return;

    // Verificar cache antes de votar
    const votoCache = obtenerVotoDelCache();
    if (votoCache) {
      // Ya hay un voto en cache válido
      const tiempoRestante = CACHE_DURATION - (Date.now() - votoCache.timestamp);
      const horasRestantes = Math.floor(tiempoRestante / (60 * 60 * 1000));
      const minutosRestantes = Math.ceil((tiempoRestante % (60 * 60 * 1000)) / (60 * 1000));
      
      let mensajeTiempo = "";
      if (horasRestantes > 0) {
        mensajeTiempo = `${horasRestantes} hora(s) y ${minutosRestantes} minuto(s)`;
      } else {
        mensajeTiempo = `${minutosRestantes} minuto(s)`;
      }
      
      alert(`Ya has votado recientemente. Debes esperar ${mensajeTiempo} más para poder votar nuevamente.`);
      setVotoRealizado(true);
      setCandidatoVotado(votoCache.candidato);
      return;
    }

    setVotando(true);

    // Disparar confeti desde todos los candidatos
    dispararConfetiDesdeCandidatos();

    try {
      // Obtener IP del cliente (usando un servicio externo)
      let ipAddress = "";
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (e) {
        console.error("Error obteniendo IP:", e);
      }

      const { error } = await supabase.from("votacion").insert({
        candidato,
        ip_address: ipAddress,
      });

      if (error) throw error;

      // Guardar voto en cache con timestamp
      guardarVotoEnCache(candidato);

      setVotoRealizado(true);
      setCandidatoVotado(candidato);
      
      // Esperar un poco antes de cargar stats
      setTimeout(async () => {
        await cargarStats();
      }, 500);
    } catch (error) {
      console.error("Error votando:", error);
      alert("Error al votar. Por favor, intenta nuevamente.");
    } finally {
      setVotando(false);
    }
  };


  return (
    <BackgroundBeamsWithCollision>
      <div className="flex flex-col items-center justify-center min-h-screen px-3 sm:px-4 md:px-6 py-2 sm:py-6 md:py-8 transition-all duration-700">
        <h1 className="text-xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-2 sm:mb-6 md:mb-8 drop-shadow-lg uppercase transition-all duration-700">
          IZANAMI VOTA
        </h1>

        <div className={`grid gap-2 sm:gap-4 md:gap-6 w-full max-w-6xl mx-auto transition-all duration-700 ${
          votoRealizado && candidatoVotado ? "grid-cols-1 auto-rows-auto" : "grid-cols-1 md:grid-cols-3"
        }`}>
          {candidatos.map((candidato) => {
            const esCandidatoVotado = votoRealizado && candidato.nombre === candidatoVotado;
            const mostrarCandidato = !votoRealizado || esCandidatoVotado;

            return (
              <div
                key={candidato.nombre}
                ref={(el) => {
                  candidatoRefs.current[candidato.nombre] = el;
                }}
                className={`transition-all duration-700 ease-in-out ${
                  mostrarCandidato 
                    ? esCandidatoVotado 
                      ? "opacity-100 scale-100 flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 w-full mt-2 sm:mt-6 md:mt-8 px-4 md:px-6" 
                      : "opacity-100 flex flex-row md:flex-col items-center md:items-center justify-center gap-3 sm:gap-4 w-full"
                    : "opacity-0 scale-90 pointer-events-none h-0 overflow-hidden"
                }`}
              >
                {/* Imagen del candidato - Más grande y centrada si es el votado */}
                <div className={`relative w-full aspect-[4/5] sm:aspect-[3/4] rounded-lg overflow-hidden border-2 sm:border-4 md:border-3 border-white/30 hover:border-white/60 transition-all duration-500 cursor-pointer shadow-2xl bg-black/10 ${
                  esCandidatoVotado 
                    ? "max-w-[180px] sm:max-w-[240px] md:max-w-[260px] lg:max-w-[280px] mx-auto mb-2 md:mb-3" 
                    : "max-w-[140px] sm:max-w-[240px] md:max-w-[280px] flex-shrink-0 md:mx-auto"
                }`}>
                  <img
                    src={candidato.imagen}
                    alt={candidato.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Si la imagen no existe, mostrar un placeholder
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${candidato.nombre}&size=256&background=random&color=fff&bold=true`;
                    }}
                  />
                </div>

                {/* Contenedor para nombre y botón - Layout diferente si es votado */}
                {esCandidatoVotado ? (
                  <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 w-full max-w-2xl mx-auto">
                    {/* Mensaje "Votaste por!" y nombre */}
                    <div className="text-center w-full">
                      <p className="text-sm sm:text-lg md:text-xl text-white font-semibold mb-1">
                        Votaste por!
                      </p>
                      <h2 className="text-lg sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                        {candidato.nombre}
                      </h2>
                    </div>

                    {/* Mensaje de confirmación */}
                    <p className="text-xs sm:text-base md:text-lg text-green-400 font-semibold text-center mb-2 md:mb-3 w-full">
                      ¡Gracias por votar! Tu voto ha sido registrado.
                    </p>

                    {/* Cuenta atrás */}
                    <div className="w-full flex justify-center items-center mt-2 md:mt-3">
                      <VoteCountdown />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 sm:gap-4 flex-1 md:flex-none w-full md:w-auto">
                    {/* Nombre del candidato */}
                    <h2 className="text-lg sm:text-3xl md:text-4xl font-bold text-white text-center drop-shadow-lg w-full">
                      {candidato.nombre}
                    </h2>

                    {/* Botón de votar */}
                    {!votoRealizado && (
                      <Button
                        onClick={() => handleVotar(candidato.nombre)}
                        disabled={votando || votoRealizado}
                        className="w-full sm:max-w-xs md:w-auto md:min-w-[150px] text-sm sm:text-lg py-2.5 sm:py-6 px-4 sm:px-6 font-bold shadow-xl"
                        variant={votoRealizado ? "outline" : "default"}
                      >
                        {votando
                          ? "Votando..."
                          : votoRealizado
                          ? "Votado"
                          : "Votar"}
                      </Button>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>
    </BackgroundBeamsWithCollision>
  );
}

