export function timeAgo(dateInput) {
  if (!dateInput) return 'Just now';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return 'Just now';

  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;

  if (interval >= 1) {
    const v = Math.floor(interval);
    return v + (v === 1 ? " year ago" : " years ago");
  }
  interval = seconds / 2592000;
  if (interval >= 1) {
    const v = Math.floor(interval);
    return v + (v === 1 ? " month ago" : " months ago");
  }
  interval = seconds / 86400;
  if (interval >= 1) {
    const v = Math.floor(interval);
    return v + (v === 1 ? " day ago" : " days ago");
  }
  interval = seconds / 3600;
  if (interval >= 1) {
    const v = Math.floor(interval);
    return v + (v === 1 ? " hr ago" : " hrs ago");
  }
  interval = seconds / 60;
  if (interval >= 1) {
    const v = Math.floor(interval);
    return v + (v === 1 ? " min ago" : " mins ago");
  }
  return "Just now";
}
