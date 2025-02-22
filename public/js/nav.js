document.addEventListener('DOMContentLoaded', () => {
    // Handle navbar collapse on mobile
    const navLinks = document.querySelectorAll('.nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navbarToggler = document.querySelector('.navbar-toggler');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) { // Bootstrap's lg breakpoint
                navbarCollapse.classList.remove('show');
                navbarToggler.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Update active nav item
    const currentPage = window.location.pathname;
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Handle authentication state
    updateNavbar();
});

function updateNavbar() {
    const token = localStorage.getItem('token');
    const loginNav = document.getElementById('loginNav');
    const signupNav = document.getElementById('signupNav');
    const profileNav = document.getElementById('profileNav');
    const logoutNav = document.getElementById('logoutNav');

    if (token) {
        loginNav.classList.add('d-none');
        signupNav.classList.add('d-none');
        profileNav.classList.remove('d-none');
        logoutNav.classList.remove('d-none');
    } else {
        loginNav.classList.remove('d-none');
        signupNav.classList.remove('d-none');
        profileNav.classList.add('d-none');
        logoutNav.classList.add('d-none');
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateNavbar();
    window.location.href = '/';
} 