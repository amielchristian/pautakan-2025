import React, { useEffect } from "react";
import "./radarView.css"; // Assuming styles are moved to a separate CSS file for better readability

const logoPaths = [
  "src/assets/AB.png",
  "src/assets/ACC.png",
  "src/assets/ARKI.png",
  "src/assets/CICS.png",
  "src/assets/COMM.png",
  "src/assets/COS.png",
  "src/assets/CRS.png",
  "src/assets/CTHM.png",
  "src/assets/EDUC.png",
  "src/assets/ENGG.png",
  "src/assets/IPEA.png",
  "src/assets/LAW.png",
  "src/assets/MED.png",
  "src/assets/PHARMA.png",
  "src/assets/MUSIC.png",
  "src/assets/NUR.png",
];

const RadarAnimation: React.FC = () => {
  useEffect(() => {
    const rotatingContainer = document.getElementById("rotatingContainer");
    const radialGridContainer = document.getElementById("radialGridContainer");
    const logosContainer = document.getElementById("logosContainer");
    const centerBorderContainer = document.getElementById(
      "centerBorderContainer"
    );

    if (
      !rotatingContainer ||
      !radialGridContainer ||
      !logosContainer ||
      !centerBorderContainer
    )
      return;

    const numSegments = 220;
    const radius = 350;
    const bootupDuration = 0.5;
    const logoSize = 91;
    const logoHalfSize = logoSize / 2;
    const logosPauseDelay = 2;
    const logosStartTime = 3.5 + logosPauseDelay;

    for (let i = 0; i < 16; i++) {
      const radialLine = document.createElement("div");
      radialLine.className = "radial-line";
      const angle = i * (360 / 16) - 90;
      radialLine.style.transform = `rotate(${angle}deg)`;
      radialLine.style.animationDelay = `${2.5 + i * 0.04}s`;
      radialGridContainer.appendChild(radialLine);

      const logoContainer = document.createElement("div");
      logoContainer.className = "logo-container";
      const logoImage = document.createElement("img");
      logoImage.src = logoPaths[i];
      logoImage.alt = `Logo ${i + 1}`;
      logoContainer.appendChild(logoImage);

      const angleRad = (angle * Math.PI) / 180;
      const logoX = 400 + radius * Math.cos(angleRad) - logoHalfSize;
      const logoY = 400 + radius * Math.sin(angleRad) - logoHalfSize;
      logoContainer.style.left = `${logoX}px`;
      logoContainer.style.top = `${logoY}px`;
      logoContainer.style.animation = `fadeIn 0.8s forwards ${
        logosStartTime + i * 0.2
      }s`;
      logosContainer.appendChild(logoContainer);
    }

    for (let i = 0; i < numSegments; i++) {
      const segment = document.createElement("div");
      segment.className = "line-segment";
      const angle = i * (360 / numSegments) - 90;
      segment.style.transform = `rotate(${angle}deg) translateX(${radius}px) rotate(90deg)`;
      segment.style.animation = `fadeIn 0.3s forwards ${
        3 + (i / numSegments) * bootupDuration
      }s`;
      rotatingContainer.appendChild(segment);
    }

    rotatingContainer.style.animation = "rotate 30s linear infinite";
  }, []);

  return (
    <div className="radar-container">
      <div className="radar-base">
        <div id="radialGridContainer" className="radial-grid-container"></div>
        <div id="logosContainer" className="logos-container"></div>
        <div className="center-image-wrapper">
          <img
            src="src/assets/CENTER VAULT.png"
            alt="Center Vault"
            className="center-image"
          />
          <div
            id="centerBorderContainer"
            className="center-border-container"
          ></div>
        </div>
        <div id="rotatingContainer" className="rotating-container"></div>
      </div>
      <div className="clock-face"></div>
    </div>
  );
};

export default RadarAnimation;
