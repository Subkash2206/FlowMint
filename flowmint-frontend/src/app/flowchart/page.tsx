'use client';

export default function FlowchartPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Project Flowchart</h1>
        <a
          href="https://gitdiagram.com/subkash2206/flowmint"
          target="_blank"
          rel="noreferrer"
          className="text-sm underline"
        >
          Flowchart
        </a>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Interactive diagram opens in a new tab.
      </p>
      <div className="rounded-xl border border-black/10 p-4 bg-white">
        <iframe
          src="https://gitdiagram.com/subkash2206/flowmint"
          title="FlowMint Diagram"
          className="w-full h-[70vh]"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}


