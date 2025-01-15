document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const projectsList = document.querySelector('.projects-list');
    const pagination = document.querySelector('.pagination');
    let allPosts = [];
 
    // 원본 HTML 저장 (단순 내용만 저장)
    const originalHTML = projectsList.innerHTML;
 
    function restoreOriginalState() {
        // 모든 아이템을 새로 그리기
        projectsList.innerHTML = originalHTML;
        
        // 모든 아이템에 대해 기본 스타일 적용
        const items = projectsList.querySelectorAll('li>a');
        items.forEach(item => {
            item.style.visibility = 'visible';
            item.style.opacity = '1';
            item.style.transform = 'none';
        });
 
        if (pagination) {
            pagination.style.display = '';
        }
    }
 
    fetch('/search-data.json')
        .then(response => response.json())
        .then(data => {
            allPosts = data.posts;
        });
 
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            restoreOriginalState();
            return;
        }
 
        const filteredPosts = allPosts.filter(post => {
            return post.title.toLowerCase().includes(searchTerm) || 
                   post.location.toLowerCase().includes(searchTerm);
        });
 
        // 검색 결과 표시
        const searchResultsHTML = filteredPosts.map(post => `
            <li style="visibility: visible; transform: none; opacity: 1">
                <a href="${post.url}">
                    <div class="img-wrapper">
                        <img src="${post.logo}" alt="${post.title}" />
                    </div>
                    <span class="h2">${post.type}</span>
                    <h3>${post.title}</h3>
                </a>
            </li>
        `).join('');
 
        projectsList.innerHTML = filteredPosts.length ? 
            searchResultsHTML : 
            `<li class="no-results" style="visibility: visible; opacity: 1;">
                <div class="search-empty">
                    <p>검색 결과가 없습니다.</p>
                    <p class="search-suggestion">다른 검색어로 시도해보세요.</p>
                </div>
            </li>`;
 
        if (pagination) {
            pagination.style.display = 'none';
        }
    });
 
    // 검색 클리어 버튼
    const clearButton = document.createElement('button');
    clearButton.className = 'search-clear';
    clearButton.textContent = '×';
    clearButton.style.display = 'none';
    searchInput.parentNode.appendChild(clearButton);
 
    searchInput.addEventListener('input', function() {
        clearButton.style.display = this.value ? 'block' : 'none';
    });
 
    clearButton.addEventListener('click', function() {
        searchInput.value = '';
        this.style.display = 'none';
        restoreOriginalState();
    });
 
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            clearButton.style.display = 'none';
            restoreOriginalState();
        }
    });
 });