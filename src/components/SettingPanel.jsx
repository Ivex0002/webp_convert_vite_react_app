import { useMemo } from "react";
import "../scss/setting_panel.scss";
import { SETTINGS, useSettingPanelOpenStore, useSettingsStore } from "../store";

export default function SettingPanel() {
  const { isOpen, togglePanel } = useSettingPanelOpenStore();
  const { resetUserSettings } = useSettingsStore();

  return (
    <div className={`config_panerl ${isOpen ? "panerl_open" : ""}`}>
      <div className="close_button" onClick={togglePanel}>
        x
      </div>
      <div className="setting_contents">
        <div className="panel_title">설정</div>
        <Type></Type>
        <Size></Size>
        <Frame></Frame>
        <Command></Command>
        <button className="reset" onClick={resetUserSettings}></button>
      </div>
    </div>
  );
}

function Type() {
  const { getUserSettings, setUserSettings } = useSettingsStore();
  const type = getUserSettings().type;

  return (
    <div className="type">
      <select
        value={type}
        onChange={(e) => setUserSettings({ type: e.target.value })}
      >
        {Object.values(SETTINGS.TYPE).map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
}

function Size() {
  const { getUserSettings, setUserSettings } = useSettingsStore();
  const size_option = getUserSettings().size.mode;
  const size_ratio = getUserSettings().size.ratio;
  const size_custom = getUserSettings().size.custom;

  // sizePercent 옵션 생성
  const ratioOptions = [];
  for (let i = 100; i >= 10; i -= 10) {
    ratioOptions.push(
      <option key={i} value={i}>
        {i} %
      </option>
    );
  }

  const handleCustomSize = (option, value) => {
    setUserSettings({
      size: {
        custom: {
          ...size_custom,
          [option]: parseInt(value) || 200,
        },
      },
    });
  };

  return (
    <div className="size">
      <div className="size_option">
        <select
          value={size_option}
          onChange={(e) => setUserSettings({ size: { mode: e.target.value } })}
        >
          {Object.values(SETTINGS.SIZE_MODE).map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
      </div>
      {size_option === SETTINGS.SIZE_MODE.RATIO ? (
        <div className="size_ratio">
          <select
            value={size_ratio}
            onChange={(e) =>
              setUserSettings({ size: { ratio: parseInt(e.target.value) } })
            }
          >
            {ratioOptions}
          </select>
        </div>
      ) : (
        <div className="size_custom">
          <input
            type="number"
            value={size_custom.width}
            onChange={(e) => handleCustomSize(width, e.target.value)}
            placeholder="가로 입력"
            min="1"
          />
          <input
            type="number"
            value={size_custom.height}
            onChange={(e) => handleCustomSize(height, e.target.value)}
            placeholder="세로 입력"
            min="1"
          />
        </div>
      )}
    </div>
  );
}

function Frame() {
  const { getUserSettings, setUserSettings } = useSettingsStore();
  const frame_mode = getUserSettings().frame.mode;
  const frame_custom = getUserSettings().frame.custom;

  return (
    <div className="frame">
      <div className="frame_mode">
        <select
          value={frame_mode}
          onChange={(e) => setUserSettings({ frame: { mode: e.target.value } })}
        >
          {Object.values(SETTINGS.FRAME_MODE).map((frameOption) => (
            <option key={frameOption} value={frameOption}>
              {frameOption}
            </option>
          ))}
        </select>
      </div>
      {frame_mode !== SETTINGS.FRAME_MODE.ORIGINAL && (
        <div className="frame_custom">
          <input
            type="number"
            value={frame_custom}
            onChange={(e) =>
              setUserSettings({
                frame: { custom: parseInt(e.target.value) || 20 },
              })
            }
            placeholder="프레임 입력"
            min="1"
          />
        </div>
      )}
    </div>
  );
}

function Command() {
  const { getUserSettings, setUserSettings, generateFfmpegCommand } =
    useSettingsStore();
  const userSetting = getUserSettings();
  const { isCommand, customCommand } = userSetting.command;

  const {command} = useMemo(
    () => generateFfmpegCommand("inputfile"),
    [userSetting]
  );

  return (
    <div className="command">
      <label>
        <input
          type="checkbox"
          checked={isCommand}
          onChange={(e) =>
            setUserSettings({ command: { isCommand: e.target.checked } })
          }
        />
        사용자 지정 ffmpeg 명령어 사용
      </label>
      <div className="command_text">
        {isCommand ? (
          <input
            className="custom_command"
            type="text"
            value={customCommand}
            onChange={(e) =>
              setUserSettings({ command: { customCommand: e.target.value } })
            }
            placeholder={"명령 입력"}
          />
        ) : (
          <div className="preset_command">현재 명령어 : {command}</div>
        )}
      </div>
    </div>
  );
}
