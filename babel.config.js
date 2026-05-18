module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@ui": "./src/components/ui",
            "@hooks": "./src/hooks",
            "@store": "./src/store",
            "@api": "./src/api",
            "@services": "./src/services",
            "@constants": "./src/constants",
            "@utils": "./src/utils",
            "@types": "./src/types",
          },
        },
      ],
      "react-native-reanimated/plugin", // ⚠️ لازم يكون آخر plugin دايماً
    ],
  };
};
