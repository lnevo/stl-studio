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
  function circuitOpts(prefix, n) {
    const opts = [];
    for (let i = 0; i < n; i++) opts.push([prefix + i, prefix + i]);
    return opts;
  }
  const Z_CIRCUIT_OPTS = circuitOpts('Z', 16);
  const Y_CIRCUIT_OPTS = circuitOpts('Y', 16);

  var defineBlocks = (Blockly.common && Blockly.common.defineBlocksWithJsonArray) || (Blockly.defineBlocksWithJsonArray);
  if (!defineBlocks) return;
  defineBlocks([
    {
      type: 'stl_clear',
      message0: '[CLR] Clear the current result (start fresh)',
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Start a new logic condition from scratch. Use at the beginning of a group when you want to build a fresh “AND/OR” chain before turning an output on or off.',
    },
    {
      type: 'stl_set',
      message0: '[SET] Set the current result to ON',
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Force the logic result to “true” so the next blocks run. Use when you want to unconditionally run the following outputs or jumps.',
    },
    {
      type: 'stl_and',
      message0: '[A] Check that %1 is ON (AND)',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: LOGIC_VAR_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'AND: continue only if this input (or output/timer) is ON and everything above was already true. Use to require “this AND that” in your condition.',
    },
    {
      type: 'stl_or',
      message0: '[O] Check that %1 is ON (OR)',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: LOGIC_VAR_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'OR: continue if this input (or output/timer) is ON or anything above was already true. Use when “either this OR that” is enough.',
    },
    {
      type: 'stl_and_not',
      message0: '[AN] Check that %1 is OFF (AND NOT)',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: LOGIC_VAR_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'AND NOT: continue only if this input is OFF and everything above was true. Use to require “this must be off” in your condition.',
    },
    {
      type: 'stl_or_not',
      message0: '[ON] Check that %1 is OFF (OR NOT)',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: LOGIC_VAR_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'OR NOT: continue if this input is OFF or anything above was true. Use when “either something above is true OR this is off”.',
    },
    {
      type: 'stl_x',
      message0: '[X] Exclusive OR: %1',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: LOGIC_VAR_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'XOR: result is true only when exactly one of “previous result” and “this input” is ON (not both). Use for “one or the other, but not both” (e.g. two buttons, only one allowed).',
    },
    {
      type: 'stl_xn',
      message0: '[XN] Exclusive OR NOT: %1',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: LOGIC_VAR_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'XOR NOT: result is true when the previous result and this input are the same (both ON or both OFF). Use for “match” logic.',
    },
    {
      type: 'stl_not',
      message0: '[NOT] Invert the result',
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Invert the current result: if it was true, it becomes false, and vice versa. The next block uses this flipped value.',
    },
    {
      type: 'stl_save',
      message0: '[SAVE] Save RLO to BR',
      previousStatement: null,
      nextStatement: null,
      colour: 180,
      tooltip: 'Save the current logic result so you can use it later with “Jump if BR” (JBI/JNBI) or “Jump with BR” (JCB/JNB). Put SAVE right before those jump blocks when you need to branch on a saved condition.',
    },
    {
      type: 'stl_assign',
      message0: '[=] Set %1 to result (ON or OFF)',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: Q_OPTS.concat(Z_OPTS, M_OPTS) }],
      previousStatement: null,
      nextStatement: null,
      colour: 0,
      tooltip: 'Copy the current logic result to this output, transmitter, or memory bit: if the condition above is true, it turns ON; if false, it turns OFF. Use for the main “then do this” action.',
    },
    {
      type: 'stl_s',
      message0: '[S] Turn ON (latch) %1',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: Q_OPTS.concat(M_OPTS) }],
      previousStatement: null,
      nextStatement: null,
      colour: 0,
      tooltip: 'Turn this output or memory bit ON and leave it ON until something else turns it OFF (latch). Use for “set” or “energize” actions (e.g. start a relay).',
    },
    {
      type: 'stl_l',
      message0: 'Load value (advanced) %1',
      args0: [{ type: 'field_input', name: 'VALUE', text: '', maxLength: 24 }],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Advanced: load a raw timer value (e.g. W#1#50). Prefer “Load time preset” below for normal timer setup.',
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
      tooltip: 'Set the delay for a timer: “count × scale” (e.g. 2 × 1 s = 2 seconds). Place this block once per timer, then use a “Start timer” block (SD, SE, SP, SS, or SF) to run it.',
    },
    {
      type: 'stl_sd',
      message0: '[SD] Start timer %1 (on-delay)',
      args0: [{ type: 'field_dropdown', name: 'TIMER', options: T_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'On-delay: when the condition above becomes true, the timer runs; the timer output turns ON only after the preset time. Use for “wait X seconds then act”.',
    },
    {
      type: 'stl_se',
      message0: '[SE] Start timer %1 (extended pulse)',
      args0: [{ type: 'field_dropdown', name: 'TIMER', options: T_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Extended pulse: when the condition goes true, the timer output turns ON for the full preset time, even if the condition goes false earlier. Use for a minimum pulse length.',
    },
    {
      type: 'stl_sp',
      message0: '[SP] Start timer %1 (pulse)',
      args0: [{ type: 'field_dropdown', name: 'TIMER', options: T_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Pulse: when the condition goes true, the timer output turns ON for the preset time, or until the condition goes false (whichever comes first). Use for a timed pulse that can be cut short.',
    },
    {
      type: 'stl_ss',
      message0: '[SS] Start timer %1 (retentive on-delay)',
      args0: [{ type: 'field_dropdown', name: 'TIMER', options: T_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Retentive on-delay: the timer adds up how long the condition has been true; when total time reaches the preset, the output turns ON (and stays ON until reset). Use for “total accumulated time” logic.',
    },
    {
      type: 'stl_sf',
      message0: '[SF] Start timer %1 (off-delay)',
      args0: [{ type: 'field_dropdown', name: 'TIMER', options: T_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Off-delay: when the condition goes from true to false, the timer starts; its output stays ON for the preset time, then turns OFF. Use for “keep output on for X seconds after input drops”.',
    },
    {
      type: 'stl_fr',
      message0: '[FR] Enable timer %1 to run',
      args0: [{ type: 'field_dropdown', name: 'TIMER', options: T_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: 200,
      tooltip: 'Enable this timer so it can run. Some timer types need FR in the scan where they are used; add it in the same group as the timer start (SD, SE, SP, SS, SF) if required.',
    },
    {
      type: 'stl_fp',
      message0: '[FP] Edge Positive %1',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: M_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: '#b8a83a',
      tooltip: 'Edge Positive: result is true for one scan when this memory bit changes from OFF to ON. Use to detect a rising edge (e.g. button just pressed, one-shot trigger).',
    },
    {
      type: 'stl_fn',
      message0: '[FN] Edge Negative %1',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: M_OPTS }],
      previousStatement: null,
      nextStatement: null,
      colour: '#b8a83a',
      tooltip: 'Edge Negative: result is true for one scan when this memory bit changes from ON to OFF. Use to detect a falling edge (e.g. button released).',
    },
    {
      type: 'stl_r',
      message0: '[R] Turn OFF or reset %1',
      args0: [{ type: 'field_dropdown', name: 'VAR', options: Q_AND_T_OPTS.concat(M_OPTS) }],
      previousStatement: null,
      nextStatement: null,
      colour: 0,
      tooltip: 'Turn this output or memory bit OFF, or reset the timer to zero. Use for “reset”, “stop”, or “turn off” actions.',
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
      tooltip: 'A named target for jumps. Give it a short name (e.g. E1); then use “Jump to” blocks with the same name. Use this when the label appears above the jump (e.g. top of a loop). For “jump then code then label”, use the C-shaped jump blocks instead.',
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
      tooltip: 'If the current condition is true, jump to the label you name. Use when the label block appears earlier in your program (e.g. loop back). For “if true, run some blocks, then land at a label”, use the C-shaped [JC] block instead.',
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
      tooltip: 'If the current condition is false, jump to the label you name. Use when the label block appears earlier (e.g. skip ahead when condition fails). For “if false, run some blocks, then land at a label”, use the C-shaped [JCN] block instead.',
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
      tooltip: 'Always jump to the label you name (no condition). Use for “go to” or “loop back” when the label appears earlier. For “run some blocks then land at a label”, use the C-shaped [JU] block instead.',
    },
    {
      type: 'stl_jcb',
      message0: '[JCB] If RLO=1 (with BR), jump to %1',
      args0: [{ type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 }],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'If the current result is true, save it and jump to the label. Use after a [SAVE] block when you need to jump on “condition was true” and still have that value stored for later (e.g. JBI/JNBI).',
    },
    {
      type: 'stl_jnb',
      message0: '[JNB] If RLO=0 (with BR), jump to %1',
      args0: [{ type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 }],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'If the current result is false, save it and jump to the label. Use after a [SAVE] block when you need to jump on “condition was false” and keep that value for later (e.g. JBI/JNBI).',
    },
    {
      type: 'stl_jbi',
      message0: '[JBI] If BR=1, jump to %1',
      args0: [{ type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 }],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'If the value you saved with [SAVE] (and optionally JCB/JNB) is true, jump to the label. Use when you stored a condition earlier and now want to branch on “was it true?”.',
    },
    {
      type: 'stl_jnbi',
      message0: '[JNBI] If BR=0, jump to %1',
      args0: [{ type: 'field_input', name: 'LABEL', text: 'E1', maxLength: 4 }],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'If the value you saved with [SAVE] (and optionally JCB/JNB) is false, jump to the label. Use when you stored a condition earlier and now want to branch on “was it false?”.',
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
      tooltip: 'If the condition is true, run the blocks inside, then continue at the label shown at the bottom. Use when you want “if true, do this, then jump to here” in one block.',
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
      tooltip: 'If the condition is false, run the blocks inside, then continue at the label shown at the bottom. Use when you want “if false, do this, then jump to here” in one block.',
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
      tooltip: 'Always run the blocks inside, then continue at the label shown at the bottom. Use when you want “do this, then jump to here” with no condition.',
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
      tooltip: 'Add a comment or note in your program. It does not change behavior. Avoid using T0–T63 as plain text in comments (those are timer names).',
    },
    {
      type: 'stl_or_group_c',
      message0: '[O(] OR nest ( … )',
      message1: '  %1',
      args1: [{ type: 'input_statement', name: 'BODY' }],
      previousStatement: null,
      nextStatement: null,
      colour: '#c47c30',
      tooltip: 'Start a grouped OR: the next blocks are combined with OR until the matching “Nest end”. Use when you need “(A OR B OR C)” style logic.',
    },
    {
      type: 'stl_on_group_c',
      message0: '[ON(] OR NOT nest ( … )',
      message1: '  %1',
      args1: [{ type: 'input_statement', name: 'BODY' }],
      previousStatement: null,
      nextStatement: null,
      colour: '#c47c30',
      tooltip: 'Start a grouped OR NOT nest. The next blocks are combined with OR NOT until the matching “Nest end”. Use for “(… OR NOT …)” style logic.',
    },
    {
      type: 'stl_and_group_c',
      message0: '[A(] AND nest ( … )',
      message1: '  %1',
      args1: [{ type: 'input_statement', name: 'BODY' }],
      previousStatement: null,
      nextStatement: null,
      colour: '#c47c30',
      tooltip: 'Start a grouped AND: the next blocks are combined with AND until the matching “Nest end”. Use when you need “(A AND B AND C)” style logic.',
    },
    {
      type: 'stl_x_group_c',
      message0: '[X(] XOR nest ( … )',
      message1: '  %1',
      args1: [{ type: 'input_statement', name: 'BODY' }],
      previousStatement: null,
      nextStatement: null,
      colour: '#c47c30',
      tooltip: 'Start a grouped XOR nest. The next blocks are combined with XOR until the matching “Nest end”. Use for “exactly one of these” logic.',
    },
    {
      type: 'stl_xn_group_c',
      message0: '[XN(] XOR NOT nest ( … )',
      message1: '  %1',
      args1: [{ type: 'input_statement', name: 'BODY' }],
      previousStatement: null,
      nextStatement: null,
      colour: '#c47c30',
      tooltip: 'Start a grouped XOR NOT nest. The next blocks are combined with XOR NOT until the matching “Nest end”.',
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
      colour: 230,
      tooltip: 'Give this section of logic a name (e.g. “Main”, “Crossing”). The byte count below shows how much of the 256-byte-per-group limit you have used. Place at the top of the blocks that belong to this group. Empty name becomes “Default”.',
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
