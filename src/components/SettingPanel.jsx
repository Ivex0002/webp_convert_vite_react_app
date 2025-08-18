import { useEffect, useMemo, useRef, useState } from "react";
import "../scss/setting_panel.scss";
import { SETTINGS, useSettingsStore } from "../store/videoSettingStore";
import { FloatingBox } from "./FloatingBox";
import Select from "react-select";

export default function SettingPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { resetUserSettings } = useSettingsStore();

  useEffect(() => {
    const handlePanerlByMouse = (e) => {
      e.clientX < 250 ? setIsOpen(true) : setIsOpen(false);
      // console.log(e.clientX);
    };
    window.addEventListener("mousemove", handlePanerlByMouse);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className={`panerl_wrapper ${isOpen ? "panerl_open" : ""}`}>
      <FloatingBox>
        <div className={`config_panerl `}>
          {/* <div className="close_button" onClick={set}>
            x
          </div> */}
          <div className="setting_contents">
            <div className="panel_title">설정</div>
            <Type></Type>
            <Size></Size>
            <Frame></Frame>
            <Command></Command>
            <button
              className="reset"
              onClick={() => {
                resetUserSettings();
              }}
            >
              리셋
            </button>
          </div>
        </div>
      </FloatingBox>
      <div className={`config_hint ${isOpen ? "hint_close" : ""}`}>
        <img src="/angle_bracket.png" alt="config" />
        <img src="/config8.png" alt="config" />
      </div>
    </div>
  );
}

function Type() {
  const { setUserSettings, getUserSettings } = useSettingsStore();
  const type = getUserSettings().type;
  // console.log({type});
  const typeOptions = Object.values(SETTINGS.TYPE).map((type) => ({
    value: type,
    label: type,
  }));

  return (
    <div className="type">
      타입 :
      <Select
        className="select_style"
        options={typeOptions}
        value={typeOptions.find((opt) => opt.value === type)}
        onChange={(selectedOption) =>
          setUserSettings({ type: selectedOption.value })
        }
        // onMenuClose={()=>{debugger}}
      ></Select>
    </div>
  );
}

function Size() {
  const { getUserSettings, setUserSettings } = useSettingsStore();
  const size_option = getUserSettings().size.mode;
  const size_ratio = getUserSettings().size.ratio;
  const size_custom = getUserSettings().size.custom;

  const size_options = Object.values(SETTINGS.SIZE_MODE).map((mode) => ({
    value: mode,
    label: mode,
  }));

  // sizePercent 옵션 생성
  const ratioOptions = [];
  for (let i = 100; i >= 10; i -= 10) {
    ratioOptions.push({ value: i, label: `${i}%` });
  }

  const handleCustomSize = (option, value) => {
    console.log("value", value);
    setUserSettings({
      size: {
        custom: {
          ...size_custom,
          [option]: parseInt(value) || 200,
        },
      },
    });

    console.log("getUserSettings", getUserSettings());
  };

  return (
    <div className="size">
      <div className="size_option">
        사이즈 :
        <Select
          className="select_style"
          options={size_options}
          value={size_options.find((opt) => opt.value === size_option)}
          onChange={(selectedOption) =>
            setUserSettings({ size: { mode: selectedOption.value } })
          }
        ></Select>
        {/* <select
          value={size_option}
          onChange={(e) => setUserSettings({ size: { mode: e.target.value } })}
        >
          {Object.values(SETTINGS.SIZE_MODE).map((mode) => (
            <option key={mode} value={mode}>
              {mode === "ratio" ? "비율" : "직접 설정"}
            </option>
          ))}
        </select> */}
      </div>
      {size_option === SETTINGS.SIZE_MODE.RATIO ? (
        <div className="size_ratio">
          <Select
            className="select_style"
            options={ratioOptions}
            value={ratioOptions.find((opt) => opt.value === size_ratio)}
            onChange={(e) =>
              setUserSettings({ size: { ratio: parseInt(e.value) } })
            }
            defaultValue={ratioOptions[0]}
            // onMenuClose={() => {
            //   debugger;
            // }}
            // openMenuOnFocus={() => {
            //   debugger;
            // }}
          ></Select>
        </div>
      ) : (
        <div className="size_custom">
          <input
            title="가로 길이 입력"
            type="number"
            value={size_custom.width}
            onChange={(e) => handleCustomSize("width", e.target.value)}
            placeholder="가로 입력"
            min="1"
          />
          x
          <input
            title="세로 길이 입력"
            type="number"
            value={size_custom.height}
            onChange={(e) => handleCustomSize("height", e.target.value)}
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

  const frame_modes = Object.values(SETTINGS.FRAME_MODE).map((mode) => ({
    value: mode,
    label: mode,
  }));

  return (
    <div className="frame">
      <div className="frame_mode">
        프레임 :
        <Select
          className="select_style"
          options={frame_modes}
          value={frame_modes.find((opt) => opt.value === frame_mode)}
          onChange={(selectedOption) =>
            setUserSettings({ frame: { mode: selectedOption.value } })
          }
        ></Select>
        {/* <select
          value={frame_mode}
          onChange={(e) => setUserSettings({ frame: { mode: e.target.value } })}
        >
          {Object.values(SETTINGS.FRAME_MODE).map((frameOption) => (
            <option key={frameOption} value={frameOption}>
              {frameOption}
            </option>
          ))}
        </select> */}
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

  const { command } = useMemo(
    () => generateFfmpegCommand("inputfile"),
    [userSetting]
  );
  // console.log("command", command);

  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight + 2}px`;
    }
  }, [command, isCommand]);

  useEffect(() => {
    isCommand
      ? setUserSettings({ command: { customCommand: command } })
      : setUserSettings({ command: { customCommand: "" } });
  }, [isCommand]);

  const formattedPlaceholder = isCommand
    ? ""
    : `현재 명령어 :\n${command
        .join(" ")
        .split("-")
        .filter(Boolean)
        .map((el) => "-" + el.trim())
        .join("\n")}`;

  console.log(formattedPlaceholder);

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
      <textarea
        className="current_command"
        ref={textareaRef}
        value={customCommand}
        onChange={(e) =>
          setUserSettings({ command: { customCommand: e.target.value } })
        }
        placeholder={formattedPlaceholder}
        rows={1}
      />
    </div>
  );
}
