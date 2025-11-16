"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface VoteCountdownProps {
  onComplete?: () => void;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export function VoteCountdown({ onComplete }: VoteCountdownProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Calcular la fecha objetivo: 22:00 de Argentina (UTC-3)
    // A partir de las 21:00 de Argentina, mostrará 1 hora de cuenta atrás
    const getTargetDate = () => {
      const now = new Date();
      
      // Obtener la fecha actual en formato YYYY-MM-DD en Argentina
      const dateFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Argentina/Buenos_Aires",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const dateStr = dateFormatter.format(now);
      
      // Crear fecha objetivo para hoy a las 22:00 en Argentina (UTC-3)
      const targetDateStr = `${dateStr}T22:00:00-03:00`;
      let targetDate = new Date(targetDateStr);
      
      // Si ya pasaron las 22:00 de hoy, usar las 22:00 de mañana
      if (targetDate.getTime() <= now.getTime()) {
        // Agregar un día a la fecha en formato YYYY-MM-DD
        const [year, month, day] = dateStr.split('-').map(Number);
        const tomorrow = new Date(year, month - 1, day + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        targetDate = new Date(`${tomorrowStr}T22:00:00-03:00`);
      }
      
      return targetDate;
    };

    const targetDateUTC = getTargetDate();

    const calculateTimeLeft = () => {
      const currentTime = new Date();
      const difference = targetDateUTC.getTime() - currentTime.getTime();

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        // Si la fecha ya pasó, mostrar ceros
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        
        // Redirigir a /ganador cuando llegue a cero (solo una vez)
        if (!hasRedirected) {
          setHasRedirected(true);
          if (onComplete) {
            onComplete();
          }
          router.push("/ganador");
        }
      }
    };

    // Calcular inmediatamente
    calculateTimeLeft();
    
    // Actualizar cada segundo
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [mounted, router, onComplete, hasRedirected]);

  if (!mounted) {
    return null;
  }

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <p className="text-sm sm:text-base text-gray-300">
        Conoce al ganador en:
      </p>
      <div className="flex gap-2 items-center">
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
        </div>
      </div>
    </div>
  );
}

