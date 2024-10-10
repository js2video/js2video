import { useEffect, useState } from "react";

const useJS2VideoEvent = () => {
  const [message, setMessage] = useState(null);
  useEffect(() => {
    const handler = (e) => {
      setMessage(e.detail);
    };
    window.addEventListener("js2video", handler);
    return () => window.removeEventListener("js2video", handler);
  }, []);
  return { message };
};

export { useJS2VideoEvent };
