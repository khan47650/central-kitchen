import React, { useState } from "react";
import { Box } from "@mui/material";

const HoverZoomImage = ({
  src,
  size = 34,
  zoomSize = 200,
  offset = 16,
}) => {
  const [hover, setHover] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  if (!src) return null;

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    let x = rect.right + offset;
    let y = rect.top + rect.height / 2;

    const maxY = window.innerHeight - zoomSize / 2 - 10;
    const minY = zoomSize / 2 + 10;

    if (y > maxY) y = maxY;
    if (y < minY) y = minY;

    setCoords({ x, y });
    setHover(true);
  };

  return (
    <>
      <Box
        component="img"
        src={src}
        alt="item"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHover(false)}
        sx={{
          width: size,
          height: size,
          cursor: "zoom-in",
          transition: "transform 0.2s ease",
          "&:hover": { transform: "scale(1.1)" },
        }}
      />

      {/* Zoom Image */}
      {hover && (
        <Box
          component="img"
          src={src}
          sx={{
            position: "fixed",
            left: coords.x,
            top: coords.y,
            transform: "translateY(-50%)",
            width: zoomSize,
            maxWidth: "80vw",
            zIndex: 99999,
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
};

export default HoverZoomImage;
