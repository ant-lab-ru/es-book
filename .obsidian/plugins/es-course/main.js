'use strict';

const {
	Plugin,
	ItemView,
	Component,
	MarkdownRenderer,
	TFile,
	TFolder,
	Keymap,
	debounce,
	getLinkpath,
	setIcon,
} = require('obsidian');

// ===========================================================================
// Общие настройки курса

const COURSE_TITLE = 'Встраиваемые системы';
const HOME_PATH = 'Встраиваемые системы.md';

const COURSE_VIEW = 'course-nav';
const COURSE_VIEW_TITLE = 'Курс';
const COURSE_VIEW_ICON = 'graduation-cap';

const CONCEPT_VIEW = 'concept-panel';
const CONCEPT_VIEW_TITLE = 'Понятия статьи';
const CONCEPT_VIEW_ICON = 'book-open';

const CONCEPT_FOLDER = 'Карта понятий/';
const DEF_BLOCK_ID = 'def';

// Имена разбираются по обеим схемам: методического репозитория
// (Т2.1.2 …, П2.1.3 …, Пр2.1 …, 2.1 …, 2. …) и публичного (т1.2.2 …, п1.2.3 …,
// пр1.4 …, з1.2 …, м1 …).
const RE = {
	moduleDir: /^Модуль (\d+)\.\s+(.+)$/u,
	moduleNote: /^м?(\d+)\.?\s+(.+)$/iu,
	lessonDir: /^Занятие (\d+)\.(\d+)$/u,
	lessonNote: /^з?(\d+)\.(\d+)\s+(.+)$/iu,
	theory: /^т(\d+)\.(\d+)\.(\d+)\s+(.+)$/iu,
	practice: /^п(\d+)\.(\d+)\.(\d+)\s+(.+)$/iu,
	appendix: /^пр(\d+)\.(\d+)\s+(.+)$/iu,
};

const GROUP_DIRS = { 'Теория': 'theory', 'Практика': 'practice' };
const APPENDIX_DIR = 'Приложения';
const REFERENCE_DIRS = ['Карта понятий', 'Карта инструментов', 'Карта навыков', 'Документация'];

const KIND_LABEL = {
	module: 'Модуль',
	lesson: 'Занятие',
	theory: 'Теория',
	practice: 'Практика',
	appendix: 'Приложение',
};

const MINUTES_FIELD = 'нагрузка, мин';

// Ручные таблицы навигации в конце заметок: при включённом плагине
// они дублируют кнопки и скрываются в режиме чтения.
const LEGACY_NAV_LINK = /^(Предыдущий раздел|Следующий раздел|К занятию|К модулю|К разделу)/;

// ===========================================================================
// Локальное хранилище: состояние интерфейса у каждого читателя своё
// и не попадает в репозиторий

function storageKey(app, name) {
	return `es-course:${app.vault.getName()}:${name}`;
}

function loadLocal(app, name, fallback) {
	try {
		const raw = window.localStorage.getItem(storageKey(app, name));
		return raw ? JSON.parse(raw) : fallback;
	} catch (e) {
		return fallback;
	}
}

function saveLocal(app, name, value) {
	try {
		window.localStorage.setItem(storageKey(app, name), JSON.stringify(value));
	} catch (e) {
		// Без localStorage интерфейс просто не запомнит состояние.
	}
}

// ===========================================================================
// Модель курса

