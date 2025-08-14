
import * as React from "react";

export function logReactIdentity(tag: string) {
  if (typeof window !== "undefined") {
    // фиксируем версию и сам объект React (для идентичности)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w: any = window;
    w.__reactVersions = w.__reactVersions || new Set<string>();
    w.__reactObjects = w.__reactObjects || new Set<any>();
    w.__reactVersions.add(React.version);
    w.__reactObjects.add(React);
    // выведем размеры сетов: если >1 — проблема
    console.log(`[diag:${tag}] React version:`, React.version, 
                "versionsCount:", w.__reactVersions.size, 
                "objectsCount:", w.__reactObjects.size);
    // на всякий случай выставим window.React, если какая-то либа ищет глобал
    w.React = React;
  }
}
