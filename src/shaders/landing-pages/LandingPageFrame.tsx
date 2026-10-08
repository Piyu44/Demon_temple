import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  applyPageCustomization,
  postPageCustomization,
  type LandingPageCustomization,
} from "./pageTypography";

export type LandingPageFrameProps = {
  backgroundCanvasSelector?: string;
  backgroundVisualSelector?: string;
  className?: string;
  sourceUrl: string;
  srcDoc?: string;
  style?: CSSProperties;
  title: string;
  customization?: LandingPageCustomization;
  applyScene?: (frame: HTMLIFrameElement) => void;
};

export type LandingPageProps = Omit<
  LandingPageFrameProps,
  "sourceUrl" | "title" | "customization" | "backgroundCanvasSelector" | "backgroundVisualSelector"
>;

const URL_FRAME_SANDBOX = "allow-downloads allow-forms allow-modals allow-popups allow-scripts";
const SRCDOC_FRAME_SANDBOX = "allow-downloads allow-forms allow-modals allow-popups allow-scripts";

const BACKGROUND_PRESENTATION_STYLE_ID = "threeui-background-presentation";

export function applyBackgroundPresentation(
  frame: HTMLIFrameElement | null,
  backgroundCanvasSelector?: string,
  backgroundVisualSelector?: string,
) {
  const document = frame?.contentDocument;
  if (!document) return;

  document.getElementById(BACKGROUND_PRESENTATION_STYLE_ID)?.remove();
  document.querySelectorAll("[data-threeui-background-layer]").forEach((element) => {
    element.removeAttribute("data-threeui-background-layer");
    element.removeAttribute("data-threeui-background-fill");
  });

  if (!backgroundCanvasSelector) {
    document.documentElement.removeAttribute("data-threeui-presentation");
    return;
  }

  const canvas = document.querySelector<HTMLElement>(backgroundCanvasSelector);
  if (!canvas) return;

  canvas.setAttribute("data-threeui-background-layer", "");
  canvas.setAttribute("data-threeui-background-fill", "");
  if (backgroundVisualSelector) {
    document.querySelectorAll<HTMLElement>(backgroundVisualSelector).forEach((element) => {
      element.setAttribute("data-threeui-background-layer", "");
    });
  }

  document.documentElement.setAttribute("data-threeui-presentation", "background");
  const presentationStyle = document.createElement("style");
  presentationStyle.id = BACKGROUND_PRESENTATION_STYLE_ID;
  presentationStyle.textContent = `
    html[data-threeui-presentation="background"],
    html[data-threeui-presentation="background"] body {
      width: 100% !important;
      height: 100% !important;
      min-height: 100% !important;
      overflow: hidden !important;
    }
    html[data-threeui-presentation="background"] body * {
      visibility: hidden !important;
      pointer-events: none !important;
    }
    html[data-threeui-presentation="background"] [data-threeui-background-layer],
    html[data-threeui-presentation="background"] [data-threeui-background-layer] * {
      visibility: visible !important;
    }
    html[data-threeui-presentation="background"] [data-threeui-background-fill] {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      max-width: none !important;
      max-height: none !important;
      margin: 0 !important;
      transform: none !important;
    }
  `;
  document.head.appendChild(presentationStyle);

  frame.contentWindow?.requestAnimationFrame(() => {
    frame.contentWindow?.dispatchEvent(new Event("resize"));
  });
}

// ==========================================
// SCROLL SEQUENCE CONFIGURATION
// ==========================================
const frameCount = 192;

const currentFrame = (index: number) => (
  `/1_frames/frame_${index.toString().padStart(6, '0')}.png`
);

