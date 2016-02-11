var inject = require('./')
var test = require('tape')
var tokenize = require('glsl-tokenizer')
var stringify = require('glsl-token-string')

test("get first token where it's safe to define values", function (t) {
  var injected = { data: '#define blah', type: 'preprocessor' }

  var shader = tokenize('#define foo\nvoid main(){}')
  t.equal(stringify(inject(shader, injected)), 
    '#define blah\n#define foo\nvoid main(){}')

  shader = tokenize('precision mediump float;\nprecision mediump int;\nvoid main(){}')
  t.equal(stringify(inject(shader, injected)), 
    'precision mediump float;\nprecision mediump int;\n#define blah\nvoid main(){}')

  shader = tokenize('void main(){}')
  t.equal(stringify(inject(shader, injected)), 
    '#define blah\nvoid main(){}')

  shader = tokenize('')
  t.equal(stringify(inject(shader, injected)), 
    '#define blah\n')

  shader = tokenize('#version 330')
  t.equal(stringify(inject(shader, injected)), 
    '#version 330\n#define blah\n')

  shader = tokenize('#version 330\n\nvoid main(){}')
  t.equal(stringify(inject(shader, injected)), 
    '#version 330\n#define blah\n\nvoid main(){}')

  shader = tokenize('#version 330//commentt\n/*comment*/\n#extension blah\nuniform vec4 foo;')
  t.equal(stringify(inject(shader, injected)), 
    '#version 330//commentt\n/*comment*/\n#extension blah\n#define blah\nuniform vec4 foo;')

  shader = tokenize('#version 330//commentt\n/*comment*/\n#extension blah\nuniform vec4 foo;')
  t.equal(stringify(inject(shader, [
    { type: 'whitespace', data: '\n' },
    { type: 'keyword', data: 'out' },
    { type: 'whitespace', data: ' ' },
    { type: 'keyword', data: 'float' },
    { type: 'whitespace', data: ' ' },
    { type: 'ident', data: 'foobar' },
    { type: 'operator', data: ';' },
    { type: 'whitespace', data: '\n' }
  ])), 
    '#version 330//commentt\n/*comment*/\n#extension blah\n\nout float foobar;\n\nuniform vec4 foo;')
  t.end()
})
