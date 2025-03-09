import { j as jsxRuntimeExports, c as client, R as React } from "./index-DcKrYOvl.js";
function ScoreBox(props) {
  const score = props.score || 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "sharp-edge-box w-20 h-10 [--img:linear-gradient(#222,#111)] font-[DS-Digital] text-3xl\n      flex items-center justify-center\n      [--top-left:10px] [--bottom-right:10px]\n      [--border-width:2px] border-[2px]\n      [--border-color:#f00] border-[#f00]",
      children: score.toString().padStart(3, "0")
    }
  );
}
function CategoryDisplay(props) {
  const content = props.content;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "sharp-edge-box bg-black w-auto h-111/1280 [--bottom-left:20px] [--top-right:20px]\n    [--img:linear-gradient(#222,#111)] font-[DS-Digital]\n    text-4xl flex items-center justify-center\n    [--border-width:2px] border-[2px]\n    [--border-color:#f00] border-[#f00]",
      children: content
    }
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "sharp-edge-box text-white text-4xl font-[Starter] font-bold\n      flex items-center justify-center\n      w-auto h-240/1280 [--all:20px] grid-pattern",
        children: "Pautakan 2025"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sharp-edge-box w-auto h-460/1280 [--all:20px] grid-pattern", children: colleges.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: x })) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryDisplay, { content: category }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryDisplay, { content: difficulty })
  ] });
}
async function getColleges() {
  console.log("Attempting to get colleges...");
  return await window.ipcRenderer.invoke("getColleges");
}
function MainView() {
  getColleges().then((colleges) => {
    console.log(colleges);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-300 flex flex-row h-screen w-screen p-4 space-x-[1%]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "sharp-edge-box flex flex-row w-full p-5 space-x-4\r\n          [--border-width:2px] border-[2px]\r\n          [--all:20px]",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "sharp-edge-box p-5\r\n            flex flex-col\r\n            [--all:10px]\r\n            [--border-width:2px] border-[2px]\r\n            [--border-color:#f00] border-[#f00]",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row space-x-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreBox, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "COS" })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "sharp-edge-box w-full\r\n            flex flex-col\r\n            [--all:10px]\r\n            [--border-width:2px] border-[2px]\r\n            [--border-color:#f00] border-[#f00]"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col w-3/20 space-y-[5%]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}) })
  ] }) });
}
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MainView, {}) })
);
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
//# sourceMappingURL=index.js.map
