import { r as reactExports, j as jsxDevRuntimeExports, c as client, R as React } from "./index-C0KKN3Gf.js";
function ControlView() {
  const [colleges, setColleges] = reactExports.useState([]);
  const [difficulty, setDifficulty] = reactExports.useState("Easy");
  const [category, setCategory] = reactExports.useState("Eliminations");
  reactExports.useEffect(() => {
    const getColleges = async () => {
      setColleges(await window.ipcRenderer.invoke("get-colleges"));
    };
    console.log("Getting colleges...");
    getColleges();
  }, []);
  async function updateScore(college, offset) {
    const collegeUpdated = { ...college, score: college.score + offset };
    setColleges(
      colleges.map(
        (x) => x.name === collegeUpdated.name ? collegeUpdated : x
      )
    );
    await window.ipcRenderer.invoke(
      "update-college-score",
      collegeUpdated.shorthand,
      collegeUpdated.score
    );
  }
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "w-screen h-screen justify-center items-center flex flex-col", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-1/10 w-4/5 bg-gray-300 flex flex-row p-4 space-x-[1%] sharp-edge-box [--bottom-right:20px] [--bottom-left:20px]", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        "select",
        {
          id: "category",
          onChange: (e) => setCategory(e.target.value),
          defaultValue: category,
          children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "Eliminations", children: "Eliminations" }, void 0, false, {
              fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
              lineNumber: 44,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "Finals", children: "Finals" }, void 0, false, {
              fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
              lineNumber: 45,
              columnNumber: 11
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
          lineNumber: 39,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        "select",
        {
          id: "difficulty",
          onChange: (e) => setDifficulty(e.target.value),
          defaultValue: difficulty,
          children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "Easy", children: "Easy" }, void 0, false, {
              fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
              lineNumber: 52,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "Average", children: "Average" }, void 0, false, {
              fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
              lineNumber: 53,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "Difficult", children: "Difficult" }, void 0, false, {
              fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
              lineNumber: 54,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "Clincher", children: "Clincher" }, void 0, false, {
              fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
              lineNumber: 55,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("option", { value: "Sudden Death", children: "Sudden Death" }, void 0, false, {
              fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
              lineNumber: 56,
              columnNumber: 11
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
          lineNumber: 47,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("button", { children: "Reset Scores" }, void 0, false, {
        fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
        lineNumber: 58,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("button", { children: "Refresh" }, void 0, false, {
        fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
        lineNumber: 59,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
      lineNumber: 38,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-4/5 w-3/5 mx-[20%]", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("table", { className: "w-full h-full", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("thead", { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("tr", { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("th", { children: "Rank" }, void 0, false, {
          fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
          lineNumber: 66,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("th", { children: "College" }, void 0, false, {
          fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
          lineNumber: 67,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("th", { children: "Score" }, void 0, false, {
          fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
          lineNumber: 68,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
        lineNumber: 65,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
        lineNumber: 64,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("tbody", { children: colleges.map((college, index) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("tr", { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("td", { children: index + 1 }, void 0, false, {
          fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
          lineNumber: 74,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("td", { children: college.name }, void 0, false, {
          fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
          lineNumber: 75,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("td", { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-row space-x-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { children: college.score }, void 0, false, {
            fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
            lineNumber: 78,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            ScoreButton,
            {
              college,
              add: false,
              difficulty,
              updateScore
            },
            void 0,
            false,
            {
              fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
              lineNumber: 79,
              columnNumber: 21
            },
            this
          ),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            ScoreButton,
            {
              college,
              add: true,
              difficulty,
              updateScore
            },
            void 0,
            false,
            {
              fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
              lineNumber: 85,
              columnNumber: 21
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
          lineNumber: 77,
          columnNumber: 19
        }, this) }, void 0, false, {
          fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
          lineNumber: 76,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
        lineNumber: 73,
        columnNumber: 15
      }, this)) }, void 0, false, {
        fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
        lineNumber: 71,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
      lineNumber: 63,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
      lineNumber: 62,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-1/10 bg-gray-300 flex flex-row p-4 space-x-[1%]", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("button", { children: "Show Leaderboard" }, void 0, false, {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
      lineNumber: 100,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
      lineNumber: 99,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
    lineNumber: 37,
    columnNumber: 5
  }, this);
}
function ScoreButton(props) {
  const college = props.college;
  const add = props.add;
  const difficulty = props.difficulty;
  const updateScore = props.updateScore;
  const changeScore = () => {
    let offset;
    switch (difficulty) {
      case "Easy":
        offset = 5;
        break;
      case "Average":
        offset = 10;
        break;
      case "Difficult":
        offset = 15;
        break;
      default:
        offset = 1;
        break;
    }
    offset *= add ? 1 : -1;
    updateScore(college, offset);
  };
  const styles = `p-2 ${add ? "bg-green-500 hover:bg-green-700" : "bg-red-500 hover:bg-red-700"}`;
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("button", { className: styles, onClick: changeScore, children: add ? "+" : "-" }, void 0, false, {
    fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/ControlView.tsx",
    lineNumber: 142,
    columnNumber: 5
  }, this);
}
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(React.StrictMode, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ControlView, {}, void 0, false, {
    fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/control.tsx",
    lineNumber: 8,
    columnNumber: 5
  }, void 0) }, void 0, false, {
    fileName: "/Users/amielchristianmala-ay/Projects/pautakan-2025/src/control.tsx",
    lineNumber: 7,
    columnNumber: 3
  }, void 0)
);
//# sourceMappingURL=control.js.map
