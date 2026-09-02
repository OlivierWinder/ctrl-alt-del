import { useState } from 'react';
import Window from './Window';
import { emails } from '../data/emailData';

const MAX_REPLY_WORDS = 100;
const BODY_EXTRA_LINES = 3;
const BODY_CHARS_PER_LINE = 72;

function estimateBodyLines(body) {
  if (!body) return 1;
  return body.split('\n').reduce((total, line) => (
    total + Math.max(1, Math.ceil(line.length / BODY_CHARS_PER_LINE))
  ), 0);
}

const EMAIL_BODY_LINES = Math.max(...emails.map((email) => estimateBodyLines(email.body)))
  + BODY_EXTRA_LINES;

function listLabel(email) {
  if (!email.subject) {
    return <span className="email-app__row-from">{email.from}</span>;
  }

  return (
    <span className="email-app__row-from">
      {email.from}
      {' - '}
      <strong className="email-app__row-subject">{email.subject}</strong>
    </span>
  );
}

function formatReceived(email) {
  return email.date || email.time || '';
}

function formatSent(email) {
  if (email.date && email.time) return `${email.date} ${email.time}`;
  return email.time || email.date || '';
}

function countWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function clampToMaxWords(text, maxWords) {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= maxWords) return text;
  return parts.slice(0, maxWords).join(' ');
}

function renderRichText(text) {
  if (!text) return null;

  const nodes = [];
  const tokenPattern = /(\*\*[^*]+\*\*|https?:\/\/[^\s]+)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={key}>{text.slice(lastIndex, match.index)}</span>);
      key += 1;
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(
        <a
          key={key}
          href={token}
          className="email-app__link"
          target="_blank"
          rel="noreferrer"
        >
          {token}
        </a>,
      );
    }
    key += 1;
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(<span key={key}>{text.slice(lastIndex)}</span>);
  }

  return nodes;
}

function EmailReplyWindow({
  email,
  zIndex,
  containerRef,
  stackOffset = 0,
  onClose,
  onFocus,
}) {
  const [replyText, setReplyText] = useState('');
  const wordCount = countWords(replyText);

  function handleChange(event) {
    const next = event.target.value;
    const nextWords = countWords(next);

    if (nextWords <= MAX_REPLY_WORDS) {
      setReplyText(next);
      return;
    }

    // Allow paste/replace up to the limit, but block anything beyond it
    if (wordCount < MAX_REPLY_WORDS) {
      setReplyText(clampToMaxWords(next, MAX_REPLY_WORDS));
    }
  }

  function handleBeforeInput(event) {
    if (wordCount < MAX_REPLY_WORDS) return;

    const data = event.data;
    if (data == null) return;

    // At the limit: only allow edits that don't add another word
    const startsNewWord = /\s/.test(replyText.slice(-1) || '') || replyText.length === 0;
    if (startsNewWord && /\S/.test(data)) {
      event.preventDefault();
      return;
    }
    if (!startsNewWord && /\s/.test(data)) {
      event.preventDefault();
    }
  }

  function handleSend() {
    onClose();
  }

  return (
    <Window
      title="Reply"
      variant="email-reply"
      zIndex={zIndex}
      containerRef={containerRef}
      stackOffset={stackOffset}
      onClose={onClose}
      onFocus={onFocus}
    >
      <div className="email-reply">
        <div className="email-reply__box">
          <div className="email-reply__header">
            <div>
              <strong>Replying to:</strong>
              {' '}
              {email.from}
            </div>
            <div>
              <strong>{email.subject}</strong>
            </div>
            {formatSent(email) ? (
              <div>
                <strong>Sent:</strong>
                {' '}
                {formatSent(email)}
              </div>
            ) : null}
          </div>

          <div className="email-reply__rule" aria-hidden="true">
            - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          </div>

          <textarea
            className="email-reply__input"
            value={replyText}
            onChange={handleChange}
            onBeforeInput={handleBeforeInput}
            placeholder="Type your reply…"
            aria-label="Reply message"
            spellCheck={false}
          />

          <div className="email-reply__footer">
            <span className="email-reply__words">
              {wordCount}/{MAX_REPLY_WORDS} words
            </span>
            <button
              type="button"
              className="email-reply__send"
              onClick={handleSend}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </Window>
  );
}

export default function EmailApp({
  title = 'E-MAIL',
  zIndex,
  containerRef,
  stackOffset = 0,
  onClose,
  onFocus,
}) {
  const [selectedId, setSelectedId] = useState(emails[0]?.id ?? null);
  const [replyEmail, setReplyEmail] = useState(null);
  const selected = emails.find((email) => email.id === selectedId) || emails[0] || null;

  return (
    <>
      <Window
        title={title}
        variant="email"
        zIndex={zIndex}
        containerRef={containerRef}
        stackOffset={stackOffset}
        onClose={onClose}
        onFocus={onFocus}
      >
        <div className="email-app">
          <div className="email-app__list-pane">
            <div className="email-app__list-header" role="row">
              <div className="email-app__col-from">From</div>
              <div className="email-app__col-received">Received</div>
            </div>

            <div className="email-app__list" role="listbox" aria-label="Inbox">
              {emails.map((email) => {
                const isActive = selected?.id === email.id;

                return (
                  <button
                    key={email.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={`email-app__row${isActive ? ' email-app__row--active' : ''}`}
                    onClick={() => setSelectedId(email.id)}
                  >
                    <div className="email-app__col-from">
                      {listLabel(email)}
                    </div>
                    <div className="email-app__col-received">{formatReceived(email)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="email-app__splitter" aria-hidden="true" />

          <div className="email-app__preview" aria-label="Selected email">
            {selected ? (
              <>
                <div className="email-app__meta">
                  <div className="email-app__meta-info">
                    <div>
                      <strong>From:</strong>
                      {' '}
                      {selected.from}
                    </div>
                    <div>
                      <strong>{selected.subject}</strong>
                    </div>
                    {formatSent(selected) ? (
                      <div>
                        <strong>Sent:</strong>
                        {' '}
                        {formatSent(selected)}
                      </div>
                    ) : null}
                  </div>
                  <div className="email-app__meta-actions">
                    <button
                      type="button"
                      className="email-app__reply"
                      onClick={() => setReplyEmail(selected)}
                    >
                      Reply
                    </button>
                  </div>
                </div>
                <div
                  className="email-app__body"
                  style={{ '--email-body-lines': EMAIL_BODY_LINES }}
                >
                  {renderRichText(selected.body)}
                </div>
              </>
            ) : (
              <p className="email-app__empty">No messages.</p>
            )}
          </div>
        </div>
      </Window>

      {replyEmail ? (
        <EmailReplyWindow
          email={replyEmail}
          zIndex={zIndex + 1}
          containerRef={containerRef}
          stackOffset={stackOffset + 1}
          onClose={() => setReplyEmail(null)}
          onFocus={onFocus}
        />
      ) : null}
    </>
  );
}
