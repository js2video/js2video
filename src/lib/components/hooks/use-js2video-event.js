import { useEffect, useState } from "react";

const useJS2VideoEvent = () => {
  const [message, setMessage] = useState(null);
  useEffect(() => {
    const listener = (e) => setMessage(e.detail);
    window.addEventListener("js2video", listener);
    return () => window.removeEventListener("js2video", listener);
  }, []);
  return message;
};

export { useJS2VideoEvent };
