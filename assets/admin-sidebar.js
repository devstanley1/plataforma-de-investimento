document.addEventListener('DOMContentLoaded', () => {
  const sidebarHTML = `
    <div class="fixed inset-y-0 left-0 w-64 bg-zinc-900 border-r border-zinc-800 z-30 transition-transform duration-300 transform -translate-x-full md:translate-x-0" id="admin-sidebar">
      <div class="flex items-center justify-center h-16 border-b border-zinc-800">
        <h1 class="text-2xl font-bold text-red-600 tracking-wider">NETFLIX</h1>
      </div>
      <nav class="mt-4 px-2 space-y-1">
        <a href="admin-dashboard.html" class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-black hover:text-white transition-colors ${isActive('admin-dashboard.html')}">
          <span class="mr-3">🏠</span> Dashboard
        </a>
        
        <div class="mt-6 mb-2">
          <p class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Apps</p>
        </div>
        <a href="admin-vips.html" class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-black hover:text-white transition-colors ${isActive('admin-vips.html')}">
          <span class="mr-3">💎</span> VIPs
        </a>
        <a href="admin-bonus.html" class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-black hover:text-white transition-colors ${isActive('admin-bonus.html')}">
          <span class="mr-3">🎁</span> Manage Bonus
        </a>

        <div class="mt-6 mb-2">
          <p class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Management</p>
        </div>
        <a href="admin-customers.html" class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-black hover:text-white transition-colors ${isActive('admin-customers.html')}">
          <span class="mr-3">👥</span> Manage Customers
        </a>
        <a href="admin-purchases.html" class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-black hover:text-white transition-colors ${isActive('admin-purchases.html')}">
          <span class="mr-3">🛒</span> Purchase Record
        </a>

        <div class="mt-6 mb-2">
          <p class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Finance</p>
        </div>
        <a href="admin-payments.html" class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-black hover:text-white transition-colors ${isActive('admin-payments.html')}">
          <span class="mr-3">💰</span> Customer Payments
        </a>
        <a href="admin-withdraws.html" class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-black hover:text-white transition-colors ${isActive('admin-withdraws.html')}">
          <span class="mr-3">💸</span> Customer Withdraws
        </a>

        <div class="mt-6 mb-2">
          <p class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Commissions</p>
        </div>
        <a href="admin-commissions.html" class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-black hover:text-white transition-colors ${isActive('admin-commissions.html')}">
          <span class="mr-3">🔗</span> Task Commission
        </a>
        <a href="admin-commission-requests.html" class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-black hover:text-white transition-colors ${isActive('admin-commission-requests.html')}">
          <span class="mr-3">🔔</span> Task Commission Request
        </a>

        <div class="mt-6 mb-2">
          <p class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">System</p>
        </div>
        <a href="admin-settings.html" class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-black hover:text-white transition-colors ${isActive('admin-settings.html')}">
          <span class="mr-3">⚙️</span> Settings
        </a>
      </nav>
    </div>

    <!-- Mobile Header -->
    <div class="md:hidden bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
      <h1 class="text-xl font-bold text-red-600">NETFLIX ADMIN</h1>
      <button id="menu-toggle" class="text-gray-300 hover:text-white focus:outline-none">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>
  `;

  // Insert sidebar
  const sidebarContainer = document.createElement('div');
  sidebarContainer.innerHTML = sidebarHTML;
  document.body.prepend(sidebarContainer);

  // Add padding to main content
  const main = document.querySelector('main');
  if (main) {
    main.classList.add('md:ml-64', 'transition-all', 'duration-300');
  }

  // Mobile toggle logic
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('admin-sidebar');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      if (sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.remove('-translate-x-full');
      } else {
        sidebar.classList.add('-translate-x-full');
      }
    });

    // Close on click outside (optional)
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && window.innerWidth < 768) {
        sidebar.classList.add('-translate-x-full');
      }
    });
  }
});

function isActive(page) {
  const path = window.location.pathname;
  // Se for a página ativa, usa vermelho e fundo preto
  return path.includes(page) ? 'bg-black text-red-600 border-l-4 border-red-600 pl-1' : '';
}
