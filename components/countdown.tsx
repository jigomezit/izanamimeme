"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Domingo 16 de noviembre 2025 a las 21:00 (UTC-3 - Argentina)
    // Usar formato ISO con offset -03:00 para hora de Argentina
    const targetDate = new Date("2025-11-16T21:00:00-03:00");
    
    // Verificar que la fecha sea válida
    if (isNaN(targetDate.getTime())) {
      console.error("Fecha objetivo inválida");
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      // Debug: mostrar información en consola (solo en desarrollo)
      if (process.env.NODE_ENV === 'development') {
        console.log('Fecha objetivo:', targetDate.toISOString());
        console.log('Fecha actual:', now.toISOString());
        console.log('Diferencia (ms):', difference);
      }

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        // Si la fecha ya pasó, mostrar ceros
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calcular inmediatamente
    calculateTimeLeft();
    
    // Actualizar cada segundo
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [mounted]);

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center gap-8">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex gap-4 md:gap-8 flex-wrap justify-center">
        <div className="flex flex-col items-center">
          <div className="text-6xl md:text-8xl font-bold text-white">
            {formatNumber(timeLeft.days)}
          </div>
          <div className="text-sm md:text-lg text-gray-400 mt-2">Días</div>
        </div>
        <div className="text-6xl md:text-8xl font-bold text-white">:</div>
        <div className="flex flex-col items-center">
          <div className="text-6xl md:text-8xl font-bold text-white">
            {formatNumber(timeLeft.hours)}
          </div>
          <div className="text-sm md:text-lg text-gray-400 mt-2">Horas</div>
        </div>
        <div className="text-6xl md:text-8xl font-bold text-white">:</div>
        <div className="flex flex-col items-center">
          <div className="text-6xl md:text-8xl font-bold text-white">
            {formatNumber(timeLeft.minutes)}
          </div>
          <div className="text-sm md:text-lg text-gray-400 mt-2">Minutos</div>
        </div>
        <div className="text-6xl md:text-8xl font-bold text-white">:</div>
        <div className="flex flex-col items-center">
          <div className="text-6xl md:text-8xl font-bold text-white">
            {formatNumber(timeLeft.seconds)}
          </div>
          <div className="text-sm md:text-lg text-gray-400 mt-2">Segundos</div>
        </div>
      </div>
    </div>
  );
}

