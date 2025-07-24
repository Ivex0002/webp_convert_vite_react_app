import "./App.css";
import Header from "./components/Header";
import Background from "./components/Background";
import ConvertButton from "./components/ConvertButton";
import { useSettingPanelOpenStore } from "./store";
import VideoHolder from "./components/VideoHolder";

function App() {
  const { isOpen } = useSettingPanelOpenStore();

  return (
    <div className="app">
      <Header></Header>
      <Background></Background>
      <VideoHolder></VideoHolder>
      <ConvertButton></ConvertButton>
      <div className={`overlay ${isOpen ? "active" : ""}`}></div>
    </div>
  );
}

export default App;