function buildCourse(app) {
	const modules = new Map();
	const minutesOf = (file) => {
		const fm = app.metadataCache.getFileCache(file)?.frontmatter;
		const value = fm ? Number(fm[MINUTES_FIELD]) : NaN;
		return Number.isFinite(value) && value > 0 ? value : null;
	};

	const getModule = (dir) => {
		const m = dir.match(RE.moduleDir);
		if (!m) return null;
		const num = Number(m[1]);
		if (!modules.has(num)) {
			modules.set(num, {
				kind: 'module', num, code: String(num), title: m[2], file: null,
				lessons: new Map(), lessonList: [], appendices: [],
			});
		}
		return modules.get(num);
	};

	const getLesson = (mod, num) => {
		if (!mod.lessons.has(num)) {
			mod.lessons.set(num, {
				kind: 'lesson', module: mod, num, code: `${mod.num}.${num}`,
				title: null, file: null, theory: [], practice: [],
			});
		}
		return mod.lessons.get(num);
	};

	for (const file of app.vault.getMarkdownFiles()) {
		if (file.basename.endsWith('.excalidraw')) continue;
		const parts = file.path.split('/');
		const mod = parts.length > 1 ? getModule(parts[0]) : null;
		if (!mod) continue;
		const name = file.basename;

		if (parts.length === 2) {
			const m = name.match(RE.moduleNote);
			if (m && Number(m[1]) === mod.num && !mod.file) mod.file = file;
			continue;
		}

		if (parts[1] === APPENDIX_DIR) {
			const m = parts.length === 3 && name.match(RE.appendix);
			if (m && Number(m[1]) === mod.num) {
				mod.appendices.push({
					kind: 'appendix', module: mod, num: Number(m[2]), code: `${m[1]}.${m[2]}`,
					title: m[3], file, minutes: minutesOf(file),
				});
			}
			continue;
		}

		const l = parts[1].match(RE.lessonDir);
		if (!l || Number(l[1]) !== mod.num) continue;
		const lesson = getLesson(mod, Number(l[2]));

		if (parts.length === 3) {
			const m = name.match(RE.lessonNote);
			if (m && Number(m[1]) === mod.num && Number(m[2]) === lesson.num && !lesson.file) {
				lesson.file = file;
				lesson.title = m[3];
			}
			continue;
		}

		// Только прямые потомки папок «Теория» и «Практика».
		const kind = parts.length === 4 ? GROUP_DIRS[parts[2]] : null;
		const m = kind && name.match(RE[kind]);
		if (!m || Number(m[1]) !== mod.num || Number(m[2]) !== lesson.num) continue;
		lesson[kind].push({
			kind, module: mod, lesson, num: Number(m[3]), code: `${m[1]}.${m[2]}.${m[3]}`,
			title: m[4], file, minutes: minutesOf(file),
		});
	}

	const byNum = (a, b) => a.num - b.num;
	const home = app.vault.getAbstractFileByPath(HOME_PATH);
	const course = {
		home: home instanceof TFile ? home : null,
		modules: [],
		chain: [],
		items: new Map(),
		reference: [],
	};

	for (const mod of [...modules.values()].sort(byNum)) {
		mod.lessonList = [...mod.lessons.values()]
			.filter((lesson) => lesson.file || lesson.theory.length || lesson.practice.length)
			.sort(byNum);
		mod.appendices.sort(byNum);
		if (!mod.file && !mod.lessonList.length && !mod.appendices.length) continue;

		course.modules.push(mod);
		if (mod.file) course.items.set(mod.file.path, mod);
		for (const lesson of mod.lessonList) {
			lesson.theory.sort(byNum);
			lesson.practice.sort(byNum);
			if (lesson.file) course.items.set(lesson.file.path, lesson);
			// Сквозная цепочка: теория занятия, затем его практика, затем следующее занятие.
			for (const item of [...lesson.theory, ...lesson.practice]) {
				item.index = course.chain.length;
				course.chain.push(item);
				course.items.set(item.file.path, item);
			}
		}
		for (const item of mod.appendices) course.items.set(item.file.path, item);
	}

	for (const folder of REFERENCE_DIRS) {
		const dir = app.vault.getAbstractFileByPath(folder);
		if (!(dir instanceof TFolder)) continue;
		const files = dir.children
			.filter((f) => f instanceof TFile && (f.extension === 'md' || f.extension === 'pdf'))
			.filter((f) => !f.basename.startsWith('_') && !f.basename.endsWith('.excalidraw'))
			.sort((a, b) => a.basename.localeCompare(b.basename, 'ru'));
		if (files.length) course.reference.push({ folder, files });
	}

	course.signature = [
		course.home ? course.home.path : '',
		...[...course.items.values()].map((item) => `${item.file.path}:${item.minutes || ''}`),
		...course.reference.map((ref) => ref.files.map((f) => f.path).join(',')),
	].join('|');

	return course;
}

function siblingsOf(item) {
	if (item.kind === 'theory' || item.kind === 'practice') return item.lesson[item.kind];
	if (item.kind === 'appendix') return item.module.appendices;
	return [item];
}

function lessonEntry(lesson) {
	return lesson.file ? lesson : lesson.theory[0] || lesson.practice[0] || null;
}

function neighbours(course, item) {
	switch (item.kind) {
		case 'theory':
		case 'practice':
			return { prev: course.chain[item.index - 1], next: course.chain[item.index + 1] };
		case 'appendix': {
			const list = item.module.appendices;
			const i = list.indexOf(item);
			return { prev: list[i - 1], next: list[i + 1] };
		}
		case 'lesson':
			return { next: item.theory[0] || item.practice[0] };
		case 'module':
			return { next: item.lessonList.length ? lessonEntry(item.lessonList[0]) : null };
		default:
			return {};
	}
}

