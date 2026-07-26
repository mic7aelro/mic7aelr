'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { WritingIndex } from '@/types/writing';
import styles from '@/app/writing/Writing.module.css';

type WorkspaceSnapshot = { group: Record<string, string>; area: Record<string, string>; post: Record<string, string>; editPost: Record<string, string> };
type DeleteTarget = { kind: 'group' | 'area' | 'post'; id: string; name: string };

type RatingBreakdown = NonNullable<WritingIndex['posts'][number]['ratingBreakdown']>;

const ratingCategories: Array<{ key: keyof RatingBreakdown; name: string; field: string; weight: number }> = [
  { key: 'story', name: 'Story', field: 'storyRating', weight: 30 },
  { key: 'musicAndSound', name: 'Music and sound', field: 'musicAndSoundRating', weight: 30 },
  { key: 'cinematography', name: 'Cinematography', field: 'cinematographyRating', weight: 20 },
  { key: 'direction', name: 'Direction', field: 'directionRating', weight: 12 },
  { key: 'acting', name: 'Acting', field: 'actingRating', weight: 8 },
];

function RatingFields({ values }: { values?: RatingBreakdown }) {
  const [scores, setScores] = useState<Record<string, string>>(() => Object.fromEntries(ratingCategories.map(({ key }) => [key, values?.[key]?.toString() || ''])));
  const complete = ratingCategories.every(({ key }) => scores[key] !== '' && Number.isFinite(Number(scores[key])));
  const aggregate = complete ? Math.round(ratingCategories.reduce((total, { key, weight }) => total + Number(scores[key]) * weight / 10, 0)) : null;
  return <fieldset className={styles.ratingEditor}><legend>Movie rating</legend><div className={styles.ratingGrid}>{ratingCategories.map(({ key, name, field, weight }) => <label key={key}>{name} · {weight}%<input className={styles.field} name={field} type="number" min="0" max="10" step="0.1" inputMode="decimal" value={scores[key]} placeholder="0–10" onChange={(event) => setScores((current) => ({ ...current, [key]: event.target.value }))} /></label>)}</div><p className={styles.ratingAggregate}><span>Aggregate</span><strong>{aggregate === null ? '—' : aggregate}<small>/100</small></strong></p></fieldset>;
}

const emptyIndex: WritingIndex = { groups: [], areas: [], posts: [], configured: true };
const draftStorageKey = 'writing-post-draft';

async function send(url: string, method: string, body?: object) {
  const response = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json();
  if (!response.ok) throw new RequestError(data.error || 'The request failed.', response.status, response.statusText);
  return data;
}

class RequestError extends Error {
  constructor(message: string, readonly status: number, readonly statusText: string) {
    super(message);
  }
}