export function LandingPageFrame({
  applyScene,
  backgroundCanvasSelector,
  backgroundVisualSelector,
  className = "",
  customization,
  sourceUrl,
  srcDoc,
  style,
  title,
}: LandingPageFrameProps) {
  const [ready, setReady] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    // Preload images
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = () => {
        loadedCount++;
        setLoaded(Math.floor((loadedCount / frameCount) * 100));
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  useEffect(() => {
    if (images.length === 0 || loaded < 100) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Draw first frame
    const img = images[0];
    
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;
      
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const handleScroll = () => {
      let scrollTop = window.scrollY;
      let scrollHeight = document.documentElement.scrollHeight;
      let clientHeight = window.innerHeight;

      // If the iframe is loaded, use its scroll position instead
      const iframeWin = frameRef.current?.contentWindow;
      if (iframeWin) {
        scrollTop = iframeWin.scrollY;
        scrollHeight = iframeWin.document.documentElement.scrollHeight;
        clientHeight = iframeWin.innerHeight;
      }

      let maxScrollTop = scrollHeight - clientHeight;
      if (maxScrollTop <= 0) maxScrollTop = 1; // Prevent division by zero
      
      let scrollFraction = scrollTop / maxScrollTop;
      scrollFraction = Math.max(0, Math.min(1, scrollFraction));
      
      const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount)
      );

      requestAnimationFrame(() => updateImage(frameIndex + 1));
    };

    const updateImage = (index: number) => {
      if (images[index - 1]) {
        const currImg = images[index - 1];
        const hRatio = canvas.width / currImg.width;
        const vRatio = canvas.height / currImg.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - currImg.width * ratio) / 2;
        const centerShift_y = (canvas.height - currImg.height * ratio) / 2;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(currImg, 0, 0, currImg.width, currImg.height,
          centerShift_x, centerShift_y, currImg.width * ratio, currImg.height * ratio);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Attempt to attach to iframe right away if it's already loaded
    if (frameRef.current?.contentWindow) {
      frameRef.current.contentWindow.addEventListener('scroll', handleScroll, { passive: true });
    }

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameRef.current?.contentWindow) {
        frameRef.current.contentWindow.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [images, loaded]);

  useEffect(() => {
    applyPageCustomization(frameRef.current, customization);
    postPageCustomization(frameRef.current, customization);
    applyBackgroundPresentation(frameRef.current, backgroundCanvasSelector, backgroundVisualSelector);
    if (frameRef.current) applyScene?.(frameRef.current);
  }, [applyScene, backgroundCanvasSelector, backgroundVisualSelector, customization]);

  return (
    <>
      {loaded < 100 && (
        <div 
          className="loader" 
          style={{ 
            position: "fixed", 
            top: "50%", 
            left: "50%", 
            transform: "translate(-50%, -50%)", 
            zIndex: 1000, 
            color: "white", 
            fontFamily: "monospace", 
            fontSize: "2rem",
            mixBlendMode: "difference" 
          }}
        >
          Loading {loaded}%
        </div>
      )}
      
      <div className="scroll-container" style={{ position: "relative", width: "100%", height: "100vh" }}>
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "hidden" }}>
          
          <div
            className={`threeui-background landing-page-frame${className ? ` ${className}` : ""}`}
            data-state={ready ? "ready" : "loading"}
            style={{ 
              position: "absolute", 
              inset: 0,
              overflow: "hidden", 
              background: "transparent", 
              pointerEvents: "auto", 
              ...style 
            }}
          >
            <div className="canvas-container">
              <canvas
                ref={canvasRef}
                id="hero-lightpass"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  zIndex: 0,
                  pointerEvents: "none",
                }}
              />
            </div>

            <iframe
              ref={frameRef}
              title={title}
              {...(srcDoc ? { srcDoc, sandbox: SRCDOC_FRAME_SANDBOX } : { src: sourceUrl })}
              loading="eager"
              onLoad={(event) => {
                applyPageCustomization(event.currentTarget, customization);
                postPageCustomization(event.currentTarget, customization);
                applyBackgroundPresentation(event.currentTarget, backgroundCanvasSelector, backgroundVisualSelector);
                applyScene?.(event.currentTarget);
                
                // Inject styles to remove any static background from the iframe
                const doc = event.currentTarget.contentDocument;
                if (doc) {
                  const style = doc.createElement('style');
                  style.textContent = `
                    html, body, .page, #root, main {
                      background: transparent !important;
                    }
                    #gl, #grain, #vignette, .fg, #fg-sky {
                      opacity: 0 !important;
                      display: none !important;
                      pointer-events: none !important;
                    }
                    .no-webgl body {
                      background: transparent !important;
                    }
                  `;
                  doc.head.appendChild(style);
                }

                // Attach scroll listener to iframe when it loads
                if (event.currentTarget.contentWindow) {
                  event.currentTarget.contentWindow.addEventListener('scroll', () => {
                    window.dispatchEvent(new Event('scroll'));
                  }, { passive: true });
                }
                
                setReady(true);
              }}
              style={{
                position: "absolute",
                inset: 0,
                display: "block",
                width: "100%",
                height: "100%",
                border: 0,
                background: "transparent", 
                zIndex: 1, 
                opacity: backgroundCanvasSelector && !ready ? 0 : 1,
                pointerEvents: backgroundCanvasSelector && !ready ? "none" : "auto",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