function markLegacyNav(el) {
	for (const table of el.querySelectorAll('table')) {
		if (table.querySelector('tbody tr')) continue;
		const links = [...table.querySelectorAll('thead a.internal-link')];
		if (!links.some((a) => LEGACY_NAV_LINK.test(a.textContent.trim()))) continue;
		table.addClass('course-nav-legacy');
		if (el.querySelectorAll('table').length === 1 && el.textContent.trim() === table.textContent.trim()) {
			el.addClass('course-nav-legacy');
		}
	}
}

// ===========================================================================
// Панель «Курс»

class CourseView extends ItemView {
	constructor(leaf, plugin) {
		super(leaf);
		this.plugin = plugin;
		this.hoverPopover = null;
		this.scrollToActive = true;
	}

	getViewType() {
		return COURSE_VIEW;
	}

	getDisplayText() {
		return COURSE_VIEW_TITLE;
	}

	getIcon() {
		return COURSE_VIEW_ICON;
	}

	async onOpen() {
		this.contentEl.addClass('course-nav-panel');
		this.render();
	}

	async onClose() {
		this.contentEl.empty();
	}

	render() {
		const { course } = this.plugin;
		const el = this.contentEl;
		const scrollTop = el.scrollTop;
		const current = this.plugin.currentFile();
		this.activePath = current ? current.path : null;
		el.empty();

		const header = el.createDiv({ cls: 'course-nav-panel-header' });
		const title = header.createDiv({
			cls: 'course-nav-panel-title',
			text: course.home ? course.home.basename : COURSE_TITLE,
		});
		if (course.home) {
			title.addClass('is-clickable');
			if (course.home.path === this.activePath) title.addClass('is-active');
			this.plugin.bindLink(title, course.home.path, { hoverParent: this });
		}

		const tree = el.createDiv({ cls: 'course-nav-tree' });
		for (const mod of course.modules) {
			this.node(tree, {
				key: `m${mod.num}`,
				cls: 'mod-module',
				number: mod.code,
				title: mod.title,
				file: mod.file,
				children: (box) => {
					for (const lesson of mod.lessonList) {
						this.node(box, {
							key: `l${lesson.code}`,
							cls: 'mod-lesson',
							number: lesson.code,
							title: lesson.title || `${KIND_LABEL.lesson} ${lesson.code}`,
							file: lesson.file,
							children: (inner) => {
								this.group(inner, KIND_LABEL.theory, lesson.theory);
								this.group(inner, KIND_LABEL.practice, lesson.practice);
							},
						});
					}
					if (mod.appendices.length) {
						this.node(box, {
							key: `a${mod.num}`,
							cls: 'mod-appendices',
							title: 'Приложения',
							children: (inner) => mod.appendices.forEach((item) => this.leafNode(inner, item)),
						});
					}
				},
			});
		}

		if (course.reference.length) {
			el.createDiv({ cls: 'course-nav-section', text: 'Справочник' });
			const ref = el.createDiv({ cls: 'course-nav-tree' });
			for (const { folder, files } of course.reference) {
				this.node(ref, {
					key: `r:${folder}`,
					cls: 'mod-reference',
					title: folder,
					flair: String(files.length),
					children: (box) => files.forEach((file) => this.node(box, { title: file.basename, file })),
				});
			}
		}

		el.scrollTop = scrollTop;
		if (this.scrollToActive) {
			const active = el.querySelector('.tree-item-self.is-active');
			if (active) active.scrollIntoView({ block: 'nearest' });
			this.scrollToActive = false;
		}
	}

	group(parent, label, items) {
		if (!items.length) return;
		parent.createDiv({ cls: 'course-nav-group', text: label });
		for (const item of items) this.leafNode(parent, item);
	}

	leafNode(parent, item) {
		this.node(parent, {
			number: String(item.num),
			title: item.title,
			file: item.file,
			flair: item.minutes ? `${item.minutes} мин` : null,
		});
	}

	node(parent, { key, cls, number, title, file, flair, children }) {
		const collapsible = typeof children === 'function';
		const expanded = collapsible && this.plugin.expanded.has(key);

		const item = parent.createDiv({ cls: 'tree-item course-nav-item' });
		if (cls) item.addClass(cls);
		const self = item.createDiv({ cls: 'tree-item-self is-clickable' });

		if (collapsible) {
			self.addClass('mod-collapsible');
			const icon = self.createDiv({ cls: 'tree-item-icon collapse-icon' });
			setIcon(icon, 'right-triangle');
			if (!expanded) {
				item.addClass('is-collapsed');
				icon.addClass('is-collapsed');
			}
			icon.addEventListener('click', (evt) => {
				evt.stopPropagation();
				this.plugin.toggle(key);
			});
		}

		const inner = self.createDiv({ cls: 'tree-item-inner' });
		if (number) inner.createSpan({ cls: 'course-nav-number', text: number });
		inner.createSpan({ cls: 'course-nav-title', text: title });
		if (flair) {
			self.createDiv({ cls: 'tree-item-flair-outer' }).createSpan({ cls: 'tree-item-flair', text: flair });
		}

		if (file) {
			if (file.path === this.activePath) self.addClass('is-active');
			this.plugin.bindLink(self, file.path, {
				hoverParent: this,
				after: () => collapsible && this.plugin.expand(key),
			});
		} else if (collapsible) {
			self.addEventListener('click', () => this.plugin.toggle(key));
		}

		if (expanded) children(item.createDiv({ cls: 'tree-item-children' }));
	}
}

