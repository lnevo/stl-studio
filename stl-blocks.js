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
      message0: 'Clear the current “result” (start fresh)',
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Resets the logic result so the next checks build from scratch. Ends the current logic string (/FC = 0); the next logic block will start a new one.',
    },
    {
      type: 'stl_set',
      message0: 'Set the current “result” to ON',
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Makes the result true so the following steps run. Ends the current logic string (/FC = 0); the next logic block will start a new one.',
    },
    {
      type: 'stl_and',
      message0: 'Check that %1 is ON (and combine with result)',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: LOGIC_VAR_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Only continue if this input/signal is ON and the result so far is also ON. Combines with RLO (/FC = 1). If this is the first logic after Clear/Set/output/jump/timer, it starts a new logic string.',
    },
    {
      type: 'stl_or',
      message0: 'Check that %1 is ON (or combine with result)',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: LOGIC_VAR_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Continue if this input/signal is ON or the result so far is already ON. Combines with RLO (/FC = 1). If this is the first logic after Clear/Set/output/jump/timer, it starts a new logic string.',
    },
    {
      type: 'stl_and_not',
      message0: 'Check that %1 is OFF (and combine with result)',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: LOGIC_VAR_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Only continue if this input/signal is OFF and the result so far is ON. Combines with RLO (/FC = 1). If this is the first logic after Clear/Set/output/jump/timer, it starts a new logic string.',
    },
    {
      type: 'stl_or_not',
      message0: 'Check that %1 is OFF (or combine with result)',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: LOGIC_VAR_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Continue if this input/signal is OFF or the result so far is ON. Combines with RLO (/FC = 1). If this is the first logic after Clear/Set/output/jump/timer, it starts a new logic string.',
    },
    {
      type: 'stl_not',
      message0: 'Invert the result (NOT)',
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Flip the current result: ON becomes OFF, OFF becomes ON. Does not end the logic string; the next block still combines with this inverted result.',
    },
    {
      type: 'stl_assign',
      message0: 'Set %1 to result (ON or OFF)',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: Q_OPTS.concat(Z_OPTS, M_OPTS) }],
      previousStatement: null,
      nextStatement: null,
      colour: 0,
      tooltip: 'Set this output (Q), transmitter (Z), or memory (M) to match the current result. Ends the logic string (/FC = 0); the next logic block will start a new one.',
    },
    {
      type: 'stl_s',
      message0: 'Turn ON (latch) %1',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: Q_OPTS.concat(M_OPTS) }],
      previousStatement: null,
      nextStatement: null,
      colour: 0,
      tooltip: 'Set this output or memory bit to ON and keep it ON until something resets it. Ends the logic string (/FC = 0); the next logic block will start a new one.',
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
      message0: 'Load time preset: %1 × %2',
      args0: [
        { type: 'field_input', name: 'VALUE', text: '', maxLength: 5 },
        { type: 'field_dropdown', name: 'SCALE', options: [ ['10 ms', '1'], ['100 ms', '2'], ['1 s', '3'], ['10 s', '4'] ] },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'L (load) on Tower LCC+Q is load timer definition only. Set the delay: count × scale (e.g. 2 × 1 s = 2 s, 1 × 100 ms = 0.1 s). Use before “Start timer”.',
    },
    {
      type: 'stl_sd',
      message0: 'Start timer %1 (delay)',
      args0: [{ type: 'field_dropdown', name: 'TIMER', options: T_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Start this timer with the delay you set in “Load time” above. Ends the logic string (/FC = 0); the next logic block (e.g. "Check that Tn is ON") will start a new one.',
    },
    {
      type: 'stl_fr',
      message0: 'Enable timer %1 to run',
      args0: [{ type: 'field_dropdown', name: 'TIMER', options: T_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Allow this timer to run (use when needed by your program).',
    },
    {
      type: 'stl_r',
      message0: 'Turn OFF or reset %1',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: Q_AND_T_OPTS.concat(M_OPTS) }],
      previousStatement: null,
      nextStatement: null,
      colour: 0,
      tooltip: 'Turn off this output/memory bit, or reset this timer to zero. Ends the logic string (/FC = 0); the next logic block will start a new one.',
    },
    {
      type: 'stl_label',
      message0: 'Label (jump target): %1',
      args0: [
        { type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'A named spot in the program that “Jump to” can go to. Use 1–4 characters (e.g. E1, AB1).',
    },
    {
      type: 'stl_jc',
      message0: 'If result is ON, jump to %1',
      args0: [
        { type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'When the result is ON, skip ahead to the label; otherwise continue to the next block. Ends the logic string (/FC = 0); the next logic block will start a new one.',
    },
    {
      type: 'stl_jcn',
      message0: 'If result is OFF, jump to %1',
      args0: [
        { type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'When the result is OFF, skip ahead to the label; otherwise continue. Ends the logic string (/FC = 0); the next logic block will start a new one.',
    },
    {
      type: 'stl_ju',
      message0: 'Jump to %1 (always)',
      args0: [
        { type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'Go to this label and continue from there. Ends the logic string (/FC = 0); the next logic block will start a new one.',
    },
    {
      type: 'stl_comment',
      message0: 'Note (comment): %1',
      args0: [
        { type: 'field_input', name: 'TEXT', text: '', maxLength: 40 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 230,
      tooltip: 'Add a note for yourself; ignored when generating code. Avoid writing T0–T63 in comments (reserved for timers).',
    },
  ]);
})(typeof window !== 'undefined' ? window : this);
