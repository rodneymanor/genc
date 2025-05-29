"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, Engine, ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

interface ParticlesBackgroundProps {
  className?: string;
}

export function ParticlesBackground({ className }: ParticlesBackgroundProps) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = useCallback(async (container?: Container) => {
    // console.log("Particles loaded", container);
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "repulse",
          },
        },
        modes: {
          push: {
            quantity: 2,
          },
          repulse: {
            distance: 100,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: "#666666", // Dark gray - will be visible on light background
        },
        links: {
          color: "#888888", // Medium gray for links
          distance: 150,
          enable: true,
          opacity: 0.05, // Significantly reduced opacity for links
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce",
          },
          random: false,
          speed: 1, // Slower, more elegant movement
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 60, // Moderate number of particles
        },
        opacity: {
          value: 0.08, // Significantly reduced opacity for particles
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 2, max: 4 }, // Small but visible size
        },
      },
      detectRetina: true,
      fullScreen: {
        enable: true,
        zIndex: undefined,
      }
    }),
    [],
  );

  if (init) {
    return (
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
        className={className || "absolute inset-0 -z-10"}
      />
    );
  }

  return null;
} 