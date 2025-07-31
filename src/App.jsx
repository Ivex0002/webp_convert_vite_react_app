import "./App.css";
import Header from "./components/Header";
import Background from "./components/Background";
import { useSettingPanelOpenStore } from "./store";
import VideoHolder from "./components/VideoHolder";
import ConvertButton from "./components/convertButton";

function App() {
  const { isOpen } = useSettingPanelOpenStore();

  return (
    <div className="app">
      <Header/>
      <Background/>
      <VideoHolder/>
      <ConvertButton/>
      <div className={`overlay ${isOpen ? "active" : ""}`}></div>
    </div>
  );
}

export default App;
