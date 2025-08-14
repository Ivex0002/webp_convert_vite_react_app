import { useEffect, useRef } from "react";
import styled from "styled-components";

export function FloatingBox({ children, moveRate = 0.02, isOn = true }) {
  const boxRef = useRef(null);
  const elementCenter = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!boxRef.current||!isOn) return;

    //   요소의 중심점
    const rect = boxRef.current.getBoundingClientRect();
    elementCenter.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    let rafId = null;
    const handleMouseMove = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        //   마우스와의 거리 계산
        const dx = elementCenter.current.x - e.clientX;
        const dy = elementCenter.current.y - e.clientY;

        if (boxRef.current) {
          boxRef.current.style.transform = `translate(${dx * moveRate}px, ${
            dy * moveRate
          }px)`;
        }

        rafId = null;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [moveRate, isOn]);

  return <BoxStyle ref={boxRef}>{children}</BoxStyle>;
}

const BoxStyle = styled.div`
  position: relative;
  z-index: 999;
  will-change: transform;
`;
