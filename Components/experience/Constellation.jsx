import { useEffect, useRef } from "react";

export default function Constellation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -9999, y: -9999, active: false };
    let points = [];
    let frame = 0;

    const layout = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const gap = width < 760 ? 112 : 148;
      const next = [];
      const cols = Math.ceil(width / gap) + 2;
      const rows = Math.ceil(height / gap) + 2;
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const shift = (row % 2) * gap * 0.5;
          const jitterX = ((col * 17 + row * 13) % 42) - 21;
          const jitterY = ((col * 11 + row * 29) % 42) - 21;
          next.push({
            x: col * gap + shift + jitterX - gap,
            y: row * gap + jitterY - gap * 0.35,
            phase: col * 0.65 + row * 1.15,
          });
        }
      }
      points = next;
    };

    const onMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };

    const draw = (time) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      context.clearRect(0, 0, width, height);
      const placed = points.map((point) => {
        let x = point.x;
        let y = point.y;
        if (!reduceMotion) {
          const drift = finePointer ? 5 : 16;
          x += Math.sin(time * 0.00035 + point.phase) * drift;
          y += Math.cos(time * 0.00028 + point.phase) * drift;
        }
        if (finePointer && pointer.active && !reduceMotion) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy) || 1;
          const reach = 250;
          if (distance < reach) {
            const force = (1 - distance / reach) * 28;
            x += (dx / distance) * force;
            y += (dy / distance) * force;
          }
        }
        return { x, y };
      });

      const linkDistance = width < 760 ? 150 : 178;
      for (let i = 0; i < placed.length; i += 1) {
        for (let j = i + 1; j < placed.length; j += 1) {
          const from = placed[i];
          const to = placed[j];
          const distance = Math.hypot(from.x - to.x, from.y - to.y);
          if (distance < linkDistance) {
            context.strokeStyle = `rgba(186, 210, 242, ${(1 - distance / linkDistance) * 0.42})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(from.x, from.y);
            context.lineTo(to.x, to.y);
            context.stroke();
          }
        }
      }

      context.fillStyle = "rgba(236, 244, 255, 0.9)";
      placed.forEach((point) => {
        context.beginPath();
        context.arc(point.x, point.y, 1.7, 0, Math.PI * 2);
        context.fill();
      });

      frame = requestAnimationFrame(draw);
    };

    layout();
    window.addEventListener("resize", layout);
    window.addEventListener("pointermove", onMove);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", layout);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}
