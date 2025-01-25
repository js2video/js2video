import { useEffect, useState } from "react";

const useJS2VideoEventProperty = (property, defaultValue) => {
  const [propertyValue, setPropertyValue] = useState(defaultValue);
  useEffect(() => {
    const listener = (e) => {
      const { videoTemplate } = e.detail;
      setPropertyValue(videoTemplate[property] ?? defaultValue);
    };
    window.addEventListener("js2video", listener);
    return () => {
      window.removeEventListener("js2video", listener);
    };
  }, [property]);
  return propertyValue;
};

export { useJS2VideoEventProperty };
