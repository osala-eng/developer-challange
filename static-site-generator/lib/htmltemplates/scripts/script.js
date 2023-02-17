const goHome = () => window.location = '/';
const showMenu = (data) => console.log(data);


const blocks = document.querySelectorAll('pre');

/**
 * Copy contents of code to clipboard
 * @param {HTMLPreElement} block 
 * @param {HTMLButtonElement} copyIcon
 */
const copyCode = async (block, copyIcon) => {
  const code = block.querySelector('code');
  const notify = copyIcon.querySelector('span');
  const text = code.innerText;
  await navigator.clipboard.writeText(text)
    .then(() => {
      notify.style.display = 'block'
      setTimeout(() => (notify.style.display = 'none'), 2000)
    })
}

blocks.forEach(block => {
  const copyIcon = document.createElement('button');
  copyIcon.className = 'copy-btn';
  copyIcon.innerHTML = '<i class="fa-regular fa-copy"></i>';
  const notify = document.createElement('span');
  notify.innerText = 'Copied to clipboard!';
  notify.className = 'text-to-clipboard';
  notify.style.display = 'none'
  copyIcon.appendChild(notify);
  block.appendChild(copyIcon);
  copyIcon.addEventListener('click', async () => await copyCode(block, copyIcon));
});
