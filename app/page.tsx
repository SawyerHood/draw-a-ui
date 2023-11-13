"use client";

import dynamic from "next/dynamic";
import "@tldraw/tldraw/tldraw.css";
import { useEditor } from "@tldraw/tldraw";
import { getSvgAsImage } from "@/lib/getSvgAsImage";
import { blobToBase64 } from "@/lib/blobToBase64";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { PreviewModal } from "@/components/PreviewModal";

const Tldraw = dynamic(async () => (await import("@tldraw/tldraw")).Tldraw, {
  ssr: false,
});

export default function Home() {
  const [html, setHtml] = useState<null | string>(null);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHtml(null);
      }
    };
    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  });

  return (
    <>
      <div className={`w-screen h-screen`}>
        <Tldraw persistenceKey="tldraw">
          <ExportButton setHtml={setHtml} />
        </Tldraw>
      </div>
      {html &&
        ReactDOM.createPortal(
          <div
            className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center"
            style={{ zIndex: 2000, backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setHtml(null)}
          >
            <PreviewModal html={html} setHtml={setHtml} />
          </div>,
          document.body
        )}
    </>
  );
}

function ExportButton({ setHtml }: { setHtml: (html: string) => void }) {
  const editor = useEditor();
  const [loading, setLoading] = useState(false);
  const [freshHtml, setFreshHtml] = useState(false);
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  // A tailwind styled button that is pinned to the bottom right of the screen
  return (<>
    <textarea
      placeholder="Write any additional instruction to your UI developer assistant. More instructions makes the task more clear..."
      className="fixed bottom-8 right-4 bg-white-500 hover:bg-grey-700 text-black font-bold p-4 w-96 h-1/4 border-dotted border-2 border-blue-500 rounded"
      style={{ zIndex: 1000 }}
      value={additionalInstructions}
      onChange={(e) => setAdditionalInstructions(e.target.value)}
    />

    <div className="fixed bottom-4 right-4 bg-slate-200 text-black font-bold py-0 px-4 rounded-lg shadow-inner"
      style={{ zIndex: 1000, width: '24rem', padding: '5px', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)' }}>
      <div className="flex flex-col items-start space-y-1">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="freshHtmlCheckbox"
            className="custom-checkbox"
            checked={freshHtml}
            onChange={(e) => {
              setFreshHtml(e.target.checked ? true : false);
            }}
          />
          <label htmlFor="freshHtmlCheckbox" className="ml-2 text-xs">Recreate Html</label>
        </div>
        <span className="text-xs text-gray-600">
          Clear the current version and get a fresh Html
        </span>
      </div>
    </div>

    <button
      onClick={async (e) => {
        setLoading(true);
        try {
          e.preventDefault();
          const svg = await editor.getSvg(
            Array.from(editor.currentPageShapeIds)
          );
          if (!svg) {
            return;
          }
          const png = await getSvgAsImage(svg, {
            type: "png",
            quality: 1,
            scale: 1,
          });
          const dataUrl = await blobToBase64(png!);
          const resp = await fetch("/api/toHtml", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: dataUrl,
              currentHtml: freshHtml ? '' : window.localStorage.getItem("currentHtml"),
              additionalInstructions
            }),
          });

          const json = await resp.json();

          if (json.error) {
            alert("Error from open ai: " + JSON.stringify(json.error));
            return;
          }

          setAdditionalInstructions("");
          setFreshHtml(false);
          const message = json.choices[0].message.content;
          const start = message.indexOf("<!DOCTYPE html>");
          const end = message.indexOf("</html>");
          const html = message.slice(start, end + "</html>".length);
          setHtml(html);
        } finally {
          setLoading(false);
        }
      }}
      className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ="
      style={{ zIndex: 1000 }}
    >
      {loading ? (
        <div className="flex justify-center items-center ">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        </div>
      ) : (
        "Make Real"
      )}
    </button>
  </>
  );
}
