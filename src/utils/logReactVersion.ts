
import * as React from "react";

export function logReactVersion(tag = "React") {
  if (typeof window !== "undefined") {
    // Track different React versions to detect conflicts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__reactVersions = (window as any).__reactVersions || new Set();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__reactVersions.add(React.version);
    console.log(tag, "versions:", Array.from((window as any).__reactVersions));
  }
}
