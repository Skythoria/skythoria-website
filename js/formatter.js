
const colors = {
  0:'000000',1:'0000AA',2:'00AA00',3:'00AAAA',
  4:'AA0000',5:'AA00AA',6:'FFAA00',7:'AAAAAA',
  8:'555555',9:'5555FF',a:'55FF55',b:'55FFFF',
  c:'FF5555',d:'FF55FF',e:'FFFF55',f:'FFFFFF'
};
const formats = {
  l:['Bold','bold'],o:['Italic','italic'],n:['Underline','underline'],
  m:['Strike','strike'],k:['Magic','magic'],r:['Reset','reset']
};

const input = document.getElementById('input');
const preview = document.getElementById('preview');
const buttons = document.getElementById('buttons');

function wrapSelection(before, after) {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const selected = input.value.slice(start, end);
  const result = before + selected + after;
  input.setRangeText(result, start, end, 'end');
  updatePreview();
}

for (const code in colors) {
  const btn = document.createElement('button');
  btn.textContent = `&${code}`;
  btn.style.background = `#${colors[code]}`;
  btn.style.color = '#000';
  btn.onclick = () => wrapSelection(`&${code}`, '&r');
  buttons.appendChild(btn);
}
for (const code in formats) {
  const [label] = formats[code];
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.onclick = () => wrapSelection(`&${code}`, '&r');
  buttons.appendChild(btn);
}

function updatePreview() {
  const text = input.value;
  let html = '';
  let openTags = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === '&' && i + 1 < text.length) {
      const code = text[++i].toLowerCase();
      if (colors[code]) { html += `<span style="color:#${colors[code]}">`; openTags.push('</span>'); }
      else if (formats[code]) { html += `<span class="${formats[code][1]}">`; openTags.push('</span>'); }
      else if (code === 'r') { while (openTags.length) html += openTags.pop(); }
    } else {
      html += text[i];
    }
    i++;
  }
  while (openTags.length) html += openTags.pop();
  preview.innerHTML = html;
}
input.addEventListener('input', updatePreview);
updatePreview();
