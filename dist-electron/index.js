import { r as reactExports, j as jsxDevRuntimeExports, c as client, R as React } from "./index-C0KKN3Gf.js";
const logoPaths = [
  "src/assets/AB.png",
  "src/assets/ACC.png",
  "src/assets/ARKI.png",
  "src/assets/CICS.png",
  "src/assets/COMM.png",
  "src/assets/COS.png",
  "src/assets/CRS.png",
  "src/assets/CTHM.png",
  "src/assets/EDUC.png",
  "src/assets/ENGG.png",
  "src/assets/IPEA.png",
  "src/assets/LAW.png",
  "src/assets/MED.png",
  "src/assets/PHARMA.png",
  "src/assets/MUSIC.png",
  "src/assets/NUR.png"
];
const RadarAnimation = () => {
  reactExports.useEffect(() => {
    const rotatingContainer = document.getElementById("rotatingContainer");
    const radialGridContainer = document.getElementById("radialGridContainer");
    const logosContainer = document.getElementById("logosContainer");
    const centerBorderContainer = document.getElementById(
      "centerBorderContainer"
    );
    if (!rotatingContainer || !radialGridContainer || !logosContainer || !centerBorderContainer)
      return;
    const numSegments = 220;
    const radius = 350;
    const bootupDuration = 0.5;
    const logoSize = 91;
    const logoHalfSize = logoSize / 2;
    const logosPauseDelay = 2;
    const logosStartTime = 3.5 + logosPauseDelay;
    for (let i = 0; i < 16; i++) {
      const radialLine = document.createElement("div");
      radialLine.className = "radial-line";
      const angle = i * (360 / 16) - 90;
      radialLine.style.transform = `rotate(${angle}deg)`;
      radialLine.style.animationDelay = `${2.5 + i * 0.04}s`;
      radialGridContainer.appendChild(radialLine);
      const logoContainer = document.createElement("div");
      logoContainer.className = "logo-container";
      const logoImage = document.createElement("img");
      logoImage.src = logoPaths[i];
      logoImage.alt = `Logo ${i + 1}`;
      logoContainer.appendChild(logoImage);
      const angleRad = angle * Math.PI / 180;
      const logoX = 400 + radius * Math.cos(angleRad) - logoHalfSize;
      const logoY = 400 + radius * Math.sin(angleRad) - logoHalfSize;
      logoContainer.style.left = `${logoX}px`;
      logoContainer.style.top = `${logoY}px`;
      logoContainer.style.animation = `fadeIn 0.8s forwards ${logosStartTime + i * 0.2}s`;
      logosContainer.appendChild(logoContainer);
    }
    for (let i = 0; i < numSegments; i++) {
      const segment = document.createElement("div");
      segment.className = "line-segment";
      const angle = i * (360 / numSegments) - 90;
      segment.style.transform = `rotate(${angle}deg) translateX(${radius}px) rotate(90deg)`;
      segment.style.animation = `fadeIn 0.3s forwards ${3 + i / numSegments * bootupDuration}s`;
      rotatingContainer.appendChild(segment);
    }
    rotatingContainer.style.animation = "rotate 30s linear infinite";
  }, []);
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "radar-container", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "radar-base", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { id: "radialGridContainer", className: "radial-grid-container" }, void 0, false, {
        fileName: "/home/qwikwire205/pautakan-2025/src/RadarView/radarView.tsx",
        lineNumber: 91,
        columnNumber: 9
      }, void 0),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { id: "logosContainer", className: "logos-container" }, void 0, false, {
        fileName: "/home/qwikwire205/pautakan-2025/src/RadarView/radarView.tsx",
        lineNumber: 92,
        columnNumber: 9
      }, void 0),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "center-image-wrapper", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          "img",
          {
            src: "src/assets/CENTER VAULT.png",
            alt: "Center Vault",
            className: "center-image"
          },
          void 0,
          false,
          {
            fileName: "/home/qwikwire205/pautakan-2025/src/RadarView/radarView.tsx",
            lineNumber: 94,
            columnNumber: 11
          },
          void 0
        ),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          "div",
          {
            id: "centerBorderContainer",
            className: "center-border-container"
          },
          void 0,
          false,
          {
            fileName: "/home/qwikwire205/pautakan-2025/src/RadarView/radarView.tsx",
            lineNumber: 99,
            columnNumber: 11
          },
          void 0
        )
      ] }, void 0, true, {
        fileName: "/home/qwikwire205/pautakan-2025/src/RadarView/radarView.tsx",
        lineNumber: 93,
        columnNumber: 9
      }, void 0),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { id: "rotatingContainer", className: "rotating-container" }, void 0, false, {
        fileName: "/home/qwikwire205/pautakan-2025/src/RadarView/radarView.tsx",
        lineNumber: 104,
        columnNumber: 9
      }, void 0)
    ] }, void 0, true, {
      fileName: "/home/qwikwire205/pautakan-2025/src/RadarView/radarView.tsx",
      lineNumber: 90,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "clock-face" }, void 0, false, {
      fileName: "/home/qwikwire205/pautakan-2025/src/RadarView/radarView.tsx",
      lineNumber: 106,
      columnNumber: 7
    }, void 0)
  ] }, void 0, true, {
    fileName: "/home/qwikwire205/pautakan-2025/src/RadarView/radarView.tsx",
    lineNumber: 89,
    columnNumber: 5
  }, void 0);
};
function MainView() {
  const [colleges, setColleges] = reactExports.useState([]);
  const [update, setUpdate] = reactExports.useState(0);
  const [difficulty, setDifficulty] = reactExports.useState("Easy");
  const [category, setCategory] = reactExports.useState("Eliminations");
  window.ipcRenderer.on("db-updated", () => {
    setUpdate(update + 1);
  });
  window.ipcRenderer.on("category-changed", (_, category2) => {
    setCategory(category2);
  });
  window.ipcRenderer.on("difficulty-changed", (_, difficulty2) => {
    setDifficulty(difficulty2);
  });
  reactExports.useEffect(() => {
    const getColleges = async () => {
      setColleges(await window.ipcRenderer.invoke("get-colleges"));
    };
    console.log("Getting colleges...");
    getColleges();
  }, [update]);
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(jsxDevRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-gray-300 flex flex-row h-screen w-screen p-4 space-x-[1%]", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
      "div",
      {
        className: "sharp-edge-box flex flex-row w-full p-5 space-x-4\r\n          [--border-width:2px] border-[2px]\r\n          [--all:20px]",
        children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            "div",
            {
              className: "sharp-edge-box p-5\r\n            flex flex-col justify-evenly\r\n            [--all:10px]\r\n            [--border-width:2px] border-[2px]\r\n            [--border-color:#f00] border-[#f00]",
              children: colleges.map((college) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-row space-x-4", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                  "div",
                  {
                    className: "sharp-edge-box w-20 h-10 [--img:linear-gradient(#222,#111)] font-[DS-Digital] text-3xl\r\n                  flex items-center justify-center\r\n                  [--top-left:10px] [--bottom-right:10px]\r\n                  [--border-width:2px] border-[2px]\r\n                  [--border-color:#f00] border-[#f00]",
                    children: college.score.toString().padStart(3, "0")
                  },
                  void 0,
                  false,
                  {
                    fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
                    lineNumber: 51,
                    columnNumber: 17
                  },
                  this
                ),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-4xl font-[Starter]", children: college.shorthand }, void 0, false, {
                  fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
                  lineNumber: 60,
                  columnNumber: 17
                }, this)
              ] }, void 0, true, {
                fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
                lineNumber: 50,
                columnNumber: 15
              }, this))
            },
            void 0,
            false,
            {
              fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
              lineNumber: 42,
              columnNumber: 11
            },
            this
          ),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            "div",
            {
              className: "sharp-edge-box w-full\r\n            flex flex-col\r\n            [--all:10px]\r\n            [--border-width:2px] border-[2px]\r\n            [--border-color:#f00] border-[#f00]",
              children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(RadarAnimation, {}, void 0, false, {
                fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
                lineNumber: 74,
                columnNumber: 13
              }, this)
            },
            void 0,
            false,
            {
              fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
              lineNumber: 67,
              columnNumber: 11
            },
            this
          )
        ]
      },
      void 0,
      true,
      {
        fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
        lineNumber: 36,
        columnNumber: 9
      },
      this
    ),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col w-3/20 space-y-[5%]", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
      Sidebar,
      {
        difficulty,
        category,
        colleges
      },
      void 0,
      false,
      {
        fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
        lineNumber: 78,
        columnNumber: 11
      },
      this
    ) }, void 0, false, {
      fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
      lineNumber: 77,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
    lineNumber: 34,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
    lineNumber: 32,
    columnNumber: 5
  }, this);
}
function CategoryDisplay({ content }) {
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    "div",
    {
      className: "sharp-edge-box bg-black w-auto h-111/1280 [--bottom-left:20px] [--top-right:20px]\r\n    [--img:linear-gradient(#222,#111)] font-[DS-Digital]\r\n    text-4xl flex items-center justify-center\r\n    [--border-width:2px] border-[2px]\r\n    [--border-color:#f00] border-[#f00]",
      children: content
    },
    void 0,
    false,
    {
      fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
      lineNumber: 91,
      columnNumber: 5
    },
    this
  );
}
function Sidebar({
  colleges,
  difficulty,
  category
}) {
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(jsxDevRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
      "div",
      {
        className: "sharp-edge-box text-white text-4xl font-[Starter] font-bold\r\n      flex items-center justify-center\r\n      w-auto h-240/1280 [--all:20px] grid-pattern",
        children: "Pautakan 2025"
      },
      void 0,
      false,
      {
        fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
        lineNumber: 114,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "sharp-edge-box w-auto h-460/1280 [--all:20px] grid-pattern justify-evenly", children: colleges.map((x) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "object-scale-down", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("img", { className: "object-cover", src: x.imagePath }, void 0, false, {
      fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
      lineNumber: 124,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
      lineNumber: 123,
      columnNumber: 11
    }, this)) }, void 0, false, {
      fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
      lineNumber: 121,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CategoryDisplay, { content: category }, void 0, false, {
      fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
      lineNumber: 128,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CategoryDisplay, { content: difficulty }, void 0, false, {
      fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
      lineNumber: 129,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/home/qwikwire205/pautakan-2025/src/MainView.tsx",
    lineNumber: 113,
    columnNumber: 5
  }, this);
}
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(React.StrictMode, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(MainView, {}, void 0, false, {
    fileName: "/home/qwikwire205/pautakan-2025/src/main.tsx",
    lineNumber: 8,
    columnNumber: 5
  }, void 0) }, void 0, false, {
    fileName: "/home/qwikwire205/pautakan-2025/src/main.tsx",
    lineNumber: 7,
    columnNumber: 3
  }, void 0)
);
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
//# sourceMappingURL=index.js.map
