"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

interface SitePreviewProps {
  html: string;
  title: string;
  className?: string;
  minScale?: number;
  children?: ReactNode;
}

export function SitePreview({ html, title, className = "", minScale = 0.15, children }: SitePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(minScale);

  useEffect(() => {
    function updateScale() {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      setScale(Math.max(width / 1920, minScale));
    }
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [minScale]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video overflow-hidden bg-vms-dark-1 ${className}`}
    >
      {html ? (
        <iframe
          srcDoc={html}
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: "1920px",
            height: "1080px",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          sandbox="allow-scripts"
          title={`Preview ${title}`}
          loading="lazy"
        />
      ) : null}
      {children}
    </div>
  );
}
