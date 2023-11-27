"use client";
import { use, useEffect, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-cshtml";
import "prismjs/themes/prism-tomorrow.css";

export function PreviewModal({
  html,
  setHtml,
}: {
  html: string | null;
  setHtml: (html: string | null) => void;
}) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const highlight = async () => {
      await Prism.highlightAll(); // <--- prepare Prism
    };
    highlight(); // <--- call the async function
  }, [html, activeTab]); // <--- run when post updates

  if (!html) {
    return null;
  }

  const downloadHtml = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    link.click();
  };

const copyToClipboard = () => {
  navigator.clipboard.writeText(html || '').then(() => {
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  });
};


  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className="bg-white rounded-lg shadow-xl flex flex-col"
      style={{
        width: "calc(100% - 64px)",
        height: "calc(100% - 64px)",
      }}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex space-x-1">
          <TabButton
            active={activeTab === "preview"}
            onClick={() => {
              setActiveTab("preview");
            }}
          >
            Preview
          </TabButton>
          <TabButton
            active={activeTab === "code"}
            onClick={() => {
              setActiveTab("code");
            }}
          >
            Code
          </TabButton>
		  
			<button
			  className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring"
			  onClick={downloadHtml}
			>
			  <svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				className="w-6 h-6 text-gray-600"
			  >
				<path
				  strokeLinecap="round"
				  strokeLinejoin="round"
				  strokeWidth={2}
				  d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
				/>
			  </svg>
			</button>
		  
        </div>
		
		        <button
          className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring"
          onClick={() => {
            setHtml(null);
          }}
        >
          <svg
            className="w-6 h-6 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
		
      </div>

      {activeTab === "preview" ? (
        <iframe className="w-full h-full" srcDoc={html} />
      ) : (
        <div className="overflow-auto relative">
          <pre className="p-4" style={{ userSelect: 'text' }}>
            <code className="language-markup">{html}</code>
          </pre>
			<button
			  className="absolute top-1 right-0 m-2 p-2 rounded-md bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring flex items-center"
			  onClick={copyToClipboard}
			  title="Copy to Clipboard"
			>
			  <svg
				xmlns="http://www.w3.org/2000/svg"
				fill="white"
				viewBox="0 0 24 24"
				stroke="currentColor"
				className="w-5 h-5 text-gray-300"
			  >
				<path
				  strokeLinecap="round"
				  strokeLinejoin="round"
				  strokeWidth={1}
				  d="M2 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-4H4a2 2 0 0 1-2-2V4zm8 12v4h10V10h-4v4a2 2 0 0 1-2 2h-4zm4-2V4H4v10h10z"
				/>
			  </svg>
			  {copySuccess && <span className="text-white ml-2">Copied!</span>}
			</button>
        </div>
      )}
    </div>
  );
}

interface TabButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  active: boolean;
}

function TabButton({ active, ...buttonProps }: TabButtonProps) {
  const className = active
    ? "px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-t-md focus:outline-none focus:ring"
    : "px-4 py-2 text-sm font-medium text-blue-500 bg-transparent hover:bg-blue-100 focus:bg-blue-100 rounded-t-md focus:outline-none focus:ring";
  return <button className={className} {...buttonProps}></button>;
}
