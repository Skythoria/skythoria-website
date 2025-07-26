const colors = {
  0: '000000', 1: '0000AA', 2: '00AA00', 3: '00AAAA',
  4: 'AA0000', 5: 'AA00AA', 6: 'FFAA00', 7: 'AAAAAA',
  8: '555555', 9: '5555FF', a: '55FF55', b: '55FFFF',
  c: 'FF5555', d: 'FF55FF', e: 'FFFF55', f: 'FFFFFF'
};
const formats = {
  l: ['Bold', 'bold'], o: ['Italic', 'italic'], n: ['Underline', 'underline'],
  m: ['Strike', 'strike'], k: ['Magic', 'magic'], r: ['Reset', 'reset']
};

const input = document.getElementById('input');
const preview = document.getElementById('preview');
const buttons = document.getElementById('buttons');

for (const code in colors) {
  const btn = document.createElement('button');
  btn.textContent = `&${code}`;
  btn.className = 'color';
  btn.style.background = `#${colors[code]}`;
  btn.style.color = (parseInt(code, 16) < 5) ? '#fff' : '#000';
  btn.onclick = () => wrapSelection(`&${code}`, '&r');
  buttons.appendChild(btn);
}
for (const code in formats) {
  const [label] = formats[code];
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.className = code;
  btn.onclick = () => wrapSelection(`&${code}`, '&r');
  buttons.appendChild(btn);
}

function wrapSelection(before, after) {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const value = input.value;
  const selected = value.slice(start, end);
  const result = before + selected + after;
  input.value = value.slice(0, start) + result + value.slice(end);
  updatePreview();
}

function updatePreview() {
  const text = input.value;
  let html = '';
  let i = 0;
  let currentStyles = '';
  while (i < text.length) {
    if (text[i] === '&' && i + 1 < text.length) {
      const code = text[i + 1].toLowerCase();
      i += 2;
      if (colors[code]) {
        currentStyles = `color: #${colors[code]}; font-weight: normal; font-style: normal; text-decoration: none; animation: none;`;
        html += `<span style="${currentStyles}">`;
        continue;
      }
      if (code === 'l') html += `<span style="font-weight:bold;">`;
      else if (code === 'o') html += `<span style="font-style:italic;">`;
      else if (code === 'n') html += `<span style="text-decoration:underline;">`;
      else if (code === 'm') html += `<span style="text-decoration:line-through;">`;
      else if (code === 'k') html += `<span class="magic">`;
      else if (code === 'r') html += `</span>`;
      continue;
    } else {
      html += text[i];
      i++;
    }
  }
  preview.innerHTML = html + '</span>';
}

input.addEventListener('input', updatePreview);
updatePreview();

setInterval(() => {
  const magic = document.querySelectorAll('.magic');
  magic.forEach(el => {
    el.textContent = el.textContent.split('').map(() => String.fromCharCode(33 + Math.random() * 94)).join('');
  });
}, 100);
