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
  /** Jump condition: value is opcode (ju,jc,jcn,jcb,jnb,jbi,jnbi). Used by stl_jump and stl_jump_c. First option = default (JU). */
  const JUMP_COND_OPTS = [
    ['Always', 'ju'],
    ['If condition is ON', 'jc'],
    ['If condition is OFF', 'jcn'],
    ['If ON, save result', 'jcb'],
    ['If OFF, save result', 'jnb'],
    ['If saved result is ON', 'jbi'],
    ['If saved result is OFF', 'jnbi']
  ];
  function timerOptions() {
    var opts = [];
    for (var i = 0; i < 64; i++) opts.push(['T' + i, 'T' + i]);
    return opts;
  }
  const T_OPTS = timerOptions();
  const LOGIC_VAR_OPTS = I_OPTS.concat(Q_OPTS, M_OPTS, Y_OPTS, Z_OPTS, T_OPTS);
  const Q_AND_T_OPTS = Q_OPTS.concat(T_OPTS);
  function circuitOpts(prefix, n) {
    const opts = [];
    for (let i = 0; i < n; i++) opts.push([prefix + i, prefix + i]);
    return opts;
  }
  const Z_CIRCUIT_OPTS = circuitOpts('Z', 16);
  const Y_CIRCUIT_OPTS = circuitOpts('Y', 16);
  /** Logic condition operator. Used by stl_logic. First option = default (A). */
  const LOGIC_OP_OPTS = [
    ['is ON (AND)', 'a'],
    ['is ON (OR)', 'o'],
    ['is OFF (AND NOT)', 'an'],
    ['is OFF (OR NOT)', 'on'],
  ];
  const LOGIC_OP_TO_LABEL = { a: '[A]', o: '[O]', an: '[AN]', on: '[ON]' };
  /** XOR operator. Used by stl_xor. First option = default (X). */
  const XOR_OP_OPTS = [
    ['OR', 'x'],
    ['OR NOT (must match)', 'xn'],
  ];
  const XOR_OP_TO_LABEL = { x: '[X]', xn: '[XN]' };
  /** Transition direction. Used by stl_transition. First option = default (FP). */
  const TRANSITION_OPTS = [
    ['OFF\u2192ON', 'fp'],
    ['ON\u2192OFF', 'fn'],
  ];
  const TRANSITION_TO_LABEL = { fp: '[FP]', fn: '[FN]' };
  /** Set/Reset operator. Used by stl_latch. First option = default (S). */
  const SR_OP_OPTS = [
    ['ON', 's'],
    ['OFF / reset', 'r'],
  ];
  const SR_OP_TO_LABEL = { s: '[S]', r: '[R]' };
  /** Timer type. Used by stl_timer. First option = default (SD). */
  const TIMER_TYPE_OPTS = [
    ['On-delay', 'sd'],
    ['Off-delay', 'sf'],
    ['Pulse', 'sp'],
    ['Extended pulse', 'se'],
    ['Accumulating', 'ss'],
  ];
  const TIMER_TYPE_TO_LABEL = { sd: '[SD]', sf: '[SF]', sp: '[SP]', se: '[SE]', ss: '[SS]' };
  /** Nest type for C-shaped ( … ) blocks. Value is STL prefix (o, on, a, x, xn); output is O(, ON(, A(, X(, XN(. Display is short so it doesn't duplicate "nest ( … )". */
  const NEST_TYPE_OPTS = [
    ['OR', 'o('],
    ['OR NOT', 'on('],
    ['AND', 'a('],
    ['XOR', 'x('],
    ['XOR NOT', 'xn(']
  ];

  var defineBlocks = (Blockly.common && Blockly.common.defineBlocksWithJsonArray) || (Blockly.defineBlocksWithJsonArray);
  if (!defineBlocks) return;
  defineBlocks([
    {
      type: 'stl_clear',
      message0: '[CLR] Clear / start fresh',
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Resets the condition to “false” so you can start a brand-new check. Place this at the top of a new logic sequence when you do not want it to carry over from the previous block.',
      helpUrl: 'help.html#cat-logic',
    },
    {
      type: 'stl_set',
      message0: '[SET] Force result ON',
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Forces the condition to true, regardless of sensor states. Use before an output or jump that should always run, with no conditions attached.',
      helpUrl: 'help.html#cat-logic',
    },
    {
      type: 'stl_logic',
      message0: '%1 Check %2 %3',
      args0: [
        { type: 'field_label', name: 'OPCODE_LABEL', text: '[A]' },
        { type: 'field_dropdown', name: 'VAR', options: LOGIC_VAR_OPTS },
        { type: 'field_dropdown', name: 'OP', options: LOGIC_OP_OPTS }
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Check whether a sensor, output, or memory bit is ON or OFF. Use the dropdown to choose how this check combines with the ones above: AND (all must be true), OR (any can be true), AND NOT (this must be OFF), OR NOT (this being OFF is enough).',
      helpUrl: 'help.html#cat-logic',
    },
    {
      type: 'stl_xor',
      message0: '%1 Exclusive %2 %3',
      args0: [
        { type: 'field_label', name: 'OPCODE_LABEL', text: '[X]' },
        { type: 'field_dropdown', name: 'XOP', options: XOR_OP_OPTS },
        { type: 'field_dropdown', name: 'VAR', options: LOGIC_VAR_OPTS },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Exclusive OR check. "OR" is true only when exactly one of the two things is active (not both). "OR NOT (must match)" is true when both agree — both ON or both OFF.',
      helpUrl: 'help.html#cat-logic',
    },
    {
      type: 'stl_not',
      message0: '[NOT] Flip / invert result',
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Flips the current result: true becomes false, false becomes true. Place this before an output or jump to apply the opposite of the condition above.',
      helpUrl: 'help.html#cat-logic',
    },
    {
      type: 'stl_save',
      message0: '[SAVE] Save condition for later',
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Advanced: saves the current condition so it can be tested later by a JBI, JNBI, JCB, or JNB jump. Place this block directly above the jump block that needs to use the saved value.',
      helpUrl: 'help.html#cat-logic',
    },
    {
      type: 'stl_assign',
      message0: '[=] Apply result to %1',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: Q_OPTS.concat(Z_OPTS, M_OPTS) }],
      previousStatement: null,
      nextStatement: null,
      colour: 0,
      tooltip: 'Sets this output ON or OFF based on the checks above. If the conditions are true, the output turns ON; if false, it turns OFF. This is the most common way to control a signal or output.',
      helpUrl: 'help.html#cat-outputs',
    },
    {
      type: 'stl_latch',
      message0: '%1 Latch %2 %3',
      args0: [
        { type: 'field_label', name: 'OPCODE_LABEL', text: '[S]' },
        { type: 'field_dropdown', name: 'SOP', options: SR_OP_OPTS },
        { type: 'field_dropdown', name: 'VAR', options: Q_AND_T_OPTS.concat(M_OPTS) },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 0,
      tooltip: 'Latches an output or memory bit ON or OFF. "ON (latch)" turns it ON and keeps it ON until reset — pair with an "OFF / reset" block to unlatch. "OFF / reset" turns it OFF or resets a timer.',
      helpUrl: 'help.html#cat-outputs',
    },
    {
      type: 'stl_l',
      message0: '[L] Load raw value (advanced): %1',
      args0: [{ type: 'field_input', name: 'VALUE', text: '', maxLength: 24 }],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Advanced: loads a raw timer value in the internal format (e.g. W#1#50). For most uses, prefer the [L] Load time preset block below which is easier to configure.',
      helpUrl: 'help.html#cat-timers',
    },
    {
      type: 'stl_l_time',
      message0: '[L] Load time preset %1 \u00d7 %2',
      args0: [
        { type: 'field_input', name: 'VALUE', text: '', maxLength: 5 },
        { type: 'field_dropdown', name: 'SCALE', options: [ ['10 ms', '1'], ['100 ms', '2'], ['1 s', '3'], ['10 s', '4'] ] },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Sets the time duration for a timer. Enter a number and choose the unit (e.g. 5 \u00d7 1 s = 5 seconds). Always place this block directly above the Start timer block (SD, SE, SP, SS, or SF).',
      helpUrl: 'help.html#cat-timers',
    },
    {
      type: 'stl_timer',
      message0: '%1 Start timer %2 %3',
      args0: [
        { type: 'field_label', name: 'OPCODE_LABEL', text: '[SD]' },
        { type: 'field_dropdown', name: 'TTYPE', options: TIMER_TYPE_OPTS },
        { type: 'field_dropdown', name: 'TIMER', options: T_OPTS },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Starts a timer. Choose the type from the dropdown: On-delay (wait before acting), Off-delay (keep output on after input drops), Pulse (timed output), Extended pulse (guaranteed minimum duration), or Accumulating (total elapsed time). Always place a [L] Load time preset block directly above this block.',
      helpUrl: 'help.html#cat-timers',
    },
    {
      type: 'stl_fr',
      message0: '[FR] Enable timer %1 to run',
      args0: [{ type: 'field_dropdown', name: 'TIMER', options: T_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Enables a timer so it can restart after being reset. Place this just above the timer start block (SD, SE, SP, SS, or SF) in the same group if the timer stops working after a reset.',
      helpUrl: 'help.html#cat-timers',
    },
    {
      type: 'stl_transition',
      message0: '%1 Transition %2 %3',
      args0: [
        { type: 'field_label', name: 'OPCODE_LABEL', text: '[FP]' },
        { type: 'field_dropdown', name: 'TDIR', options: TRANSITION_OPTS },
        { type: 'field_dropdown', name: 'VAR', options: M_OPTS },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: '#b8a83a',
      tooltip: 'Detects a change on a memory bit \u2014 true for just one program cycle at the moment of the transition. "OFF\u2192ON" triggers when the bit first turns on; "ON\u2192OFF" triggers when it first turns off. Use for one-shot actions (e.g. fire an action the instant a sensor activates or clears).',
      helpUrl: 'help.html#cat-transition',
    },
    {
      type: 'stl_label',
      message0: '[label:] Jump target: %1',
      args0: [
        { type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'Marks a point in the program that a Jump block can branch to. Give it a short name up to 4 characters (e.g. E1). Place it above the logic you want to loop back to, or use the C-shaped Jump block when the label goes below the jump.',
      helpUrl: 'help.html#cat-jumps',
    },
    {
      type: 'stl_jump',
      message0: '%1 Jump to %2 when %3',
      args0: [
        { type: 'field_label', name: 'OPCODE_LABEL', text: '[JU]' },
        { type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 },
        { type: 'field_dropdown', name: 'COND', options: JUMP_COND_OPTS }
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'Jumps to a label block elsewhere in the program. Choose when to jump using the dropdown: Always, if the condition is ON or OFF, or using a previously saved value. Use this when the label is above the jump (e.g. loop back). For “skip a section if a condition is met” use the C-shaped jump block instead.',
      helpUrl: 'help.html#cat-jumps',
    },
    {
      type: 'stl_jump_c',
      message0: '%1 Jump to %2 when %3',
      args0: [
        { type: 'field_label', name: 'OPCODE_LABEL', text: '[JU]' },
        { type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 },
        { type: 'field_dropdown', name: 'COND', options: JUMP_COND_OPTS }
      ],
      message1: '  %1',
      args1: [{ type: 'input_statement', name: 'BODY' }],
      message2: '  [label:] %1',
      args2: [{ type: 'field_label', name: 'LABEL_DISPLAY', text: 'E1' }],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'Runs the blocks inside only if the jump condition is met, then continues at the label shown at the bottom. Use for "if condition, skip this section" logic. The landing label is built in — no separate label block needed.',
      helpUrl: 'help.html#cat-jumps',
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
      tooltip: 'Adds a note or description in the program — has no effect on logic. Use to explain what a section does. Note: avoid using timer names (T0–T63) as plain text in comments.',
      helpUrl: 'help.html#cat-groups',
    },
    {
      type: 'stl_nest_c',
      message0: '%1 %2 (',
      args0: [
        { type: 'field_label', name: 'OPCODE_LABEL', text: '[O]' },
        { type: 'field_dropdown', name: 'NEST_TYPE', options: NEST_TYPE_OPTS }
      ],
      message1: '  %1',
      args1: [{ type: 'input_statement', name: 'BODY' }],
      message2: ')',
      args2: [],
      previousStatement: null,
      nextStatement: null,
      colour: '#c47c30',
      tooltip: 'Groups a set of checks together like parentheses in math. All checks inside are evaluated as a unit, then combined with the checks outside using the chosen operator (OR, AND, etc.). Example: "(sensor A OR sensor B) AND sensor C".',
      helpUrl: 'help.html#cat-nesting',
    },
    {
      type: 'stl_group',
      message0: '%1 %2',
      args0: [
        { type: 'field_label', name: 'GROUP_LABEL', text: '[//Group 0:]' },
        { type: 'field_input', name: 'NAME', text: '', maxLength: 60 },
      ],
      message1: '  %1',
      args1: [{ type: 'field_label', name: 'GROUP_BYTES', text: '— bytes' }],
      previousStatement: null,
      nextStatement: null,
      colour: 230,
      tooltip: 'Names a logic group (e.g. “East Signal” or “Crossing Gate”). Each group can hold up to 256 bytes of logic — the byte count shows how full it is. Place this block at the very top of each group’s logic.',
      helpUrl: 'help.html#cat-groups',
    },
    {
      type: 'stl_var_input',
      message0: 'Input %1 Name %2 %3',
      args0: [
        { type: 'field_dropdown', name: 'VAR', options: I_OPTS },
        { type: 'field_input', name: 'NAME', text: '', maxLength: 80 },
        { type: 'input_value', name: 'RIGHT' },
      ],
      previousStatement: ['stl_var_input'],
      nextStatement: ['stl_var_input'],
      colour: 260,
      tooltip: 'Name this input (e.g. “West approach”) for reference and for JMRI export. Optionally attach Event ID blocks for true/false. Stacks with other Input blocks; order is used when exporting inputs.',
      helpUrl: 'help.html#variables',
    },
    {
      type: 'stl_var_output',
      message0: 'Output %1 Name %2 %3',
      args0: [
        { type: 'field_dropdown', name: 'VAR', options: Q_OPTS },
        { type: 'field_input', name: 'NAME', text: '', maxLength: 80 },
        { type: 'input_value', name: 'RIGHT' },
      ],
      previousStatement: ['stl_var_output'],
      nextStatement: ['stl_var_output'],
      colour: 260,
      tooltip: 'Name this output (e.g. “Signal head”) for reference and for JMRI export. Optionally attach Event ID blocks for true/false. Stacks with other Output blocks; order is used when exporting outputs.',
      helpUrl: 'help.html#variables',
    },
    {
      type: 'stl_var_transmitter',
      message0: 'Transmitter %1 Name %2 %3',
      args0: [
        { type: 'field_dropdown', name: 'CIRCUIT', options: Z_CIRCUIT_OPTS },
        { type: 'field_input', name: 'NAME', text: '', maxLength: 80 },
        { type: 'input_value', name: 'RIGHT' },
      ],
      previousStatement: ['stl_var_transmitter'],
      nextStatement: ['stl_var_transmitter'],
      colour: 260,
      tooltip: 'Name this transmitter circuit for reference and for JMRI export. Optionally attach Event ID blocks. Stacks with other Transmitter blocks; order is used when exporting transmitters.',
      helpUrl: 'help.html#variables',
    },
    {
      type: 'stl_var_receiver',
      message0: 'Receiver %1 Name %2 %3',
      args0: [
        { type: 'field_dropdown', name: 'CIRCUIT', options: Y_CIRCUIT_OPTS },
        { type: 'field_input', name: 'NAME', text: '', maxLength: 80 },
        { type: 'input_value', name: 'RIGHT' },
      ],
      previousStatement: ['stl_var_receiver'],
      nextStatement: ['stl_var_receiver'],
      colour: 260,
      tooltip: 'Name this receiver circuit for reference and for JMRI export. Optionally attach Event ID blocks. Stacks with other Receiver blocks; order is used when exporting receivers.',
      helpUrl: 'help.html#variables',
    },
    {
      type: 'stl_event_id',
      message0: 'Event ID True %1 False %2',
      args0: [
        { type: 'field_input', name: 'TRUE_ID', text: '', maxLength: 80 },
        { type: 'field_input', name: 'FALSE_ID', text: '', maxLength: 80 },
      ],
      output: 'String',
      colour: 160,
      tooltip: 'Enter the LCC event IDs for “when true” and “when false”. Plugs into the right socket of an Input, Output, Transmitter, or Receiver block; used when exporting CSV for JMRI.',
      helpUrl: 'help.html#variables',
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
