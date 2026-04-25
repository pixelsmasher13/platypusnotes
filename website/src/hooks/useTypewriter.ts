import { useEffect, useState } from "react";

export function useTypewriter(
  text: string,
  speed = 35,
  startDelay = 0,
  enabled = true
) {
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (!enabled) {
      setOutput("");
      return;
    }
    let cancelled = false;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (cancelled) return;
      if (i <= text.length) {
        setOutput(text.slice(0, i));
        i += 1;
        timer = setTimeout(tick, speed);
      }
    };

    timer = setTimeout(tick, startDelay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, speed, startDelay, enabled]);

  return output;
}
