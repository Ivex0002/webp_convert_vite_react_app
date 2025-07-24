// import { convertVideos } from "../logics/convertLogic";
// import "../scss/convert_button.scss";
// import { useSettingsStore, useVideoStore } from "../store";

// export default function ConvertButton() {
//   const { vidList } = useVideoStore();
//   const { userSettings, generateFfmpegCommand } = useSettingsStore();

//   const handleConvert = async () => {
//     const result = await convertVideos(
//       vidList,
//       userSettings,
//       generateFfmpegCommand
//     );

//     result ? console.log("변환 성공!") : console.log("변환 실패!");
//   };
//   return (
//     <>
//       <button id="convert_floating_button" onClick={() => handleConvert()}>
//         convert now
//       </button>
//     </>
//   );
// }

// 2차 시도
import { useState, useRef, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { SETTINGS, useSettingsStore, useVideoStore } from "../store";
import "../scss/convert_button.scss";

export default function ConvertButton() {
  const { vidList } = useVideoStore();
  const { userSettings, generateFfmpegCommand } = useSettingsStore();
  const [loaded, setLoaded] = useState(false);
  const [converting, setConverting] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef(null);

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

        await ffmpeg.load({
          coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            "text/javascript"
          ),
          wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            "application/wasm"
          ),
          workerURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.worker.js`,
            "text/javascript"
          ),
        });
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
    <div>
      {loadingError ? (
        <p style={{ color: "red" }}>{loadingError}</p>
      ) : !loaded ? (
        <p>FFmpeg 로드 중... 잠시만 기다려 주세요.</p>
      ) : (
        <>
          <button
            id="convert_floating_button"
            onClick={convertVideos}
            disabled={converting || vidList.length === 0}
          >
            {converting ? "Converting..." : "Convert Now"}
          </button>
          <p ref={messageRef}></p>
          <p>Open Developer Tools (Ctrl+Shift+I) to View Logs</p>
        </>
      )}
    </div>
  );
}

// 3차시도 
// import { useState, useRef } from "react";
// import { FFmpeg } from "@ffmpeg/ffmpeg";
// import { toBlobURL, fetchFile } from "@ffmpeg/util";
// import { useVideoStore, useSettingsStore } from "./store"; // store.jsx 경로 확인 필요

// export default function ConvertButton() {
//   const [loaded, setLoaded] = useState(false);
//   const [converting, setConverting] = useState(false);
//   const ffmpegRef = useRef(new FFmpeg());
//   const videoRef = useRef(null);
//   const messageRef = useRef(null);
//   const { vidList, setVidList, reSet } = useVideoStore();
//   const { userSettings, generateFfmpegCommand } = useSettingsStore();

//   // FFmpeg 로드 함수
//   const load = async () => {
//     try {
//       const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm";
//       const ffmpeg = ffmpegRef.current;

//       ffmpeg.on("log", ({ message }) => {
//         if (messageRef.current) {
//           messageRef.current.innerHTML = message;
//         }
//       });

//       await ffmpeg.load({
//         coreURL: await toBlobURL(
//           `${baseURL}/ffmpeg-core.js`,
//           "text/javascript"
//         ),
//         wasmURL: await toBlobURL(
//           `${baseURL}/ffmpeg-core.wasm`,
//           "application/wasm"
//         ),
//         workerURL: await toBlobURL(
//           `${baseURL}/ffmpeg-core.worker.js`,
//           "text/javascript"
//         ),
//       });
//       setLoaded(true);
//       if (messageRef.current) {
//         messageRef.current.innerHTML = "FFmpeg가 성공적으로 로드되었습니다.";
//       }
//     } catch (error) {
//       console.error("FFmpeg 로드 중 오류:", error);
//       if (messageRef.current) {
//         messageRef.current.innerHTML = "FFmpeg 로드에 실패했습니다.";
//       }
//     }
//   };

//   // 비디오 변환 함수
//   const transcode = async (inputFile, outputFile, command) => {
//     const ffmpeg = ffmpegRef.current;
//     try {
//       await ffmpeg.writeFile(inputFile.name, await fetchFile(inputFile));
//       await ffmpeg.exec(command);
//       const fileData = await ffmpeg.readFile(outputFile);
//       const data = new Uint8Array(fileData);

//       // 변환된 비디오를 video 요소에 표시
//       if (videoRef.current) {
//         videoRef.current.src = URL.createObjectURL(
//           new Blob([data.buffer], {
//             type: `video/${userSettings.type.toLowerCase()}`,
//           })
//         );
//       }
//       return { success: true, outputFile };
//     } catch (error) {
//       console.error(`비디오 변환 실패 (${inputFile.name}):`, error);
//       throw error;
//     }
//   };

//   // 변환 시작 함수
//   const convert = async () => {
//     if (vidList.length === 0) {
//       if (messageRef.current) {
//         messageRef.current.innerHTML = "변환할 비디오가 없습니다.";
//       }
//       return;
//     }

//     setConverting(true);
//     try {
//       const outputList = await Promise.all(
//         vidList.map(async (vid) => {
//           const { command, outputFileName } = generateFfmpegCommand(vid.name); // 오타 수정
//           return await transcode(vid, outputFileName, command);
//         })
//       );

//       if (messageRef.current) {
//         messageRef.current.innerHTML = `변환 완료: ${outputList.length}개의 비디오`;
//       }
//     } catch (error) {
//       console.error("비디오 변환 중 오류 발생:", error);
//       if (messageRef.current) {
//         messageRef.current.innerHTML = "비디오 변환 중 오류가 발생했습니다.";
//       }
//     } finally {
//       setConverting(false);
//     }
//   };

//   // 비디오 업로드 핸들러
//   const handleUploadVid = () => {
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = "video/*";
//     input.multiple = true;

//     input.onchange = (e) => {
//       const files = Array.from(e.target.files || []);
//       if (files.length > 0) {
//         setVidList(files);
//         if (messageRef.current) {
//           messageRef.current.innerHTML = `${files.length}개의 비디오가 업로드되었습니다.`;
//         }
//       }
//     };

//     input.click();
//   };

//   return (
//     <div>
//       {loaded ? (
//         <>
//           <button onClick={handleUploadVid} disabled={converting}>
//             비디오 업로드
//           </button>
//           <br />
//           <video
//             ref={videoRef}
//             controls
//             style={{ maxWidth: "100%", margin: "10px 0" }}
//           />
//           <br />
//           <button
//             onClick={convert}
//             disabled={converting || vidList.length === 0}
//           >
//             {converting ? "변환 중..." : "비디오 변환"}
//           </button>
//           <button onClick={reSet} disabled={converting || vidList.length === 0}>
//             비디오 목록 초기화
//           </button>
//           <p ref={messageRef}></p>
//         </>
//       ) : (
//         <button onClick={load} disabled={loaded}>
//           FFmpeg 로드
//         </button>
//       )}
//     </div>
//   );
// }