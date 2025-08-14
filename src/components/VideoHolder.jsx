import { useEffect, useRef, useState } from "react";
import "../scss/video_holder.scss";
import { useVideoStore } from "../store";
import { FloatingBox } from "./FloatingBox";

export default function VideoHolder() {
  const [hoverIndex, setHoverIndex] = useState(null);
  const holderRef = useRef(null);
  // const elementCenter = useRef({ x: 0, y: 0 });
  const { vidList, setVidList } = useVideoStore();
  const [previewList, setPreviewList] = useState([]);
  // const [holderMoveRate, setHolderMoveRate] = useState(0.02);

  // useEffect(() => {
  //   vidList.length > 0 ? setHolderMoveRate(0.01) : setHolderMoveRate(0.02);
  // }, [vidList]);

  // // 비디오 홀더 이동 애니메이션 효과 제어
  // useEffect(() => {
  //   if (!holderRef.current) return;

  //   const rect = holderRef.current.getBoundingClientRect();
  //   elementCenter.current = {
  //     x: rect.left + rect.width / 2,
  //     y: rect.top + rect.height / 2,
  //   };

  //   let rafId = null;
  //   const handleMouseMove = (e) => {
  //     if (rafId) return;
  //     rafId = requestAnimationFrame(() => {
  //       const dx = elementCenter.current.x - e.clientX;
  //       const dy = elementCenter.current.y - e.clientY;

  //       holderRef.current.style.setProperty("--tx", `${dx * holderMoveRate}px`);
  //       holderRef.current.style.setProperty("--ty", `${dy * holderMoveRate}px`);

  //       rafId = null;
  //     });
  //   };

  //   window.addEventListener("mousemove", handleMouseMove);
  //   return () => {
  //     window.removeEventListener("mousemove", handleMouseMove);
  //     cancelAnimationFrame(rafId);
  //   };
  // }, [vidList]);

  // 썸네일
  useEffect(() => {
    const previewURLs = vidList.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviewList(previewURLs);

    return () => {
      previewURLs.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [vidList]);

  // 비디오 업로드
  const handleUploadVid = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.multiple = true;

    input.onchange = (e) => {
      const files = Array.from(input.files || []);
      if (files.length > 0) {
        setVidList(files);
      }
    };

    input.click();
  };

  // // 호버시 확대 애니메이션 제어
  // const handleHoverAni = (bool) => {
  //   setHovering(bool);
  // };

  return (
    // <div
    //   ref={holderRef}
    //   className={`video_holder ${
    //     vidList.length === 0 ? "no_item" : "has_item"
    //   } ${
    //     vidList.length > 0
    //       ? hovering
    //         ? "hover_in_small"
    //         : "hover_out_small"
    //       : hovering
    //       ? "hover_in_big"
    //       : "hover_out_big"
    //   }`}
    //   onMouseEnter={() => handleHoverAni(true)}
    //   onMouseLeave={() => handleHoverAni(false)}
    //   onClick={() => handleUploadVid()}
    // >
    <div className="video_holder">
      {vidList.length === 0 ? (
        <FloatingBox>
          <div className="guide_text" onClick={() => handleUploadVid()}>
            여기를 눌러 비디오를 업로드 하세요
          </div>
        </FloatingBox>
      ) : (
        <div className="grid_video">
          {previewList.map(({url}, index) => (
          <FloatingBox key={index} isOn={hoverIndex === index}>
            <div
              className="vid_item"
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <video src={url} controls muted className="preview_video"></video>
            </div>
          </FloatingBox>
          ))}
        </div>
      )}
    </div>
    // </div>
  );
}
