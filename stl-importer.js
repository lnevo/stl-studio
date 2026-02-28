/**
 * STL importer: parse pasted STL text and build Blockly XML so it can be loaded.
 * Supports: CLR, SET, A/O/AN/ON Ix.x, =/S/R Qx.x, label:, JC/JCN/JU label, // comment.
 */
(function (global) {
  var Blockly = global.Blockly;
  if (!Blockly || !Blockly.Xml) return;

  var I_Q_REGEX = /^[IQ]\d{1,2}\.\d$/;
  var M_Y_Z_REGEX = /^[MYZ]\d{1,2}\.\d$/;
  var T_REGEX = /^T\d{1,2}$/;
  function validVar(s) {
    if (!s) return false;
    s = s.trim().toUpperCase();
    return I_Q_REGEX.test(s) || /^[IQ]\d{1,2}\.\d$/.test(s);
  }
  function validMQYZ(s) {
    if (!s) return false;
    s = s.trim().toUpperCase();
    return M_Y_Z_REGEX.test(s) || /^[MYZ]\d{1,2}\.\d$/.test(s);
  }
  function validTimer(s) {
    if (!s) return false;
    s = s.trim().toUpperCase();
    if (!T_REGEX.test(s)) return false;
    var n = parseInt(s.slice(1), 10);
    return n >= 0 && n <= 63;
  }
  function validLogicVar(s) {
    return validVar(s) || validMQYZ(s) || validTimer(s);
  }
  function validRVar(s) {
    return validVar(s) || validMQYZ(s) || validTimer(s);
  }
  function validSVar(s) {
    return validVar(s) || validMQYZ(s);
  }
  function normVar(s) {
    s = (s || '').trim().toUpperCase();
    if (validTimer(s)) return s;
    if (validVar(s) || validMQYZ(s)) return s;
    return s;
  }

  /** Parse L (load). If value is W#base#value, return stl_l_time with VALUE and SCALE; else stl_l. */
  function parseL(rest) {
    rest = (rest || '').trim();
    var match = /^W#(\d)#(\d+)$/i.exec(rest);
    if (match) {
      var base = parseInt(match[1], 10);
      var val = parseInt(match[2], 10);
      if (base >= 1 && base <= 4 && val >= 0 && val <= 999) {
        return { type: 'stl_l_time', fields: { VALUE: val, SCALE: String(base) } };
      }
    }
    return { type: 'stl_l', fields: { VALUE: rest || '' } };
  }

  function blockXml(type, fields, nextXml) {
    var xml = '<block type="' + type + '" x="0" y="0">';
    if (fields) {
      for (var key in fields) xml += '<field name="' + key + '">' + escapeXml(String(fields[key])) + '</field>';
    }
    if (nextXml) xml += '<next>' + nextXml + '</next>';
    xml += '</block>';
    return xml;
  }

  function escapeXml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /**
   * Parse a single STL line; return { type, fields } or null.
   * Line can have trailing // comment (we strip it for the instruction).
   */
  function parseLine(line) {
    var raw = line.trim();
    var commentIdx = raw.indexOf('//');
    var comment = '';
    if (commentIdx >= 0) {
      comment = raw.slice(commentIdx + 2).trim();
      raw = raw.slice(0, commentIdx).trim();
    }
    if (!raw) return comment ? { type: 'stl_comment', fields: { TEXT: comment } } : null;

    var parts = raw.split(/\s+/);
    var op = (parts[0] || '').toUpperCase();
    var arg = parts[1] || '';

    switch (op) {
      case 'CLR':
        return { type: 'stl_clear', fields: {} };
      case 'SET':
        return { type: 'stl_set', fields: {} };
      case 'A':
        return validLogicVar(arg) ? { type: 'stl_and', fields: { VAR: normVar(arg) } } : null;
      case 'LD':
        return validLogicVar(arg) ? { type: 'stl_and', fields: { VAR: normVar(arg) } } : null;
      case 'O':
        if (!arg || arg === '(') return null;
        return validLogicVar(arg) ? { type: 'stl_or', fields: { VAR: normVar(arg) } } : null;
      case 'AN':
        return validLogicVar(arg) ? { type: 'stl_and_not', fields: { VAR: normVar(arg) } } : null;
      case 'ON':
        return validLogicVar(arg) ? { type: 'stl_or_not', fields: { VAR: normVar(arg) } } : null;
      case 'NOT':
        return { type: 'stl_not', fields: {} };
      case '=':
        return (validVar(arg) || validMQYZ(arg)) ? { type: 'stl_assign', fields: { VAR: normVar(arg) } } : null;
      case 'S':
        return validSVar(arg) ? { type: 'stl_s', fields: { VAR: normVar(arg) } } : null;
      case 'R':
        return validRVar(arg) ? { type: 'stl_r', fields: { VAR: normVar(arg) } } : null;
      case 'JC':
        return { type: 'stl_jc', fields: { LABEL: (arg || 'E1').slice(0, 4) } };
      case 'JCN':
        return { type: 'stl_jcn', fields: { LABEL: (arg || 'E1').slice(0, 4) } };
      case 'JU':
        return { type: 'stl_ju', fields: { LABEL: (arg || 'E1').slice(0, 4) } };
      case 'L':
        return parseL(parts.slice(1).join(' ').trim());
      case 'SD':
        return validTimer(arg) ? { type: 'stl_sd', fields: { TIMER: normVar(arg) } } : null;
      case 'FR':
        return validTimer(arg) ? { type: 'stl_fr', fields: { TIMER: normVar(arg) } } : null;
      case 'O(':
      case ')':
        return null;
      default:
        if (/^[A-Za-z0-9]{1,4}:$/.test(op)) {
          return { type: 'stl_label', fields: { LABEL: op.slice(0, -1).slice(0, 4) } };
        }
        if (/^[A-Za-z0-9]{1,4}:$/.test(raw)) {
          return { type: 'stl_label', fields: { LABEL: raw.slice(0, -1).slice(0, 4) } };
        }
        return null;
    }
  }

  /** Variable pattern for compact parsing: I0.0, Q0.0, M0.0, Y0.0, Z0.0, T0-T63 */
  var VAR_PATTERN = '(?:[IQMYZ]\\d{1,2}\\.\\d|T\\d{1,2})';
  var OPT = '\\s*';
  var LABEL_PATTERN = '[A-Za-z0-9]{1,4}';

  /**
   * Parse one or more statements from a line (compact form: no spaces, e.g. CLR=Q0.0 or OQ0.1=Q0.0).
   * Returns an array of { type, fields }; tries compact first, then falls back to single-statement parseLine.
   */
  function parseLineCompact(line) {
    var raw = line.trim();
    var commentIdx = raw.indexOf('//');
    var comment = '';
    if (commentIdx >= 0) {
      comment = raw.slice(commentIdx + 2).trim();
      raw = raw.slice(0, commentIdx).trim();
    }
    if (!raw) return comment ? [{ type: 'stl_comment', fields: { TEXT: comment } }] : [];

    var list = [];
    var rest = raw;
    var triedCompact = false;

    while (rest.length > 0) {
      rest = rest.replace(/^\s+/, '');
      if (rest.length === 0) break;

      var m;
      if ((m = /^CLR/i.exec(rest))) {
        list.push({ type: 'stl_clear', fields: {} });
        rest = rest.slice(m[0].length);
        triedCompact = true;
        continue;
      }
      if ((m = /^SET/i.exec(rest))) {
        list.push({ type: 'stl_set', fields: {} });
        rest = rest.slice(m[0].length);
        triedCompact = true;
        continue;
      }
      if ((m = /^NOT/i.exec(rest))) {
        list.push({ type: 'stl_not', fields: {} });
        rest = rest.slice(m[0].length);
        triedCompact = true;
        continue;
      }
      if ((m = new RegExp('^ON' + OPT + '(' + VAR_PATTERN + ')', 'i').exec(rest))) {
        list.push({ type: 'stl_or_not', fields: { VAR: normVar(m[1]) } });
        rest = rest.slice(m[0].length);
        triedCompact = true;
        continue;
      }
      if ((m = new RegExp('^O' + OPT + '(' + VAR_PATTERN + ')', 'i').exec(rest))) {
        list.push({ type: 'stl_or', fields: { VAR: normVar(m[1]) } });
        rest = rest.slice(m[0].length);
        triedCompact = true;
        continue;
      }
      if ((m = new RegExp('^AN' + OPT + '(' + VAR_PATTERN + ')', 'i').exec(rest))) {
        list.push({ type: 'stl_and_not', fields: { VAR: normVar(m[1]) } });
        rest = rest.slice(m[0].length);
        triedCompact = true;
        continue;
      }
      if ((m = new RegExp('^A' + OPT + '(' + VAR_PATTERN + ')', 'i').exec(rest))) {
        list.push({ type: 'stl_and', fields: { VAR: normVar(m[1]) } });
        rest = rest.slice(m[0].length);
        triedCompact = true;
        continue;
      }
      if ((m = new RegExp('^=' + OPT + '(' + VAR_PATTERN + ')', 'i').exec(rest))) {
        list.push({ type: 'stl_assign', fields: { VAR: normVar(m[1]) } });
        rest = rest.slice(m[0].length);
        triedCompact = true;
        continue;
      }
      if ((m = new RegExp('^S' + OPT + '(' + VAR_PATTERN + ')', 'i').exec(rest))) {
        if (validSVar(m[1])) {
          list.push({ type: 'stl_s', fields: { VAR: normVar(m[1]) } });
          rest = rest.slice(m[0].length);
          triedCompact = true;
          continue;
        }
      }
      if ((m = new RegExp('^R' + OPT + '(' + VAR_PATTERN + ')', 'i').exec(rest))) {
        if (validRVar(m[1])) {
          list.push({ type: 'stl_r', fields: { VAR: normVar(m[1]) } });
          rest = rest.slice(m[0].length);
          triedCompact = true;
          continue;
        }
      }
      if ((m = /^L(W#\d#\d+)/i.exec(rest))) {
        var lResult = parseL(m[1]);
        list.push(lResult);
        rest = rest.slice(m[0].length);
        triedCompact = true;
        continue;
      }
      if ((m = /^L\s*(\S+)/.exec(rest))) {
        var lResult = parseL(m[1]);
        list.push(lResult);
        rest = rest.slice(m[0].length);
        triedCompact = true;
        continue;
      }
      if ((m = new RegExp('^SD' + OPT + '(T\\d{1,2})', 'i').exec(rest)) && validTimer(m[1])) {
        list.push({ type: 'stl_sd', fields: { TIMER: normVar(m[1]) } });
        rest = rest.slice(m[0].length);
        triedCompact = true;
        continue;
      }
      if ((m = new RegExp('^FR' + OPT + '(T\\d{1,2})', 'i').exec(rest)) && validTimer(m[1])) {
        list.push({ type: 'stl_fr', fields: { TIMER: normVar(m[1]) } });
        rest = rest.slice(m[0].length);
        triedCompact = true;
        continue;
      }
      if ((m = new RegExp('^JC(' + LABEL_PATTERN + ')', 'i').exec(rest))) {
        list.push({ type: 'stl_jc', fields: { LABEL: m[1].slice(0, 4) } });
        rest = rest.slice(m[0].length);
        triedCompact = true;
        continue;
      }
      if ((m = new RegExp('^JCN(' + LABEL_PATTERN + ')', 'i').exec(rest))) {
        list.push({ type: 'stl_jcn', fields: { LABEL: m[1].slice(0, 4) } });
        rest = rest.slice(m[0].length);
        triedCompact = true;
        continue;
      }
      if ((m = new RegExp('^JU(' + LABEL_PATTERN + ')', 'i').exec(rest))) {
        list.push({ type: 'stl_ju', fields: { LABEL: m[1].slice(0, 4) } });
        rest = rest.slice(m[0].length);
        triedCompact = true;
        continue;
      }
      if ((m = new RegExp('^(' + LABEL_PATTERN + '):').exec(rest))) {
        list.push({ type: 'stl_label', fields: { LABEL: m[1].slice(0, 4) } });
        rest = rest.slice(m[0].length);
        triedCompact = true;
        continue;
      }

      if (triedCompact) {
        rest = rest.slice(1);
        continue;
      }
      var single = parseLine(line);
      if (single) list.push(single);
      break;
    }

    if (comment && list.length > 0) list.push({ type: 'stl_comment', fields: { TEXT: comment } });
    return list;
  }

  /**
   * Parse full STL text into a list of block descriptors.
   * Supports both normal (space-separated) and compact (e.g. CLR=Q0.0, OQ0.1=Q0.0) lines.
   */
  function parseStlText(text) {
    var list = [];
    var lines = (text || '').split(/\n/);
    for (var i = 0; i < lines.length; i++) {
      var parsedList = parseLineCompact(lines[i]);
      for (var j = 0; j < parsedList.length; j++) list.push(parsedList[j]);
    }
    return list;
  }

  /**
   * Build Blockly XML from a list of block descriptors (one stack).
   * Flat list of sibling blocks (no <next> nesting) so domToWorkspace doesn't throw "Block has parent";
   * the app connects them after load.
   */
  var FLAT_BLOCK_SPACING = 50;
  function buildXml(list) {
    if (list.length === 0) return '';
    var parts = [];
    for (var i = 0; i < list.length; i++) {
      parts.push(blockXml(list[i].type, list[i].fields, null));
    }
    var xml = '<xml xmlns="https://developers.google.com/blockly/xml">';
    for (var j = 0; j < parts.length; j++) {
      xml += parts[j].replace('x="0" y="0"', 'x="20" y="' + (j * FLAT_BLOCK_SPACING) + '"');
    }
    xml += '</xml>';
    return xml;
  }

  /**
   * Import pasted STL into the workspace. Returns { success, message, xml }.
   */
  function importStl(text) {
    var list = parseStlText(text);
    if (list.length === 0) {
      return { success: false, message: 'No valid STL lines found. Paste lines like CLR, SET, A I0.0, = Q0.0, E1:, JC E1, // comment.' };
    }
    var xml = buildXml(list);
    return { success: true, message: 'Imported ' + list.length + ' statement(s).', xml: xml };
  }

  global.stlImporter = {
    parseStlText: parseStlText,
    importStl: importStl,
    buildXml: buildXml
  };
})(typeof window !== 'undefined' ? window : this);
