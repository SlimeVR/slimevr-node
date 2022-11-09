module.exports = {
  root: true,
  extends: ['@slimevr/eslint-config'],
  parserOptions: {
    project: ['./packages/*/tsconfig.json', './apps/*/tsconfig.json']
  }
};