// ===========================================================================
// Панель «Понятия статьи»

// Текст определения из карточки понятия. Блок `^def` в карточках стоит
// отдельной строкой после callout, но поддержан и вариант в конце абзаца.
function extractDefinition(text) {
	const lines = text.replace(/^---\r?\n[\s\S]*?\r?\n---(\r?\n|$)/, '').split(/\r?\n/);
	const block = [];

	// Блок — непрерывные непустые строки; если последняя строка цитата
	// или callout, то только строки цитаты.
	const collectUp = (from) => {
		const isQuote = /^\s*>/.test(lines[from]);
		for (let i = from; i >= 0 && lines[i].trim() !== ''; i--) {
			if (/^\s*>/.test(lines[i]) !== isQuote) break;
			block.unshift(lines[i]);
		}
	};

	const idLine = lines.findIndex((l) => l.trim() === '^' + DEF_BLOCK_ID);
	if (idLine !== -1) {
		let i = idLine - 1;
		while (i >= 0 && lines[i].trim() === '') i--;
		if (i < 0) return null;
		collectUp(i);
	} else {
		const tail = new RegExp('\\s\\^' + DEF_BLOCK_ID + '\\s*$');
		const inline = lines.findIndex((l) => tail.test(l));
		if (inline === -1) return null;
		collectUp(inline);
		block[block.length - 1] = block[block.length - 1].replace(tail, '');
	}

	const md = block
		.map((l) => l.replace(/^\s*>\s?/, ''))
		.filter((l) => !/^\[![^\]]+\]/.test(l.trim()))
		.join('\n')
		.trim();
	return md || null;
}

function pluralConcepts(n) {
	const mod10 = n % 10;
	const mod100 = n % 100;
	let word = 'понятий';
	if (mod10 === 1 && mod100 !== 11) word = 'понятие';
	else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) word = 'понятия';
	return `${n} ${word}`;
}

class ConceptView extends ItemView {
	constructor(leaf) {
		super(leaf);
		this.file = null;
		this.signature = null;
		this.refreshId = 0;
		this.defCache = new Map();
		this.renderComponent = null;
		this.hoverPopover = null;
		this.requestRefresh = debounce(() => this.refresh(), 300, true);
	}

	getViewType() {
		return CONCEPT_VIEW;
	}

	getDisplayText() {
		return CONCEPT_VIEW_TITLE;
	}

	getIcon() {
		return CONCEPT_VIEW_ICON;
	}

	async onOpen() {
		this.contentEl.addClass('concept-panel');

		const { workspace, metadataCache } = this.app;
		this.registerEvent(workspace.on('file-open', () => this.refresh()));
		this.registerEvent(workspace.on('active-leaf-change', () => this.refresh()));
		this.registerEvent(
			metadataCache.on('changed', (file) => {
				if (file.path.startsWith(CONCEPT_FOLDER)) this.defCache.delete(file.path);
				this.requestRefresh();
			})
		);
		this.registerEvent(metadataCache.on('resolved', () => this.requestRefresh()));

		this.registerDomEvent(this.contentEl, 'click', (evt) => this.onLinkClick(evt));
		this.registerDomEvent(this.contentEl, 'mouseover', (evt) => this.onLinkHover(evt));

		await this.refresh();
	}

	async onClose() {
		this.contentEl.empty();
	}

	// Ссылки на понятия в порядке первого упоминания; повторные упоминания
	// только увеличивают счётчик.
	collect() {
		if (!this.file) return [];
		const { metadataCache } = this.app;
		const cache = metadataCache.getFileCache(this.file);
		if (!cache) return [];

		const refs = [...(cache.links || []), ...(cache.embeds || [])].sort(
			(a, b) => a.position.start.offset - b.position.start.offset
		);

		const items = new Map();
		for (const ref of refs) {
			const dest = metadataCache.getFirstLinkpathDest(getLinkpath(ref.link), this.file.path);
			if (!dest || dest === this.file || !dest.path.startsWith(CONCEPT_FOLDER)) continue;
			const item = items.get(dest.path);
			if (item) item.count++;
			else items.set(dest.path, { dest, count: 1 });
		}
		return [...items.values()];
	}

