const fs = require('fs');
const path = require('path');
const docx = require('docx');

const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle } = docx;

const mdPath = path.join(__dirname, '..', '算法逻辑说明.md');
const md = fs.readFileSync(mdPath, 'utf-8');

const lines = md.split('\n');
const children = [];

let tableLines = [];
let inTable = false;
let inCode = false;

function flushTable() {
  if (tableLines.length < 2) {
    tableLines = [];
    return;
  }
  const rows = [];
  let isHeader = true;
  for (const line of tableLines) {
    if (!line.trim().startsWith('|')) continue;
    if (line.includes('---')) {
      isHeader = false;
      continue;
    }
    const cells = line.split('|').map((s) => s.trim()).filter((s) => s);
    const rowCells = cells.map((text) => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text, bold: isHeader, font: '微软雅黑', size: 22 })],
      })],
    }));
    rows.push(new TableRow({ children: rowCells }));
    isHeader = false;
  }
  if (rows.length > 0) {
    children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
  }
  tableLines = [];
}

for (const line of lines) {
  if (line.trim().startsWith('```')) {
    if (inCode) {
      const code = tableLines.join('\n');
      children.push(new Paragraph({
        children: [new TextRun({ text: code, font: 'Consolas', size: 20 })],
      }));
      tableLines = [];
      inCode = false;
    } else {
      inCode = true;
    }
    continue;
  }

  if (inCode) {
    tableLines.push(line);
    continue;
  }

  if (line.trim().startsWith('|')) {
    inTable = true;
    tableLines.push(line);
    continue;
  } else if (inTable) {
    flushTable();
    inTable = false;
  }

  if (line.trim() === '') continue;
  if (line.trim() === '---') continue;

  if (line.startsWith('# ')) {
    children.push(new Paragraph({
      text: line.replace('# ', ''),
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 200 },
    }));
  } else if (line.startsWith('## ')) {
    children.push(new Paragraph({
      text: line.replace('## ', ''),
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 250, after: 150 },
    }));
  } else if (line.startsWith('### ')) {
    children.push(new Paragraph({
      text: line.replace('### ', ''),
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 200, after: 100 },
    }));
  } else if (line.startsWith('- ')) {
    children.push(new Paragraph({
      children: [new TextRun({ text: '• ' + line.replace('- ', ''), font: '微软雅黑', size: 22 })],
      spacing: { before: 60, after: 60 },
    }));
  } else if (line.trim().startsWith('|')) {
    // handled above
  } else {
    // Inline code `text`
    const parts = line.split(/(`[^`]+`)/g);
    const runs = [];
    for (const part of parts) {
      if (part.startsWith('`') && part.endsWith('`')) {
        runs.push(new TextRun({ text: part.slice(1, -1), font: 'Consolas', size: 22 }));
      } else {
        runs.push(new TextRun({ text: part, font: '微软雅黑', size: 22 }));
      }
    }
    children.push(new Paragraph({
      children: runs,
      spacing: { before: 80, after: 80 },
    }));
  }
}

flushTable();

const doc = new Document({
  sections: [{
    properties: {
      page: {
        margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
      },
    },
    children,
  }],
  styles: {
    default: {
      document: {
        run: {
          font: '微软雅黑',
          size: 22,
        },
      },
    },
  },
});

const outPath = path.join(__dirname, '..', '算法逻辑说明.docx');
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log('DOCX generated:', outPath);
});
