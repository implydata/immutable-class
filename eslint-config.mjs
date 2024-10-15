import awesomeCodeStyle, { configs } from '@awesome-code-style/eslint-config';
import notice from 'eslint-plugin-notice';

export default [
  ...awesomeCodeStyle,
  ...configs.typeChecked,
  {
    plugins: {
      notice,
    },
    rules: {
      'notice/notice': [
        2,
        {
          mustMatch: 'Copyright [0-9-]+ Imply Data, Inc\\.',
        },
      ],
      'max-classes-per-file': [0],
    },
  },
];
