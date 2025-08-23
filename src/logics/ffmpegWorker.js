import { expose, transfer } from "comlink";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

async function processVideo(vid, commandInfo) {
  const ffmpeg = new FFmpeg();
  const baseURL =
    "https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.10/dist/esm";

  ffmpeg.on("log", ({ message }) => {
    console.log(`[Worker for ${vid.name}]: ${message}`);
  });

  // FFmpeg 로드 (baseURL 사용)
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    workerURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      "text/javascript"
    ),
  });

  const inputFileName = vid.name;
  await ffmpeg.writeFile(inputFileName, await fetchFile(vid));

  const { command, outputFileName } = commandInfo;

  await ffmpeg.exec(command);

  const data = await ffmpeg.readFile(outputFileName);

  await ffmpeg.deleteFile(inputFileName);
  await ffmpeg.deleteFile(outputFileName);

  await ffmpeg.terminate();

  return transfer({ data: data.buffer }, [data.buffer]);
}

expose({ processVideo });
