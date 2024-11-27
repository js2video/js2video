import { djb2Hash } from "./utils";

let items = {};

const cache = {
  get: async (key) => {
    return items[djb2Hash(key)];
  },
  set: async (key, value) => {
    items[djb2Hash(key)] = value;
  },
  clear: async () => {
    items = {};
  },
};

export { cache };
