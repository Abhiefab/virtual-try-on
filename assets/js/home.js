document.addEventListener('DOMContentLoaded', () => {
  const loginFormEl = document.getElementById('loginForm');
  const signupFormEl = document.getElementById('signupForm');
  const showSignup = document.getElementById('showSignup');
  const showLogin = document.getElementById('showLogin');
  const welcomeSection = document.getElementById('welcomeSection');
  const userSection = document.getElementById('userSection');
  const displayName = document.getElementById('displayName');

  // Toggle between Login and Signup
  showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormEl.classList.add('hidden');
    signupFormEl.classList.remove('hidden');
  });

  showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupFormEl.classList.add('hidden');
    loginFormEl.classList.remove('hidden');
  });

  // Handle Login - connecting to PHP backend
  document.getElementById('loginFormElement').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    fetch('auth/login.php', {   // <-- fixed path
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        localStorage.setItem('loggedInUser', username);
        updateLoginState(username);
      } else {
        alert(data.message);
      }
    })
    .catch(err => {
      console.error('Error:', err);
      alert('Something went wrong. Try again.');
    });
  });

  // Handle Signup - connecting to PHP backend
  document.getElementById('signupFormElement').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.querySelector('input[name="name"]').value.trim();
    const email = document.querySelector('input[name="email"]').value.trim();
    const password = document.querySelector('input[name="password"]').value.trim();

    fetch('auth/signup.php', {   // <-- fixed path
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        alert('Signup successful! Please log in.');
        signupFormEl.classList.add('hidden');
        loginFormEl.classList.remove('hidden');
      } else {
        alert(data.message);
      }
    })
    .catch(err => {
      console.error('Error:', err);
      alert('Something went wrong during signup.');
    });
  });

  // Handle Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    userSection.classList.add('hidden');
    welcomeSection.classList.add('hidden');
    document.getElementById('authContainer').classList.remove('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
  });

  // Restore session if user is already logged in
  const savedUser = localStorage.getItem('loggedInUser');
  if (savedUser) {
    updateLoginState(savedUser);
  }

  // Helper to update UI state for logged-in user
  function updateLoginState(username) {
    displayName.textContent = `Welcome, ${username}`;
    document.getElementById('authContainer').classList.add('hidden');
    welcomeSection.classList.remove('hidden');
    userSection.classList.remove('hidden');
  }
});
