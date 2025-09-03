module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-leading-blank': [0, 'always'],
    'header-max-length': [2, 'always', 100],
    'scope-case': [2, 'always', 'kebab-case'],
    'scope-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-case': [2, 'never', 'sentence-case'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [2, 'always', ['feat', 'fix', 'change', 'chore', 'docs', 'style', 'perf', 'test']],
  },
};
