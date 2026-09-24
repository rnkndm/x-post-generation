// ===== Unicode Mathematical Bold 変換 =====
// 半角英数字を Mathematical Bold（U+1D400台）に置換。それ以外の文字（記号・スペース・
// 日本語・全角文字など）はそのまま。
function toMathBold(input) {
  const upperBase = 0x1d400; // A
  const lowerBase = 0x1d41a; // a
  const digitBase = 0x1d7ce; // 0
  return Array.from(input)
    .map((ch) => {
      const code = ch.codePointAt(0);
      if (code >= 0x41 && code <= 0x5a) return String.fromCodePoint(upperBase + (code - 0x41));
      if (code >= 0x61 && code <= 0x7a) return String.fromCodePoint(lowerBase + (code - 0x61));
      if (code >= 0x30 && code <= 0x39) return String.fromCodePoint(digitBase + (code - 0x30));
      return ch;
    })
    .join('');
}

const WEEKDAYS = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];

// ===== 固定テンプレート要素（仕様書の原文どおり） =====
const DIVIDER = '━'.repeat(21);
const PICKUP_HEADER = '━━━━━━［Ｐｉｃｋｕｐ］━━━━━━━';
const BIRTHDAY_HEADER = '━━［Ｈａｐｐｙ　Ｂｉｒｔｈｄａｙ］━━';
const RESERVE_LINK = 'https://s.lmes.jp/landing-qr/2008882174-oRxOVoCG?uLand=0QRupn';
const STORE_TAG = '#𝐒𝐈𝐍𝐂𝐄𝐘𝐎𝐔本店';
const HASHTAG = '#歌舞伎町ホスト';
const PICKUP_EMOJI = '🎤';
const BIRTHDAY_EMOJI = '🎂';
const EVENT_EMOJI = '✨';

// ===== SNSリンク =====
function getManualLinks() {
  const val = (id) => (document.getElementById(id)?.value || '').trim();
  return { x: val('link-x'), instagram: val('link-instagram'), tiktok: val('link-tiktok'), hosuhosu: val('link-hosuhosu') };
}

// SNSブロックは X／Instagram／TikTok／ホスホスの順で出力するが、リンクが空の項目は
// 見出し・URLごと省略する（全て空なら何も出力しない）。
function buildSnsRows(links) {
  const entries = [
    { label: '𝐗', value: links.x },
    { label: '𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦', value: links.instagram },
    { label: '𝐓𝐢𝐤𝐓𝐨𝐤', value: links.tiktok },
    { label: 'ホスホス', value: links.hosuhosu },
  ].filter((entry) => entry.value);

  const rows = [];
  entries.forEach((entry, i) => {
    if (i > 0) rows.push({ text: '', center: false });
    rows.push({ text: entry.label, center: false });
    rows.push({ text: entry.value, center: false });
  });
  return rows;
}

// Pickup/Happy Birthdayで共通の「区切り線〜SNS〜初回指名リンク〜ハッシュタグ」部分。
// SNSリンクが1件も無い場合は、その分の空行が重複しないようにする。
function buildSnsAndReserveRows(links) {
  const snsRows = buildSnsRows(links);
  return [
    { text: DIVIDER, center: true },
    { text: '', center: false },
    ...(snsRows.length ? [...snsRows, { text: '', center: false }] : []),
    { text: DIVIDER, center: true },
    { text: '', center: false },
    { text: '《👇初回指名はこちらから👇》', center: true },
    { text: '', center: false },
    { text: RESERVE_LINK, center: false },
    { text: '', center: false },
    { text: DIVIDER, center: true },
    { text: '', center: false },
    { text: HASHTAG, center: false },
    { text: '', center: false },
    { text: '※動画を挿入', center: false },
  ];
}

// ===== テンプレート組版(各行を {text, center} の配列として構築) =====
// center: true の行だけ、プレビュー上で text-align:center を適用する(仕様書の指示どおり)。
function buildPickupRows(name, nameRomaji, links) {
  const nameRow = PICKUP_EMOJI + '　' + name + '　／　' + toMathBold(nameRomaji) + '　' + PICKUP_EMOJI;
  return [
    { text: STORE_TAG, center: false },
    { text: '', center: false },
    { text: PICKUP_HEADER, center: true },
    { text: '', center: false },
    { text: nameRow, center: true },
    { text: '', center: false },
    ...buildSnsAndReserveRows(links),
  ];
}

