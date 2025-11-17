"use client";
import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeamsWithCollision = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={parentRef}
      className={cn(
        "relative flex min-h-screen w-full items-center justify-center bg-slate-950 p-4",
        className
      )}
    >
      <CollisionMechanism
        containerRef={containerRef}
        parentRef={parentRef}
        beamOptions={{
          initialX: 0,
          translateX: 0,
          initialY: "1800px",
          translateY: "-200px",
          rotate: 0,
          className: "h-screen w-[2px] bg-gradient-to-t from-black via-red-600 to-transparent opacity-40",
          duration: 8,
          delay: 0,
          repeatDelay: 0,
        }}
      />
      <div ref={containerRef} className="relative z-10">
        {children}
      </div>
    </div>
  );
};

const CollisionMechanism = ({
  containerRef,
  parentRef,
  beamOptions,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  parentRef: React.RefObject<HTMLDivElement | null>;
  beamOptions?: {
    initialX?: number;
    translateX?: number;
    initialY?: string;
    translateY?: string;
    rotate?: number;
    className?: string;
    duration?: number;
    delay?: number;
    repeatDelay?: number;
  };
}) => {
  const [beams, setBeams] = React.useState<Array<{
    id: number;
    x: number;
    initialX: number;
    translateX: number;
    initialY: string;
    translateY: string;
    rotate: number;
  }>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (parentRef.current) {
        const parentRect = parentRef.current.getBoundingClientRect();
        const parentWidth = parentRect.width;
        const parentHeight = parentRect.height;

        // Generar beams a lo largo de todo el ancho de la pantalla
        const x = Math.random() * parentWidth;
        
        // Calcular translateY dinámicamente basado en la altura de la pantalla (de abajo hacia arriba)
        const translateYValue = `-${parentHeight + 200}px`;
        
        const newBeam = {
          id: Date.now() + Math.random(),
          x,
          initialX: beamOptions?.initialX ?? 0,
          translateX: beamOptions?.translateX ?? 0,
          initialY: beamOptions?.initialY ?? `${parentHeight + 200}px`,
          translateY: translateYValue,
          rotate: beamOptions?.rotate ?? 0,
        };

        setBeams((prev) => [...prev, newBeam]);

        setTimeout(() => {
          setBeams((prev) => prev.filter((beam) => beam.id !== newBeam.id));
        }, (beamOptions?.duration ?? 8) * 1000);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [beamOptions, parentRef]);

  return (
    <AnimatePresence>
      {beams.map((beam) => (
        <motion.div
          key={beam.id}
          initial={{
            x: beam.x,
            y: beam.initialY,
            opacity: 0,
          }}
          animate={{
            y: beam.translateY,
            opacity: [0, 1, 1, 0],
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: beamOptions?.duration ?? 8,
            delay: beamOptions?.delay ?? 0,
            repeatDelay: beamOptions?.repeatDelay ?? 0,
            ease: "linear",
          }}
          className={cn(
            "absolute left-0 top-0 w-[2px] bg-gradient-to-t from-black via-red-600 to-transparent opacity-40",
            beamOptions?.className || "h-screen"
          )}
          style={{
            left: `${beam.x}px`,
            rotate: `${beam.rotate}deg`,
          }}
        />
      ))}
    </AnimatePresence>
  );
};


