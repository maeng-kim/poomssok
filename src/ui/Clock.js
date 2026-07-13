// Live-updates a taskbar clock element in the classic Windows "오전/오후 h:mm" style.
export function startClock(el) {
  if (!el) return;
  const update = () => {
    const now = new Date();
    const hours24 = now.getHours();
    const period = hours24 < 12 ? '오전' : '오후';
    const hours12 = hours24 % 12 || 12;
    const minutes = String(now.getMinutes()).padStart(2, '0');
    el.textContent = `${period} ${hours12}:${minutes}`;
  };
  update();
  return setInterval(update, 15000);
}
