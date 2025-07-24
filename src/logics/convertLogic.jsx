// import { FFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
// import { SETTINGS, useSettingsStore, useVideoStore } from "../store";

// const ffmpeg = new FFmpeg();

// /**
//  *
//  * @returns bool
//  */
// export const convertVideos = async () => {
//   const { vidList } = useVideoStore();
//   const { userSettings, generateFfmpegCommand } = useSettingsStore();
//   try {
//     if (!ffmpeg.isLoaded()) {
//       await ffmpeg.load();
//     }
//     const outputList = vidList.map(async (vid) => {
//       const inputFileName = vid.name;
//       ffmpeg.FS("writeFile", inputFileName, await fetchFile(vid));

//       const { command, outputFileName } = generateFfmpegCommand(vid);
//       await ffmpeg.run(...command);

//       const data = ffmpeg.FS("readFile", outputFileName);

//       ffmpeg.FS("unlink", inputFileName);
//       ffmpeg.FS("unlink", outputFileName);
//       const blob = new Blob([data.buffer], {
//         type:
//           userSettings.type === SETTINGS.TYPE.WEBP ? "image/webp" : "image/gif",
//       });
//       return { blob, outputFileName };
//     });

//     downloadAllOutputs(outputList);

//     return true;
//   } catch (error) {
//     console.error("WebP 변환 중 오류 발생:", error);
//     return false;
//   }
// };

// function downloadAllOutputs(fileList) {
//   for (const { blob, outputFileName } of fileList) {
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = outputFileName;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   }
// }

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { SETTINGS} from "../store";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

export const convertVideos = async (vidList, userSettings, generateFfmpegCommand) => {
  // const { vidList } = useVideoStore();
  // const { userSettings, generateFfmpegCommand } = useSettingsStore();

  try {
    if (!ffmpeg.isLoaded()) {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";

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
    }

    const outputList = await Promise.all(
      vidList.map(async (vid) => {
        const inputFileName = vid.name;
        ffmpeg.writeFile(inputFileName, await fetchFile(vid));

        const { command, outputFileName } = generateFfmpegCommand(vid);
        await ffmpeg.exec(command);

        const data = await ffmpeg.readFile(outputFileName);

        ffmpeg.deleteFile(inputFileName);
        ffmpeg.deleteFile(outputFileName);

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

    return true;
  } catch (error) {
    console.error("비디오 변환 중 오류 발생:", error);
    return false;
  }
};

function downloadAllOutputs(fileList) {
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
}
