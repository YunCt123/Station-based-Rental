import React, { useEffect, useRef } from "react";

/**
 * Astronaut 404 scene (React version)
 * - Pure React + CSS (no external libs)
 * - Canvas drawing converted to useRef + useEffect
 * - Self-contained styles
 */
const Astronaut404: React.FC = () => {
  const visorRef = useRef<HTMLCanvasElement | null>(null);
  const cordRef = useRef<HTMLCanvasElement | null>(null);

  // Draw helmet visor once
  useEffect(() => {
    const canvas = visorRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(5, 45);
    ctx.bezierCurveTo(15, 64, 45, 64, 55, 45);
    ctx.lineTo(55, 20);
    ctx.bezierCurveTo(55, 15, 50, 10, 45, 10);
    ctx.lineTo(15, 10);
    ctx.bezierCurveTo(15, 10, 5, 10, 5, 20);
    ctx.lineTo(5, 45);

    ctx.fillStyle = "#2f3640";
    ctx.strokeStyle = "#f5f6fa";
    ctx.fill();
    ctx.stroke();
  }, []);

  // Animate cord continuously
  useEffect(() => {
    const canvas = cordRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ensure fixed working size (matches original)
    canvas.width = 500;
    canvas.height = 500;

    let y1 = 160;
    let y2 = 100;
    let y3 = 100;

    let y1Forward = true;
    let y2Forward = false;
    let y3Forward = true;

    let raf = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.moveTo(130, 170);
      ctx.bezierCurveTo(250, y1, 345, y2, 400, y3);

      ctx.strokeStyle = "white";
      ctx.lineWidth = 8;
      ctx.stroke();

      if (y1 === 100) y1Forward = true;
      if (y1 === 300) y1Forward = false;
      if (y2 === 100) y2Forward = true;
      if (y2 === 310) y2Forward = false;
      if (y3 === 100) y3Forward = true;
      if (y3 === 317) y3Forward = false;

      y1 = y1Forward ? y1 + 1 : y1 - 1;
      y2 = y2Forward ? y2 + 1 : y2 - 1;
      y3 = y3Forward ? y3 + 1 : y3 - 1;
    };

    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="scene">
      <div className="moon" />
      <div className="moon__crater moon__crater1" />
      <div className="moon__crater moon__crater2" />
      <div className="moon__crater moon__crater3" />

      <div className="star star1" />
      <div className="star star2" />
      <div className="star star3" />
      <div className="star star4" />
      <div className="star star5" />

      <div className="error">
        <div className="error__title">404</div>
        <div className="error__subtitle">Hmmm...</div>
        <div className="error__description">
          It looks like one of the developers fell asleep
        </div>
        <div className="error__actions">
          <button
            className="error__button error__button--active"
            onClick={() => (window.location.href = "/login")}
          >
            Quay lại Trang Đăng Nhập
          </button>
          <button
            className="error__button"
            onClick={() => (window.location.href = "/contact")}
          >
            Liên hệ Hỗ Trợ
          </button>
        </div>
      </div>

      <div className="astronaut">
        <div className="astronaut__backpack" />
        <div className="astronaut__body" />
        <div className="astronaut__body__chest" />
        <div className="astronaut__arm-left1" />
        <div className="astronaut__arm-left2" />
        <div className="astronaut__arm-right1" />
        <div className="astronaut__arm-right2" />
        <div className="astronaut__arm-thumb-left" />
        <div className="astronaut__arm-thumb-right" />
        <div className="astronaut__leg-left" />
        <div className="astronaut__leg-right" />
        <div className="astronaut__foot-left" />
        <div className="astronaut__foot-right" />
        <div className="astronaut__wrist-left" />
        <div className="astronaut__wrist-right" />

        <div className="astronaut__cord">
          <canvas ref={cordRef} height={500} width={500} />
        </div>

        <div className="astronaut__head">
          <canvas ref={visorRef} width={60} height={60} />
          <div className="astronaut__head-visor-flare1" />
          <div className="astronaut__head-visor-flare2" />
        </div>
      </div>

      <style jsx>{`
        .scene {
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow: hidden;
          background: linear-gradient(
            90deg,
            rgba(47, 54, 64, 1) 23%,
            rgba(24, 27, 32, 1) 100%
          );
          font-family: "Righteous", ui-sans-serif, system-ui, -apple-system,
            Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji",
            "Segoe UI Emoji", "Segoe UI Symbol";
        }

        .moon {
          background: linear-gradient(
            90deg,
            rgba(208, 208, 208, 1) 48%,
            rgba(145, 145, 145, 1) 100%
          );
          position: absolute;
          top: -100px;
          left: -300px;
          width: 900px;
          height: 900px;
          border-radius: 100%;
          box-shadow: 0 0 30px -4px rgba(0, 0, 0, 0.5);
        }

        .moon__crater {
          position: absolute;
          border-radius: 100%;
          background: linear-gradient(
            90deg,
            rgba(122, 122, 122, 1) 38%,
            rgba(195, 195, 195, 1) 100%
          );
          opacity: 0.6;
        }

        .moon__crater1 {
          top: 250px;
          left: 500px;
          width: 60px;
          height: 180px;
        }
        .moon__crater2 {
          top: 650px;
          left: 340px;
          width: 40px;
          height: 80px;
          transform: rotate(55deg);
        }
        .moon__crater3 {
          top: -20px;
          left: 40px;
          width: 65px;
          height: 120px;
          transform: rotate(250deg);
        }

        .star {
          background: grey;
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 100%;
          transform: rotate(250deg);
          opacity: 0.4;
          animation: shimmer 1.5s infinite alternate;
        }
        @keyframes shimmer {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.7;
          }
        }
        .star1 {
          top: 40%;
          left: 50%;
          animation-delay: 1s;
        }
        .star2 {
          top: 60%;
          left: 90%;
          animation-delay: 3s;
        }
        .star3 {
          top: 10%;
          left: 70%;
          animation-delay: 2s;
        }
        .star4 {
          top: 90%;
          left: 40%;
        }
        .star5 {
          top: 20%;
          left: 30%;
          animation-delay: 0.5s;
        }

        .error {
          position: absolute;
          left: 100px;
          top: 400px;
          transform: translateY(-60%);
          color: #363e49;
          text-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
        }
        .error__title {
          font-size: 10em;
          line-height: 1;
        }
        .error__subtitle {
          font-size: 2em;
          margin-top: 0.25em;
        }
        .error__description {
          opacity: 0.6;
          margin-top: 0.25em;
        }
        .error__actions {
          display: flex;
          align-items: center;
          gap: 0.5em;
          flex-wrap: wrap;
        }
        .error__button {
          min-width: 7em;
          margin-top: 2em;
          padding: 0.5em 2em;
          outline: none;
          border: 2px solid #2f3640;
          background-color: transparent;
          border-radius: 8em;
          color: #576375;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.75em;
        }
        .error__button:hover {
          color: #21252c;
          transform: translateY(-1px);
        }
        .error__button--active {
          background-color: #e67e22;
          border: 2px solid #e67e22;
          color: white;
        }
        .error__button--active:hover {
          box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.5);
          color: white;
        }

        .astronaut {
          position: absolute;
          width: 185px;
          height: 300px;
          left: 70%;
          top: 50%;
          transform: translate(-50%, -50%) rotate(20deg) scale(1.2);
        }
        .astronaut__head {
          background-color: white;
          position: absolute;
          top: 60px;
          left: 60px;
          width: 60px;
          height: 60px;
          border-radius: 2em;
        }
        .astronaut__head-visor-flare1 {
          background-color: #7f8fa6;
          position: absolute;
          top: 28px;
          left: 40px;
          width: 10px;
          height: 10px;
          border-radius: 2em;
          opacity: 0.5;
        }
        .astronaut__head-visor-flare2 {
          background-color: #718093;
          position: absolute;
          top: 40px;
          left: 38px;
          width: 5px;
          height: 5px;
          border-radius: 2em;
          opacity: 0.3;
        }
        .astronaut__backpack {
          background-color: #bfbfbf;
          position: absolute;
          top: 90px;
          left: 47px;
          width: 86px;
          height: 90px;
          border-radius: 8px;
        }
        .astronaut__body {
          background-color: #e6e6e6;
          position: absolute;
          top: 115px;
          left: 55px;
          width: 70px;
          height: 80px;
          border-radius: 8px;
        }
        .astronaut__body__chest {
          background-color: #d9d9d9;
          position: absolute;
          top: 140px;
          left: 68px;
          width: 45px;
          height: 25px;
          border-radius: 6px;
        }
        .astronaut__arm-left1 {
          background-color: #e6e6e6;
          position: absolute;
          top: 127px;
          left: 9px;
          width: 65px;
          height: 20px;
          border-radius: 8px;
          transform: rotate(-30deg);
        }
        .astronaut__arm-left2 {
          background-color: #e6e6e6;
          position: absolute;
          top: 102px;
          left: 7px;
          width: 20px;
          height: 45px;
          border-radius: 8px;
          transform: rotate(-12deg);
          border-top-left-radius: 8em;
          border-top-right-radius: 8em;
        }
        .astronaut__arm-right1 {
          background-color: #e6e6e6;
          position: absolute;
          top: 113px;
          left: 100px;
          width: 65px;
          height: 20px;
          border-radius: 8px;
          transform: rotate(-10deg);
        }
        .astronaut__arm-right2 {
          background-color: #e6e6e6;
          position: absolute;
          top: 78px;
          left: 141px;
          width: 20px;
          height: 45px;
          border-radius: 8px;
          transform: rotate(-10deg);
          border-top-left-radius: 8em;
          border-top-right-radius: 8em;
        }
        .astronaut__arm-thumb-left {
          background-color: #e6e6e6;
          position: absolute;
          top: 110px;
          left: 21px;
          width: 10px;
          height: 6px;
          border-radius: 8em;
          transform: rotate(-35deg);
        }
        .astronaut__arm-thumb-right {
          background-color: #e6e6e6;
          position: absolute;
          top: 90px;
          left: 133px;
          width: 10px;
          height: 6px;
          border-radius: 8em;
          transform: rotate(20deg);
        }
        .astronaut__wrist-left {
          background-color: #e67e22;
          position: absolute;
          top: 122px;
          left: 6.5px;
          width: 21px;
          height: 4px;
          border-radius: 8em;
          transform: rotate(-15deg);
        }
        .astronaut__wrist-right {
          background-color: #e67e22;
          position: absolute;
          top: 98px;
          left: 141px;
          width: 21px;
          height: 4px;
          border-radius: 8em;
          transform: rotate(-10deg);
        }
        .astronaut__leg-left {
          background-color: #e6e6e6;
          position: absolute;
          top: 188px;
          left: 50px;
          width: 23px;
          height: 75px;
          transform: rotate(10deg);
        }
        .astronaut__leg-right {
          background-color: #e6e6e6;
          position: absolute;
          top: 188px;
          left: 108px;
          width: 23px;
          height: 75px;
          transform: rotate(-10deg);
        }
        .astronaut__foot-left {
          background-color: white;
          position: absolute;
          top: 240px;
          left: 43px;
          width: 28px;
          height: 20px;
          transform: rotate(10deg);
          border-radius: 3px;
          border-top-left-radius: 8em;
          border-top-right-radius: 8em;
          border-bottom: 4px solid #e67e22;
        }
        .astronaut__foot-right {
          background-color: white;
          position: absolute;
          top: 240px;
          left: 111px;
          width: 28px;
          height: 20px;
          transform: rotate(-10deg);
          border-radius: 3px;
          border-top-left-radius: 8em;
          border-top-right-radius: 8em;
          border-bottom: 4px solid #e67e22;
        }

        .astronaut__head canvas {
          position: absolute;
          inset: 0;
          margin: auto;
        }

        /* Responsive tweak to keep text visible on narrow screens */
        @media (max-width: 768px) {
          .error {
            left: 24px;
            top: 50%;
            transform: translateY(-50%);
          }
          .error__title {
            font-size: 6em;
          }
        }
      `}</style>
    </div>
  );
};

export default Astronaut404;