// 2차 시도
import { useState, useRef, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { SETTINGS, useSettingsStore, useVideoStore } from "../store";
import "../scss/convert_button.scss";
import { FloatingBox } from "./FloatingBox";

export default function ConvertButton() {
  const { vidList } = useVideoStore();
  const { userSettings, generateFfmpegCommand } = useSettingsStore();
  const [loaded, setLoaded] = useState(false);
  const [converting, setConverting] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handlePanerlByMouse = (e) => {
      const rightX = window.innerWidth - e.clientX;
      rightX < 250 ? setIsOpen(true) : setIsOpen(false);
      // console.log(rightX);
    };
    window.addEventListener("mousemove", handlePanerlByMouse);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpeg = ffmpegRef.current;
      const baseURL = "/ffmpeg";

      try {
        ffmpeg.on("log", ({ message }) => {
          if (messageRef.current) {
            messageRef.current.innerHTML = message;
            console.log(message);
          }
        });

        await loadffmpegURL(ffmpeg, baseURL);
        setLoaded(true);
        console.log("FFmpeg loaded successfully!");
      } catch (error) {
        console.error("FFmpeg 로드 중 오류 발생:", error);
        setLoadingError("FFmpeg 로드에 실패했습니다. 다시 시도해 주세요.");
      }
    };

    loadFFmpeg();
  }, []);

  const convertVideos = async () => {
    if (!vidList || vidList.length === 0) {
      alert("변환할 비디오가 없습니다!");
      return;
    }

    setConverting(true);
    const ffmpeg = ffmpegRef.current;

    try {
      const outputList = await Promise.all(
        vidList.map(async (vid) => {
          if (!vid.name) {
            throw new Error(`비디오 파일 이름이 유효하지 않습니다: ${vid}`);
          }

          const inputFileName = vid.name;
          await ffmpeg.writeFile(inputFileName, await fetchFile(vid));

          const { command, outputFileName } = generateFfmpegCommand(vid);
          await ffmpeg.exec(command);

          const data = await ffmpeg.readFile(outputFileName);

          await ffmpeg.deleteFile(inputFileName);
          await ffmpeg.deleteFile(outputFileName);

          const blob = new Blob([data.buffer], {
            type:
              userSettings.type === SETTINGS.TYPE.WEBP
                ? "image/webp"
                : "image/gif",
          });

          return { blob, outputFileName };
        })
      );

      downloadAllOutputs(outputList);
      alert("비디오 변환이 완료되었습니다!");
    } catch (error) {
      console.error("비디오 변환 중 오류 발생:", error);
      alert("비디오 변환 중 오류가 발생했습니다!");
    } finally {
      setConverting(false);
    }
  };

  const downloadAllOutputs = (fileList) => {
    for (const { blob, outputFileName } of fileList) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = outputFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="convert_div">
      {loadingError ? (
        <p style={{ color: "red" }}>{loadingError}</p>
      ) : !loaded ? (
        <p className="ffmpeg_load_msg">
          FFmpeg 로드 중... 잠시만 기다려 주세요.
        </p>
      ) : (
        <>
          {vidList.length > 0 ? (
            <>
              <div
                className={`convert_button_hint ${isOpen ? "hint_close" : ""}`}
              >
                convert
                <img src="/angle_bracket.png" alt="" />
              </div>
                  <div className={`button_wrapper ${isOpen ? "convert_button_open" : ""
                    }`}>
                <FloatingBox>
                  <button
                    onClick={convertVideos}
                    disabled={converting || vidList.length === 0}
                  >
                    {converting ? "Converting..." : "Convert Now"}
                  </button>
                </FloatingBox>
              </div>
            </>
          ) : null}
          <div className="system_log">
            <p ref={messageRef}></p>
          </div>
        </>
      )}
    </div>
  );
}

async function loadffmpegURL(ffmpeg, baseURL) {
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    workerURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      "text/javascript"
    ),
  });
}
