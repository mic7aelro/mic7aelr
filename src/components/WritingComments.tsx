'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { WritingComment } from '@/types/writing';
import styles from '@/app/writing/Writing.module.css';

export function WritingComments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<WritingComment[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    const response = await fetch(`/api/writing/comments?postId=${postId}`);
    const data = await response.json();
    setComments(data.comments || []);
    setLoading(false);
  }, [postId]);

  useEffect(() => { void loadComments(); }, [loadComments]);

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setStatus('Posting...');
    setSubmitting(true);
    try {
      const response = await fetch('/api/writing/comments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, postId }),
      });
      const data = await response.json();
      if (!response.ok) return setStatus(data.error || 'The comment could not be posted.');
      form.reset();
      setStatus('Comment posted.');
      await loadComments();
    } finally {
      setSubmitting(false);
    }
  };

  const react = async (commentId: string, value: 'like' | 'dislike') => {
    await fetch('/api/writing/comments', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commentId, value }),
    });
    await loadComments();
  };

  return (
    <section className={styles.comments}>
      <h2>Discussion</h2>
      <div className={styles.commentList}>
        {loading ? <p className={styles.empty}>Loading comments...</p> : comments.length === 0 ? <p className={styles.empty}>Start the discussion.</p> : comments.map((item) => (
          <article className={styles.comment} key={item.id}>
            <div className={styles.commentMeta}><strong>{item.name}</strong><time dateTime={item.createdAt}>{new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(item.createdAt))}</time></div>
            <p className={styles.commentText}>{item.comment}</p>
            <div className={styles.reactions}>
              <button className={`${styles.reaction} ${item.viewerReaction === 'like' ? styles.reactionActive : ''}`} type="button" onClick={() => react(item.id, 'like')} aria-pressed={item.viewerReaction === 'like'}>Like {item.likes}</button>
              <button className={`${styles.reaction} ${item.viewerReaction === 'dislike' ? styles.reactionActive : ''}`} type="button" onClick={() => react(item.id, 'dislike')} aria-pressed={item.viewerReaction === 'dislike'}>Dislike {item.dislikes}</button>
            </div>
          </article>
        ))}
      </div>
      <form className={styles.commentForm} onSubmit={submitComment}>
        <label>Name (optional)<input className={styles.field} name="name" maxLength={80} /></label>
        <label>Comment<textarea className={styles.textarea} name="comment" maxLength={2000} required data-lenis-prevent /></label>
        <button className={styles.button} type="submit" disabled={submitting}>{submitting ? 'Posting...' : 'Post comment'}</button>
      </form>
      {status && <p className={status.includes('could not') ? styles.error : styles.status}>{status}</p>}
    </section>
  );
}
