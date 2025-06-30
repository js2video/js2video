import { templates } from "../../play/templates";
import { Modal } from "./modal";

const ExamplesButton = () => {
  return (
    <Modal>
      <div className="flex flex-col gap-6">
        <div className="font-bold text-2xl">Examples</div>
        <div className="text-sm">
          {templates.map((template, index) => (
            <div key={index} className="mb-8">
              <h2 className="mb-1">{template.group}</h2>
              <ul className="flex flex-col gap-1">
                {template.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <a
                      className="opacity-60 hover:opacity-80"
                      href={"/play/?t=" + location.origin + item.url}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <button className="opacity-50 hover:opacity-80">Examples</button>
    </Modal>
  );
};

export { ExamplesButton };
