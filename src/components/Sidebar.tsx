function Difficulty() {
  return (
    <div className='sharp-edge-box bg-black w-auto h-111/1280 [--bottom-left:20px] [--top-right:20px]'></div>
  );
}

export default function Sidebar() {
  return (
    <>
      <div
        className='sharp-edge-box text-white text-4xl
      flex items-center justify-center
      w-auto h-240/1280 [--all:20px] grid-pattern'
      >
        Pautakan 2025
      </div>
      <div className='sharp-edge-box w-auto h-460/1280 [--all:20px] grid-pattern'></div>
      <div className='sharp-edge-box bg-black w-auto h-111/1280 [--bottom-left:20px] [--top-right:20px]'></div>
      <Difficulty />
      <Difficulty />
      <Difficulty />
    </>
  );
}
