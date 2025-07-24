import { FFmpeg } from "@ffmpeg/ffmpeg";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
FFmpeg;

export const useVideoStore = create((set) => ({
  vidList: [],
  setVidList: (newVid) => set((state) => ({ vidList: [...state.vidList, ...newVid] })),
  reSet: () => set({ vidList: [] }),
}));

export const useFfmpegStore = create((set) => ({
  command: "",
  setCommand: (newCommand) => set(() => ({ command: newCommand })),
  resetCommand: set({ command: "" }),
}));

// 세팅 패널 여닫기
export const useSettingPanelOpenStore = create((set) => ({
  isOpen: false,
  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),
}));

// 세팅 구조
export const SETTINGS = {
  TYPE: {
    WEBP: "webp",
    GIF: "gif",
  },
  SIZE_MODE: {
    RATIO: "ratio",
    CUSTOM: "custom",
  },
  FRAME_MODE: {
    ORIGINAL: "original",
    CUSTOM: "custom",
  },
};

// 디폴트 세팅
const DEFAULT_SETTINGS = {
  type: SETTINGS.TYPE.WEBP,
  size: {
    mode: SETTINGS.SIZE_MODE.RATIO,
    ratio: 100,
    custom: { width: 200, height: 200 },
  },
  frame: {
    mode: SETTINGS.FRAME_MODE.ORIGINAL,
    custom: 20,
  },
  command: {
    isCommand: false,
    // placeholder: "",
    customCommand: "",
  },
};

// 세팅 검증로직
const validateSettings = (newSettings, currentSettings) => {
  return {
    type: Object.values(SETTINGS.TYPE).includes(newSettings.type)
      ? newSettings.type
      : currentSettings.type,
    size: {
      ...currentSettings.size,
      ...newSettings.size,
      mode: Object.values(SETTINGS.SIZE_MODE).includes(newSettings.size?.mode)
        ? newSettings.size.mode
        : currentSettings.size.mode,
      ratio: Math.max(
        1,
        Math.min(100, newSettings.size?.ratio ?? currentSettings.size.ratio)
      ),
      custom: {
        width: Math.max(
          1,
          newSettings.size?.custom?.width ?? currentSettings.size.custom.width
        ),
        height: Math.max(
          1,
          newSettings.size?.custom?.height ?? currentSettings.size.custom.height
        ),
      },
    },
    frame: {
      ...currentSettings.frame,
      ...newSettings.frame,
      mode: Object.values(SETTINGS.FRAME_MODE).includes(newSettings.frame?.mode)
        ? newSettings.frame.mode
        : currentSettings.frame.mode,
      custom: Math.max(
        5,
        Math.min(30, newSettings.frame?.custom ?? currentSettings.frame.custom)
      ),
    },
    command: {
      ...currentSettings.command,
      ...newSettings.command,
    },
  };
};

// 로컬에 저장된 설정파일 가져오기
const getInitialSettings = () => {
  try {
    const storedSettings = localStorage.getItem("user-settings");
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      const mergedSettings = validateSettings(
        parsedSettings.userSettings || {},
        DEFAULT_SETTINGS
      );

      // placeholder 생성 로직
      const type = mergedSettings.type;
      const size = mergedSettings.size;
      const frame = mergedSettings.frame;

      const sizeCommand =
        size.mode === SETTINGS.SIZE_MODE.RATIO
          ? "-vf scale=iw*" + size.ratio / 100 + ":-1"
          : `-vf scale=${size.custom.width}:${size.custom.height}`;

      const frameCommand =
        frame.mode === SETTINGS.FRAME_MODE.ORIGINAL ? "" : `-r ${frame.custom}`;

      const formatCommand = type === SETTINGS.TYPE.WEBP ? "-c:v libwebp" : "";

      const commandStr = [sizeCommand, frameCommand, formatCommand]
        .filter(Boolean)
        .join(" ");

      mergedSettings.command.placeholder = commandStr;

      return mergedSettings;
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Failed to parse stored settings:", error);
    return DEFAULT_SETTINGS;
  }
};

// 세팅 설정
export const useSettingsStore = create(
  persist(
    (set, get) => ({
      userSettings: getInitialSettings(),

      getUserSettings: () => get().userSettings,

      setUserSettings: (newSettings) =>
        set((state) => ({
          userSettings: validateSettings(newSettings, state.userSettings),
        })),

      resetUserSettings: () =>
        set(() => ({
          userSettings: DEFAULT_SETTINGS,
        })),

      generateFfmpegCommand: (inputFile) => {
        const { type, size, frame } = get().userSettings;

        const outputFileName =
          inputFile.substring(0, inputFile.lastIndexOf(".")) +
          `.${type.toLowerCase()}`;
        const args = ["-i", inputFile, "-c:v", type.toLowerCase()];

        if (size.mode === SETTINGS.SIZE_MODE.RATIO) {
          args.push("-vf", `scale=iw*${size.ratio}/100:ih*${size.ratio}/100`);
        } else {
          args.push("-vf", `scale=${size.custom.width}:${size.custom.height}`);
        }

        if (frame.mode !== SETTINGS.FRAME_MODE.ORIGINAL) {
          args[args.length - 1] += `,pad=width=iw+${frame.custom}:height=ih+${
            frame.custom
          }:x=${frame.custom / 2}:y=${frame.custom / 2}`;
        }

        args.push(outputFileName);

        return { command: args, outputFileName };
      },
    }),
    {
      name: "user-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ userSettings: state.userSettings }),
    }
  )
);
