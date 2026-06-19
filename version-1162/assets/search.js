document.addEventListener('DOMContentLoaded', function () {
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var summary = document.querySelector('[data-search-summary]');
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  if (input) {
    input.value = initialQuery;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderCard(item) {
    var tags = (item.tags || []).slice(0, 2).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-card>',
      '  <a class="poster-wrap" href="' + escapeHtml(item.url) + '">',
      '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" data-cover>',
      '    <span class="card-play">▶</span>',
      '    <span class="card-category">' + escapeHtml(item.category) + '</span>',
      '    <span class="card-year">' + escapeHtml(item.year) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>',
      '    <p>' + escapeHtml(item.oneLine) + '</p>',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(item.region) + '</span>',
      '      <span>' + escapeHtml(item.genre) + '</span>',
      '    </div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function applySearch(query) {
    if (!results) {
      return;
    }

    var keyword = String(query || '').trim().toLowerCase();
    if (!keyword) {
      results.innerHTML = '';
      if (summary) {
        summary.textContent = '输入关键词后显示匹配影片。';
      }
      return;
    }

    var words = keyword.split(/\s+/).filter(Boolean);
    var matched = SEARCH_INDEX.filter(function (item) {
      var haystack = [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.category,
        item.oneLine,
        (item.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 96);

    results.innerHTML = matched.map(renderCard).join('\n');
    if (summary) {
      summary.textContent = matched.length ? '已显示匹配影片。' : '没有找到匹配影片，可尝试更换关键词。';
    }
  }

  applySearch(initialQuery);

  if (input) {
    input.addEventListener('input', function () {
      applySearch(input.value);
    });
  }
});
