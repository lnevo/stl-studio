/**
 * STL code generator for Tower LCC+Q.
 * Converts Blockly blocks to Siemens-style STL (Statement List) text.
 * Each block appends the next block in the stack so the full chain is emitted.
 */
(function (global) {
  const Blockly = global.Blockly;
  if (!Blockly || !Blockly.Generator) return;

  function sanitizeLabel(str) {
    if (!str || typeof str !== 'string') return 'E1';
    const s = String(str).trim().slice(0, 4);
    return s.length ? s : 'E1';
  }

  /** Return this block's STL line plus the rest of the stack (next block). */
  function withNext(block, generator, line) {
    var next = block.getNextBlock();
    return line + (next ? generator.blockToCode(next) : '');
  }

  var stlGenerator = new Blockly.Generator('STL');

  stlGenerator.forBlock['stl_clear'] = function (block, gen) {
    return withNext(block, gen, 'CLR\n');
  };
  stlGenerator.forBlock['stl_set'] = function (block, gen) {
    return withNext(block, gen, 'SET\n');
  };
  var LOGIC_OP_TO_STL = { a: 'A', o: 'O', an: 'AN', on: 'ON' };
  stlGenerator.forBlock['stl_logic'] = function (block, gen) {
    var v = block.getFieldValue('VAR') || 'I0.0';
    var op = block.getFieldValue('OP') || 'a';
    return withNext(block, gen, (LOGIC_OP_TO_STL[op] || 'A') + ' ' + v + '\n');
  };
  var XOR_OP_TO_STL = { x: 'X', xn: 'XN' };
  stlGenerator.forBlock['stl_xor'] = function (block, gen) {
    var v = block.getFieldValue('VAR') || 'I0.0';
    var op = block.getFieldValue('XOP') || 'x';
    return withNext(block, gen, (XOR_OP_TO_STL[op] || 'X') + ' ' + v + '\n');
  };
  stlGenerator.forBlock['stl_not'] = function (block, gen) {
    return withNext(block, gen, 'NOT\n');
  };
  stlGenerator.forBlock['stl_save'] = function (block, gen) {
    return withNext(block, gen, 'SAVE\n');
  };
  stlGenerator.forBlock['stl_l'] = function (block, gen) {
    var v = (block.getFieldValue('VALUE') || '').trim();
    if (!v) return withNext(block, gen, '');
    var match = /^W#(\d)#(\d+)$/i.exec(v);
    if (match) {
      var base = parseInt(match[1], 10);
      var val = parseInt(match[2], 10);
      if (base >= 1 && base <= 4 && val >= 0 && val <= 999) return withNext(block, gen, 'L W#' + base + '#' + val + '\n');
    }
    return withNext(block, gen, '');
  };

  stlGenerator.forBlock['stl_l_time'] = function (block, gen) {
    var val = parseInt(block.getFieldValue('VALUE'), 10) || 0;
    if (val <= 0) return withNext(block, gen, '');
    var base = block.getFieldValue('SCALE') || '3';
    return withNext(block, gen, 'L W#' + base + '#' + val + '\n');
  };

  var TIMER_TYPE_TO_STL = { sd: 'SD', se: 'SE', sp: 'SP', ss: 'SS', sf: 'SF' };
  stlGenerator.forBlock['stl_timer'] = function (block, gen) {
    var v = block.getFieldValue('TIMER') || 'T0';
    var t = block.getFieldValue('TTYPE') || 'sd';
    return withNext(block, gen, (TIMER_TYPE_TO_STL[t] || 'SD') + ' ' + v + '\n');
  };
  stlGenerator.forBlock['stl_fr'] = function (block, gen) {
    var v = block.getFieldValue('TIMER') || 'T0';
    return withNext(block, gen, 'FR ' + v + '\n');
  };
  stlGenerator.forBlock['stl_transition'] = function (block, gen) {
    var v = block.getFieldValue('VAR') || 'M0.0';
    var dir = block.getFieldValue('TDIR') || 'fp';
    return withNext(block, gen, (dir === 'fn' ? 'FN' : 'FP') + ' ' + v + '\n');
  };
  stlGenerator.forBlock['stl_assign'] = function (block, gen) {
    var v = block.getFieldValue('VAR') || 'Q0.0';
    return withNext(block, gen, '= ' + v + '\n');
  };
  stlGenerator.forBlock['stl_latch'] = function (block, gen) {
    var v = block.getFieldValue('VAR') || 'Q0.0';
    var op = block.getFieldValue('SOP') || 's';
    return withNext(block, gen, (op === 'r' ? 'R' : 'S') + ' ' + v + '\n');
  };
  stlGenerator.forBlock['stl_label'] = function (block, gen) {
    var label = sanitizeLabel(block.getFieldValue('LABEL'));
    return withNext(block, gen, label + ': ');
  };
  var JUMP_OPCODES = { ju: 'JU', jc: 'JC', jcn: 'JCN', jcb: 'JCB', jnb: 'JNB', jbi: 'JBI', jnbi: 'JNBI' };
  stlGenerator.forBlock['stl_jump'] = function (block, gen) {
    var label = sanitizeLabel(block.getFieldValue('LABEL'));
    var cond = block.getFieldValue('COND') || 'ju';
    var op = JUMP_OPCODES[cond] || 'JU';
    return withNext(block, gen, op + ' ' + label + '\n');
  };
  stlGenerator.forBlock['stl_jump_c'] = function (block, gen) {
    var label = sanitizeLabel(block.getFieldValue('LABEL'));
    var cond = block.getFieldValue('COND') || 'ju';
    var op = JUMP_OPCODES[cond] || 'JU';
    var bodyCode = gen.statementToCode(block, 'BODY');
    var out = op + ' ' + label + '\n';
    if (bodyCode) out += bodyCode;
    out += label + ': ';
    return withNext(block, gen, out);
  };
  stlGenerator.forBlock['stl_comment'] = function (block, gen) {
    var text = (block.getFieldValue('TEXT') || '').trim();
    var line = text ? '//' + text + '\n' : '';
    return withNext(block, gen, line);
  };
  stlGenerator.forBlock['stl_var_input'] = function () { return ''; };
  stlGenerator.forBlock['stl_var_output'] = function () { return ''; };
  stlGenerator.forBlock['stl_var_transmitter'] = function () { return ''; };
  stlGenerator.forBlock['stl_var_receiver'] = function () { return ''; };
  stlGenerator.forBlock['stl_name'] = function () { return ''; };
  stlGenerator.forBlock['stl_event_id'] = function () { return ''; };
  stlGenerator.forBlock['stl_group'] = function (block, gen) {
    var name = (block.getFieldValue('NAME') || 'Default').trim() || 'Default';
    var n = typeof gen.groupIndex === 'number' ? gen.groupIndex : 0;
    gen.groupIndex = n + 1;
    return withNext(block, gen, '//Group ' + n + ': ' + name + '\n');
  };
  var NEST_TYPE_TO_OP = { 'o(': 'O(', 'on(': 'ON(', 'a(': 'A(', 'x(': 'X(', 'xn(': 'XN(' };
  stlGenerator.forBlock['stl_nest_c'] = function (block, gen) {
    var nestType = block.getFieldValue('NEST_TYPE') || 'o(';
    var op = NEST_TYPE_TO_OP[nestType] || 'O(';
    var bodyCode = gen.statementToCode(block, 'BODY');
    return withNext(block, gen, op + '\n' + (bodyCode || '') + ')\n');
  };

  global.stlGenerator = stlGenerator;
})(typeof window !== 'undefined' ? window : this);
