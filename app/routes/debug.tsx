export default function Layout() {
  return (
    <div className="flex flex-col h-full bg-green-100">
      <div className="bg-gray-200 p-4">Project name</div>
      <div className="flex-grow bg-gray-300 p-4 overflow-hidden">
        <div className="flex gap-8 h-full items-start">
          <Board name="one" small />
          <Board name="two" />
          <Board name="three" />
        </div>
      </div>
    </div>
  );
}

function Board({ name, small }: { name: string; small?: boolean }) {
  return (
    <div className="flex w-60 flex-shrink-0 flex-col max-h-full bg-green-100">
      <div className="bg-red-200 p-4">{name}</div>

      <div className="flex-grow bg-red-300 p-4 overflow-auto">
        Content area...
        {!small && (
          <>
            <div style={{ height: 2000 }} />
            More content
          </>
        )}
      </div>
    </div>
  );
}
