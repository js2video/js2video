import DefaultTheme from "vitepress/theme";
import MyLayout from "./layout.vue";

export default {
  extends: DefaultTheme,
  // override the Layout with a wrapper component that
  // injects the slots
  Layout: MyLayout,
};
