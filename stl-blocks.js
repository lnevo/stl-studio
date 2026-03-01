/**
 * Block definitions for Tower LCC+Q STL (Statement List) language.
 * Maps to Siemens-style STL: A, O, AN, ON, =, S, R, CLR, SET, JC, JCN, JU, labels.
 */

(function (global) {
  const Blockly = global.Blockly;
  if (!Blockly) return;

  // Build I and Q variable options (I0.0-I15.7, Q0.0-Q15.7). Demo uses first 2 groups each.
  function ioOptions(prefix, groups, bits) {
    const opts = [];
    for (let g = 0; g < groups; g++) {
      for (let b = 0; b < bits; b++) {
        const name = prefix + g + '.' + b;
        opts.push([name, name]);
      }
    }
    return opts;
  }
  const I_OPTS = ioOptions('I', 16, 8);
  const Q_OPTS = ioOptions('Q', 16, 8);
  const M_OPTS = ioOptions('M', 16, 8);
  const Y_OPTS = ioOptions('Y', 16, 8);
  const Z_OPTS = ioOptions('Z', 16, 8);
  function timerOptions() {
    var opts = [];
    for (var i = 0; i < 64; i++) opts.push(['T' + i, 'T' + i]);
    return opts;
  }
  const T_OPTS = timerOptions();
  const LOGIC_VAR_OPTS = I_OPTS.concat(Q_OPTS, M_OPTS, Y_OPTS, Z_OPTS, T_OPTS);
  const Q_AND_T_OPTS = Q_OPTS.concat(T_OPTS);

  var defineBlocks = (Blockly.common && Blockly.common.defineBlocksWithJsonArray) || (Blockly.defineBlocksWithJsonArray);
  if (!defineBlocks) return;
  defineBlocks([
    {
      type: 'stl_clear',
      message0: '[CLR] Clear the current result (start fresh)',
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'STL: CLR. Resets the logic result so the next checks build from scratch. Ends the current logic string (/FC = 0); the next logic block will start a new one.',
    },
    {
      type: 'stl_set',
      message0: '[SET] Set the current result to ON',
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'STL: SET. Makes the result true so the following steps run. Ends the current logic string (/FC = 0); the next logic block will start a new one.',
    },
    {
      type: 'stl_and',
      message0: '[A] Check that %1 is ON (AND)',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: LOGIC_VAR_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'STL: A. Only continue if this input/signal is ON and the result so far is ON. First logic after Clear/Set/output/jump/timer starts a new string.',
    },
    {
      type: 'stl_or',
      message0: '[O] Check that %1 is ON (OR)',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: LOGIC_VAR_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'STL: O. Continue if this input/signal is ON or the result so far is ON. First logic after Clear/Set/output/jump/timer starts a new string.',
    },
    {
      type: 'stl_and_not',
      message0: '[AN] Check that %1 is OFF (AND NOT)',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: LOGIC_VAR_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'STL: AN. Only continue if this input/signal is OFF and the result so far is ON. First logic after Clear/Set/output/jump/timer starts a new string.',
    },
    {
      type: 'stl_or_not',
      message0: '[ON] Check that %1 is OFF (OR NOT)',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: LOGIC_VAR_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'STL: ON. Continue if this input/signal is OFF or the result so far is ON. First logic after Clear/Set/output/jump/timer starts a new string.',
    },
    {
      type: 'stl_not',
      message0: '[NOT] Invert the result',
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'STL: NOT. Flip the current result: ON becomes OFF, OFF becomes ON. Next block still combines with this result.',
    },
    {
      type: 'stl_assign',
      message0: '[=] Set %1 to result (ON or OFF)',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: Q_OPTS.concat(Z_OPTS, M_OPTS) }],
      previousStatement: null,
      nextStatement: null,
      colour: 0,
      tooltip: 'STL: =. Set this output (Q), transmitter (Z), or memory (M) to match the current result. Ends the logic string (/FC = 0); the next logic block will start a new one.',
    },
    {
      type: 'stl_s',
      message0: '[S] Turn ON (latch) %1',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: Q_OPTS.concat(M_OPTS) }],
      previousStatement: null,
      nextStatement: null,
      colour: 0,
      tooltip: 'STL: S. Set this output or memory bit to ON and keep it ON until something resets it. Ends the logic string (/FC = 0); the next logic block will start a new one.',
    },
    {
      type: 'stl_l',
      message0: 'Load value (advanced) %1',
      args0: [{ type: 'field_input', name: 'VALUE', text: '', maxLength: 24 }],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Load a raw value (e.g. for timers use “Load time” below instead).',
    },
    {
      type: 'stl_l_time',
      message0: '[L] Load time preset %1 × %2',
      args0: [
        { type: 'field_input', name: 'VALUE', text: '', maxLength: 5 },
        { type: 'field_dropdown', name: 'SCALE', options: [ ['10 ms', '1'], ['100 ms', '2'], ['1 s', '3'], ['10 s', '4'] ] },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'STL: L. Load timer definition only. Set the delay: count × scale (e.g. 2 × 1 s = 2 s, 1 × 100 ms = 0.1 s). Use before “Start timer”.',
    },
    {
      type: 'stl_sd',
      message0: '[SD] Start timer %1 (delay)',
      args0: [{ type: 'field_dropdown', name: 'TIMER', options: T_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'STL: SD. Start this timer with the delay you set in “Load time” above. Ends the logic string (/FC = 0); the next logic block (e.g. "Check that Tn is ON") will start a new one.',
    },
    {
      type: 'stl_fr',
      message0: '[FR] Enable timer %1 to run',
      args0: [{ type: 'field_dropdown', name: 'TIMER', options: T_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'STL: FR. Allow this timer to run (use when needed by your program).',
    },
    {
      type: 'stl_r',
      message0: '[R] Turn OFF or reset %1',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: Q_AND_T_OPTS.concat(M_OPTS) }],
      previousStatement: null,
      nextStatement: null,
      colour: 0,
      tooltip: 'STL: R. Turn off this output/memory bit, or reset this timer to zero. Ends the logic string (/FC = 0); the next logic block will start a new one.',
    },
    {
      type: 'stl_label',
      message0: '[label:] Label (jump target): %1',
      args0: [
        { type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'A named spot in the program that “Jump to” can go to. Use with JC/JCN/JU below when the label comes first (e.g. loop-back). Prefer the C-shaped blocks when the label comes after the jump.',
    },
    {
      type: 'stl_jc',
      message0: '[JC] If result is ON, jump to %1',
      args0: [
        { type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'STL: JC. Use when the target label appears earlier (e.g. loop back). For jump-then-body-then-label, use the C-shaped [JC] block above.',
    },
    {
      type: 'stl_jcn',
      message0: '[JCN] If result is OFF, jump to %1',
      args0: [
        { type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'STL: JCN. Use when the target label appears earlier (e.g. loop back). For jump-then-body-then-label, use the C-shaped [JCN] block above.',
    },
    {
      type: 'stl_ju',
      message0: '[JU] Jump to %1 (always)',
      args0: [
        { type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'STL: JU. Use when the target label appears earlier (e.g. loop back). For jump-then-body-then-label, use the C-shaped [JU] block above.',
    },
    {
      type: 'stl_jump_c_jc',
      message0: '[JC] If result is ON, jump to %1',
      args0: [{ type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 }],
      message1: '  %1',
      args1: [{ type: 'input_statement', name: 'BODY' }],
      message2: '  [label:] %1',
      args2: [{ type: 'field_label', name: 'LABEL_DISPLAY', text: 'E1' }],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'C-shaped: jump to label (label is part of this block). Add blocks inside to run between the jump and the label. The bottom shows the target label. STL: JC then body then label:.',
    },
    {
      type: 'stl_jump_c_jcn',
      message0: '[JCN] If result is OFF, jump to %1',
      args0: [{ type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 }],
      message1: '  %1',
      args1: [{ type: 'input_statement', name: 'BODY' }],
      message2: '  [label:] %1',
      args2: [{ type: 'field_label', name: 'LABEL_DISPLAY', text: 'E1' }],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'C-shaped: jump to label (label is part of this block). Add blocks inside to run between the jump and the label. The bottom shows the target label. STL: JCN then body then label:.',
    },
    {
      type: 'stl_jump_c_ju',
      message0: '[JU] Jump to %1 (always)',
      args0: [{ type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 }],
      message1: '  %1',
      args1: [{ type: 'input_statement', name: 'BODY' }],
      message2: '  [label:] %1',
      args2: [{ type: 'field_label', name: 'LABEL_DISPLAY', text: 'E1' }],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'C-shaped: jump to label (label is part of this block). Add blocks inside to run between the jump and the label. The bottom shows the target label. STL: JU then body then label:.',
    },
    {
      type: 'stl_comment',
      message0: '[//] Comment %1',
      args0: [
        { type: 'field_input', name: 'TEXT', text: '', maxLength: 40 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 230,
      tooltip: 'STL: //. Add a note for yourself. Avoid writing T0–T63 in comments (reserved for timers).',
    },
    {
      type: 'stl_or_group_start',
      message0: '[O(] OR nest start ( … )',
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'STL: O(. Start of OR nest. Inserted by import when parsing nested OR.',
    },
    {
      type: 'stl_and_group_start',
      message0: '[A(] AND nest start ( … )',
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'STL: A(. Start of AND nest. Inserted by import when parsing nested AND.',
    },
    {
      type: 'stl_group_end',
      message0: '[)] Nest end',
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'STL: ). End of O( … ) or A( … ) nest.',
    },
    {
      type: 'stl_group',
      message0: '[// Group] Group Description %1',
      args0: [
        { type: 'field_input', name: 'NAME', text: '', maxLength: 60 },
      ],
      message1: '  %1',
      args1: [{ type: 'field_label', name: 'GROUP_BYTES', text: '— bytes' }],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Tower LCC+Q: Conditionals.Logic(n).Group Description. Name for this logic group. Byte count (per group, max 255) is shown below. Place before the blocks that belong to it. Empty becomes "Default".',
    },
  ]);

  /** Return dropdown options with friendly names (from config backup) when window.stlFriendlyNames is set. */
  function optsWithFriendlyNames(baseOpts) {
    var names = (typeof global !== 'undefined' && global.stlFriendlyNames) || {};
    return baseOpts.map(function (p) {
      var val = p[1];
      return [names[val] ? val + ' – ' + names[val] : val, val];
    });
  }
  if (typeof global !== 'undefined') {
    global.getStlLogicVarOptions = function () { return optsWithFriendlyNames(LOGIC_VAR_OPTS); };
    global.getStlAssignVarOptions = function () { return optsWithFriendlyNames(Q_OPTS.concat(Z_OPTS, M_OPTS)); };
    global.getStlSVarOptions = function () { return optsWithFriendlyNames(Q_OPTS.concat(M_OPTS)); };
    global.getStlRVarOptions = function () { return optsWithFriendlyNames(Q_AND_T_OPTS.concat(M_OPTS)); };
  }
})(typeof window !== 'undefined' ? window : this);
