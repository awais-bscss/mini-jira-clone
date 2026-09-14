import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal } from '../../components/Modal/Modal.jsx';
import { Tabs } from '../../components/Tabs/Tabs.jsx';
import { Spinner } from '../../components/Spinner/Spinner.jsx';
import { useTask } from '../../hooks/useTasks.js';
import { TaskDetailsTab } from './detail/TaskDetailsTab.jsx';
import { TaskCommentsTab } from './detail/TaskCommentsTab.jsx';
import { TaskActivityTab } from './detail/TaskActivityTab.jsx';

export function TaskDetailModal() {
  const { boardId, taskId } = useParams();
  const navigate = useNavigate();
  const { data: task, isLoading, isError } = useTask(taskId);

  const handleClose = useCallback(() => {
    navigate(`/board/${boardId}`);
  }, [navigate, boardId]);

  return (
    <Modal
      isOpen={!!taskId}
      onClose={handleClose}
      title={task?.taskKey || 'Task Detail'}
      size="lg"
      id="task-detail"
    >
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {isError && !task && (
        <div className="p-8 text-center">
          <p className="text-red-500 font-medium">Failed to load task</p>
          <button onClick={handleClose} className="mt-4 btn-secondary">Close</button>
        </div>
      )}

      {task && (
        <div className="flex flex-col">
          <Tabs defaultTab="details">
            <Tabs.List className="px-6">
              <Tabs.Tab id="details">Details</Tabs.Tab>
              <Tabs.Tab id="comments">Comments ({task.comments?.length || 0})</Tabs.Tab>
              <Tabs.Tab id="activity">Activity</Tabs.Tab>
            </Tabs.List>

            {/* ── Details Tab ── */}
            <Tabs.Panel id="details" className="p-6">
              <TaskDetailsTab
                key={task.id}
                task={task}
                boardId={boardId}
                onDeleteSuccess={handleClose}
              />
            </Tabs.Panel>

            {/* ── Comments Tab ── */}
            <Tabs.Panel id="comments" className="p-6">
              <TaskCommentsTab
                taskId={task.id}
                comments={task.comments}
              />
            </Tabs.Panel>

            {/* ── Activity Tab ── */}
            <Tabs.Panel id="activity" className="p-6">
              <TaskActivityTab
                task={task}
              />
            </Tabs.Panel>
          </Tabs>
        </div>
      )}
    </Modal>
  );
}
