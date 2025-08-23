import { useState, useEffect } from "react";
import "../scss/convert_button.scss";
import { FloatingBox } from "./FloatingBox";
import {
  SETTINGS,
  useSettingsStore,
  useVideoStore,
} from "../store/videoSettingStore";
import { wrap } from "comlink";
import pLimit from "p-limit";
import JSZip from "jszip";

export default function ConvertButton() {
  const { vidList } = useVideoStore();
  const { userSettings, generateFfmpegCommand } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const maxWorkers = Math.max(1, navigator.hardwareConcurrency - 1);

  useEffect(() => {
    const handlePanerlByMouse = (e) => {
      const rightX = window.innerWidth - e.clientX;
      rightX < 190 ? setIsOpen(true) : setIsOpen(false);
      // console.log(rightX);
    };
    window.addEventListener("mousemove", handlePanerlByMouse);
    return () => window.removeEventListener("mousemove", handlePanerlByMouse);
  }, []);

  async function convertVideos() {
    if (!vidList || vidList.length === 0) {
      alert("변환할 비디오가 없습니다!");
      return;
    }
    const limit = pLimit(maxWorkers);
    const tasks = vidList.map((vid) => limit(() => processSingleVideo(vid)));
    const outputList = await Promise.all(tasks);
    downloadAsZip(outputList);
    alert("비디오 변환이 완료되었습니다!");
  }

  return (
    <div className="convert_div">
      {vidList.length > 0 ? (
        <>
          <div className={`convert_button_hint ${isOpen ? "hint_close" : ""}`}>
            convert
            <img src="/angle_bracket.png" alt="" />
          </div>
          <div
            className={`button_wrapper ${isOpen ? "convert_button_open" : ""}`}
          >
            <FloatingBox>
              <button
                onClick={convertVideos}
                disabled={converting || vidList.length === 0}
              >
                "Convert Now"
              </button>
            </FloatingBox>
          </div>
        </>
      ) : null}
    </div>
  );

  async function processSingleVideo(vid) {
    const worker = new Worker(
      new URL("../logics/ffmpegWorker.js", import.meta.url),
      { type: "module" }
    );
    const api = wrap(worker);

    const { command, outputFileName } = generateFfmpegCommand(vid);
    const { data } = await api.processVideo(vid, {
      command,
      outputFileName,
    });

    worker.terminate();

    const blob = new Blob([data], {
      type:
        userSettings.type === SETTINGS.TYPE.WEBP ? "image/webp" : "image/gif",
    });
    return { blob, outputFileName };
  }
}

async function downloadAsZip(fileList) {
  console.log(`다운 시작됨!`);

  const zip = new JSZip();

  fileList.forEach(({ blob, outputFileName }) => {
    zip.file(outputFileName, blob);
  });

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = "converted_files.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