function buildBirthdayRows(name, nameRomaji, links) {
  const nameRow = BIRTHDAY_EMOJI + '　' + name + '　／　' + toMathBold(nameRomaji) + '　' + BIRTHDAY_EMOJI;
  return [
    { text: STORE_TAG, center: false },
    { text: '', center: false },
    { text: BIRTHDAY_HEADER, center: true },
    { text: '', center: false },
    { text: nameRow, center: true },
    { text: '', center: false },
    ...buildSnsAndReserveRows(links),
  ];
}

function buildEventRows() {
  const dateInput = document.getElementById('event-date').value; // YYYY-MM-DD（日付ピッカー）
  const nameRaw = document.getElementById('event-name').value.trim() || 'イベント名';

  let dateRow = toMathBold('2026.1.1（' + WEEKDAYS[1] + '）');
  if (dateInput) {
    const [y, m, d] = dateInput.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const weekday = WEEKDAYS[dateObj.getDay()];
    dateRow = toMathBold(`${y}.${m}.${d}（${weekday}）`);
  }
  const nameRow = toMathBold(nameRaw);

  return [
    { text: STORE_TAG, center: false },
    { text: '', center: false },
    { text: DIVIDER, center: true },
    { text: '', center: false },
    { text: EVENT_EMOJI + '　' + dateRow + '　' + EVENT_EMOJI, center: true },
    { text: '', center: false },
    { text: EVENT_EMOJI + '　' + nameRow + '　' + EVENT_EMOJI, center: true },
    { text: '', center: false },
    { text: DIVIDER, center: true },
    { text: '', center: false },
    { text: '🕗𝟐𝟎:𝟎𝟎～𝟐𝟒:𝟓𝟎', center: true },
    { text: '', center: false },
    { text: '📍東京都新宿区歌舞伎町２－２４－３', center: true },
    { text: '新宿興和ビル２Ｆ', center: true },
    { text: '', center: false },
    { text: '📞０３－６２０５－９５００', center: true },
    { text: '', center: false },
    { text: DIVIDER, center: true },
    { text: '', center: false },
    { text: '《👇予約はこちらから👇》', center: true },
    { text: '', center: false },
    { text: RESERVE_LINK, center: false },
    { text: '', center: false },
    { text: DIVIDER, center: true },
    { text: '', center: false },
    { text: HASHTAG, center: false },
    { text: '', center: false },
    { text: '※画像を挿入', center: false },
  ];
}

// ===== キャスト一覧の動的取得 =====
// casts.js の静的データは「オフライン時・取得失敗時のフォールバック」として保持する。
// 参考ツール（x-post-generation-tool.netlify.app）が削除された後は、キャスト一覧の
// 一次情報源は店舗サイト（host2.jp）そのものになるため、そこから直接取得する。
// host2.jp はブラウザからの直接fetchを許可するCORSヘッダーを返さないため、
// 公開CORSプロキシを経由する。1つ目（corsfix）が失敗した場合は2つ目（allorigins）に
// フォールバックする（無料の第三者サービスのため、将来的に停止・仕様変更する可能性あり）。
// プロキシが軒並み落ちている場合や、レイアウト変更で取得件数が異常に少ない場合は
// casts.js のデータのまま動作する（取得失敗はアプリの利用を止めない）。
const HOST_TOP_URL = 'https://www.host2.jp/shop/sinceyou3/';
const CORS_PROXIES = [
  { buildUrl: (url) => 'https://proxy.corsfix.com/?' + url, parse: (res) => res.text() },
  { buildUrl: (url) => 'https://api.allorigins.win/get?url=' + encodeURIComponent(url), parse: async (res) => (await res.json()).contents || '' },
];

// 個人ページの再取得は重い（キャスト数ぶんのHTTPリクエスト）ので、結果をlocalStorageに
// キャッシュし、一定時間はキャッシュを使い回す。キャッシュが無い/古い場合のみ再取得する。
const CASTS_CACHE_KEY = 'xpost_casts_cache_v2';
const CASTS_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6時間

let currentCasts = CASTS;

const PROXY_TIMEOUT_MS = 12000;

