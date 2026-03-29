// FlatButton3D.jsx
// Bouton rectangulaire principal, 100% personnalisable, avec effet flip3D horizontal ou vertical
import React from "react";
import "../animations/spin3D.css";
import PropTypes from "prop-types";

// Import du hook 3D universel
import { useSpin3D } from "../animations/useSpin3D";
import { useFlip3D } from "../animations/flip3D";

export default function FlatButton3D({
  children,
  color = "#271d44",
  textColor = "#fff",
  gradient,
  radius = 12,
  shadow = "0 4px 24px 0 #3a2a5c88, 0 2px 8px #fff4, 0 0 0 2px #fff2",
  fontWeight = 800,
  fontSize = 17,
  onClick,
  style = {},
  className = "",
  flipOptions = {},
  cube = false,
  cubeDepth = 36,
  cubeColors = {},
  glass = false,
  ...props
}) {
  const [spinStyle, triggerSpin, spinning] = useSpin3D({
    axis: (flipOptions.axis || 'X'),
    duration: flipOptions.duration || 600,
    easing: flipOptions.easing || 'cubic-bezier(.4,2,.3,1)',
    perspective: flipOptions.perspective || '800px',
  });

  const { flipped, triggerFlip, flipClass } = useFlip3D({ axis: 'X', duration: 600, scale: 0.96, perspective: '1400px', ...flipOptions });

  const hasAlpha = (str) => typeof str === 'string' && (/rgba\s*\(|hsla\s*\(/.test(str) || /,\s*0\.[0-9]+\)/.test(str));

  let bg;
  if (gradient) {
    if (hasAlpha(gradient)) {
      bg = gradient;
    } else if (glass) {
      bg = gradient.replace(/(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]*\))/g, (col) => {
        if (col.startsWith('rgb')) return col.replace(')', ',0.72)');
        if (col.length === 7) return col + 'b8';
        if (col.length === 4) return col + 'b8';
        return col;
      });
    } else {
      bg = gradient;
    }
  } else if (color) {
    bg = glass ? (hasAlpha(color) ? color : color + 'b8') : color;
  } else {
    bg = glass ? 'rgba(39,29,68,0.72)' : '#271d44';
  }

  const axis = (flipOptions.axis || 'X').toUpperCase();
  const cumulative = !!flipOptions.cumulative;

  const handleClick = (e) => {
    if (cumulative) {
      triggerSpin();
    } else {
      triggerFlip();
    }
    if (onClick) onClick(e);
  };
  if (!cube) {
    const btnClass = cumulative
      ? ["flat-btn-3d", className].join(" ")
      : ["flat-btn-3d", flipClass, flipped ? "flipping" : "", className].join(" ");
    return (
      <button
        className={btnClass}
        style={{
          width: "100%",
          maxWidth: 320,
          margin: "0 auto",
          padding: "12px 0",
          borderRadius: radius,
          background: bg,
          color: textColor,
          border: "none",
          fontWeight,
          fontSize,
          cursor: "pointer",
          boxShadow: shadow,
          outline: "none",
          position: "relative",
          backdropFilter: glass ? 'blur(12px) saturate(1.25)' : undefined,
          WebkitBackdropFilter: glass ? 'blur(12px) saturate(1.25)' : undefined,
          ...style
        }}
        onClick={handleClick}
        {...props}
      >
        <span
          className="flat-btn-3d-inner flat-btn-3d-face front"
          style={{
            position: "relative",
            zIndex: 2,
            background: bg,
            color: textColor,
            borderRadius: radius,
            width: "100%",
            minHeight: 32,
            padding: "0 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight,
            fontSize,
            boxShadow: shadow,
            backdropFilter: glass ? 'blur(12px) saturate(1.25)' : undefined,
            WebkitBackdropFilter: glass ? 'blur(12px) saturate(1.25)' : undefined,
            ...(cumulative ? spinStyle : {})
          }}
        >
          {children}
        </span>
        {!cumulative && (
          <span className="flat-btn-3d-inner flat-btn-3d-face back" style={{
            zIndex: 1,
            background: bg,
            color: textColor,
            borderRadius: radius,
            width: "100%",
            minHeight: 32,
            padding: "0 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight,
            fontSize,
            boxShadow: shadow,
            backdropFilter: glass ? 'blur(12px) saturate(1.25)' : undefined,
            WebkitBackdropFilter: glass ? 'blur(12px) saturate(1.25)' : undefined,
          }}>{children}</span>
        )}
      </button>
    );
  }

  const cubeFaceStyle = (face) => {
    if (face === "front") {
      return {
        background: cubeColors[face] || bg,
        borderRadius: radius,
        position: "absolute",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: textColor,
        fontWeight,
        fontSize,
        boxShadow: shadow,
        padding: "0 18px",
        backfaceVisibility: "hidden",
        zIndex: 1,
        backdropFilter: glass ? 'blur(12px) saturate(1.25)' : undefined,
        WebkitBackdropFilter: glass ? 'blur(12px) saturate(1.25)' : undefined,
      };
    }
    let baseColor = cubeColors[face] || bg;
    let backgroundFade = baseColor;
    if (baseColor.startsWith('linear-gradient') || baseColor.startsWith('radial-gradient')) {
      backgroundFade = `${baseColor}, linear-gradient(0deg,rgba(0,0,0,0.22),rgba(0,0,0,0.38))`;
    } else {
      backgroundFade = `linear-gradient(0deg,rgba(0,0,0,0.22),rgba(0,0,0,0.38)), ${baseColor}`;
    }
    return {
      background: backgroundFade,
      borderRadius: radius,
      position: "absolute",
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: textColor,
      fontWeight,
      fontSize,
      boxShadow: shadow,
      padding: "0 18px",
      backfaceVisibility: "hidden",
      zIndex: 1,
      backdropFilter: glass ? 'blur(12px) saturate(1.25)' : undefined,
      WebkitBackdropFilter: glass ? 'blur(12px) saturate(1.25)' : undefined,
    };
  };

  const depth = typeof cubeDepth === "number" ? `${cubeDepth}px` : cubeDepth;

  return (
    <div
      className={cumulative
        ? ["flat-btn-3d", className].join(" ")
        : ["flat-btn-3d", flipClass, flipped ? "flipping" : "", className].join(" ")}
      style={{
        width: "100%",
        maxWidth: 320,
        margin: "0 auto",
        height: 48,
        borderRadius: radius,
        background: "none",
        position: "relative",
        perspective: flipOptions.perspective || '800px',
        ...style
      }}
      onClick={handleClick}
      {...props}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          borderRadius: radius,
          ...spinStyle
        }}
      >
        <div className="flat-btn-3d-face front" style={{ ...cubeFaceStyle("front"), transform: `translateZ(${depth})` }}>{children}</div>
        {!cumulative && (
          <div className="flat-btn-3d-face back" style={{ ...cubeFaceStyle("back"), transform: `rotateX(180deg) translateZ(${depth})` }}>{children}</div>
        )}
        <div className="flat-btn-3d-face left" style={{ ...cubeFaceStyle("left"), transform: `rotateY(-90deg) translateZ(${depth})` }}></div>
        <div className="flat-btn-3d-face right" style={{ ...cubeFaceStyle("right"), transform: `rotateY(90deg) translateZ(${depth})` }}></div>
        <div className="flat-btn-3d-face top" style={{ ...cubeFaceStyle("top"), transform: `rotateX(90deg) translateZ(${depth})` }}></div>
        <div className="flat-btn-3d-face bottom" style={{ ...cubeFaceStyle("bottom"), transform: `rotateX(-90deg) translateZ(${depth})` }}></div>
      </div>
    </div>
  );
}

FlatButton3D.propTypes = {
  children: PropTypes.node,
  color: PropTypes.string,
  textColor: PropTypes.string,
  gradient: PropTypes.string,
  radius: PropTypes.number,
  shadow: PropTypes.string,
  fontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClick: PropTypes.func,
  style: PropTypes.object,
  className: PropTypes.string,
  flipOptions: PropTypes.object,
};
