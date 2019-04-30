'use strict';

const Util = require('../src/util/Util');
const testString = '`_Behold!_`\n||___~~***```js\n`use strict`;\nrequire(\'discord.js\');```***~~___||';

describe('escapeCodeblock', () => {
  test('basic', () => {
    expect(Util.escapeCodeBlock(testString))
      .toBe('`_Behold!_`\n||___~~***\\`\\`\\`js\n`use strict`;\nrequire(\'discord.js\');\\`\\`\\`***~~___||');
  });
});


describe('escapeInlineCode', () => {
  test('basic', () => {
    expect(Util.escapeInlineCode(testString))
      .toBe('\\`_Behold!_\\`\n||___~~***```js\n\\`use strict\\`;\nrequire(\'discord.js\');```***~~___||');
  });
});


describe('escapeBold', () => {
  test('basic', () => {
    expect(Util.escapeBold(testString))
      .toBe('`_Behold!_`\n||___~~*\\*\\*```js\n`use strict`;\nrequire(\'discord.js\');```\\*\\**~~___||');
  });
});


describe('escapeItalic', () => {
  test('basic', () => {
    expect(Util.escapeItalic(testString))
      .toBe('`\\_Behold!\\_`\n||\\___~~\\***```js\n`use strict`;\nrequire(\'discord.js\');```**\\*~~__\\_||');
  });
});


describe('escapeUnderline', () => {
  test('basic', () => {
    expect(Util.escapeUnderline(testString))
      .toBe('`_Behold!_`\n||_\\_\\_~~***```js\n`use strict`;\nrequire(\'discord.js\');```***~~\\_\\__||');
  });
});


describe('escapeStrikethrough', () => {
  test('basic', () => {
    expect(Util.escapeStrikethrough(testString))
      .toBe('`_Behold!_`\n||___\\~\\~***```js\n`use strict`;\nrequire(\'discord.js\');```***\\~\\~___||');
  });
});


describe('escapeSpoiler', () => {
  test('basic', () => {
    expect(Util.escapeSpoiler(testString))
      .toBe('`_Behold!_`\n\\|\\|___~~***```js\n`use strict`;\nrequire(\'discord.js\');```***~~___\\|\\|');
  });
});


describe('escapeMarkdown', () => {
  test('basic', () => {
    expect(Util.escapeMarkdown(testString))
    // eslint-disable-next-line max-len
      .toBe('\\`\\_Behold!\\_\\`\n\\|\\|\\_\\_\\_\\~\\~\\*\\*\\*\\`\\`\\`js\n\\`use strict\\`;\nrequire(\'discord.js\');\\`\\`\\`\\*\\*\\*\\~\\~\\_\\_\\_\\|\\|');
  });

  test('no code block content', () => {
    expect(Util.escapeMarkdown(testString, { codeBlockContent: false }))
    // eslint-disable-next-line max-len
      .toBe('\\`\\_Behold!\\_\\`\n\\|\\|\\_\\_\\_\\~\\~\\*\\*\\*\\`\\`\\`js\n`use strict`;\nrequire(\'discord.js\');\\`\\`\\`\\*\\*\\*\\~\\~\\_\\_\\_\\|\\|');
  });

  test('no inline code content', () => {
    expect(Util.escapeMarkdown(testString, { inlineCodeContent: false }))
    // eslint-disable-next-line max-len
      .toBe('\\`_Behold!_\\`\n\\|\\|\\_\\_\\_\\~\\~\\*\\*\\*\\`\\`\\`js\n\\`use strict\\`;\nrequire(\'discord.js\');\\`\\`\\`\\*\\*\\*\\~\\~\\_\\_\\_\\|\\|');
  });

  test('neither inline code or code block content', () => {
    expect(Util.escapeMarkdown(testString, { inlineCodeContent: false, codeBlockContent: false }))
    // eslint-disable-next-line max-len
      .toBe('\\`_Behold!_\\`\n\\|\\|\\_\\_\\_\\~\\~\\*\\*\\*\\`\\`\\`js\n`use strict`;\nrequire(\'discord.js\');\\`\\`\\`\\*\\*\\*\\~\\~\\_\\_\\_\\|\\|');
  });

  test('neither code blocks or code block content', () => {
    expect(Util.escapeMarkdown(testString, { codeBlock: false, codeBlockContent: false }))
    // eslint-disable-next-line max-len
      .toBe('\\`\\_Behold!\\_\\`\n\\|\\|\\_\\_\\_\\~\\~\\*\\*\\*```js\n`use strict`;\nrequire(\'discord.js\');```\\*\\*\\*\\~\\~\\_\\_\\_\\|\\|');
  });

  test('neither inline code or inline code content', () => {
    expect(Util.escapeMarkdown(testString, { inlineCode: false, inlineCodeContent: false }))
    // eslint-disable-next-line max-len
      .toBe('`_Behold!_`\n\\|\\|\\_\\_\\_\\~\\~\\*\\*\\*\\`\\`\\`js\n`use strict`;\nrequire(\'discord.js\');\\`\\`\\`\\*\\*\\*\\~\\~\\_\\_\\_\\|\\|');
  });

  test('edge odd number of fenses with no code block content', () => {
    // eslint-disable-next-line max-len
    expect(Util.escapeMarkdown('**foo** ```**bar**``` **fizz** ``` **buzz**', { codeBlock: false, codeBlockContent: false }))
      .toBe('\\*\\*foo\\*\\* ```**bar**``` \\*\\*fizz\\*\\* ``` \\*\\*buzz\\*\\*');
  });

  test('edge odd number of backticks with no inline code content', () => {
    // eslint-disable-next-line max-len
    expect(Util.escapeMarkdown('**foo** `**bar**` **fizz** ` **buzz**', { inlineCode: false, inlineCodeContent: false }))
      .toBe('\\*\\*foo\\*\\* `**bar**` \\*\\*fizz\\*\\* ` \\*\\*buzz\\*\\*');
  });
});

