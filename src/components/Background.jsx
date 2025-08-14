import styled from "styled-components";

export default function Background() {

  return (
    <BackgroundStyle>
    </BackgroundStyle>
  );
}

const BackgroundStyle = styled.div`
  position: fixed;
  /* display: flex; */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f3ca90c0, #4678b9c8);
  background-size: 150% 150%;
  animation: waveGradient 10s ease infinite;
  /* animation: waveGradient 2s ease infinite; */
  z-index: 1;
  pointer-events: none;

  @keyframes waveGradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;
