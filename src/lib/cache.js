import { djb2Hash } from "./utils";

let items = {};

const cache = {
  get: async (key) => {
    return items[djb2Hash(JSON.stringify(key))];
  },
  set: async (key, value) => {
    items[djb2Hash(JSON.stringify(key))] = value;
  },
  clear: async () => {
    items = {};
  },
};

export { cache };
