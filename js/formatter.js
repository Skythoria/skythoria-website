const colors = {
  0: '000000', 1: '0000AA', 2: '00AA00', 3: '00AAAA',
  4: 'AA0000', 5: 'AA00AA', 6: 'FFAA00', 7: 'AAAAAA',
  8: '555555', 9: '5555FF', a: '55FF55', b: '55FFFF',
  c: 'FF5555', d: 'FF55FF', e: 'FFFF55', f: 'FFFFFF'
};
const formats = {
  l: ['Bold'], o: ['Italic'], n: ['Underline'],
  m: ['Strike'], k: ['Magic'], r: ['Reset']
};
const input = document.getElementById('input');
const output = document.getElementById('output');
const preview = document.getElementById('preview');
const buttons = document.getElementById('buttons');

for (const code in colors) {
  const btn = document.createElement('button');
  btn.textContent = `&${code}`;
  btn.style.background = `#${colors[code]}`;
  btn.style.color = parseInt(code, 16) < 5 ? '#fff' : '#000';
  btn.onclick = () => wrapSelection(`&${code}`, '&r');
  buttons.appendChild(btn);
}
for (const code in formats) {
  const btn = document.createElement('button');
  btn.textContent = formats[code][0];
  btn.onclick = () => wrapSelection(`&${code}`, '&r');
  buttons.appendChild(btn);
}

function wrapSelection(before, after) {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const selected = input.value.slice(start, end);
  const result = before + selected + after;
  input.value = input.value.slice(0, start) + result + input.value.slice(end);
  updatePreview();
}

function updatePreview() {
  const text = input.value;
  output.textContent = text;
  let html = '';
  let i = 0;
  while (i < text.length) {
    if (text[i] === '&' && i + 1 < text.length) {
      const code = text[i + 1].toLowerCase();
      i += 2;
      if (colors[code]) {
        html += `<span style="color:#${colors[code]}">`;
        continue;
      }
      if (code === 'l') { html += '<b>'; continue; }
      if (code === 'o') { html += '<i>'; continue; }
      if (code === 'n') { html += '<u>'; continue; }
      if (code === 'm') { html += '<s>'; continue; }
      if (code === 'r') { html += '</span></b></i></u></s>'; continue; }
    } else {
      html += text[i++];
    }
  }
  html += '</span></b></i></u></s>';
  preview.innerHTML = html;
}

function copyText() {
  navigator.clipboard.writeText(output.textContent)
    .then(() => alert('Copied to clipboard!'));
}