"use client";

import { useState, useEffect } from "react";
import { BackgroundBeamsWithCollision } from "@/components/background-beams-with-collision";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";

type Candidato = "Jimmy" | "Alex" | "Mariano";

interface VotoStats {
  candidato: string;
  votos: number;
}

const candidatos: { nombre: Candidato; imagen: string }[] = [
  { nombre: "Jimmy", imagen: "/jimmy.jpg" },
  { nombre: "Alex", imagen: "/alex.jpg" },
  { nombre: "Mariano", imagen: "/mariano.jpg" },
];

export default function GanadorPage() {
  const [ganador, setGanador] = useState<Candidato | null>(null);
  const [cargando, setCargando] = useState(true);
  const [stats, setStats] = useState<VotoStats[]>([]);

  useEffect(() => {
    cargarGanador();
  }, []);

  useEffect(() => {
    if (ganador) {
      // Disparar confetis múltiples veces para un efecto espectacular
      const dispararConfetis = () => {
        // Confetis desde el centro
        confetti({
          particleCount: 200,
          spread: 70,
          origin: { x: 0.5, y: 0.5 },
          colors: ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#fbbf24"],
        });

        // Confetis desde las esquinas
        confetti({
          particleCount: 100,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#06b6d4", "#3b82f6", "#8b5cf6"],
        });

        confetti({
          particleCount: 100,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#ec4899", "#f59e0b", "#10b981"],
        });

        confetti({
          particleCount: 100,
          angle: 30,
          spread: 55,
          origin: { x: 0, y: 1 },
          colors: ["#ef4444", "#fbbf24", "#10b981"],
        });

        confetti({
          particleCount: 100,
          angle: 150,
          spread: 55,
          origin: { x: 1, y: 1 },
          colors: ["#8b5cf6", "#3b82f6", "#06b6d4"],
        });
      };

      // Disparar inmediatamente
      dispararConfetis();

      // Disparar cada 500ms durante 3 segundos
      const interval1 = setInterval(dispararConfetis, 500);
      setTimeout(() => clearInterval(interval1), 3000);

      // Disparar cada 1 segundo durante los siguientes 5 segundos
      const interval2 = setInterval(dispararConfetis, 1000);
      setTimeout(() => clearInterval(interval2), 8000);

      // Disparar ocasionalmente después
      const interval3 = setInterval(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { x: Math.random(), y: Math.random() },
          colors: ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"],
        });
      }, 2000);

      return () => {
        clearInterval(interval1);
        clearInterval(interval2);
        clearInterval(interval3);
      };
    }
  }, [ganador]);

  const cargarGanador = async () => {
    try {
      const { data, error } = await supabase
        .from("votacion")
        .select("candidato");

      if (error) throw error;

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

      // Encontrar el ganador (el que tiene más votos)
      let maxVotos = 0;
      let ganadorNombre: Candidato | null = null;

      statsArray.forEach((stat) => {
        if (stat.votos > maxVotos) {
          maxVotos = stat.votos;
          ganadorNombre = stat.candidato as Candidato;
        }
      });

      setGanador(ganadorNombre);
      setCargando(false);
    } catch (error) {
      console.error("Error cargando ganador:", error);
      setCargando(false);
    }
  };

  const getImagenGanador = () => {
    if (!ganador) return null;
    const candidato = candidatos.find((c) => c.nombre === ganador);
    return candidato?.imagen || null;
  };

  const getVotosGanador = () => {
    if (!ganador) return 0;
    const stat = stats.find((s) => s.candidato === ganador);
    return stat?.votos || 0;
  };

  if (cargando) {
    return (
      <BackgroundBeamsWithCollision>
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <p className="text-2xl sm:text-3xl text-white">Cargando ganador...</p>
        </div>
      </BackgroundBeamsWithCollision>
    );
  }

  if (!ganador) {
    return (
      <BackgroundBeamsWithCollision>
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <p className="text-2xl sm:text-3xl text-white">No hay ganador aún</p>
        </div>
      </BackgroundBeamsWithCollision>
    );
  }

  // Ordenar candidatos por votos (de mayor a menor)
  const candidatosOrdenados = [...stats].sort((a, b) => b.votos - a.votos);

  return (
    <BackgroundBeamsWithCollision>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-white mb-8 drop-shadow-lg">
          ¡El Ganador es!
        </h1>

        <div className="flex flex-col items-center gap-6 sm:gap-8 mb-12">
          {/* Imagen del ganador */}
          <div className="relative w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] aspect-[3/4] rounded-lg overflow-hidden border-4 sm:border-8 border-yellow-400 shadow-2xl bg-black/10 animate-pulse">
            <img
              src={getImagenGanador() || ""}
              alt={ganador}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${ganador}&size=512&background=random&color=fff&bold=true`;
              }}
            />
            {/* Efecto de brillo */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-transparent pointer-events-none"></div>
          </div>

          {/* Nombre del ganador */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center text-yellow-400 drop-shadow-[0_0_20px_rgba(255,255,0,0.8)] animate-pulse">
            {ganador}
          </h2>

          {/* Votos del ganador */}
          <div className="text-2xl sm:text-3xl md:text-4xl text-white font-semibold">
            {getVotosGanador()} {getVotosGanador() === 1 ? "voto" : "votos"}
          </div>

          {/* Mensaje de celebración */}
          <p className="text-xl sm:text-2xl md:text-3xl text-green-400 font-semibold text-center mt-4">
            ¡Felicidades! 🎉
          </p>
        </div>

        {/* Tabla de resultados de todos los candidatos */}
        <div className="w-full max-w-4xl mt-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-6 drop-shadow-lg">
            Resultados Completos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {candidatosOrdenados.map((stat, index) => {
              const candidato = candidatos.find((c) => c.nombre === stat.candidato);
              const esGanador = stat.candidato === ganador;
              
              return (
                <div
                  key={stat.candidato}
                  className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 ${
                    esGanador
                      ? "border-yellow-400 bg-yellow-400/10 shadow-lg"
                      : "border-white/30 bg-black/10"
                  }`}
                >
                  {/* Imagen del candidato */}
                  <div className={`relative w-full max-w-[150px] sm:max-w-[180px] aspect-[3/4] rounded-lg overflow-hidden border-2 ${
                    esGanador ? "border-yellow-400" : "border-white/30"
                  }`}>
                    <img
                      src={candidato?.imagen || ""}
                      alt={stat.candidato}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${stat.candidato}&size=256&background=random&color=fff&bold=true`;
                      }}
                    />
                  </div>

                  {/* Nombre */}
                  <h3 className={`text-xl sm:text-2xl md:text-3xl font-bold text-center ${
                    esGanador ? "text-yellow-400" : "text-white"
                  }`}>
                    {stat.candidato}
                  </h3>

                  {/* Votos */}
                  <div className="text-lg sm:text-xl md:text-2xl text-white font-semibold">
                    {stat.votos} {stat.votos === 1 ? "voto" : "votos"}
                  </div>

                  {/* Posición */}
                  <div className={`text-sm sm:text-base font-semibold ${
                    esGanador ? "text-yellow-400" : "text-gray-300"
                  }`}>
                    {index === 0 ? "🥇 Ganador" : index === 1 ? "🥈 2do lugar" : "🥉 3er lugar"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </BackgroundBeamsWithCollision>
  );
}

