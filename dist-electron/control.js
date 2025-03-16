import { r as reactExports, j as jsxRuntimeExports, c as client, R as React } from "./index-Bgro7GNA.js";
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
  reactExports.useEffect(() => {
    const changeCategory = async () => {
      await window.ipcRenderer.invoke("change-category", category);
    };
    changeCategory();
  }, [category]);
  reactExports.useEffect(() => {
    const changeDifficulty = async () => {
      await window.ipcRenderer.invoke("change-difficulty", difficulty);
    };
    changeDifficulty();
  }, [difficulty]);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-screen h-screen justify-center items-center flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-1/10 w-4/5 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row bg-gray-300 w-full justify-evenly", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Dropdown,
          {
            options: ["Eliminations", "Finals"],
            onChange: (selected) => {
              setCategory(selected);
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Dropdown,
          {
            options: [
              "Easy",
              "Average",
              "Difficult",
              "Clincher",
              "Sudden Death"
            ],
            onChange: (selected) => {
              setDifficulty(selected);
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { children: "Reset Scores" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { children: "Refresh" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-300 h-1/4 sharp-edge-box [--bottom-left:2.5px] [--bottom-right:2.5px]" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4/5 w-3/5 mx-[20%]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full h-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Rank" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "College" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Score" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: colleges.map((college, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: index + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: college.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row space-x-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: college.score }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ScoreButton,
            {
              college,
              add: false,
              difficulty,
              updateScore
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ScoreButton,
            {
              college,
              add: true,
              difficulty,
              updateScore
            }
          )
        ] }) })
      ] })) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1/10 bg-gray-300 flex flex-row p-4 space-x-[1%]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { children: "Show Leaderboard" }) })
  ] });
}
function ScoreButton({
  college,
  add,
  difficulty,
  updateScore
}) {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: styles, onClick: changeScore, children: add ? "+" : "-" });
}
function Dropdown({
  options,
  onChange
}) {
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const [selected, setSelected] = reactExports.useState(options[0]);
  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    if (onChange) onChange(option);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-64", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setIsOpen(!isOpen),
        className: "w-full p-2 bg-white border rounded flex justify-between items-center",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: selected })
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-visible absolute z-50 w-full mt-1 bg-white border rounded shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: options.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "li",
      {
        className: "p-2 hover:bg-gray-100 cursor-pointer",
        onClick: () => handleSelect(option),
        children: option
      },
      option
    )) }) })
  ] });
}
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ControlView, {}) })
);
//# sourceMappingURL=control.js.map
