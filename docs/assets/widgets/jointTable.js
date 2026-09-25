/* jointTable: a joint probability table with marginal sums. props.rows is a list of rows;
 * the first row and the first column are headers, "?" marks the cell to find and an empty
 * string leaves a cell blank. Cells may contain TeX. */
(() => {
  "use strict";
  const D = window.DRAW;

  window.WIDGETS.jointTable = function jointTable(el, props, ctx) {
    const table = D.html("table", { class: "tbl" });
    props.rows.forEach((row, i) => {
      const tr = D.html("tr");
      row.forEach((c, j) => {
        const head = i === 0 || j === 0;
        tr.append(D.html(head ? "th" : "td", { class: !head && c === "?" ? "ask" : null, html: c }));
      });
      table.append(tr);
    });
    const parts = [table];
    if (props.caption) parts.push(D.html("div", { class: "caption", html: props.caption }));
    el.append(D.card(...parts));
    ctx.math(table);
  };
})();
