import "./App.css";
import ConvertButton from "./components/ConvertButton";
import Header from "./components/header";
import Background from "./components/background";
import VideoHolder from "./components/videoHolder";
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
