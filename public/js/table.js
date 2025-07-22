document.addEventListener('DOMContentLoaded', () => {
  const table = document.querySelector('#prices-table, #differences-table');
  const searchInput = document.querySelector('#search-input');
  const clearSearchBtn = document.querySelector('#clear-search');
  const perPageSelect = document.querySelector('#per-page-select');
  const prevPageBtn = document.querySelector('#prev-page');
  const nextPageBtn = document.querySelector('#next-page');
  const pageInput = document.querySelector('#page-input');
  const headers = table.querySelectorAll('th[data-sort]');

  let debounceTimeout;

  // Debounced search
  const debounceSearch = (callback, delay) => {
    return (...args) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => callback(...args), delay);
    };
  };

  // Search handler
  const handleSearch = () => {
    const params = new URLSearchParams(window.location.search);
    params.set('search', searchInput.value);
    params.set('page', '1'); // Reset to first page
    window.location.search = params.toString();
  };

  // Toggle clear button visibility
  const toggleClearButton = () => {
    clearSearchBtn.style.display = searchInput.value ? 'block' : 'none';
  };

  searchInput.addEventListener('input', () => {
    toggleClearButton();
    debounceSearch(handleSearch, 300)();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    toggleClearButton();
    handleSearch();
  });

  // Initialize clear button state
  toggleClearButton();

  // Sorting handler
  headers.forEach((header) => {
    header.addEventListener('click', () => {
      const sortBy = header.dataset.sort;
      const currentSortBy =
        new URLSearchParams(window.location.search).get('sortBy') ||
        (table.id === 'prices-table' ? 'symbol' : 'netProfit');
      const currentSortOrder =
        new URLSearchParams(window.location.search).get('sortOrder') ||
        (table.id === 'prices-table' ? 'asc' : 'desc');
      const newSortOrder = currentSortBy === sortBy && currentSortOrder === 'asc' ? 'desc' : 'asc';
      const params = new URLSearchParams(window.location.search);
      params.set('sortBy', sortBy);
      params.set('sortOrder', newSortOrder);
      window.location.search = params.toString();
    });
  });

  // Pagination handler
  perPageSelect.addEventListener('change', () => {
    const params = new URLSearchParams(window.location.search);
    params.set('perPage', perPageSelect.value);
    params.set('page', '1'); // Reset to first page
    window.location.search = params.toString();
  });

  prevPageBtn.addEventListener('click', () => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page') || '1');
    if (page > 1) {
      params.set('page', (page - 1).toString());
      window.location.search = params.toString();
    }
  });

  nextPageBtn.addEventListener('click', () => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page') || '1');
    params.set('page', (page + 1).toString());
    window.location.search = params.toString();
  });

  pageInput.addEventListener('change', () => {
    const params = new URLSearchParams(window.location.search);
    const maxPage = parseInt(pageInput.max) || 1;
    let newPage = parseInt(pageInput.value) || 1;
    newPage = Math.max(1, Math.min(newPage, maxPage)); // Clamp to valid range
    pageInput.value = newPage;
    params.set('page', newPage.toString());
    window.location.search = params.toString();
  });
});
