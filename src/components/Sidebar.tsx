function CategoryDisplay(props: any) {
  const content: string = props.content;
  return (
    <div
      className='sharp-edge-box bg-black w-auto h-111/1280 [--bottom-left:20px] [--top-right:20px]
    [--img:linear-gradient(#222,#111)] font-[DS-Digital]
    text-4xl flex items-center justify-center
    [--border-width:2px] border-[2px]
    [--border-color:#f00] border-[#f00]'
    >
      {content}
    </div>
  );
}

export default function Sidebar(props: any) {
  const colleges: string[] = props.colleges || [
    './images/AB.png',
    './images/ACC.png',
    './images/ARKI.png',
  ];
  const difficulty: string = props.difficulty || 'Easy';
  const category: string = props.category || 'Individual';
  return (
    <>
      <div
        className='sharp-edge-box text-white text-4xl font-[Starter] font-bold
      flex items-center justify-center
      w-auto h-240/1280 [--all:20px] grid-pattern'
      >
        Pautakan 2025
      </div>
      <div className='sharp-edge-box w-auto h-460/1280 [--all:20px] grid-pattern'>
        {colleges.map((x) => (
          <img src={x} />
        ))}
      </div>
      <CategoryDisplay content={category} />
      <CategoryDisplay content={difficulty} />
    </>
  );
}
