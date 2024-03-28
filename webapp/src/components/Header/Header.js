import "./Header.css";

import { ReactComponent as BarIcon } from "../../assets/bars-solid.svg";
import { ReactComponent as SunIcon } from "../../assets/sun-solid.svg";
import { ReactComponent as MoonIcon } from "../../assets/moon-solid.svg";
import AudioButton from "../AudioButton/AudioButton";

const Header = (props) => {
  return (
    <header className="header">

      <div className="theme" onClick={props.onChangeTheme}>
        {props.theme === "light" ? <MoonIcon /> : <SunIcon />}
      </div>

      <AudioButton url="../../assets/music.wav" sound={props.sound} onChangeSound={props.onChangeSound} />

      <div className="header-button" onClick={props.onToggleNav}>
        <BarIcon />
      </div>

    </header>
  );
};

export default Header;
