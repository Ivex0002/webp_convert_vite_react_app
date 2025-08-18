import "./App.css";
import ConvertButton from "./components/ConvertButton";
import Header from "./components/Header";
import Background from "./components/Background";
import VideoHolder from "./components/VideoHolder";
import SettingPanel from "./components/SettingPanel";

function App() {
  return (
    <div className="app">
      <Header />
      <Background />
      <VideoHolder />
      <SettingPanel/>
      <ConvertButton />
    </div>
  );
}

export default App;
