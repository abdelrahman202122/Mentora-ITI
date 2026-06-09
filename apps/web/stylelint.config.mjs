const tailwindAtRules = ['apply', 'custom-variant', 'layer', 'theme'];

const stylelintConfig = {
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: tailwindAtRules,
      },
    ],
  },
};

export default stylelintConfig;