	async getDefinition(file) {
		const cached = this.defCache.get(file.path);
		if (cached && cached.mtime === file.stat.mtime) return cached.md;
		const md = extractDefinition(await this.app.vault.cachedRead(file));
		this.defCache.set(file.path, { mtime: file.stat.mtime, md });
		return md;
	}

	async refresh() {
		// Когда фокус уходит в боковую панель, остаётся последняя открытая статья.
		const active = this.app.workspace.getActiveFile();
		if (active) this.file = active;

		const id = ++this.refreshId;
		const items = this.collect();
		const defs = await Promise.all(items.map((item) => this.getDefinition(item.dest)));
		if (id !== this.refreshId) return;

		const signature = [
			this.file ? this.file.path : '',
			...items.map((item) => `${item.dest.path}:${item.count}:${item.dest.stat.mtime}`),
		].join('|');
		if (signature === this.signature) return;
		this.signature = signature;

		this.render(items, defs);
	}

	render(items, defs) {
		const el = this.contentEl;
		const scrollTop = el.scrollTop;

		if (this.renderComponent) this.removeChild(this.renderComponent);
		this.renderComponent = this.addChild(new Component());
		el.empty();

		const header = el.createDiv({ cls: 'concept-panel-header' });
		header.createDiv({ cls: 'concept-panel-heading', text: 'Понятия в статье' });
		if (this.file) {
			const meta = header.createDiv({ cls: 'concept-panel-meta' });
			meta.createSpan({ cls: 'concept-panel-file', text: this.file.basename });
			if (items.length) {
				meta.createSpan({ cls: 'concept-panel-total', text: pluralConcepts(items.length) });
			}
		}

		if (!items.length) {
			el.createDiv({
				cls: 'concept-panel-empty',
				text: this.file ? 'В статье нет ссылок на понятия' : 'Откройте статью',
			});
			return;
		}

		const list = el.createDiv({ cls: 'concept-panel-list' });
		items.forEach((item, i) => {
			const row = list.createDiv({ cls: 'concept-panel-item' });
			row.dataset.source = item.dest.path;

			const title = row.createDiv({ cls: 'concept-panel-title' });
			title.createEl('a', {
				cls: 'internal-link',
				text: item.dest.basename,
				attr: { href: item.dest.path, 'data-href': item.dest.path },
			});
			if (item.count > 1) {
				title.createSpan({
					cls: 'concept-panel-count',
					text: '×' + item.count,
					attr: { 'aria-label': 'Ссылок в статье' },
				});
			}

			const body = row.createDiv({ cls: 'concept-panel-def' });
			if (defs[i]) {
				MarkdownRenderer.render(this.app, defs[i], body, item.dest.path, this.renderComponent);
			} else {
				body.createDiv({ cls: 'concept-panel-missing', text: 'Блок ^def не найден' });
			}
		});

		el.scrollTop = scrollTop;
	}

	linkAt(evt) {
		const a = evt.target.closest('a.internal-link');
		if (!a) return null;
		const row = a.closest('.concept-panel-item');
		return {
			el: a,
			linktext: a.dataset.href || a.getAttribute('href'),
			sourcePath: row ? row.dataset.source : '',
		};
	}

	onLinkClick(evt) {
		const link = this.linkAt(evt);
		if (!link) return;
		evt.preventDefault();
		this.app.workspace.openLinkText(link.linktext, link.sourcePath, Keymap.isModEvent(evt));
	}

	onLinkHover(evt) {
		const link = this.linkAt(evt);
		if (!link) return;
		this.app.workspace.trigger('hover-link', {
			event: evt,
			source: CONCEPT_VIEW,
			hoverParent: this,
			targetEl: link.el,
			linktext: link.linktext,
			sourcePath: link.sourcePath,
		});
	}
}

// ===========================================================================
// Плагин

