import { useState, useCallback } from "react";

/**
 * Hook d'animation de rotation 3D réutilisable
 */
export default function useRotate3D({ axis = "X", duration = 600, direction = 1, animate = true } = {}) {
  const [rotation, setRotation] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  const handleClick = useCallback(() => {
    if (animate && !isRotating) {
      setIsRotating(true);
      setRotation((prev) => prev + 360 * direction);
    }
  }, [animate, isRotating, direction]);

  const handleTransitionEnd = useCallback(() => {
    setIsRotating(false);
  }, []);

  const reset = useCallback(() => {
    setRotation(0);
    setIsRotating(false);
  }, []);

  const style = {
    transition: `transform ${duration}ms cubic-bezier(.4,2,.3,1)`,
    transform: axis.toUpperCase() === "Y" ? `rotateY(${rotation}deg)` : `rotateX(${rotation}deg)`,
    transformStyle: "preserve-3d",
  };

  return { rotation, isRotating, handleClick, handleTransitionEnd, reset, style };
}
