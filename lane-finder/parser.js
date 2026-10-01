// อ่านข้อความที่ก๊อปจากหน้าเว็บ -> [{round, lanes: {1: "ชื่อ", ...}}]
(function (root) {
  var ROUND_RE = /(?:รอบ(?:ที่)?|round|heat|race|match|แมตช์|เฮต)\s*(?:no\.?|#|ที่)?\s*(\d+)/i;
  var LANE_RE = /(?:เลน(?:ที่)?|lane|\bL)\s*#?\s*(\d+)\s*[:：\-–.)=]?\s*/ig;

  function clean(s) {
    return String(s).replace(/\s+/g, " ").replace(/^[\s|:：\-–,;]+|[\s|:：\-–,;]+$/g, "");
  }

  // แยกข้อความที่มีหลายเลนในบรรทัดเดียว เช่น "เลน1 A เลน2 B เลน3 C"
  function lanesInLine(line) {
    var out = [], m, marks = [];
    LANE_RE.lastIndex = 0;
    while ((m = LANE_RE.exec(line)) !== null) {
      marks.push({ lane: +m[1], start: m.index, end: LANE_RE.lastIndex });
    }
    for (var i = 0; i < marks.length; i++) {
      var next = i + 1 < marks.length ? marks[i + 1].start : line.length;
      var name = clean(line.slice(marks[i].end, next));
      if (name) out.push({ lane: marks[i].lane, name: name });
    }
    return out;
  }

  function parse(text) {
    var rounds = [], cur = null, plainSeq = 0;
    function open(n) {
      cur = rounds.filter(function (r) { return r.round === n; })[0];
      if (!cur) { cur = { round: n, lanes: {} }; rounds.push(cur); }
      plainSeq = 0;
    }
    function put(lane, name) {
      if (!cur) open(rounds.length + 1);
      cur.lanes[lane] = name;
    }

    String(text).split(/\r?\n/).forEach(function (raw) {
      var line = raw.replace(/ /g, " ").trim();
      if (!line) return;

      var rm = line.match(ROUND_RE);
      var rest = line;
      if (rm) {
        open(+rm[1]);
        rest = clean(line.replace(rm[0], " "));
        if (!rest) return;
      }

      // 1) มีคำว่าเลน/Lane ในบรรทัด
      var found = lanesInLine(rest);
      if (found.length) { found.forEach(function (f) { put(f.lane, f.name); }); return; }

      // 2) แถวตาราง (tab หรือ | หรือเว้นวรรคหลายตัว) ตัวแรกเป็นเลขรอบ ที่เหลือคือเลน 1..n
      var cells = rest.split(/\t|\||\s{2,}/).map(clean).filter(Boolean);
      if (!rm && cells.length >= 3 && /^\d+$/.test(cells[0])) {
        open(+cells[0]);
        cells.slice(1).forEach(function (c, i) { put(i + 1, c); });
        return;
      }
      if (rm && cells.length >= 2) {
        cells.forEach(function (c, i) { put(i + 1, c); });
        return;
      }

      // 3) ลำดับเลขข้อ "1. ชื่อ" ใต้หัวรอบ = เลนที่ 1,2,3...
      var nm = rest.match(/^(\d{1,2})\s*[.)\-:]\s*(.+)$/);
      if (nm && cur) { put(+nm[1], clean(nm[2])); return; }

      // 4) ชื่อล้วน ๆ ใต้หัวรอบ = เลนถัดไป
      if (cur && !/^\d+$/.test(rest)) { plainSeq += 1; put(plainSeq, rest); }
    });

    rounds.sort(function (a, b) { return a.round - b.round; });
    return rounds.filter(function (r) { return Object.keys(r.lanes).length; });
  }

  function norm(s) { return String(s).toLowerCase().replace(/[\s._\-]+/g, ""); }

  function findTeam(rounds, query) {
    var q = norm(query);
    if (!q) return [];
    var hits = [];
    rounds.forEach(function (r) {
      Object.keys(r.lanes).forEach(function (lane) {
        if (norm(r.lanes[lane]).indexOf(q) !== -1) {
          hits.push({
            round: r.round, lane: +lane, name: r.lanes[lane],
            others: Object.keys(r.lanes).filter(function (l) { return l !== lane; })
              .map(function (l) { return { lane: +l, name: r.lanes[l] }; })
          });
        }
      });
    });
    return hits;
  }

  function allNames(rounds) {
    var set = {};
    rounds.forEach(function (r) {
      Object.keys(r.lanes).forEach(function (l) { set[r.lanes[l]] = true; });
    });
    return Object.keys(set);
  }

  root.LaneParser = { parse: parse, findTeam: findTeam, allNames: allNames };
  if (typeof module !== "undefined") module.exports = root.LaneParser;
})(typeof window !== "undefined" ? window : globalThis);
