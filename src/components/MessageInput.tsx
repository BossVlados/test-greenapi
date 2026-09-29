import {
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { MAX_MESSAGE_LENGTH } from '../utils/splitMessage';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const MAX_TEXTAREA_HEIGHT = 140;

export function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [text]);

  const submit = (): void => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    submit();
  };

  const insertNewlineAtCursor = (): void => {
    const el = textareaRef.current;
    if (!el) return;

    const { selectionStart: start, selectionEnd: end, value } = el;
    const next = `${value.slice(0, start)}\n${value.slice(end)}`;
    setText(next);

    requestAnimationFrame(() => {
      const node = textareaRef.current;
      if (!node) return;
      const pos = start + 1;
      node.selectionStart = node.selectionEnd = pos;
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      insertNewlineAtCursor();
      return;
    }

    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !e.altKey &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      e.preventDefault();
      submit();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setText(e.target.value);
  };

  const overLimit = text.length > MAX_MESSAGE_LENGTH;
  const chunks = overLimit ? Math.ceil(text.length / MAX_MESSAGE_LENGTH) : 1;

  return (
    <form className="message-input" onSubmit={handleFormSubmit}>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Введите сообщение…"
        disabled={disabled}
        rows={1}
      />
      {overLimit && (
        <span
          className="char-counter"
          title={`Будет отправлено ${chunks} частями`}
        >
          {text.length} / {MAX_MESSAGE_LENGTH} · {chunks} части
        </span>
      )}
      <button type="submit" disabled={disabled || !text.trim()}>
        Отправить
      </button>
    </form>
  );
}