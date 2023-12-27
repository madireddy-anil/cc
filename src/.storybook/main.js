module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  refs: {
    "design-system": {
      title: "PayPerform Design System",
      url: "https://develop--607ed7af8ef4e600214a6a36.chromatic.com",
    },
  },
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-create-react-app",
  ],
};
