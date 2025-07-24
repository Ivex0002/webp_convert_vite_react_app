import logo from "../assets/logo.png";
import config_button from "../assets/menu.png";
import "../scss/header.scss";
import { useSettingPanelOpenStore } from "../store";
import SettingPanel from "./SettingPanel";

export default function Header() {
  const { togglePanel } = useSettingPanelOpenStore();

  return (
    <header>
      {/* 로고 */}
      <div className="logo">
        <img src={logo} alt="" />
        convert to Webp
      </div>
      {/* 설정버튼 */}
      <div className="config_button" onClick={()=>togglePanel()}>
        <img src={config_button} alt="" />
      </div>
      {/* 설정패널 */}
      <SettingPanel></SettingPanel>
    </header>
  );
}
