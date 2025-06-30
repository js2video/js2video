// @ts-nocheck
import { useState, cloneElement, Children } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";

function Modal({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen((prev) => !prev);

  const allChildren = Children.toArray(children);
  const trigger = allChildren.at(-1);
  const content = allChildren.slice(0, -1);

  return (
    <>
      {cloneElement(trigger, { onClick: toggle })}
      <Dialog open={isOpen} onClose={toggle} className="relative z-50">
        <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <DialogPanel className="relative bg-black rounded border border-[#888] text-white p-8 shadow-xl w-full max-w-screen-md h-[90vh] overflow-y-auto">
            <button
              onClick={toggle}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              aria-label="Close modal"
            >
              <X size={30} strokeWidth={1} />
            </button>
            <div className="space-y-4">{content}</div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}

export { Modal };