export function WritingAdmin({ initialAuthenticated, initialIndex = emptyIndex, embedded = false }: { initialAuthenticated: boolean; initialIndex?: WritingIndex; embedded?: boolean }) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [index, setIndex] = useState<WritingIndex>(initialIndex);
  const [selectedPostId, setSelectedPostId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [newPostAreaId, setNewPostAreaId] = useState('');
  const [editPostAreaId, setEditPostAreaId] = useState('');
  const [workspaceView, setWorkspaceView] = useState<'content' | 'create'>('content');
  const [message, setMessage] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [ratingRestore, setRatingRestore] = useState<{ key: number; values?: RatingBreakdown }>({ key: 0 });
  const [editRatingRestore, setEditRatingRestore] = useState<{ key: number; values?: RatingBreakdown }>({ key: 0 });
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const editDraftRef = useRef<HTMLTextAreaElement>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formValues = (id: string) => {
    const form = document.querySelector<HTMLFormElement>(`#${id}`);
    if (!form) return {};
    return Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, String(value)]));
  };

  const captureWorkspace = (): WorkspaceSnapshot => ({
    group: formValues('group-editor'),
    area: formValues('area-editor'),
    post: formValues('post-editor'),
    editPost: formValues('edit-post-editor'),
  });

  const applyWorkspace = (snapshot: WorkspaceSnapshot) => {
    const applyForm = (id: string, values: Record<string, string>) => {
      const form = document.querySelector<HTMLFormElement>(`#${id}`);
      if (!form) return;
      Object.entries(values).forEach(([name, value]) => {
        const field = form.elements.namedItem(name);
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) field.value = value;
      });
    };
    applyForm('group-editor', snapshot.group || {});
    applyForm('area-editor', snapshot.area || {});
    applyForm('post-editor', snapshot.post || {});
    applyForm('edit-post-editor', snapshot.editPost || {});
    setNewPostAreaId(snapshot.post?.areaId || '');
    setEditPostAreaId(snapshot.editPost?.areaId || '');
    const getScores = (section: Record<string, string>) => {
      const score = (key: string) => section?.[key] === '' || section?.[key] === undefined ? undefined : Number(section[key]);
      const scores = {
        story: score('storyRating'), direction: score('directionRating'), acting: score('actingRating'),
        cinematography: score('cinematographyRating'), musicAndSound: score('musicAndSoundRating'),
      };
      return Object.values(scores).every((value) => typeof value === 'number' && Number.isFinite(value)) ? scores as RatingBreakdown : undefined;
    };
    const key = Date.now();
    setRatingRestore({ key, values: getScores(snapshot.post || {}) });
    setEditRatingRestore({ key, values: getScores(snapshot.editPost || {}) });
  };

  const storeLocalSnapshot = (snapshot: WorkspaceSnapshot) => {
    window.localStorage.setItem(draftStorageKey, JSON.stringify({ snapshot, updatedAt: new Date().toISOString() }));
  };

  const queueAutosave = () => {
    const snapshot = captureWorkspace();
    storeLocalSnapshot(snapshot);
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => { void send('/api/writing/draft', 'PATCH', { snapshot }).catch(() => setMessage('The browser saved the draft, but MongoDB autosave failed.')); }, 450);
  };

  const refresh = async () => {
    const response = await fetch('/api/writing/index');
    if (response.ok) setIndex(await response.json());
  };
  useEffect(() => { if (authenticated) void refresh(); }, [authenticated]);
  useEffect(() => {
    if (workspaceView !== 'create') return;
    let local: { snapshot?: WorkspaceSnapshot; updatedAt?: string } | null = null;
    try { local = JSON.parse(window.localStorage.getItem(draftStorageKey) || 'null'); } catch { window.localStorage.removeItem(draftStorageKey); }
    if (local?.snapshot) applyWorkspace(local.snapshot);
    void send('/api/writing/draft', 'GET').then((saved) => {
      if (!saved.snapshot) return;
      const localTime = local?.updatedAt ? new Date(local.updatedAt).getTime() : 0;
      const databaseTime = saved.updatedAt ? new Date(saved.updatedAt).getTime() : 0;
      if (databaseTime >= localTime) { applyWorkspace(saved.snapshot); storeLocalSnapshot(saved.snapshot); }
    }).catch(() => undefined);
  }, [workspaceView]);
  useEffect(() => {
    if (workspaceView !== 'content' || !selectedPostId) return;
    void send('/api/writing/draft', 'GET').then((saved) => {
      if (saved.snapshot?.editPost?.draftPostId === selectedPostId) applyWorkspace(saved.snapshot);
    }).catch(() => undefined);
  }, [workspaceView, selectedPostId]);

  const saveLocalDraft = () => {
    queueAutosave();
  };

  const formatDraft = (format: 'heading2' | 'heading3' | 'bold' | 'underline' | 'italic' | 'ordered' | 'unordered', field = draftRef.current) => {
    if (!field) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const selected = field.value.slice(start, end);
    let replaceStart = start;
    let replaceEnd = end;
    let replacement = selected;
    if (format === 'bold') replacement = (selected || 'bold text').split('\n').map((line) => `**${line}**`).join('\n');
    if (format === 'underline') replacement = (selected || 'underlined text').split('\n').map((line) => `++${line}++`).join('\n');
    if (format === 'italic') replacement = (selected || 'italic text').split('\n').map((line) => `_${line}_`).join('\n');
    if (format === 'heading2' || format === 'heading3') {
      const prefix = format === 'heading2' ? '## ' : '### ';
      replaceStart = field.value.lastIndexOf('\n', start - 1) + 1;
      const nextBreak = field.value.indexOf('\n', end);
      replaceEnd = nextBreak < 0 ? field.value.length : nextBreak;
      replacement = field.value.slice(replaceStart, replaceEnd).split('\n').map((line) => `${prefix}${line.replace(/^#{1,3}\s+/, '')}`).join('\n');
    }
    if (format === 'ordered' || format === 'unordered') {
      replaceStart = field.value.lastIndexOf('\n', start - 1) + 1;
      const nextBreak = field.value.indexOf('\n', end);
      replaceEnd = nextBreak < 0 ? field.value.length : nextBreak;
      const lines = field.value.slice(replaceStart, replaceEnd).split('\n');
      replacement = lines.map((line, index) => `${format === 'ordered' ? `${index + 1}. ` : '- '}${line.replace(/^(?:- |\d+\.\s+)/, '')}`).join('\n');
    }
    field.setRangeText(replacement, replaceStart, replaceEnd, 'select');
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.focus();
  };

  const handle = (action: (values: Record<string, FormDataEntryValue>, form: HTMLFormElement) => Promise<void>) => async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage('Saving...');
    try { await action(Object.fromEntries(new FormData(form)), form); setMessage('Saved.'); await refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'The request failed.'); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleteConfirmation !== deleteTarget.name || deleting) return;
    setDeleting(true);
    try {
      const endpoint = deleteTarget.kind === 'group' ? 'groups' : deleteTarget.kind === 'area' ? 'areas' : 'posts';
      await send(`/api/writing/${endpoint}`, 'DELETE', { id: deleteTarget.id, confirmation: deleteConfirmation });
      setDeleteTarget(null);
      setDeleteConfirmation('');
      setSelectedGroupId('');
      setSelectedAreaId('');
      setSelectedPostId('');
      setMessage(`${deleteTarget.kind[0].toUpperCase()}${deleteTarget.kind.slice(1)} deleted.`);
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  if (!authenticated) return (
    <main className={styles.admin}><div className={styles.login}>
      <h1>Author login</h1>
      <p className={styles.panelIntro}>Use the private credentials stored in your server environment.</p>
      <form className={styles.form} onSubmit={async (event) => {
        event.preventDefault(); setMessage('Signing in...');
        try { const values = Object.fromEntries(new FormData(event.currentTarget)); await send('/api/writing/auth', 'POST', values); window.location.assign('/writing'); }
        catch (error) { setMessage(error instanceof Error ? error.message : 'Sign-in failed.'); }
      }}>
        <label>Username<input className={styles.field} name="username" autoComplete="username" required /></label>
        <label>Password<input className={styles.field} name="password" type="password" autoComplete="current-password" required /></label>
        <button className={styles.button} type="submit">Sign in</button>
        {message && <p className={styles.error}>{message}</p>}
      </form>
    </div></main>
  );

  const selectedPost = index.posts.find((post) => post.id === selectedPostId);
  const selectedGroup = index.groups.find((group) => group.id === selectedGroupId);
  const selectedArea = index.areas.find((area) => area.id === selectedAreaId);
  const isMoviesArea = (areaId: string) => {
    const area = index.areas.find((item) => item.id === areaId);
    const group = index.groups.find((item) => item.id === area?.groupId);
    return group?.name.trim().toLowerCase() === 'movies';
  };
  const WorkspaceRoot = embedded ? 'section' : 'main';

  return (
    <WorkspaceRoot className={styles.admin}>
      <header className={styles.adminHeader}><div><h1>Author workspace</h1><p>Manage published content or create new writing.</p></div><div className={styles.adminActions}><a className={styles.secondaryButton} href="#published-writing">View published writing</a></div></header>
      <nav className={styles.workspaceTabs} aria-label="Author workspace views">
        <button type="button" className={workspaceView === 'content' ? styles.workspaceTabActive : ''} aria-current={workspaceView === 'content' ? 'page' : undefined} onClick={() => setWorkspaceView('content')}>Content</button>
        <button type="button" className={workspaceView === 'create' ? styles.workspaceTabActive : ''} aria-current={workspaceView === 'create' ? 'page' : undefined} onClick={() => setWorkspaceView('create')}>Create</button>
      </nav>
      <div className={styles.workspace}>
        {workspaceView === 'content' && <>
        <section className={styles.panel}>
          <div><h2>Content</h2><p className={styles.panelIntro}>Select a group, area, or post to edit it directly.</p></div>
          <div className={styles.contentOverview}>
            {index.groups.length === 0 ? <p className={styles.empty}>No groups exist yet.</p> : index.groups.map((group) => (
              <div className={styles.contentGroup} key={group.id}>
                <div className={styles.contentItem}><h3>{group.name}</h3><div className={styles.contentActions}><button type="button" onClick={() => { setSelectedGroupId(group.id); setSelectedAreaId(''); setSelectedPostId(''); }}>Edit</button><button className={styles.deleteAction} type="button" onClick={() => { setDeleteTarget({ kind: 'group', id: group.id, name: group.name }); setDeleteConfirmation(''); }}>Delete</button></div></div>
                {index.areas.filter((area) => area.groupId === group.id).map((area) => (
                  <div className={styles.contentArea} key={area.id}>
                    <div className={styles.contentItem}><p>{area.name}</p><div className={styles.contentActions}><button type="button" onClick={() => { setSelectedAreaId(area.id); setSelectedGroupId(''); setSelectedPostId(''); }}>Edit</button><button className={styles.deleteAction} type="button" onClick={() => { setDeleteTarget({ kind: 'area', id: area.id, name: area.name }); setDeleteConfirmation(''); }}>Delete</button></div></div>
                    {index.posts.filter((post) => post.areaId === area.id).map((post) => (
                      <div className={styles.contentPost} key={post.id}>
                        <a href={`/writing/${post.slug}`} target="_blank" rel="noreferrer">{post.title}</a>
                        <div className={styles.contentActions}><button type="button" onClick={() => { setSelectedPostId(post.id); setEditPostAreaId(post.areaId); setSelectedGroupId(''); setSelectedAreaId(''); }}>Edit</button><button className={styles.deleteAction} type="button" onClick={() => { setDeleteTarget({ kind: 'post', id: post.id, name: post.title }); setDeleteConfirmation(''); }}>Delete</button></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
        <section className={styles.panel}>
          <div><h2>Edit selection</h2><p className={styles.panelIntro}>Changes appear on the public writing page after you save.</p></div>
          {selectedGroup ? (
            <form className={styles.editor} key={selectedGroup.id} onSubmit={handle(async (values) => { await send('/api/writing/groups', 'PATCH', { ...values, id: selectedGroup.id }); })}>
              <label>Group name<input className={styles.field} name="name" required defaultValue={selectedGroup.name} /></label>
              <label>Description<textarea className={styles.textarea} name="description" defaultValue={selectedGroup.description} data-lenis-prevent /></label>
              <button className={styles.button} type="submit">Save group</button>
            </form>
          ) : selectedArea ? (
            <form className={styles.editor} key={selectedArea.id} onSubmit={handle(async (values) => { await send('/api/writing/areas', 'PATCH', { ...values, id: selectedArea.id }); })}>
              <label>Group<select className={styles.select} name="groupId" required defaultValue={selectedArea.groupId}>{index.groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
              <label>Area name<input className={styles.field} name="name" required defaultValue={selectedArea.name} /></label>
              <label>Description<textarea className={styles.textarea} name="description" defaultValue={selectedArea.description} data-lenis-prevent /></label>
              <button className={styles.button} type="submit">Save area</button>
            </form>
          ) : selectedPost ? (
            <form id="edit-post-editor" className={styles.editor} key={selectedPost.id} onInput={queueAutosave} onChange={queueAutosave} onSubmit={handle(async (values) => { await send('/api/writing/posts', 'PATCH', { ...values, id: selectedPost.id }); })}>
              <input type="hidden" name="draftPostId" value={selectedPost.id} />
              <label>Area<select className={styles.select} name="areaId" required value={editPostAreaId || selectedPost.areaId} onChange={(event) => setEditPostAreaId(event.target.value)}>{index.areas.map((area) => <option key={area.id} value={area.id}>{index.groups.find((group) => group.id === area.groupId)?.name} / {area.name}</option>)}</select></label>
              <div className={styles.editorRow}><label>Post title<input className={styles.field} name="title" required defaultValue={selectedPost.title} /></label><label>Short summary<input className={styles.field} name="excerpt" defaultValue={selectedPost.excerpt} /></label></div>
              {isMoviesArea(editPostAreaId || selectedPost.areaId) && <RatingFields key={editRatingRestore.key} values={editRatingRestore.values || selectedPost.ratingBreakdown} />}
              <div className={styles.draftField}><span id="edit-draft-label">Post text</span><div className={styles.formatToolbar} role="toolbar" aria-label="Post formatting"><button type="button" onClick={() => formatDraft('heading2', editDraftRef.current)}>H2</button><button type="button" onClick={() => formatDraft('heading3', editDraftRef.current)}>H3</button><button type="button" onClick={() => formatDraft('bold', editDraftRef.current)}><strong>B</strong></button><button type="button" onClick={() => formatDraft('underline', editDraftRef.current)}><u>U</u></button><button type="button" onClick={() => formatDraft('italic', editDraftRef.current)}><em>I</em></button><button type="button" onClick={() => formatDraft('unordered', editDraftRef.current)}>Bullets</button><button type="button" onClick={() => formatDraft('ordered', editDraftRef.current)}>Numbers</button></div><div className={styles.draftWrap}><textarea ref={editDraftRef} className={`${styles.textarea} ${styles.draft}`} name="body" rows={16} required defaultValue={selectedPost.body} aria-labelledby="edit-draft-label" data-lenis-prevent /></div></div>
              <div className={styles.editorActions}><button className={styles.button} type="submit">Save post</button><a className={styles.previewLink} href={`/writing/${selectedPost.slug}`} target="_blank" rel="noreferrer">View post</a></div>
            </form>
          ) : <p className={styles.empty}>Select Edit beside a content item.</p>}
        </section>
        </>}
        {workspaceView === 'create' && <>
        <section className={styles.panel}>
          <div><h2>New group</h2><p className={styles.panelIntro}>Use groups for broad subjects.</p></div>
          <form id="group-editor" className={styles.editor} onInput={queueAutosave} onChange={queueAutosave} onSubmit={handle(async (values, form) => { await send('/api/writing/groups', 'POST', values); form.reset(); queueAutosave(); })}>
            <label>Group name<input className={styles.field} name="name" required /></label>
            <label>Description<textarea className={styles.textarea} name="description" data-lenis-prevent /></label>
            <button className={styles.button}>Create group</button>
          </form>
        </section>
        <section className={styles.panel}>
          <div><h2>New area</h2><p className={styles.panelIntro}>Use areas for focused discussions inside a group.</p></div>
          <form id="area-editor" className={styles.editor} onInput={queueAutosave} onChange={queueAutosave} onSubmit={handle(async (values, form) => { await send('/api/writing/areas', 'POST', values); form.reset(); queueAutosave(); })}>
            <label>Group<select className={styles.select} name="groupId" required defaultValue=""><option value="" disabled>Select group</option>{index.groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
            <label>Area name<input className={styles.field} name="name" required /></label>
            <label>Description<textarea className={styles.textarea} name="description" data-lenis-prevent /></label>
            <button className={styles.button}>Create area</button>
          </form>
        </section>
        <section className={styles.panel}>
          <div><h2>New post</h2><p className={styles.panelIntro}>Write the post, then review the text before you publish.</p></div>
          <form id="post-editor" className={styles.editor} onInput={saveLocalDraft} onChange={queueAutosave} onSubmit={handle(async (values, form) => { await send('/api/writing/posts', 'POST', values); form.reset(); setNewPostAreaId(''); window.localStorage.removeItem(draftStorageKey); await send('/api/writing/draft', 'PATCH', { snapshot: { group: formValues('group-editor'), area: formValues('area-editor'), post: {} } }); })}>
            <label>Area<select className={styles.select} name="areaId" required value={newPostAreaId} onChange={(event) => setNewPostAreaId(event.target.value)}><option value="" disabled>Select area</option>{index.areas.map((area) => <option key={area.id} value={area.id}>{index.groups.find((group) => group.id === area.groupId)?.name} / {area.name}</option>)}</select></label>
            <div className={styles.editorRow}><label>Post title<input className={styles.field} name="title" required /></label><label>Short summary<input className={styles.field} name="excerpt" /></label></div>
            {isMoviesArea(newPostAreaId) && <RatingFields key={ratingRestore.key} values={ratingRestore.values} />}
            <div className={styles.draftField}><span id="draft-label">Draft</span><div className={styles.formatToolbar} role="toolbar" aria-label="Draft formatting"><button type="button" onClick={() => formatDraft('heading2')}>H2</button><button type="button" onClick={() => formatDraft('heading3')}>H3</button><button type="button" onClick={() => formatDraft('bold')}><strong>B</strong></button><button type="button" onClick={() => formatDraft('underline')}><u>U</u></button><button type="button" onClick={() => formatDraft('italic')}><em>I</em></button><button type="button" onClick={() => formatDraft('unordered')}>Bullets</button><button type="button" onClick={() => formatDraft('ordered')}>Numbers</button></div><div className={styles.draftWrap}><textarea ref={draftRef} className={`${styles.textarea} ${styles.draft}`} name="body" rows={16} required aria-labelledby="draft-label" data-lenis-prevent /></div></div>
            <div className={styles.editorActions}><button className={styles.button} type="submit">Publish post</button></div>
          </form>
        </section>
        </>}
      </div>
      {deleteTarget && <div className={styles.deleteOverlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) setDeleteTarget(null); }}><section className={styles.deleteDialog} role="dialog" aria-modal="true" aria-labelledby="delete-title"><p className={styles.kicker}>Permanent action</p><h2 id="delete-title">Delete {deleteTarget.kind}</h2><p>{deleteTarget.kind === 'post' ? 'This removes the post, its comments, and all reactions.' : `This removes the ${deleteTarget.kind} and all content inside it.`}</p><label>Type <strong>{deleteTarget.name}</strong> to confirm<input className={styles.field} value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} autoFocus /></label><div className={styles.deleteDialogActions}><button className={styles.secondaryButton} type="button" disabled={deleting} onClick={() => setDeleteTarget(null)}>Cancel</button><button className={styles.deleteButton} type="button" disabled={deleteConfirmation !== deleteTarget.name || deleting} onClick={() => void confirmDelete()}>{deleting ? 'Deleting...' : `Delete ${deleteTarget.kind}`}</button></div></section></div>}
      {message && <p className={message.toLowerCase().includes('failed') || message.toLowerCase().includes('not') ? styles.error : styles.status}>{message}</p>}
    </WorkspaceRoot>
  );
}
