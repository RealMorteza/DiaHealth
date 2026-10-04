import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getQuestionnaireEnabled,
  questionnaireErrorMessage,
  setQuestionnaireEnabled,
} from '../../services/questionnaireService.js';

export function QuestionnaireSetting() {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setStatus('loading');
    setError('');

    try {
      const value = await getQuestionnaireEnabled();
      if (requestId.current !== currentRequest) return;
      setEnabled(value);
      setStatus('ready');
    } catch (reason) {
      if (requestId.current !== currentRequest) return;
      setError(questionnaireErrorMessage(reason));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    refresh();
    return () => { requestId.current += 1; };
  }, [refresh]);

  const toggle = async (event) => {
    const nextValue = event.target.checked;
    const currentRequest = ++requestId.current;
    setStatus('saving');
    setError('');

    try {
      const savedValue = await setQuestionnaireEnabled(nextValue);
      if (requestId.current !== currentRequest) return;
      setEnabled(savedValue);
      setStatus('ready');
    } catch (reason) {
      if (requestId.current !== currentRequest) return;
      setError(questionnaireErrorMessage(reason, 'ذخیره'));
      setStatus('error');
    }
  };

  return (
    <section className="profile-card questionnaire-setting">
      <div>
        <h2>پرسشنامه</h2>
        <p>نمایش دکمه شروع پرسشنامه برای همه کاربران</p>
        {error && <span className="questionnaire-error" role="alert">{error}</span>}
        {status === 'error' && (
          <button type="button" className="questionnaire-retry" onClick={refresh}>تلاش دوباره</button>
        )}
      </div>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={enabled}
          onChange={toggle}
          disabled={status !== 'ready'}
          aria-label="فعال‌سازی پرسشنامه"
        />
        <span aria-hidden="true" />
      </label>
    </section>
  );
}
