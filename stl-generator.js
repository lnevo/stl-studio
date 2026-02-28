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
  stlGenerator.forBlock['stl_and'] = function (block, gen) {
    var v = block.getFieldValue('VAR') || 'I0.0';
    return withNext(block, gen, 'A ' + v + '\n');
  };
  stlGenerator.forBlock['stl_or'] = function (block, gen) {
    var v = block.getFieldValue('VAR') || 'I0.0';
    return withNext(block, gen, 'O ' + v + '\n');
  };
  stlGenerator.forBlock['stl_and_not'] = function (block, gen) {
    var v = block.getFieldValue('VAR') || 'I0.0';
    return withNext(block, gen, 'AN ' + v + '\n');
  };
  stlGenerator.forBlock['stl_or_not'] = function (block, gen) {
    var v = block.getFieldValue('VAR') || 'I0.0';
    return withNext(block, gen, 'ON ' + v + '\n');
  };
  stlGenerator.forBlock['stl_not'] = function (block, gen) {
    return withNext(block, gen, 'NOT\n');
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

  stlGenerator.forBlock['stl_sd'] = function (block, gen) {
    var v = block.getFieldValue('TIMER') || 'T0';
    return withNext(block, gen, 'SD ' + v + '\n');
  };
  stlGenerator.forBlock['stl_fr'] = function (block, gen) {
    var v = block.getFieldValue('TIMER') || 'T0';
    return withNext(block, gen, 'FR ' + v + '\n');
  };
  stlGenerator.forBlock['stl_assign'] = function (block, gen) {
    var v = block.getFieldValue('VAR') || 'Q0.0';
    return withNext(block, gen, '= ' + v + '\n');
  };
  stlGenerator.forBlock['stl_s'] = function (block, gen) {
    var v = block.getFieldValue('VAR') || 'Q0.0';
    return withNext(block, gen, 'S ' + v + '\n');
  };
  stlGenerator.forBlock['stl_r'] = function (block, gen) {
    var v = block.getFieldValue('VAR') || 'Q0.0';
    return withNext(block, gen, 'R ' + v + '\n');
  };
  stlGenerator.forBlock['stl_label'] = function (block, gen) {
    var label = sanitizeLabel(block.getFieldValue('LABEL'));
    return withNext(block, gen, label + ':\n');
  };
  stlGenerator.forBlock['stl_jc'] = function (block, gen) {
    var label = sanitizeLabel(block.getFieldValue('LABEL'));
    return withNext(block, gen, 'JC ' + label + '\n');
  };
  stlGenerator.forBlock['stl_jcn'] = function (block, gen) {
    var label = sanitizeLabel(block.getFieldValue('LABEL'));
    return withNext(block, gen, 'JCN ' + label + '\n');
  };
  stlGenerator.forBlock['stl_ju'] = function (block, gen) {
    var label = sanitizeLabel(block.getFieldValue('LABEL'));
    return withNext(block, gen, 'JU ' + label + '\n');
  };
  stlGenerator.forBlock['stl_comment'] = function (block, gen) {
    var text = (block.getFieldValue('TEXT') || '').trim();
    var line = text ? '// ' + text + '\n' : '';
    return withNext(block, gen, line);
  };

  global.stlGenerator = stlGenerator;
})(typeof window !== 'undefined' ? window : this);
