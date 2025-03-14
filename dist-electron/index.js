import { r as reactExports, j as jsxDevRuntimeExports, c as client, R as React } from "./index-C0KKN3Gf.js";
function MainView() {
  const [colleges, setColleges] = reactExports.useState([]);
  const [difficulty, setDifficulty] = reactExports.useState("Easy");
  const [category, setCategory] = reactExports.useState("Eliminations");
  const getColleges = async () => {
    return await window.ipcRenderer.invoke("get-colleges");
  };
  reactExports.useEffect(() => {
    window.ipcRenderer.removeAllListeners("db-updated");
    window.ipcRenderer.removeAllListeners("category-changed");
    window.ipcRenderer.removeAllListeners("difficulty-changed");
    window.ipcRenderer.once("db-updated", () => {
      getColleges().then((colleges2) => {
        setColleges(colleges2);
      });
    });
    window.ipcRenderer.once("category-changed", (_, category2) => {
      setCategory(category2);
    });
    window.ipcRenderer.once("difficulty-changed", (_, difficulty2) => {
      setDifficulty(difficulty2);
    });
  }, [colleges, category, difficulty]);
  reactExports.useEffect(() => {
    getColleges().then((colleges2) => setColleges(colleges2));
  }, []);
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(jsxDevRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "overflow-hidden bg-gray-300 flex flex-row h-screen w-screen p-4 space-x-[1%]", children: [
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
                    fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
                    lineNumber: 56,
                    columnNumber: 17
                  },
                  this
                ),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-4xl font-[Starter]", children: college.shorthand }, void 0, false, {
                  fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
                  lineNumber: 65,
                  columnNumber: 17
                }, this)
              ] }, void 0, true, {
                fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
                lineNumber: 55,
                columnNumber: 15
              }, this))
            },
            void 0,
            false,
            {
              fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
              lineNumber: 47,
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
              lineNumber: 72,
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
        lineNumber: 41,
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
        fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
        lineNumber: 81,
        columnNumber: 11
      },
      this
    ) }, void 0, false, {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
      lineNumber: 80,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
    lineNumber: 39,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
    lineNumber: 37,
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
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
      lineNumber: 94,
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
        children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("img", { src: "./public/main logo.png" }, void 0, false, {
          fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
          lineNumber: 122,
          columnNumber: 9
        }, this)
      },
      void 0,
      false,
      {
        fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
        lineNumber: 117,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "sharp-edge-box h-460/1280 p-[10%] [--all:20px] grid-pattern grid grid-cols-4 gap-x-2 gap-y-0 items-center", children: colleges.map((x) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("img", { className: "object-cover scale-200", src: x.imagePath }, void 0, false, {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
      lineNumber: 126,
      columnNumber: 11
    }, this)) }, void 0, false, {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
      lineNumber: 124,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CategoryDisplay, { content: category }, void 0, false, {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
      lineNumber: 129,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CategoryDisplay, { content: difficulty }, void 0, false, {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
      lineNumber: 130,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/MainView.tsx",
    lineNumber: 116,
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
