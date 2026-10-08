import { KageLandingPage } from "./shaders/landing-pages/LandingPages";
import "./shaders/threeui.css";
import "./index.css";

export function Scene() {
  return (
    <div className="shader-frame" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <KageLandingPage
        headingFont="onest"
        bodyFont="onest"
        headingWeight="400"
        bodyWeight="300"
        primaryColor="#e0231c"
        headingSize={46}
        bodySize={17}
        headingLetterSpacing={-0.012}
      />
    </div>
  );
}

export default Scene;
