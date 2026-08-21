"use client";

import { useState } from "react";
import { chatToBookCopy, firstReplyCopy } from "@/lib/copy-draft";

export function CopyDraft({
  name,
  pageUrl,
}: {
  name: string;
  pageUrl: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const items = [
    { id: "hold", label: "When they ask if you are free", text: firstReplyCopy({ name, pageUrl }) },
    { id: "page", label: "When you send the page first", text: chatToBookCopy({ name, pageUrl }) },
  ];

  return (
    <div className="mx-auto mt-8 max-w-md rounded-2xl border border-line bg-void-2 p-4 text-start lg:mx-0">
      <p className="text-[10px] uppercase tracking-[0.28em] text-signal">
        write the reply
      </p>
      <p className="mt-2 text-sm text-dim">
        Paste into WhatsApp. Do not send until it sounds like you.
      </p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <p className="text-sm font-medium text-paper">{item.label}</p>
            <p className="mt-1 whitespace-pre-wrap rounded-xl border border-line bg-void px-3 py-3 text-sm leading-relaxed text-dim">
              {item.text}
            </p>
            <button
              type="button"
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-line px-4 text-sm sm:w-auto"
              onClick={async () => {
                await navigator.clipboard.writeText(item.text);
                setCopied(item.id);
              }}
            >
              {copied === item.id ? "Copied" : "Copy"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
