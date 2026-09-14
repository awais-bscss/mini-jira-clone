import { useState, useMemo, useCallback, memo } from 'react';
import { Avatar } from '../../../components/Avatar/Avatar.jsx';
import { Spinner } from '../../../components/Spinner/Spinner.jsx';
import { useAddComment, useTaskComments } from '../../../hooks/useTasks.js';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue.js';
import { USERS, CURRENT_USER } from '../../../constants/data.js';
import { format } from 'date-fns';

const EMPTY_COMMENTS = Object.freeze([]);

export const TaskCommentsTab = memo(function TaskCommentsTab({ taskId, comments: initialComments = EMPTY_COMMENTS }) {
  const [commentText, setCommentText] = useState('');
  const [commentSearch, setCommentSearch] = useState('');
  const debouncedCommentSearch = useDebouncedValue(commentSearch, 200);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTaskComments(taskId, { limit: 20, search: debouncedCommentSearch });

  const addComment = useAddComment(taskId);

  const handleAddComment = useCallback((e) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;
    addComment.mutate(
      { text: trimmed, authorId: CURRENT_USER.id },
      {
        onSuccess: () => setCommentText(''),
      }
    );
  }, [commentText, addComment]);

  // Paginated comments from server
  const serverComments = useMemo(() => {
    if (!data?.pages) return null;
    return data.pages.flatMap(page => page.comments || []);
  }, [data]);

  // Use server paginated comments when available, otherwise fall back to initial prop
  const displayComments = serverComments !== null ? serverComments : initialComments;

  const totalCount = data?.pages?.[0]?.total ?? initialComments.length;
  const remainingCount = Math.max(0, totalCount - displayComments.length);

  return (
    <div className="space-y-4">
      {/* Search comments */}
      {(totalCount > 1 || commentSearch) && (
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="comment-search"
            type="text"
            autoComplete="off"
            value={commentSearch}
            onChange={e => setCommentSearch(e.target.value)}
            placeholder="Search comments..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md hover:border-slate-300 focus:outline-none focus:bg-white focus:border-[#0052CC] transition-colors"
          />
          {commentSearch && (
            <button
              type="button"
              onClick={() => setCommentSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
              aria-label="Clear comment search"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Add comment form */}
      <form onSubmit={handleAddComment} className="flex gap-2">
        <Avatar userId={CURRENT_USER.id} size="sm" className="shrink-0 mt-0.5" />
        <div className="flex-1 flex gap-2">
          <input
            id="comment-input"
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="input flex-1"
          />
          <button type="submit" className="btn-primary text-xs shrink-0" disabled={!commentText.trim() || addComment.isPending}>
            {addComment.isPending ? <Spinner size="sm" /> : 'Post'}
          </button>
        </div>
      </form>

      {/* Loading state for initial fetch */}
      {isLoading && !displayComments.length && (
        <div className="flex justify-center py-6">
          <Spinner size="md" />
        </div>
      )}

      {/* Comment list */}
      <div className="space-y-3">
        {!isLoading && displayComments.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6">
            {commentSearch ? 'No matching comments found.' : 'No comments yet.'}
          </p>
        )}
        {displayComments.map(c => (
          <div key={c.id} className="flex gap-3">
            <Avatar userId={c.authorId} size="sm" className="shrink-0" />
            <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-100/60">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-slate-700">
                  {USERS.find(u => u.id === c.authorId)?.name || 'Unknown'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {c.createdAt ? format(new Date(c.createdAt), 'MMM d, h:mm a') : 'Just now'}
                </span>
              </div>
              <p className="text-sm text-slate-600">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Load more / older comments button (Pattern A) */}
      {hasNextPage && (
        <div className="pt-2 text-center">
          <button
            type="button"
            id="load-more-comments"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#0052CC] bg-blue-50/80 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? (
              <>
                <Spinner size="xs" />
                <span>Loading older comments...</span>
              </>
            ) : (
              <span>Load older comments ({remainingCount} remaining)</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
});
