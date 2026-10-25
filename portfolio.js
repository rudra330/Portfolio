/* Visitor interactions only. Project data and files are the captured admin version. */
(async () => {
  'use strict';
  const response = await fetch('portfolio-data.json');
  if (!response.ok) throw new Error('Could not load portfolio data.');
  const data = await response.json();
  const projects = new Map(data.projects.map(project => [project.id, project]));
  const cards = Array.from(document.querySelectorAll('#projects-grid article'));
  let folder = 'All Folders';
  let previousFocus;
  const modal = document.getElementById('visitor-project-modal');
  const search = document.getElementById('input-project-search');
  function filterCards() {
    const query = search.value.trim().toLocaleLowerCase();
    cards.forEach(card => {
      const project = projects.get(card.dataset.projectId);
      const matches = (folder === 'All Folders' || project.folder === folder) && [project.title, project.desc, project.folder, ...project.tags].join(' ').toLocaleLowerCase().includes(query);
      card.hidden = !matches;
      card.classList.toggle('hidden', !matches);
    });
  }
  const tabs = document.getElementById('folder-tabs-container');
  tabs.replaceChildren();
  for (const name of data.folders) {
    const count = name === 'All Folders' ? data.projects.length : data.projects.filter(project => project.folder === name).length;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '📁 ' + name + '  ' + count;
    button.dataset.folder = name;
    button.className = 'shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-800 bg-slate-900 text-slate-300';
    button.setAttribute('aria-pressed', String(name === folder));
    button.addEventListener('click', () => selectFolder(name));
    tabs.appendChild(button);
  }
  function selectFolder(name) {
    folder = name;
    for (const button of tabs.children) {
      const active = button.dataset.folder === name;
      button.setAttribute('aria-pressed', String(active));
      button.style.background = active ? '#06b6d4' : '';
      button.style.color = active ? '#020617' : '';
    }
    filterCards();
  }
  selectFolder(folder);
  search.addEventListener('input', filterCards);
  const navigation = document.querySelector('header nav a[href="#projects-section"]');
  if (navigation) navigation.textContent = 'Portfolio Folders (' + (data.folders.length - 1) + ')';
  function closeProject() {
    modal.classList.add('hidden');
    modal.querySelectorAll('video').forEach(video => video.pause());
    document.body.style.overflow = '';
    previousFocus?.focus();
  }
  function openProject(id) {
    const project = projects.get(id);
    if (!project) return;
    previousFocus = document.activeElement;
    document.getElementById('visitor-project-title').textContent = project.title;
    document.getElementById('visitor-project-folder').textContent = project.folder;
    const thumbnail = document.getElementById('visitor-project-thumb');
    thumbnail.src = project.thumb;
    thumbnail.alt = project.title;
    document.getElementById('visitor-project-desc').textContent = project.desc;
    const tags = document.getElementById('visitor-project-tags');
    tags.replaceChildren();
    for (const text of project.tags) {
      const tag = document.createElement('span'); tag.className = 'visitor-tag'; tag.textContent = text; tags.appendChild(tag);
    }
    const files = document.getElementById('visitor-project-files');
    files.replaceChildren();
    if (!project.files.length) {
      const empty = document.createElement('p'); empty.className = 'text-sm text-slate-400'; empty.textContent = 'No supporting files attached.'; files.appendChild(empty);
    }
    for (const file of project.files) {
      const panel = document.createElement('section'); panel.className = 'file-panel';
      const heading = document.createElement('div'); heading.className = 'file-heading';
      const title = document.createElement('span'); title.textContent = file.name; heading.appendChild(title);
      if (file.url) {
        const download = document.createElement('a'); download.href = file.url; download.download = file.name; download.className = 'file-download'; download.textContent = 'Download'; heading.appendChild(download);
      }
      panel.appendChild(heading);
      let preview;
      if (file.url && file.type === 'video') {
        preview = document.createElement('video'); preview.controls = true; preview.preload = 'metadata'; preview.src = file.url;
      } else if (file.url && file.type === 'image') {
        preview = document.createElement('img'); preview.src = file.url; preview.alt = file.name; preview.loading = 'lazy';
      } else if (file.url && file.type === 'pdf') {
        preview = document.createElement('iframe'); preview.src = file.url; preview.title = file.name; preview.style.height = '500px';
      }
      if (preview) { preview.className = 'file-preview'; panel.appendChild(preview); }
      if (file.note) { const note = document.createElement('p'); note.className = 'text-xs text-slate-400'; note.textContent = file.note; panel.appendChild(note); }
      files.appendChild(panel);
    }
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.getElementById('visitor-project-close').focus();
  }
  document.querySelectorAll('[data-open-modal]').forEach(button => button.addEventListener('click', () => openProject(button.dataset.openModal)));
  document.getElementById('visitor-project-close').addEventListener('click', closeProject);
  modal.addEventListener('click', event => { if (event.target === modal) closeProject(); });
  document.querySelectorAll('[data-open-folder]').forEach(button => button.addEventListener('click', () => { selectFolder(button.dataset.openFolder); document.getElementById('projects-section').scrollIntoView({behavior:'smooth'}); }));
  const resume = document.getElementById('resume-viewer-modal');
  document.getElementById('btn-view-resume-modal').addEventListener('click', () => resume.classList.remove('hidden'));
  document.getElementById('btn-close-resume-modal').addEventListener('click', () => resume.classList.add('hidden'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { if (!modal.classList.contains('hidden')) closeProject(); resume.classList.add('hidden'); }
    if (event.key === 'Tab' && !modal.classList.contains('hidden')) {
      const controls = Array.from(modal.querySelectorAll('button, a, video, iframe')).filter(element => !element.disabled);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-form-status');
  const fields = ['contact-name', 'contact-subject', 'contact-message'].map(id => document.getElementById(id));
  fields.forEach(field => field.addEventListener('input', () => { field.setCustomValidity(''); status.textContent = ''; }));
  form.addEventListener('submit', event => {
    fields.forEach(field => field.setCustomValidity(field.value.trim() ? '' : 'Please fill in this field.'));
    if (!form.reportValidity()) { event.preventDefault(); return; }
    document.getElementById('contact-source-url').value = location.origin + location.pathname;
    status.textContent = 'Complete verification on the FormSubmit page to finish your inquiry.';
  });
})().catch(error => {
  console.error(error);
  const message = document.createElement('p');
  message.setAttribute('role', 'alert'); message.style.cssText = 'padding:16px;color:#fda4af;text-align:center';
  message.textContent = 'The portfolio could not load fully. Please refresh the page.';
  document.body.appendChild(message);
});
