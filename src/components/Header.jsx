import logo from "../assets/logo.png";
import "../scss/header.scss";

export default function Header() {

  return (
    <header>
      {/* 로고 */}
      <div className="logo">
        <img src={logo} alt="" />
        convert to webp
      </div>
    </header>
  );
}
