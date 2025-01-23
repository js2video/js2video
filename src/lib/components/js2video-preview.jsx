import { useJS2Video } from "./js2video-provider";

/**
 * A preview component that renders a preview of the video.
 * @returns {JSX.Element}
 */
const JS2VideoPreview = () => {
  const { previewRef, templateError } = useJS2Video();
  return (
    <div className="flex-1 flex relative">
      <div
        className="absolute inset-[2%] overflow-hidden flex items-center justify-center"
        ref={previewRef}
      ></div>
      {!!templateError && (
        <div className="absolute inset-0 bg-red-500 text-white p-4">
          {`Template Error: ${templateError}`}
        </div>
      )}
    </div>
  );
};

export { JS2VideoPreview };