async function fetchTextViaProxy(url) {
  let lastError;
  for (const proxy of CORS_PROXIES) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
    try {
      const res = await fetch(proxy.buildUrl(url), { signal: controller.signal });
      if (!res.ok) throw new Error('proxy fetch failed: ' + res.status);
      return await proxy.parse(res);
    } catch (e) {
      lastError = e;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

function normalizeSpaces(text) {
  return text.trim().replace(/\s+/g, '　');
}

// キャスト個人ページ（例: https://www.host2.jp/shop/sinceyou3/kaoru03/index.html）から
// ローマ字表記と、ページ下部に記載されているX／Instagram／TikTokのリンクを抽出する。
// 実際のHTML構造（要素名のtypoも含めそのまま）:
//   <div class="staff-name">カヲル <soan class="kana">Kaoru</span></div>
//   <dl><dt>X：</dt><dd><a href="https://x.com/...">...</a></dd>
//       <dt>Instagram：</dt><dd><a href="https://www.instagram.com/...">...</a></dd> ...</dl>
// LINE・mail等、X/Instagram/TikTok以外の項目が混ざっていることもあるため、
// <dt>のラベル文字列で判定してから対応する<dd>内の href を拾う。
async function fetchProfileDetails(slug) {
  const result = { nameRomaji: '', sns: { x: '', instagram: '', tiktok: '' } };
  try {
    const html = await fetchTextViaProxy(HOST_TOP_URL + slug + '/index.html');

    const nameMatch = html.match(/<div class="staff-name">([^<]*)<\S+\s+class="kana">([^<]*)<\/span>/);
    if (nameMatch) result.nameRomaji = normalizeSpaces(nameMatch[2]);

    const dlMatch = html.match(/<dl>([\s\S]*?)<\/dl>/);
    if (dlMatch) {
      const dtddRe = /<dt>([^<]*)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g;
      let m;
      while ((m = dtddRe.exec(dlMatch[1]))) {
        const label = m[1].replace(/[：:]/g, '').trim().toLowerCase();
        const hrefMatch = m[2].match(/href="([^"]+)"/);
        if (!hrefMatch) continue;
        const url = hrefMatch[1];
        if (label === 'x') result.sns.x = url;
        else if (label === 'instagram') result.sns.instagram = url;
        else if (label === 'tiktok') result.sns.tiktok = url;
      }
    }
  } catch (e) {
    console.warn('プロフィール取得失敗:', slug, e);
  }
  return result;
}

function readCastsCache() {
  try {
    const raw = localStorage.getItem(CASTS_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.casts) || !data.timestamp) return null;
    return data;
  } catch (e) {
    return null;
  }
}

function writeCastsCache(casts) {
  try {
    localStorage.setItem(CASTS_CACHE_KEY, JSON.stringify({ casts, timestamp: Date.now() }));
  } catch (e) {
    // ストレージが使えなくても致命的ではないので無視する
  }
}

// 店舗トップページから、現在掲載されているキャストのslug・和名一覧を取得する
async function fetchCastListFromSite() {
  const html = await fetchTextViaProxy(HOST_TOP_URL);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const seen = new Set();
  const list = [];
  doc.querySelectorAll('a[href*="/shop/sinceyou3/"]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const m = href.match(/\/shop\/sinceyou3\/([^/]+)\/index\.html$/);
    if (!m || !m[1] || m[1] === 'index' || seen.has(m[1])) return;
    const slug = m[1];
    const name = a.textContent.trim();
    if (!name || name.length < 1 || name.length > 15 || /^[0-9]+$/.test(name)) return;
    if (['CLH', 'UP', 'NEW', 'ゼン'].includes(name)) return;
    seen.add(slug);
    list.push({ slug, name: name.replace(/\s+/, '　') });
  });
  return list;
}

