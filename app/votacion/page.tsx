"use client";

import { useState, useEffect, useRef } from "react";
import { BackgroundBeamsWithCollision } from "@/components/background-beams-with-collision";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { LightningEffect } from "@/components/lightning-effect";
import { VoteCountdown } from "@/components/vote-countdown";

type Candidato = "Jimmy" | "Alex" | "Mariano";

interface VotoStats {
  candidato: string;
  votos: number;
}

export default function VotacionPage() {
  const [votando, setVotando] = useState(false);
  const [votoRealizado, setVotoRealizado] = useState(false);
  const [stats, setStats] = useState<VotoStats[]>([]);
  const [cargandoStats, setCargandoStats] = useState(true);
  const [candidatoConRayo, setCandidatoConRayo] = useState<Candidato | null>(null);
  const [votosAnteriores, setVotosAnteriores] = useState<Record<string, number>>({});
  const [candidatoVotado, setCandidatoVotado] = useState<Candidato | null>(null);
  const candidatoRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const candidatos: { nombre: Candidato; imagen: string }[] = [
    { nombre: "Jimmy", imagen: "/jimmy.jpg" },
    { nombre: "Alex", imagen: "/alex.jpg" },
    { nombre: "Mariano", imagen: "/mariano.jpg" },
  ];

  useEffect(() => {
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

    setVotando(true);

    // Disparar confeti desde todos los candidatos
    dispararConfetiDesdeCandidatos();

    // Activar rayo para el candidato votado
    setCandidatoConRayo(candidato);

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

      setVotoRealizado(true);
      setCandidatoVotado(candidato);
      
      // Esperar un poco antes de cargar stats para que el rayo se vea
      setTimeout(async () => {
        await cargarStats();
      }, 500);
    } catch (error) {
      console.error("Error votando:", error);
      alert("Error al votar. Por favor, intenta nuevamente.");
      setCandidatoConRayo(null);
    } finally {
      setVotando(false);
    }
  };

  const handleRayoComplete = () => {
    setCandidatoConRayo(null);
  };

  const getVotosCandidato = (nombre: string) => {
    const stat = stats.find((s) => s.candidato === nombre);
    return stat?.votos || 0;
  };

  return (
    <BackgroundBeamsWithCollision>
      <div className="flex flex-col items-center justify-center min-h-screen px-3 sm:px-4 py-2 sm:py-12 transition-all duration-700">
        <h1 className="text-xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-center text-white mb-2 sm:mb-12 drop-shadow-lg uppercase transition-all duration-700">
          IZANAMI VOTA
        </h1>

        <div className={`grid gap-2 sm:gap-8 md:gap-12 w-full max-w-6xl transition-all duration-700 ${
          votoRealizado && candidatoVotado ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
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
                      ? "opacity-100 scale-100 flex flex-col items-center justify-center gap-4 sm:gap-6 w-full mt-8 sm:mt-12" 
                      : "opacity-100 flex flex-row md:flex-col items-center md:items-center gap-3 sm:gap-4"
                    : "opacity-0 scale-90 pointer-events-none h-0 overflow-hidden"
                }`}
              >
                {/* Imagen del candidato - Más grande y centrada si es el votado */}
                <div className={`relative w-full aspect-[4/5] sm:aspect-[3/4] rounded-lg overflow-hidden border-2 sm:border-4 border-white/30 hover:border-white/60 transition-all duration-500 cursor-pointer shadow-2xl bg-black/10 ${
                  esCandidatoVotado 
                    ? "max-w-[200px] sm:max-w-[300px] md:max-w-[400px] mx-auto" 
                    : "max-w-[140px] sm:max-w-[240px] md:max-w-[280px] flex-shrink-0"
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
                  <div className="flex flex-col items-center gap-4 sm:gap-6 w-full">
                    {/* Mensaje "Votaste por!" y nombre */}
                    <div className="text-center">
                      <p className="text-lg sm:text-2xl md:text-3xl text-white font-semibold mb-2">
                        Votaste por!
                      </p>
                      <h2 className="text-2xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
                        {candidato.nombre}
                      </h2>
                    </div>

                    {/* Mensaje de confirmación */}
                    <p className="text-sm sm:text-xl text-green-400 font-semibold text-center">
                      ¡Gracias por votar! Tu voto ha sido registrado.
                    </p>

                    {/* Cuenta atrás */}
                    <div className="w-full">
                      <VoteCountdown />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center md:items-center gap-2 sm:gap-4 flex-1 md:flex-none">
                    {/* Nombre del candidato */}
                    <h2 className="text-lg sm:text-3xl md:text-4xl font-bold text-white text-center drop-shadow-lg">
                      {candidato.nombre}
                    </h2>

                    {/* Botón de votar */}
                    {!votoRealizado && (
                      <Button
                        onClick={() => handleVotar(candidato.nombre)}
                        disabled={votando || votoRealizado}
                        className="w-full sm:max-w-xs text-sm sm:text-lg py-2.5 sm:py-6 px-4 sm:px-6 font-bold shadow-xl"
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

                {/* Contador de votos - Oculto en móvil, visible en desktop */}
                {!cargandoStats && !esCandidatoVotado && (
                  <div className="hidden sm:block relative text-xl md:text-2xl text-gray-300 mt-2 min-h-[2rem] flex items-start justify-start pt-16 overflow-visible">
                    <span
                      className={`relative z-10 transition-all duration-300 ${
                        candidatoConRayo === candidato.nombre
                          ? "text-yellow-400 scale-125 font-bold drop-shadow-[0_0_10px_rgba(255,255,0,0.8)]"
                          : ""
                      }`}
                    >
                      {getVotosCandidato(candidato.nombre)} votos
                    </span>
                    {candidatoConRayo === candidato.nombre && (
                      <LightningEffect show={true} onComplete={handleRayoComplete} />
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

