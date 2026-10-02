let user = requireAuth();

// Pictures are shrunk to this size before saving, so they stay small enough
// for the browser's storage.
const PHOTO_SIZE = 256;

function renderProfile() {
  renderShell('');
  document.getElementById('profile-avatar').innerHTML = avatarHtml(user);
  document.getElementById('photo-btn').textContent = user.photo ? 'Change picture' : 'Add picture';
  document.getElementById('photo-remove-btn').hidden = !user.photo;
}

// Crops the chosen image to a centred square and returns it as a small JPEG.
function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = PHOTO_SIZE;
      canvas.height = PHOTO_SIZE;
      canvas.getContext('2d').drawImage(
        img,
        (img.width - side) / 2, (img.height - side) / 2, side, side,
        0, 0, PHOTO_SIZE, PHOTO_SIZE
      );
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable image'));
    };
    img.src = url;
  });
}

if (user) {
  document.getElementById('back-link').href = dashboardFor(user);
  document.getElementById('profile-name').textContent = user.name;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-role').textContent = user.role === 'facilitator' ? 'Facilitator' : 'Learner';
  renderProfile();

  if (user.role === 'student') {
    const input = document.getElementById('photo-input');
    const errorEl = document.getElementById('photo-error');
    document.getElementById('photo-actions').hidden = false;

    document.getElementById('photo-btn').addEventListener('click', () => input.click());

    input.addEventListener('change', async () => {
      const file = input.files[0];
      input.value = '';
      errorEl.textContent = '';
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        errorEl.textContent = 'Please choose an image file.';
        return;
      }

      try {
        const photo = await resizePhoto(file);
        user = updateCurrentUser({ photo });
        renderProfile();
        flashMessage('Profile picture updated.');
      } catch (e) {
        errorEl.textContent = e.name === 'QuotaExceededError'
          ? 'This browser has no space left to save the picture.'
          : 'That picture could not be used. Please try another one.';
      }
    });

    document.getElementById('photo-remove-btn').addEventListener('click', () => {
      errorEl.textContent = '';
      user = updateCurrentUser({ photo: '' });
      renderProfile();
      flashMessage('Profile picture removed.');
    });
  }
}