// 店舗サイトから最新のキャスト一覧を取得し、各キャストの個人ページからローマ字名・
// X/Instagram/TikTokリンクを取得してマージする（4件ずつ並列。プロキシへの負荷を抑える）。
// 個人ページの取得は仕様上ページ数ぶんのリクエストが必要で数十秒かかることがあるため、
// 結果は呼び出し側でキャッシュする。失敗時は casts.js のデータをそのまま返す。
async function loadLatestCasts(onProgress) {
  try {
    const siteList = await fetchCastListFromSite();
    if (siteList.length < 5) throw new Error('取得件数が少なすぎます（サイト構造が変わった可能性）');

    const staticById = new Map(CASTS.map((c) => [c.id, c]));
    const detailsBySlug = new Map();
    const BATCH_SIZE = 6;
    for (let i = 0; i < siteList.length; i += BATCH_SIZE) {
      const batch = siteList.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(batch.map((s) => fetchProfileDetails(s.slug)));
      batch.forEach((s, idx) => detailsBySlug.set(s.slug, results[idx]));
      if (onProgress) onProgress(Math.min(i + BATCH_SIZE, siteList.length), siteList.length);
    }

    return siteList.map(({ slug, name }) => {
      const existing = staticById.get(slug);
      const detail = detailsBySlug.get(slug) || { nameRomaji: '', sns: { x: '', instagram: '', tiktok: '' } };
      return {
        id: slug,
        name,
        // 店舗サイトはローマ字名の語順（名字→名前／名前→名字）がキャストごとにバラバラなため、
        // casts.js に手作業で直した表記がある場合はそちらを優先する（無ければサイトの値を使う）。
        nameRomaji: (existing && existing.nameRomaji) || detail.nameRomaji || '',
        sns: {
          x: detail.sns.x || (existing && existing.sns.x) || '',
          instagram: detail.sns.instagram || (existing && existing.sns.instagram) || '',
          tiktok: detail.sns.tiktok || (existing && existing.sns.tiktok) || '',
          hosuhosu: HOST_TOP_URL + slug + '/',
        },
      };
    });
  } catch (e) {
    console.warn('キャスト一覧の動的取得に失敗。casts.js のデータを使用します。', e);
    return CASTS;
  }
}

// ===== 画面制御 =====
let currentType = 'pickup';

function populateCastSelect() {
  const select = document.getElementById('cast-select');
  const prevValue = select.value;
  select.innerHTML = '<option value="">-- キャストを選択してください --</option>';
  currentCasts.forEach((cast) => {
    const option = document.createElement('option');
    option.value = cast.id;
    option.textContent = cast.name + (cast.nameRomaji && cast.nameRomaji !== cast.name ? '（' + cast.nameRomaji + '）' : '');
    select.appendChild(option);
  });
  if (prevValue && findCastById(prevValue)) select.value = prevValue;
}

function findCastById(id) {
  return currentCasts.find((c) => c.id === id);
}

function onCastChange() {
  setFieldError('cast-field', 'cast-error', false);
  const cast = findCastById(document.getElementById('cast-select').value);
  const sns = cast ? cast.sns : { x: '', instagram: '', tiktok: '', hosuhosu: '' };
  document.getElementById('link-x').value = sns.x;
  document.getElementById('link-instagram').value = sns.instagram;
  document.getElementById('link-tiktok').value = sns.tiktok;
  document.getElementById('link-hosuhosu').value = sns.hosuhosu;
  updatePreview();
}

function setType(type) {
  currentType = type;
  document.querySelectorAll('.tab').forEach((el) => el.classList.toggle('active', el.dataset.type === type));
  const isEvent = type === 'event';
  document.getElementById('cast-section').style.display = isEvent ? 'none' : '';
  document.getElementById('event-section').style.display = isEvent ? '' : 'none';
  document.getElementById('links-section').style.display = isEvent ? 'none' : '';
  document.getElementById('media-hint').textContent = isEvent ? '※投稿画面で画像を添付してください' : '※投稿画面で動画を添付してください';
  updatePreview();
}

function currentRows() {
  if (currentType === 'pickup' || currentType === 'birthday') {
    const cast = findCastById(document.getElementById('cast-select').value);
    const name = cast ? cast.name : '名前';
    const nameRomaji = cast ? cast.nameRomaji : 'Name';
    const links = getManualLinks();
    return currentType === 'pickup' ? buildPickupRows(name, nameRomaji, links) : buildBirthdayRows(name, nameRomaji, links);
  }
  return buildEventRows();
}

function rowsToPlainText(rows) {
  return rows.map((row) => row.text).join('\n');
}

