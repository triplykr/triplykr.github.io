document.addEventListener('DOMContentLoaded', function () {
    console.log('=== 스크립트 초기화 ===');
    
    // DOM 요소 선택
    const searchInput = document.getElementById('searchInput');
    const filterItems = document.querySelectorAll('.filter-item');
    const projectsList = document.querySelector('.projects-list');
    const pagination = document.querySelector('.pagination');
    let allPosts = [];

    console.log('검색 입력창 존재여부:', !!searchInput);
    console.log('필터 아이템 개수:', filterItems.length);
    console.log('프로젝트 리스트 존재여부:', !!projectsList);
    
    // 원본 HTML 저장
    const originalHTML = projectsList.innerHTML;

    // URL 파라미터 관련 함수들
    function getQueryParam(param) {
        const value = new URLSearchParams(window.location.search).get(param) || '';
        console.log(`URL 파라미터 ${param}:`, value);
        return value;
    }

    function updateQueryParam(param, value) {
        const url = new URL(window.location);
        if (value && value !== 'all') {
            url.searchParams.set(param, value);
        } else {
            url.searchParams.delete(param);
        }
        console.log(`URL 파라미터 업데이트 ${param}:`, value);
        window.history.replaceState({}, '', url);
    }

    // 검색 결과 렌더링 함수
    function renderSearchResults(filteredPosts, searchTerm) {
        console.log('=== 렌더링 시작 ===');
        console.log('검색어:', searchTerm);
        console.log('필터링된 포스트 수:', filteredPosts.length);
        console.log('필터링된 포스트:', filteredPosts);
        
        if (filteredPosts.length === 0) {
            projectsList.innerHTML = `
                <li class="no-results">
                    <div class="search-empty">
                        <p>검색 결과가 없습니다.</p>
                        <p class="search-suggestion">다른 검색어로 시도해보세요.</p>
                    </div>
                </li>`;
        } else {
            projectsList.innerHTML = filteredPosts.map(post => `
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
        }
        
        // 페이지네이션 표시/숨김
        if (searchTerm) {
            if (pagination) {
                console.log('페이지네이션 숨김 (검색어 있음)');
                pagination.style.display = 'none';
            }
        } else {
            if (pagination) {
                console.log('페이지네이션 표시 (검색어 없음)');
                pagination.style.display = '';
            }
        }
    }

    // 필터링 함수
    function filterPosts(searchTerm, selectedCategory) {
        console.log('=== 필터링 시작 ===');
        console.log('검색어:', searchTerm);
        console.log('선택된 카테고리:', selectedCategory);
        console.log('전체 포스트 수:', allPosts.length);
        console.log('전체 포스트:', allPosts);

        // 검색어와 카테고리가 모두 없으면 초기 상태로 복원
        if (!searchTerm && (selectedCategory === 'all' || !selectedCategory)) {
            console.log('초기 상태로 복원');
            projectsList.innerHTML = originalHTML;
            if (pagination) pagination.style.display = '';
            return;
        }

        let filteredPosts = allPosts;

        // 카테고리 필터링
        if (selectedCategory && selectedCategory !== 'all') {
            filteredPosts = filteredPosts.filter(post => post.category === selectedCategory);
            console.log('카테고리 필터링 후 포스트 수:', filteredPosts.length);
            console.log('카테고리 필터링된 포스트:', filteredPosts);
        }

        // 검색어 필터링
        if (searchTerm) {
            const searchTermLower = searchTerm.toLowerCase();
            filteredPosts = filteredPosts.filter(post => {
                const title = (post.title || '').toLowerCase();
                const location = (post.location || '').toLowerCase();
                const titleMatch = title.includes(searchTermLower);
                const locationMatch = location.includes(searchTermLower);
                
                console.log('검색 비교:', {
                    searchTerm: searchTermLower,
                    title,
                    location,
                    titleMatch,
                    locationMatch
                });
                
                return titleMatch || locationMatch;
            });
            console.log('검색어 필터링 후 포스트 수:', filteredPosts.length);
            console.log('검색어 필터링된 포스트:', filteredPosts);
        }

        renderSearchResults(filteredPosts, searchTerm);
    }

    // 데이터 로딩
    console.log('=== 데이터 로딩 시작 ===');
    fetch('/search-data.json')
        .then(response => {
            console.log('응답 상태:', response.status);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('받은 원본 데이터:', data);
            
            if (!Array.isArray(data.posts)) {
                throw new Error('Invalid data format');
            }
            
            // 데이터 전처리
            allPosts = data.posts.map(post => {
                const processedPost = {
                    ...post,
                    location: post.location || '',
                    title: post.title || '',
                    category: (post.category || '').toLowerCase()
                };
                console.log('처리된 포스트:', processedPost);
                return processedPost;
            });

            console.log('전처리된 전체 데이터:', allPosts);
            
            // 초기 필터링 적용
            const initialSearchTerm = getQueryParam('search');
            const initialCategory = getQueryParam('category') || 'all';
            
            searchInput.value = initialSearchTerm;
            filterItems.forEach(item => {
                item.classList.toggle('active', item.dataset.category === initialCategory);
            });

            filterPosts(initialSearchTerm, initialCategory);
        })
        .catch(error => {
            console.error('데이터 로딩 오류:', error);
            projectsList.innerHTML = `
                <li class="error">
                    <div class="error-message">
                        <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
                        <p>잠시 후 다시 시도해주세요.</p>
                    </div>
                </li>`;
        });

    // 검색어 입력 이벤트
    searchInput.addEventListener('input', function (e) {
        const searchTerm = e.target.value.trim();
        const selectedCategory = document.querySelector('.filter-item.active')?.dataset.category || 'all';
        
        console.log('=== 검색어 입력 ===');
        console.log('입력된 검색어:', searchTerm);
        console.log('현재 선택된 카테고리:', selectedCategory);
        
        updateQueryParam('search', searchTerm);
        filterPosts(searchTerm, selectedCategory);
        clearButton.style.display = searchTerm ? 'block' : 'none';
    });

    // 카테고리 필터 클릭 이벤트
    filterItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            
            console.log('=== 카테고리 선택 ===');
            console.log('선택된 카테고리:', this.dataset.category);

            filterItems.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const selectedCategory = this.dataset.category;
            const searchTerm = searchInput.value.trim();

            updateQueryParam('category', selectedCategory);
            filterPosts(searchTerm, selectedCategory);
        });
    });

    // 검색 초기화 버튼 설정
    const clearButton = document.createElement('button');
    clearButton.className = 'search-clear';
    clearButton.textContent = '×';
    clearButton.style.display = 'none';
    searchInput.parentNode.appendChild(clearButton);

    clearButton.addEventListener('click', function () {
        console.log('=== 검색 초기화 ===');
        searchInput.value = '';
        filterItems.forEach(item => item.classList.remove('active'));
        document.querySelector('[data-category="all"]').classList.add('active');
        this.style.display = 'none';
        updateQueryParam('search', '');
        updateQueryParam('category', 'all');
        projectsList.innerHTML = originalHTML;
        if (pagination) pagination.style.display = '';
    });

    // ESC 키 이벤트
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            console.log('=== ESC 키 입력 ===');
            searchInput.value = '';
            clearButton.style.display = 'none';
            updateQueryParam('search', '');
            projectsList.innerHTML = originalHTML;
            if (pagination) pagination.style.display = '';
        }
    });
});