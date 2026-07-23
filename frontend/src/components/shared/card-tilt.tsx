"use client";

import { useRef, useState, useCallback, type ReactNode } from "react";

interface CardTiltProps {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  perspective?: number;
  scaleOnHover?: number;
}

export function CardTilt({
  children,
  className = "",
  tiltAmount = 6,
  perspective = 800,
  scaleOnHover = 1.02,
}: CardTiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(
    "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)"
  );
  const isHovering = useRef(false);
  const rafRef = useRef<number>(0);
  const targetRef = useRef({ rx: 0, ry: 0, s: 1, z: 0 });
  const currentRef = useRef({ rx: 0, ry: 0, s: 1, z: 0 });

  const animate = useCallback(() => {
    const target = targetRef.current;
    const current = currentRef.current;
    const lerp = 0.1;

    current.rx += (target.rx - current.rx) * lerp;
    current.ry += (target.ry - current.ry) * lerp;
    current.s += (target.s - current.s) * lerp;
    current.z += (target.z - current.z) * lerp;

    setTransform(
      `perspective(${perspective}px) rotateX(${current.rx}deg) rotateY(${current.ry}deg) scale(${current.s}) translateZ(${current.z}px)`
    );

    if (
      Math.abs(current.rx - target.rx) > 0.05 ||
      Math.abs(current.ry - target.ry) > 0.05 ||
      Math.abs(current.s - target.s) > 0.001
    ) {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [perspective]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    targetRef.current = {
      rx: y * -tiltAmount,
      ry: x * tiltAmount,
      s: scaleOnHover,
      z: 8,
    };

    if (!isHovering.current) {
      isHovering.current = true;
    }
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  };

  const handleMouseLeave = () => {
    isHovering.current = false;
    targetRef.current = { rx: 0, ry: 0, s: 1, z: 0 };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  };

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transformStyle: "preserve-3d",
        transition: isHovering.current
          ? "none"
          : "transform 0.5s cubic-bezier(0.03, 0.98, 0.52, 0.99)",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
