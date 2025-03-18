import "./App.css";
import { useEffect, useState } from "react";
import RadarAnimation from "./RadarView/radarView";
import { College } from "./types";

function MainView() {
  const [colleges, setColleges] = useState([]);
  const [update, setUpdate] = useState(0);
  const [difficulty, setDifficulty] = useState<string>("Easy");
  const [category, setCategory] = useState<string>("Eliminations");

  // IPC listeners
  window.ipcRenderer.on("db-updated", () => {
    setUpdate(update + 1);
  });
  window.ipcRenderer.on("category-changed", (_, category) => {
    setCategory(category);
  });
  window.ipcRenderer.on("difficulty-changed", (_, difficulty) => {
    setDifficulty(difficulty);
  });

  useEffect(() => {
    const getColleges = async () => {
      setColleges(await window.ipcRenderer.invoke("get-colleges"));
    };
    console.log("Getting colleges...");
    getColleges();
  }, [update]);

  return (
    <>
      {/* Body - flex row */}
      <div className="bg-gray-300 flex flex-row h-screen w-screen p-4 space-x-[1%]">
        {/* Main */}
        <div
          className="sharp-edge-box flex flex-row w-full p-5 space-x-4
          [--border-width:2px] border-[2px]
          [--all:20px]"
        >
          {/* Scores */}
          <div
            className="sharp-edge-box p-5
            flex flex-col justify-evenly
            [--all:10px]
            [--border-width:2px] border-[2px]
            [--border-color:#f00] border-[#f00]"
          >
            {colleges.map((college: College) => (
              <div className="flex flex-row space-x-4">
                <div
                  className="sharp-edge-box w-20 h-10 [--img:linear-gradient(#222,#111)] font-[DS-Digital] text-3xl
                  flex items-center justify-center
                  [--top-left:10px] [--bottom-right:10px]
                  [--border-width:2px] border-[2px]
                  [--border-color:#f00] border-[#f00]"
                >
                  {college.score.toString().padStart(3, "0")}
                </div>
                <span className="text-4xl font-[Starter]">
                  {college.shorthand}
                </span>
              </div>
            ))}
          </div>
          {/* Main */}
          <div
            className="sharp-edge-box w-full
            flex flex-col
            [--all:10px]
            [--border-width:2px] border-[2px]
            [--border-color:#f00] border-[#f00]"
          >
            <RadarAnimation></RadarAnimation>
          </div>
        </div>
        <div className="flex flex-col w-3/20 space-y-[5%]">
          <Sidebar
            difficulty={difficulty}
            category={category}
            colleges={colleges}
          />
        </div>
      </div>
    </>
  );
}

function CategoryDisplay({ content }: { content: string }) {
  return (
    <div
      className="sharp-edge-box bg-black w-auto h-111/1280 [--bottom-left:20px] [--top-right:20px]
    [--img:linear-gradient(#222,#111)] font-[DS-Digital]
    text-4xl flex items-center justify-center
    [--border-width:2px] border-[2px]
    [--border-color:#f00] border-[#f00]"
    >
      {content}
    </div>
  );
}

function Sidebar({
  colleges,
  difficulty,
  category,
}: {
  colleges: College[];
  difficulty: string;
  category: string;
}) {
  return (
    <>
      <div
        className="sharp-edge-box text-white text-4xl font-[Starter] font-bold
      flex items-center justify-center
      w-auto h-240/1280 [--all:20px] grid-pattern"
      >
        Pautakan 2025
      </div>
      <div className="sharp-edge-box w-auto h-460/1280 [--all:20px] grid-pattern justify-evenly">
        {colleges.map((x) => (
          <div className="object-scale-down">
            <img className="object-cover" src={x.imagePath} />
          </div>
        ))}
      </div>
      <CategoryDisplay content={category} />
      <CategoryDisplay content={difficulty} />
    </>
  );
}

export default MainView;
