/**
 * FloorModel3D - Lightweight 3D wireframe floor model
 *
 * CSS-based 3D visualization for demo scenarios - no heavy libraries
 * Interactive, performant, and responsive
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { RotateCcw, Play, Pause, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  RoomData,
  getRoomColor,
  getRoomGlow,
  getRoomTypeIcon,
} from "@/lib/fakefloorplan";

interface FloorModel3DProps {
  rooms: RoomData[];
  autoRotate?: boolean;
  className?: string;
}

export function FloorModel3D({
  rooms,
  autoRotate = false,
  className = "",
}: FloorModel3DProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [zoom, setZoom] = useState(1.8);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Auto-rotation animation
  useEffect(() => {
    if (!isAutoRotating) return;

    const animate = () => {
      setRotation((prev) => ({ ...prev, y: (prev.y + 0.5) % 360 }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAutoRotating]);

  // Mouse/touch interaction handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAutoRotating(false);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setRotation((prev) => ({
        ...prev,
        y: prev.y + deltaX * 0.5,
        x: Math.max(-90, Math.min(10, prev.x - deltaY * 0.5)),
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Control handlers
  const resetView = useCallback(() => {
    setRotation({ x: 0, y: 0, z: 0 });
    setZoom(2.25);
  }, []);

  const toggleAutoRotate = useCallback(() => {
    setIsAutoRotating((prev) => !prev);
  }, []);

  const handleZoom = useCallback((direction: "in" | "out") => {
    setZoom((prev) =>
      Math.max(0.5, Math.min(2, prev + (direction === "in" ? 0.1 : -0.1)))
    );
  }, []);

  // Room color and glow functions are now imported from the floorplan library

  return (
    <div
      className={`relative w-full h-96 bg-white rounded-lg overflow-hidden border border-gray-300 ${className}`}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={resetView}
          className="bg-white/90 border-gray-600 hover:bg-gray-50 text-gray-800"
          title="Reset view"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleAutoRotate}
          className="bg-white/90 border-gray-600 hover:bg-gray-50 text-gray-800"
          title={isAutoRotating ? "Pause rotation" : "Auto rotate"}
        >
          {isAutoRotating ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <div className="flex">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom("out")}
            className="bg-white/90 border-gray-600 hover:bg-gray-50 text-gray-800 rounded-r-none"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom("in")}
            className="bg-white/90 border-gray-600 hover:bg-gray-50 text-gray-800 rounded-l-none border-l-0"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 3D Scene Container */}
      <div
        ref={containerRef}
        className="w-full h-full perspective-1000 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ perspective: "1000px" }}
      >
        {/* 3D Model */}
        <div
          className="absolute inset-0 preserve-3d transition-transform duration-100 ease-out"
          style={{
            transform: `
              translateZ(0) 
              scale3d(${zoom}, ${zoom}, ${zoom})
              rotateX(${rotation.x}deg) 
              rotateY(${rotation.y}deg) 
              rotateZ(${rotation.z}deg)
              translateX(50%) 
              translateY(50%)
            `,
            transformOrigin: "center center",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Floor Base */}
          <div
            className="absolute bg-gray-100 border"
            style={{
              width: "300px",
              height: "200px",
              left: "-150px",
              top: "-100px",
              transform: "translateZ(-20px)",
              opacity: 0.3,
              borderColor: "#1e40af", // Blueprint blue
            }}
          />

          {/* Floor Outline - Wireframe */}
          <div
            className="absolute border"
            style={{
              width: "300px",
              height: "200px",
              left: "-150px",
              top: "-100px",
              transform: "translateZ(0px)",
              background: "transparent",
              borderColor: "#1e40af", // Blueprint blue
            }}
          />

          {/* Rooms */}
          {rooms.map((room) => {
            const roomColor = getRoomColor(room);
            const roomGlow = getRoomGlow(room);

            return (
              <div key={room.id} className="absolute">
                {/* Room Structure */}
                <div
                  className="absolute border transition-all duration-300"
                  style={{
                    width: `${room.position.width}px`,
                    height: `${room.position.height}px`,
                    left: `${room.position.x - 150}px`,
                    top: `${room.position.y - 100}px`,
                    borderColor: roomColor,
                    backgroundColor:
                      room.type === "cubicles"
                        ? "transparent"
                        : `${roomColor}20`,
                    transform: "translateZ(0px)",
                    boxShadow: roomGlow,
                  }}
                />

                {/* Elevator crossing lines */}
                {room.type === "elevator" && (
                  <>
                    <div
                      className="absolute border"
                      style={{
                        width: `${room.position.width}px`,
                        height: "0px",
                        left: `${room.position.x - 150}px`,
                        top: `${
                          room.position.y - 100 + room.position.height / 2
                        }px`,
                        transform: "translateZ(1px)",
                        borderColor: "#1e40af",
                      }}
                    />
                    <div
                      className="absolute border"
                      style={{
                        width: "0px",
                        height: `${room.position.height}px`,
                        left: `${
                          room.position.x - 150 + room.position.width / 2
                        }px`,
                        top: `${room.position.y - 100}px`,
                        transform: "translateZ(1px)",
                        borderColor: "#1e40af",
                      }}
                    />
                  </>
                )}

                {/* Conference room data display */}
                {room.type === "conference" && (
                  <div
                    className="absolute pointer-events-none text-gray-800"
                    style={{
                      left: `${room.position.x - 150}px`,
                      top: `${room.position.y - 100}px`,
                      width: `${room.position.width}px`,
                      height: `${room.position.height}px`,
                      transform: "translateZ(1px)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "4px",
                      fontSize: "10px",
                      fontWeight: "500",
                      textAlign: "center",
                      lineHeight: "1.2",
                    }}
                  >
                    <div style={{ fontWeight: "600", marginBottom: "2px" }}>
                      {room.name}
                    </div>
                    <div style={{ fontSize: "8px", opacity: 0.8 }}>
                      {room.occupancy}/{room.capacity} people
                    </div>
                    <div style={{ fontSize: "8px", opacity: 0.8 }}>
                      {room.temperature}°F
                    </div>
                  </div>
                )}

                {/* Cubicles text - rotated vertically on both sides */}
                {room.type === "cubicles" && (
                  <>
                    {/* Left side - rotated 90 degrees clockwise (reading upwards) */}
                    <div
                      className="absolute pointer-events-none text-gray-400"
                      style={{
                        left: `${room.position.x - 150 + 40}px`,
                        top: `${
                          room.position.y - 100 + room.position.height / 2
                        }px`,
                        transform:
                          "translateZ(1px) translate(-50%, -50%) rotate(90deg)",
                        fontSize: "14px",
                        fontWeight: "300",
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      Cubicles
                    </div>
                    {/* Right side - rotated 90 degrees counter-clockwise (reading downwards) */}
                    <div
                      className="absolute pointer-events-none text-gray-400"
                      style={{
                        left: `${
                          room.position.x - 150 + room.position.width - 40
                        }px`,
                        top: `${
                          room.position.y - 100 + room.position.height / 2
                        }px`,
                        transform:
                          "translateZ(1px) translate(-50%, -50%) rotate(-90deg)",
                        fontSize: "14px",
                        fontWeight: "300",
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      Cubicles
                    </div>
                  </>
                )}

                {/* Room "Walls" - 3D Effect (skip for elevators and cubicles) */}
                {room.type !== "elevator" && room.type !== "cubicles" && (
                  <>
                    <div
                      className="absolute"
                      style={{
                        width: `${room.position.width}px`,
                        height: "25px",
                        left: `${room.position.x - 150}px`,
                        top: `${room.position.y - 100}px`,
                        background: `linear-gradient(to bottom, ${roomColor}40, ${roomColor}20)`,
                        border: `1px solid ${roomColor}`,
                        transform: "rotateX(90deg) translateZ(12.5px)",
                        transformOrigin: "bottom",
                      }}
                    />

                    <div
                      className="absolute"
                      style={{
                        width: `${room.position.width}px`,
                        height: "25px",
                        left: `${room.position.x - 150}px`,
                        top: `${
                          room.position.y - 100 + room.position.height
                        }px`,
                        background: `linear-gradient(to bottom, ${roomColor}40, ${roomColor}20)`,
                        border: `1px solid ${roomColor}`,
                        transform: "rotateX(90deg) translateZ(12.5px)",
                        transformOrigin: "top",
                      }}
                    />

                    <div
                      className="absolute"
                      style={{
                        width: "25px",
                        height: `${room.position.height}px`,
                        left: `${room.position.x - 150}px`,
                        top: `${room.position.y - 100}px`,
                        background: `linear-gradient(to right, ${roomColor}40, ${roomColor}20)`,
                        border: `1px solid ${roomColor}`,
                        transform: "rotateY(90deg) translateZ(12.5px)",
                        transformOrigin: "right",
                      }}
                    />

                    <div
                      className="absolute"
                      style={{
                        width: "25px",
                        height: `${room.position.height}px`,
                        left: `${
                          room.position.x - 150 + room.position.width
                        }px`,
                        top: `${room.position.y - 100}px`,
                        background: `linear-gradient(to right, ${roomColor}40, ${roomColor}20)`,
                        border: `1px solid ${roomColor}`,
                        transform: "rotateY(90deg) translateZ(12.5px)",
                        transformOrigin: "left",
                      }}
                    />
                  </>
                )}
              </div>
            );
          })}

          {/* Grid Lines for depth perception */}
          {[...Array(6)].map((_, i) => (
            <div
              key={`grid-h-${i}`}
              className="absolute border-b opacity-20"
              style={{
                width: "300px",
                height: "0px",
                left: "-150px",
                top: `${-100 + i * 40}px`,
                transform: "translateZ(0px)",
                borderColor: "#1e40af",
              }}
            />
          ))}
          {[...Array(8)].map((_, i) => (
            <div
              key={`grid-v-${i}`}
              className="absolute border-r opacity-20"
              style={{
                width: "0px",
                height: "200px",
                left: `${-150 + i * 37.5}px`,
                top: "-100px",
                transform: "translateZ(0px)",
                borderColor: "#1e40af",
              }}
            />
          ))}
        </div>
      </div>

      {/* No status legend or instructions - just the wireframe */}
    </div>
  );
}
