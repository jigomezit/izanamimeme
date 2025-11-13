"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export function VoteButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: x / window.innerWidth, y: y / window.innerHeight },
        colors: ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"],
      });

      // Disparar confetti desde diferentes posiciones
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
    }
  };

  return (
    <Button
      ref={buttonRef}
      onClick={handleClick}
      size="lg"
      className="mt-8 text-xl px-12 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      Vote aquí
    </Button>
  );
}


