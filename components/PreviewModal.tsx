"use client";

import { use, useEffect, useRef, useState } from "react";
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

  const showcopiedTooltip = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const highlight = async () => {
      await Prism.highlightAll(); // <--- prepare Prism
    };
    highlight(); // <--- call the async function
  }, [html, activeTab]); // <--- run when post updates

  if (!html) {
    return null;
  }

  const onclickShowCopied = () => {
    if (showcopiedTooltip.current) {
      showcopiedTooltip.current.style.display = 'inline';
    }
    setTimeout(() => {
      if (showcopiedTooltip.current) {
        showcopiedTooltip.current.style.display = 'none'
      }
    }, 2000)

  }

  async function copyCodeToClipboard({ html }: { html: string | null }) {
    try {
      await navigator.clipboard.writeText(html || '');
      onclickShowCopied()
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }



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
        <pre className="overflow-auto p-4 ">
          <div className="mr-5 absolute w-8 right-8 md:right-16">
            <svg onClick={() => copyCodeToClipboard({ html })} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer  lucide lucide-copy inline  mr-2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
            <br />
            <span ref={showcopiedTooltip} className={`hidden p-2  mt-4 -right-3 absolute  rounded-lg bg-green-500`}>Copied</span>
          </div>
          <br />
          <code className="language-markup">{html}</code>
        </pre>
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
