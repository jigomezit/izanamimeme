"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LightningEffectProps {
  show: boolean;
  onComplete?: () => void;
}

export function LightningEffect({ show, onComplete }: LightningEffectProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Ocultar después de 1.5 segundos
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) {
          setTimeout(onComplete, 300); // Esperar a que termine la animación de salida
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show && !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 pointer-events-none z-50 overflow-visible"
        >
          {/* Rayo principal - viene desde arriba y apunta al número */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 200 200"
            className="absolute top-0 left-1/2 transform -translate-x-1/2"
            style={{ 
              filter: "drop-shadow(0 0 20px rgba(255, 255, 0, 0.8))",
              height: "200%",
              top: "-100%"
            }}
          >
            <motion.path
              d="M 100 0 L 85 30 L 115 50 L 90 80 L 110 110 L 95 140 L 105 170 L 100 200"
              stroke="url(#lightningGradient)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFF00" stopOpacity="1" />
                <stop offset="30%" stopColor="#00FFFF" stopOpacity="1" />
                <stop offset="70%" stopColor="#FFFF00" stopOpacity="1" />
                <stop offset="100%" stopColor="#FFD700" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Rayos secundarios */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0.8, 0],
            }}
            transition={{ 
              duration: 1.5,
              times: [0, 0.2, 0.6, 1],
              repeat: 0
            }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2"
            style={{ height: "200%", top: "-100%", width: "100%" }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 200 200"
              className="absolute"
            >
              <motion.path
                d="M 100 0 L 75 35 L 125 55 L 85 85 L 115 115 L 80 145 L 120 175 L 100 200"
                stroke="#00FFFF"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              />
            </svg>
          </motion.div>

          {/* Brillo pulsante centrado en el número (abajo) */}
          <motion.div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 rounded-full"
            style={{
              width: "120px",
              height: "120px",
              background: "radial-gradient(circle, rgba(255,255,0,0.5) 0%, rgba(0,255,255,0.3) 30%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

