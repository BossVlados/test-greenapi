import { useCallback, useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ChatMessage } from '../types';
import { MessageBubble } from './MessageBubble';

interface Props {
  messages: ChatMessage[];
  onRetry?: (messageId: string) => void;
}

const ESTIMATED_ROW_HEIGHT = 60;
const BOTTOM_THRESHOLD = 40;
const SCROLL_BUTTON_THRESHOLD = 200;

export function MessageList({ messages, onRetry }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const wasAtBottomRef = useRef(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 6,
    getItemKey: (index) => messages[index]?.id ?? index,
  });

  const handleScroll = useCallback((): void => {
    const el = parentRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    wasAtBottomRef.current = distanceToBottom < BOTTOM_THRESHOLD;
    setShowScrollButton(distanceToBottom > SCROLL_BUTTON_THRESHOLD);
  }, []);

  const scrollToBottom = useCallback((): void => {
    if (messages.length === 0) return;
    virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
    setShowScrollButton(false);
    wasAtBottomRef.current = true;
  }, [messages.length, virtualizer]);

  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    const shouldScroll =
      wasAtBottomRef.current || last.direction === 'outgoing';
    if (shouldScroll) {
      virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
    }
  }, [messages.length, virtualizer]);

  useEffect(() => {
    wasAtBottomRef.current = true;
    setShowScrollButton(false);
    if (messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages[0]?.chatId]);

  return (
    <div className="message-list-wrapper">
      <div ref={parentRef} className="message-list" onScroll={handleScroll}>
        <div
          className="message-list-inner"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((vItem) => {
            const message = messages[vItem.index];
            if (!message) return null;
            return (
              <div
                key={vItem.key}
                data-index={vItem.index}
                ref={virtualizer.measureElement}
                className="message-list-row"
                style={{ transform: `translateY(${vItem.start}px)` }}
              >
                <MessageBubble message={message} onRetry={onRetry} />
              </div>
            );
          })}
        </div>
      </div>

      {showScrollButton && (
        <button
          type="button"
          className="scroll-to-bottom"
          onClick={scrollToBottom}
          aria-label="К последнему сообщению"
          title="К последнему сообщению"
        >
          ↓
        </button>
      )}
    </div>
  );
}