import { j as jsxDevRuntimeExports, r as reactExports, c as client, R as React } from "./index-C0KKN3Gf.js";
function ScoreBox(props) {
  const score = props.score || 0;
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    "div",
    {
      className: "sharp-edge-box w-20 h-10 [--img:linear-gradient(#222,#111)] font-[DS-Digital] text-3xl\n      flex items-center justify-center\n      [--top-left:10px] [--bottom-right:10px]\n      [--border-width:2px] border-[2px]\n      [--border-color:#f00] border-[#f00]",
      children: score.toString().padStart(3, "0")
    },
    void 0,
    false,
    {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/components/ScoreBox.tsx",
      lineNumber: 4,
      columnNumber: 5
    },
    this
  );
}
function CategoryDisplay(props) {
  const content = props.content;
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    "div",
    {
      className: "sharp-edge-box bg-black w-auto h-111/1280 [--bottom-left:20px] [--top-right:20px]\n    [--img:linear-gradient(#222,#111)] font-[DS-Digital]\n    text-4xl flex items-center justify-center\n    [--border-width:2px] border-[2px]\n    [--border-color:#f00] border-[#f00]",
      children: content
    },
    void 0,
    false,
    {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/components/Sidebar.tsx",
      lineNumber: 4,
      columnNumber: 5
    },
    this
  );
}
function Sidebar(props) {
  const colleges = props.colleges || [
    "./images/AB.png",
    "./images/ACC.png",
    "./images/ARKI.png"
  ];
  const difficulty = props.difficulty || "Easy";
  const category = props.category || "Individual";
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(jsxDevRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
      "div",
      {
        className: "sharp-edge-box text-white text-4xl font-[Starter] font-bold\n      flex items-center justify-center\n      w-auto h-240/1280 [--all:20px] grid-pattern",
        children: "Pautakan 2025"
      },
      void 0,
      false,
      {
        fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/components/Sidebar.tsx",
        lineNumber: 26,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "sharp-edge-box w-auto h-460/1280 [--all:20px] grid-pattern justify-evenly", children: colleges.map((x) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "object-scale-down", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("img", { className: "object-cover", src: x }, void 0, false, {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/components/Sidebar.tsx",
      lineNumber: 36,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/components/Sidebar.tsx",
      lineNumber: 35,
      columnNumber: 11
    }, this)) }, void 0, false, {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/components/Sidebar.tsx",
      lineNumber: 33,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CategoryDisplay, { content: category }, void 0, false, {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/components/Sidebar.tsx",
      lineNumber: 40,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CategoryDisplay, { content: difficulty }, void 0, false, {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/components/Sidebar.tsx",
      lineNumber: 41,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/components/Sidebar.tsx",
    lineNumber: 25,
    columnNumber: 5
  }, this);
}
function MainView() {
  const [colleges, setColleges] = reactExports.useState([]);
  reactExports.useEffect(() => {
    const getColleges = async () => {
      console.log("Attempting to get colleges...");
      setColleges(await window.ipcRenderer.invoke("getColleges"));
      console.log(colleges);
    };
    getColleges();
  }, [colleges]);
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
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ScoreBox, {}, void 0, false, {
                  fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
                  lineNumber: 45,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-4xl", children: college.shorthand }, void 0, false, {
                  fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
                  lineNumber: 46,
                  columnNumber: 17
                }, this)
              ] }, void 0, true, {
                fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
                lineNumber: 44,
                columnNumber: 15
              }, this))
            },
            void 0,
            false,
            {
              fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
              lineNumber: 36,
              columnNumber: 11
            },
            this
          ),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            "div",
            {
              className: "sharp-edge-box w-full\r\n            flex flex-col\r\n            [--all:10px]\r\n            [--border-width:2px] border-[2px]\r\n            [--border-color:#f00] border-[#f00]"
            },
            void 0,
            false,
            {
              fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
              lineNumber: 51,
              columnNumber: 11
            },
            this
          )
        ]
      },
      void 0,
      true,
      {
        fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
        lineNumber: 30,
        columnNumber: 9
      },
      this
    ),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col w-3/20 space-y-[5%]", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Sidebar, {}, void 0, false, {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
      lineNumber: 60,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
      lineNumber: 59,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
    lineNumber: 28,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
    lineNumber: 26,
    columnNumber: 5
  }, this);
}
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(React.StrictMode, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(MainView, {}, void 0, false, {
    fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/main.tsx",
    lineNumber: 8,
    columnNumber: 5
  }, void 0) }, void 0, false, {
    fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/main.tsx",
    lineNumber: 7,
    columnNumber: 3
  }, void 0)
);
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
//# sourceMappingURL=index.js.map
