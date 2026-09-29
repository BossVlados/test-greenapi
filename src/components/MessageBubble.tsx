import { memo, type MouseEvent } from 'react';
import type { ChatMessage } from '../types';
import { getAvatarColor, getInitial } from '../utils/avatar';

interface Props {
  message: ChatMessage;
  onRetry?: (messageId: string) => void;
}

const formatTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

const getStatusTitle = (message: ChatMessage): string => {
  if (message.pending) return 'Отправляется…';
  if (message.failed) return 'Не отправлено';
  switch (message.deliveryStatus) {
    case 'read':
      return 'Прочитано';
    case 'delivered':
      return 'Доставлено';
    case 'sent':
      return 'Отправлено';
    default:
      return 'Отправлено';
  }
};

function MessageBubbleBase({ message, onRetry }: Props) {
  const {
    id,
    direction,
    sender,
    text,
    timestamp,
    pending,
    failed,
    deliveryStatus,
  } = message;

  const isOutgoing = direction === 'outgoing';

  const handleRetry = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onRetry?.(id);
  };

  const statusClass = [
    'status',
    pending ? 'pending' : 'sent',
    deliveryStatus === 'delivered' ? 'delivered' : '',
    deliveryStatus === 'read' ? 'read' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const statusIcon = pending
    ? '⏳'
    : deliveryStatus === 'read'
      ? '✓✓'
      : '✓';

  return (
    <div className={`message-row ${isOutgoing ? 'outgoing' : 'incoming'}`}>
      {!isOutgoing && (
        <div
          className="avatar"
          style={{ backgroundColor: getAvatarColor(sender || '?') }}
          aria-hidden="true"
        >
          {getInitial(sender || '?')}
        </div>
      )}

      <div className={`message ${isOutgoing ? 'outgoing' : 'incoming'}`}>
        {!isOutgoing && sender && <div className="sender">{sender}</div>}

        <div className="bubble-body">
          <span className="text">{text}</span>
          <span className="meta">
            {formatTime(timestamp)}
            {isOutgoing &&
              (failed ? (
                <button
                  type="button"
                  className="status failed"
                  onClick={handleRetry}
                  title="Повторить отправку"
                  aria-label="Повторить отправку"
                >
                  ↻
                </button>
              ) : (
                <span className={statusClass} title={getStatusTitle(message)}>
                  {statusIcon}
                </span>
              ))}
          </span>
        </div>

        {failed && (
          <button
            type="button"
            className="error retry"
            onClick={handleRetry}
            title="Повторить отправку"
          >
            Не отправлено — повторить
          </button>
        )}
      </div>
    </div>
  );
}

export const MessageBubble = memo(MessageBubbleBase, (prev, next) => {
  const a = prev.message;
  const b = next.message;
  return (
    a.id === b.id &&
    a.text === b.text &&
    a.sender === b.sender &&
    a.timestamp === b.timestamp &&
    a.direction === b.direction &&
    a.pending === b.pending &&
    a.failed === b.failed &&
    a.deliveryStatus === b.deliveryStatus &&
    prev.onRetry === next.onRetry
  );
});