module.exports = class EmbeddedSystemsCoursePlugin extends Plugin {
	async onload() {
		this.course = buildCourse(this.app);
		this.lastFile = null;
		this.expanded = new Set(loadLocal(this.app, 'expanded', []));

		this.registerView(COURSE_VIEW, (leaf) => new CourseView(leaf, this));
		this.registerView(CONCEPT_VIEW, (leaf) => new ConceptView(leaf));
		this.registerHoverLinkSource(COURSE_VIEW, { display: 'Навигация по курсу', defaultMod: true });
		this.registerHoverLinkSource(CONCEPT_VIEW, { display: CONCEPT_VIEW_TITLE, defaultMod: true });

		this.addRibbonIcon(COURSE_VIEW_ICON, 'Навигация по курсу', () => this.openCoursePanel());
		this.addRibbonIcon(CONCEPT_VIEW_ICON, CONCEPT_VIEW_TITLE, () => this.openConceptPanel());

		this.addCommand({ id: 'open-course', name: 'Открыть панель «Курс»', callback: () => this.openCoursePanel() });
		this.addCommand({ id: 'open-concepts', name: 'Открыть панель «Понятия статьи»', callback: () => this.openConceptPanel() });
		this.addCommand({ id: 'next', name: 'Далее', checkCallback: (checking) => this.go('next', checking) });
		this.addCommand({ id: 'prev', name: 'Назад', checkCallback: (checking) => this.go('prev', checking) });

		this.requestRebuild = debounce(() => this.rebuild(), 300, true);
		this.requestDecorate = debounce(() => this.decorateAll(), 50, true);
		this.decorateRetries = new WeakMap();
		this.previewObservers = new WeakMap();
		this.retryTimer = 0;

		document.body.addClass('course-nav-hide-legacy');
		// В режиме чтения Obsidian перестраивает содержимое заметки при каждой
		// отрисовке и стирает вставленную навигацию: возвращаем её на место.
		this.registerMarkdownPostProcessor((el) => {
			markLegacyNav(el);
			this.requestDecorate();
		});

		this.app.workspace.onLayoutReady(async () => {
			const { vault, metadataCache, workspace } = this.app;
			this.registerEvent(vault.on('create', () => this.requestRebuild()));
			this.registerEvent(vault.on('delete', () => this.requestRebuild()));
			this.registerEvent(vault.on('rename', () => this.requestRebuild()));
			this.registerEvent(metadataCache.on('changed', () => this.requestRebuild()));
			this.registerEvent(workspace.on('file-open', (file) => this.onFileOpen(file)));
			this.registerEvent(workspace.on('layout-change', () => this.requestDecorate()));
			this.registerEvent(workspace.on('active-leaf-change', () => this.requestDecorate()));

			this.course = buildCourse(this.app);
			this.onFileOpen(workspace.getActiveFile());

			// При первом включении панели открываются сами, дальше Obsidian
			// запоминает их место в раскладке.
			if (!loadLocal(this.app, 'panels-opened', false)) {
				await this.openCoursePanel();
				await this.openConceptPanel();
				saveLocal(this.app, 'panels-opened', true);
			}
		});
	}

	onunload() {
		window.clearTimeout(this.retryTimer);
		document.body.removeClass('course-nav-hide-legacy');
		document.querySelectorAll('.course-nav-top, .course-nav-bottom').forEach((el) => el.remove());
	}

	async openPanel(type, side) {
		const { workspace } = this.app;
		let leaf = workspace.getLeavesOfType(type)[0];
		if (!leaf) {
			leaf = side === 'left' ? workspace.getLeftLeaf(false) : workspace.getRightLeaf(false);
			await leaf.setViewState({ type, active: true });
		}
		workspace.revealLeaf(leaf);
	}

	openCoursePanel() {
		return this.openPanel(COURSE_VIEW, 'left');
	}

	openConceptPanel() {
		return this.openPanel(CONCEPT_VIEW, 'right');
	}

	currentFile() {
		return this.app.workspace.getActiveFile() || this.lastFile;
	}

	coursePanels() {
		return this.app.workspace
			.getLeavesOfType(COURSE_VIEW)
			.map((leaf) => leaf.view)
			.filter((view) => view instanceof CourseView);
	}

	rebuild() {
		const course = buildCourse(this.app);
		if (course.signature === this.course.signature) {
			// Режим чтения мог перерисовать заметку и потерять вставленную навигацию.
			this.requestDecorate();
			return;
		}
		this.course = course;
		this.coursePanels().forEach((view) => view.render());
		this.decorateAll();
	}

	onFileOpen(file) {
		if (file) {
			this.lastFile = file;
			const keys = this.ancestorKeys(file);
			if (keys.some((key) => !this.expanded.has(key))) {
				keys.forEach((key) => this.expanded.add(key));
				this.saveExpanded();
			}
		}
		for (const view of this.coursePanels()) {
			view.scrollToActive = true;
			view.render();
		}
		this.requestDecorate();
	}

	ancestorKeys(file) {
		const item = this.course.items.get(file.path);
		if (!item) {
			const parent = file.parent ? file.parent.path : '';
			return REFERENCE_DIRS.includes(parent) ? [`r:${parent}`] : [];
		}
		const mod = item.kind === 'module' ? item : item.module;
		const keys = [`m${mod.num}`];
		const lesson = item.kind === 'lesson' ? item : item.lesson;
		if (lesson) keys.push(`l${lesson.code}`);
		if (item.kind === 'appendix') keys.push(`a${mod.num}`);
		return keys;
	}

	toggle(key) {
		if (this.expanded.has(key)) this.expanded.delete(key);
		else this.expanded.add(key);
		this.saveExpanded();
		this.coursePanels().forEach((view) => view.render());
	}

	expand(key) {
		if (this.expanded.has(key)) return;
		this.expanded.add(key);
		this.saveExpanded();
	}

	saveExpanded() {
		saveLocal(this.app, 'expanded', [...this.expanded]);
	}

	go(direction, checking) {
		const file = this.app.workspace.getActiveFile();
		const item = file && this.course.items.get(file.path);
		const target = item && neighbours(this.course, item)[direction];
		if (!target) return false;
		if (!checking) this.app.workspace.getLeaf(false).openFile(target.file);
		return true;
	}

	// Клик открывает заметку в текущей вкладке (Ctrl — в новой), наведение
	// с Ctrl показывает предпросмотр.
	bindLink(el, path, { leaf = null, hoverParent = null, after = null } = {}) {
		const open = (evt, newLeaf) => {
			const file = this.app.vault.getAbstractFileByPath(path);
			if (!(file instanceof TFile)) return;
			evt.preventDefault();
			const target = newLeaf ? this.app.workspace.getLeaf(newLeaf) : leaf || this.app.workspace.getLeaf(false);
			target.openFile(file);
			if (after) after();
		};
		el.addEventListener('click', (evt) => open(evt, Keymap.isModEvent(evt)));
		el.addEventListener('auxclick', (evt) => {
			if (evt.button === 1) open(evt, 'tab');
		});
		el.addEventListener('mouseover', (evt) => {
			this.app.workspace.trigger('hover-link', {
				event: evt,
				source: COURSE_VIEW,
				hoverParent: hoverParent || el,
				targetEl: el,
				linktext: path,
				sourcePath: '',
			});
		});
	}

	// -------------------------------------------------------------------------
	// Навигация внутри заметок

	decorateAll() {
		for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
			this.watchPreview(leaf.view);
			this.decorateView(leaf.view);
		}
	}

	// В режиме чтения Obsidian строит содержимое заметки сам и при каждой
	// перерисовке стирает вставленную навигацию — в том числе уже после того,
	// как плагин отработал по событию. Наблюдатель ловит любую такую
	// перерисовку и просит вставить навигацию заново; лишние срабатывания
	// гасит проверка ключа в decorateView.
	watchPreview(view) {
		if (!view || !view.previewMode || this.previewObservers.has(view)) return;
		const target = view.previewMode.containerEl;
		if (!target) return;
		const observer = new MutationObserver(() => this.requestDecorate());
		observer.observe(target, { childList: true, subtree: true });
		this.previewObservers.set(view, observer);
		this.register(() => observer.disconnect());
	}

	navModel(item) {
		const crumbs = [];
		const { home } = this.course;
		if (home) crumbs.push({ text: 'Курс', title: home.basename, path: home.path });

		const mod = item.kind === 'module' ? item : item.module;
		const isModule = item.kind === 'module';
		crumbs.push({
			text: `${KIND_LABEL.module} ${mod.num}`,
			title: mod.title,
			path: !isModule && mod.file ? mod.file.path : null,
		});

		const lesson = item.kind === 'lesson' ? item : item.lesson;
		if (lesson) {
			crumbs.push({
				text: `${KIND_LABEL.lesson} ${lesson.code}`,
				title: lesson.title,
				path: item.kind !== 'lesson' && lesson.file ? lesson.file.path : null,
			});
		}

		if (item.kind === 'theory' || item.kind === 'practice' || item.kind === 'appendix') {
			const list = siblingsOf(item);
			crumbs.push({ text: `${KIND_LABEL[item.kind]} · ${list.indexOf(item) + 1} из ${list.length}` });
		}

		const { prev, next } = neighbours(this.course, item);
		const card = (target) =>
			target && {
				path: target.file.path,
				caption: `${KIND_LABEL[target.kind]} ${target.code}`,
				title: target.title || '',
				minutes: target.minutes || null,
			};
		const nextLabel = item.kind === 'lesson' ? 'Начать занятие' : item.kind === 'module' ? 'Начать модуль' : 'Далее';

		return { crumbs, prev: card(prev), next: card(next), prevLabel: 'Назад', nextLabel };
	}

	hostsOf(view) {
		const mode = typeof view.getMode === 'function' ? view.getMode() : 'source';
		if (mode === 'preview') {
			const sizer = view.previewMode?.containerEl.querySelector('.markdown-preview-sizer');
			if (!sizer) return null;
			const header = sizer.querySelector(':scope > .mod-header');
			const footer = sizer.querySelector(':scope > .mod-footer');
			return {
				mode,
				root: sizer,
				insertTop: (el) => (header || sizer).prepend(el),
				insertBottom: (el) => (footer ? footer.prepend(el) : sizer.append(el)),
			};
		}
		const sizer = view.contentEl.querySelector('.markdown-source-view .cm-sizer');
		if (!sizer) return null;
		return {
			mode,
			root: sizer,
			insertTop: (el) => {
				const title = sizer.querySelector(':scope > .inline-title');
				sizer.insertBefore(el, title || sizer.firstChild);
			},
			insertBottom: (el) => {
				const content = sizer.querySelector(':scope > .cm-contentContainer');
				if (content) content.after(el);
				else sizer.append(el);
			},
		};
	}

	// Режим чтения отрисовывает заметку асинхронно, поэтому контейнера для
	// вставки может ещё не быть. Пробуем ещё несколько раз, счётчик попыток
	// сбрасывается при первой удачной вставке.
	retryDecorate(view) {
		const left = (this.decorateRetries.get(view) ?? 5) - 1;
		if (left < 0) return;
		this.decorateRetries.set(view, left);
		window.clearTimeout(this.retryTimer);
		this.retryTimer = window.setTimeout(() => this.requestDecorate(), 100);
	}

	decorateView(view) {
		if (!view || !view.containerEl) return;
		const clear = () =>
			view.containerEl.querySelectorAll('.course-nav-top, .course-nav-bottom').forEach((el) => el.remove());

		const item = view.file ? this.course.items.get(view.file.path) : null;
		if (!item) {
			clear();
			return;
		}

		const host = this.hostsOf(view);
		if (!host) {
			clear();
			this.retryDecorate(view);
			return;
		}
		this.decorateRetries.delete(view);

		const model = this.navModel(item);
		const key = `${host.mode}|${view.file.path}|${JSON.stringify(model)}`;
		// Ищем уже вставленное там же, куда вставляем: иначе блок от предыдущей
		// заметки, переживший перерисовку, остаётся на странице.
		const existing = host.root.querySelectorAll('.course-nav-top, .course-nav-bottom');
		const top = host.root.querySelector('.course-nav-top');
		if (top && top.dataset.key === key && existing.length === (model.prev || model.next ? 2 : 1)) return;
		clear();

		const topEl = this.renderCrumbs(model, view);
		topEl.dataset.key = key;
		host.insertTop(topEl);
		if (model.prev || model.next) host.insertBottom(this.renderCards(model, view));
	}

	renderCrumbs(model, view) {
		const el = createDiv({ cls: 'course-nav-top' });
		model.crumbs.forEach((crumb, i) => {
			if (i) el.createSpan({ cls: 'course-nav-sep', text: '›' });
			const span = el.createSpan({ cls: 'course-nav-crumb', text: crumb.text });
			if (crumb.title) span.setAttr('aria-label', crumb.title);
			if (crumb.path) {
				span.addClass('is-link');
				this.bindLink(span, crumb.path, { leaf: view.leaf, hoverParent: view });
			} else if (i === model.crumbs.length - 1) {
				span.addClass('is-current');
			}
		});
		return el;
	}

	renderCards(model, view) {
		const el = createDiv({ cls: 'course-nav-bottom' });
		if (model.prev) this.renderCard(el, model.prev, model.prevLabel, 'prev', view);
		if (model.next) this.renderCard(el, model.next, model.nextLabel, 'next', view);
		return el;
	}

	renderCard(parent, card, label, direction, view) {
		const el = parent.createDiv({ cls: `course-nav-card mod-${direction}` });
		setIcon(el.createDiv({ cls: 'course-nav-card-icon' }), direction === 'prev' ? 'arrow-left' : 'arrow-right');
		const body = el.createDiv({ cls: 'course-nav-card-body' });
		const meta = [label, card.caption];
		if (card.minutes) meta.push(`${card.minutes} мин`);
		body.createDiv({ cls: 'course-nav-card-label', text: meta.join(' · ') });
		if (card.title) body.createDiv({ cls: 'course-nav-card-title', text: card.title });
		this.bindLink(el, card.path, { leaf: view.leaf, hoverParent: view });
	}
};