function renderPreview(rows) {
  const container = document.getElementById('preview-text');
  container.innerHTML = '';
  rows.forEach((row) => {
    const line = document.createElement('div');
    const isDividerRow = row.text.startsWith('━');
    line.className =
      'line' +
      (row.center ? ' line-center' : '') +
      (isDividerRow ? ' line-accent' : row.center ? ' line-strong' : '');
    line.textContent = row.text || ' '; // 空行にも高さを持たせる
    if (row.text) {
      // URLとハッシュタグはXの投稿と同じくアクセント色で表示する（表示のみ。コピー/投稿テキストには影響しない）
      line.textContent = '';
      row.text.split(/(https?:\/\/\S+|#\S+)/g).forEach((part) => {
        if (!part) return;
        if (/^(https?:\/\/|#)/.test(part)) {
          const span = document.createElement('span');
          span.className = 'link';
          span.textContent = part;
          line.appendChild(span);
        } else {
          line.appendChild(document.createTextNode(part));
        }
      });
    }
    container.appendChild(line);
  });
}

function updatePreview() {
  const rows = currentRows();
  renderPreview(rows);
  const text = rowsToPlainText(rows);
  document.getElementById('char-count').textContent = Array.from(text).length + ' 文字';
}

function setFieldError(fieldId, errorId, show) {
  document.getElementById(fieldId).classList.toggle('has-error', show);
  document.getElementById(errorId).style.display = show ? 'block' : 'none';
  return show;
}

function validate() {
  let hasError = false;
  if (currentType !== 'event') {
    hasError = setFieldError('cast-field', 'cast-error', !document.getElementById('cast-select').value) || hasError;
  } else {
    hasError = setFieldError('date-field', 'date-error', !document.getElementById('event-date').value) || hasError;
    hasError = setFieldError('name-field', 'name-error', !document.getElementById('event-name').value.trim()) || hasError;
  }
  return !hasError;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2500);
}

async function copyText() {
  if (!validate()) {
    showToast('必須項目を入力してください');
    return;
  }
  const text = rowsToPlainText(currentRows());
  try {
    await navigator.clipboard.writeText(text);
    showToast('コピーしました');
  } catch (e) {
    showToast('コピーに失敗しました');
  }
}

// 仕様書どおり：Xの標準投稿インテントURLに本文を渡すだけ（アプリ専用スキームや
// OAuth連携は不要。JSでURLへ遷移させる）。
function postToX() {
  if (!validate()) {
    showToast('必須項目を入力してください');
    return;
  }
  const text = rowsToPlainText(currentRows());
  const url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text);
  // window.open(_blank) を使用。サンドボックス化された埋め込み表示（Artifact等）でも
  // トップレベル遷移がブロックされず新しいタブで開ける。
  window.open(url, '_blank');
}

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', () => {
  // まず casts.js のデータで即座に使えるようにしてから、裏で最新データを取りに行く
  populateCastSelect();

  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => setType(tab.dataset.type)));
  document.getElementById('cast-select').addEventListener('change', onCastChange);
  document.getElementById('event-date').addEventListener('input', updatePreview);
  document.getElementById('event-name').addEventListener('input', updatePreview);
  ['link-x', 'link-instagram', 'link-tiktok', 'link-hosuhosu'].forEach((id) =>
    document.getElementById(id).addEventListener('input', updatePreview)
  );
  document.getElementById('copy-btn').addEventListener('click', copyText);
  document.getElementById('post-btn').addEventListener('click', postToX);

  updatePreview();

  const syncStatus = document.getElementById('cast-sync-status');
  const refreshBtn = document.getElementById('cast-sync-refresh');

  function applyCasts(casts) {
    currentCasts = casts;
    populateCastSelect();
    onCastChange();
  }

  async function syncFromSite() {
    if (syncStatus) syncStatus.textContent = '（最新のキャスト一覧を取得中…0%）';
    const casts = await loadLatestCasts((done, total) => {
      if (syncStatus) syncStatus.textContent = `（最新のキャスト一覧を取得中…${Math.round((done / total) * 100)}%）`;
    });
    applyCasts(casts);
    if (casts !== CASTS) {
      writeCastsCache(casts);
      if (syncStatus) syncStatus.textContent = '（店舗サイトの最新データ）';
    } else if (syncStatus) {
      syncStatus.textContent = '（店舗サイトから取得できず、保存済みデータを表示中）';
    }
  }

  const cached = readCastsCache();
  if (cached && Date.now() - cached.timestamp < CASTS_CACHE_TTL_MS) {
    applyCasts(cached.casts);
    const hoursAgo = Math.round((Date.now() - cached.timestamp) / (60 * 60 * 1000));
    if (syncStatus) syncStatus.textContent = `（店舗サイトの最新データ・${hoursAgo === 0 ? '1時間以内' : hoursAgo + '時間前'}に取得）`;
  } else {
    syncFromSite();
  }

  if (refreshBtn) refreshBtn.addEventListener('click', syncFromSite);
});
