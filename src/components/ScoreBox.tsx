export default function ScoreBox(props: any) {
  const score: number = props.score || 0;
  return (
    <div
      className='sharp-edge-box w-20 h-10 [--img:linear-gradient(#222,#111)] font-[DS-Digital] text-3xl
      flex items-center justify-center
      [--top-left:10px] [--bottom-right:10px]
      [--border-width:2px] border-[2px]
      [--border-color:#f00] border-[#f00]'
    >
      {score.toString().padStart(3, '0')}
    </div>
  );
}
