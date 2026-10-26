export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [1, 'always', ['app', 'ui', 'mocks', 'e2e', 'config', 'docs', 'deps', 'perf']],
  },
};
