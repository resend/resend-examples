/**
 * API Keys Management Example
 *
 * Demonstrates the full API key lifecycle: list, create, rename, and
 * delete. There is no endpoint to retrieve a single key - Resend only
 * supports list, create, update (rename), and delete.
 *
 * @see https://resend.com/docs/dashboard/api-keys/introduction
 */

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/api-keys')({
  component: ApiKeysPage,
});

function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [permission, setPermission] = useState('sending_access');
  const [domainId, setDomainId] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createdToken, setCreatedToken] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [rowError, setRowError] = useState(null);

  const loadApiKeys = () => {
    setLoading(true);
    setError(null);
    fetch('/api/api-keys')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setApiKeys(data.apiKeys || []);
        }
      })
      .catch(() => setError('Failed to fetch API keys'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreatedToken(null);

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          permission,
          ...(permission === 'sending_access' && domainId ? { domainId } : {}),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setCreateError(data.error);
      } else {
        setCreatedToken(data.apiKey.token);
        setApiKeys((prev) => [{ id: data.apiKey.id, name: data.apiKey.name }, ...prev]);
        setName('');
        setDomainId('');
      }
    } catch {
      setCreateError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const startRename = (key) => {
    setRowError(null);
    setEditingId(key.id);
    setEditingName(key.name);
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleRename = async (id) => {
    setSavingId(id);
    setRowError(null);

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName }),
      });

      const data = await response.json();
      if (!response.ok) {
        setRowError(data.error);
      } else {
        setApiKeys((prev) =>
          prev.map((key) => (key.id === id ? { ...key, name: editingName } : key)),
        );
        setEditingId(null);
        setEditingName('');
      }
    } catch {
      setRowError('Network error. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setRowError(null);

    try {
      const response = await fetch(`/api/api-keys/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        setRowError(data.error);
      } else {
        setApiKeys((prev) => prev.filter((key) => key.id !== id));
      }
    } catch {
      setRowError('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '48px 16px' }}>
      <a href="/" style={{ fontSize: 14, color: '#666' }}>&larr; Back to examples</a>
      <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: '16px 0 8px' }}>API Keys</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Create, rename, and delete API keys used to authenticate with Resend.</p>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Create an API Key</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
              placeholder="Production Sending Key"
            />
          </div>

          <div>
            <label htmlFor="permission" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Permission</label>
            <select
              id="permission"
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              style={inputStyle}
            >
              <option value="full_access">Full access</option>
              <option value="sending_access">Sending access</option>
            </select>
          </div>

          {permission === 'sending_access' && (
            <div>
              <label htmlFor="domainId" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                Domain ID <span style={{ fontWeight: 400, color: '#999' }}>(optional, restricts sending to one domain)</span>
              </label>
              <input
                id="domainId"
                type="text"
                value={domainId}
                onChange={(e) => setDomainId(e.target.value)}
                style={inputStyle}
                placeholder="d91cd9bd-1176-453e-8fc1-35364d380206"
              />
            </div>
          )}

          <button type="submit" disabled={creating} style={buttonStyle}>
            {creating ? 'Creating...' : 'Create API Key'}
          </button>
        </form>

        {createError && (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 8, border: '1px solid #fca5a5', background: '#fef2f2' }}>
            <pre style={{ margin: 0, fontSize: 13, whiteSpace: 'pre-wrap' }}>{createError}</pre>
          </div>
        )}

        {createdToken && (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 8, border: '1px solid #fde68a', background: '#fffbeb' }}>
            <h3 style={{ fontWeight: 500, marginBottom: 8, color: '#92400e' }}>Save this token now</h3>
            <p style={{ fontSize: 14, color: '#a16207', marginBottom: 8 }}>
              This is the only time the full token is shown. Resend cannot display it again.
            </p>
            <pre style={{ margin: 0, fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{createdToken}</pre>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Your API Keys</h2>
        {loading && <p style={{ fontSize: 14, color: '#666' }}>Loading API keys...</p>}
        {error && <p style={{ fontSize: 14, color: '#dc2626' }}>{error}</p>}
        {!loading && !error && apiKeys.length === 0 && (
          <p style={{ fontSize: 14, color: '#666' }}>No API keys found. Create one above.</p>
        )}
        {rowError && <p style={{ fontSize: 14, color: '#dc2626', marginBottom: 12 }}>{rowError}</p>}
        {!loading && apiKeys.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {apiKeys.map((key) => (
              <div
                key={key.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #e5e5e5',
                }}
              >
                {editingId === key.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRename(key.id)}
                      disabled={savingId === key.id}
                      style={smallButtonStyle}
                    >
                      {savingId === key.id ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" onClick={cancelRename} style={smallGhostButtonStyle}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1, fontSize: 14 }}>{key.name}</span>
                    <button type="button" onClick={() => startRename(key)} style={smallGhostButtonStyle}>
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(key.id)}
                      disabled={deletingId === key.id}
                      style={smallDangerButtonStyle}
                    >
                      {deletingId === key.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>API Keys API</h2>
        <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, fontSize: 13, overflow: 'auto', lineHeight: 1.6 }}>
{`// Create an API key (the token is only returned here, once)
const { data: created } = await resend.apiKeys.create({
  name: 'Production Sending Key',
  permission: 'sending_access',
});

// List all API keys (no token, no single-key retrieve endpoint)
const { data: keys } = await resend.apiKeys.list();

// Rename a key - only \`name\` is patchable
const { data: updated } = await resend.apiKeys.update(created.id, {
  name: 'New Name',
});

// Delete a key
await resend.apiKeys.remove(created.id);`}
        </pre>
      </div>

      <div style={{ padding: 16, borderRadius: 8, background: '#f5f5f5', border: '1px solid #e5e5e5' }}>
        <h3 style={{ fontWeight: 500, marginBottom: 12 }}>Best Practices</h3>
        <ul style={{ fontSize: 14, color: '#666', margin: 0, paddingLeft: 20, lineHeight: 2 }}>
          <li><strong>Save the token immediately:</strong> It's shown once at creation and can't be retrieved again</li>
          <li><strong>Use least privilege:</strong> Prefer <code>sending_access</code> scoped to a single domain over <code>full_access</code></li>
          <li><strong>Never commit keys:</strong> Store them in environment variables or a secrets manager</li>
          <li><strong>Rotate and delete unused keys:</strong> Delete a key immediately if it may have leaked</li>
        </ul>
      </div>
    </main>
  );
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #e5e5e5',
  borderRadius: 6,
  fontSize: 14,
  boxSizing: 'border-box',
};

const buttonStyle = {
  width: '100%',
  padding: '10px 16px',
  background: '#000',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
};

const smallButtonStyle = {
  padding: '6px 12px',
  background: '#000',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const smallGhostButtonStyle = {
  padding: '6px 12px',
  background: '#fff',
  color: '#333',
  border: '1px solid #e5e5e5',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const smallDangerButtonStyle = {
  padding: '6px 12px',
  background: '#fff',
  color: '#dc2626',
  border: '1px solid #fca5a5',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};
