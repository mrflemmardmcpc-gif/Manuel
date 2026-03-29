import React, { useEffect } from "react";
import PropTypes from "prop-types";
import useRotate3D from "../animations/useRotate3D";

export default function CubeButton({
  width = 220,
  height = 64,
  depth = 32,
  faces = {},
  borderColor = "#fff4",
  borderRadius = 12,
  rotationDuration = 600,
  rotationAxis = "X",
  rotationDirection = 1,
  onClick,
  style = {},
  className = "",
  children,
  ...props
}) {
  // Initialiser le hook pour gérer l'animation 3D
  const rotate3d = useRotate3D({ 
    axis: rotationAxis, 
    duration: rotationDuration, 
    direction: rotationDirection, 
    animate: true 
  });

  useEffect(() => {
    const id = "cube-btn-3d-style";
    if (!document.getElementById(id)) {
      const styleTag = document.createElement("style");
      styleTag.id = id;
      styleTag.innerHTML = `
        .cube-btn-3d {
          display: inline-block;
          position: relative;
          cursor: pointer;
          outline: none;
          border: none;
          background: none;
          padding: 0;
        }
        .cube-btn-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform ${rotationDuration}ms cubic-bezier(.4,2,.3,1);
          border-radius: var(--cube-border-radius, 12px);
        }
        .cube-btn-face {
          box-shadow: 0 4px 24px 0 #0004;
          user-select: none;
          position: absolute;
          left: 0;
          top: 0;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: white;
          box-sizing: border-box;
          border-radius: var(--cube-border-radius, 12px);
          overflow: hidden;
        }
        .cube-btn-face.front  { transform: translateZ(calc(var(--cube-depth) / 2)); }
        .cube-btn-face.back   { transform: rotateY(180deg) translateZ(calc(var(--cube-depth) / 2)); }
        .cube-btn-face.left   { transform: rotateY(-90deg) translateZ(calc(var(--cube-width) / 2)); }
        .cube-btn-face.right  { transform: rotateY(90deg) translateZ(calc(var(--cube-width) / 2)); }
        .cube-btn-face.top    { 
          top: 50% !important;
          left: 50% !important;
          margin-left: calc(var(--cube-width) / -2) !important;
          margin-top: calc(var(--cube-depth) / -2) !important;
          transform: rotateX(90deg) translateZ(calc(var(--cube-height) / 2)); 
        }
        .cube-btn-face.bottom { 
          top: 50% !important;
          left: 50% !important;
          margin-left: calc(var(--cube-width) / -2) !important;
          margin-top: calc(var(--cube-depth) / -2) !important;
          transform: rotateX(-90deg) translateZ(calc(var(--cube-height) / 2)); 
        }
        .rotate-360-x {
          animation: rotateX360 var(--rotation-duration)ms forwards cubic-bezier(.4,2,.3,1);
        }
        .rotate-360-y {
          animation: rotateY360 var(--rotation-duration)ms forwards cubic-bezier(.4,2,.3,1);
        }
        @keyframes rotateX360 {
          from { transform: rotateX(0deg); }
          to { transform: rotateX(calc(360deg * var(--rotation-direction))); }
        }
        @keyframes rotateY360 {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(calc(360deg * var(--rotation-direction))); }
        }
      `;
      document.head.appendChild(styleTag);
    }
  }, [rotationDuration]);

  const w = typeof width === "number" ? `${width}px` : width;
  const h = typeof height === "number" ? `${height}px` : height;
  let d;
  if (typeof depth === "number") {
    d = `${depth}px`;
  } else if (depth) {
    d = depth;
  } else {
    const numW = parseInt(w);
    const numH = parseInt(h);
    d = `${Math.min(numW, numH)}px`;
  }

  function getFaceStyle(face) {
    let faceStyle = {};
    if (face === 'front' || face === 'back') {
      faceStyle.width = w;
      faceStyle.height = h;
    } else if (face === 'left' || face === 'right') {
      faceStyle.width = d;
      faceStyle.height = h;
    } else if (face === 'top' || face === 'bottom') {
      faceStyle.width = w;
      faceStyle.height = d;
    }
    faceStyle.background = faces[face]?.background || faces[face]?.color || "#271d44";
    faceStyle.color = faces[face]?.textColor || "#fff";
    faceStyle.borderRadius = borderRadius;
    Object.assign(faceStyle, faces[face]?.style);
    return faceStyle;
  }

  const handleClick = (e) => {
    rotate3d.handleClick(e);
    if (onClick) onClick(e);
  };

  return (
    <button
      className={["cube-btn-3d", className].join(" ")}
      style={{
        '--cube-width': w,
        '--cube-height': h,
        '--cube-depth': d,
        '--cube-border-color': borderColor,
        '--cube-border-radius': `${borderRadius}px`,
        '--rotation-duration': `${rotationDuration}`,
        '--rotation-direction': rotationDirection,
        width: w,
        height: h,
        ...(() => {
          const { transition, transform, ...rest } = style || {};
          return rest;
        })(),
      }}
      onClick={handleClick}
      {...props}
    >
      <div
        className="cube-btn-inner"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          borderRadius: `var(--cube-border-radius, 12px)`,
          ...rotate3d.style,
        }}
        onTransitionEnd={rotate3d.handleTransitionEnd}
      >
        <div className="cube-btn-face front" style={getFaceStyle("front")}>{faces.front?.content ?? faces.front ?? children}</div>
        <div className="cube-btn-face back" style={getFaceStyle("back")}>{faces.back?.content ?? faces.back ?? ""}</div>
        <div className="cube-btn-face left" style={getFaceStyle("left")}>{faces.left?.content ?? faces.left ?? ""}</div>
        <div className="cube-btn-face right" style={getFaceStyle("right")}>{faces.right?.content ?? faces.right ?? ""}</div>
        <div className="cube-btn-face top" style={getFaceStyle("top")}>{faces.top?.content ?? faces.top ?? ""}</div>
        <div className="cube-btn-face bottom" style={getFaceStyle("bottom")}>{faces.bottom?.content ?? faces.bottom ?? ""}</div>
      </div>
    </button>
  );
}

CubeButton.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  depth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  faces: PropTypes.object,
  borderColor: PropTypes.string,
  borderRadius: PropTypes.number,
  rotationAxis: PropTypes.string,
  rotationDirection: PropTypes.number,
  onClick: PropTypes.func,
  style: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.node,
};
