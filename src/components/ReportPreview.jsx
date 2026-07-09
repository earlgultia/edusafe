import React from 'react';

function parseCsv(text) {
  if (!text) return [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  const rows = [];
  const re = /(?:"([^"]*(?:""[^"]*)*)")|([^,]+)/g;
  for (let line of lines) {
    const fields = [];
    let match;
    let idx = 0;
    while ((match = re.exec(line)) !== null) {
      const val = match[1] !== undefined ? match[1].replace(/""/g, '"') : (match[2] || '');
      fields.push(val);
      idx += match[0].length;
      if (re.lastIndex >= line.length) break;
    }
    // fallback: split by comma if parser failed
    if (!fields.length) fields.push(...line.split(','));
    rows.push(fields.map((f) => f.replace(/^"|"$/g, '')));
  }
  return rows;
}

function ReportPreview({ open, title, csv, onClose, onDownloadCsv, onPrint, onServerExport }) {
  if (!open) return null;
  const rows = parseCsv(csv || '');
  const header = rows[0] || [];
  const body = rows.slice(1);

  return (
    <div className="sheet overlay reportPreviewOverlay" role="dialog" aria-modal="true">
      <div className="sheetCard reportPreview">
        <div className="sheetHead">
          <div>
            <strong>{title}</strong>
          </div>
        </div>

        <div className="reportPreviewBody">
          {rows.length ? (
            <div className="reportTableWrap">
              <table className="reportTable">
                <thead>
                  <tr>{header.map((h, i) => <th key={i}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {body.map((r, ri) => (
                    <tr key={ri}>{r.map((c, ci) => <td key={ci}>{c}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <pre className="reportPreviewPre">No data available</pre>
          )}
        </div>

        <div className="reportPreviewFooter">
          <div className="reportPreviewActions">
            <button className="reportActionBtn reportDownloadBtn" onClick={onDownloadCsv} title="Download as CSV file">
              <span className="material-symbols-outlined">download</span>
              <span>Download CSV</span>
            </button>
            <button className="reportActionBtn reportPrintBtn" onClick={onPrint} title="Print or save as PDF">
              <span className="material-symbols-outlined">print</span>
              <span>Print / PDF</span>
            </button>
            <button className="reportActionBtn reportServerBtn" onClick={onServerExport} title="Server export (mock)">
              <span className="material-symbols-outlined">cloud_upload</span>
              <span>Server Export</span>
            </button>
          </div>
          <button className="reportCloseBtn" onClick={onClose}>
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export { ReportPreview };
