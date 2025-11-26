'use client';

import { useState } from 'react';

export default function HomePage() {
  const [content, setContent] = useState(null);
  const [filename, setFilename] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      const base64Content = content.split(',')[1];

      await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: base64Content,
          filename,
        }),
      });

      alert('Request sent');
    } catch {
      alert('Something went wrong');
    }
  };

  const onAddFileAction = (e) => {
    const reader = new FileReader();
    const files = e.target.files;

    reader.onload = (r) => {
      setContent(r.target.result.toString());
      setFilename(files[0].name);
    };

    reader.readAsDataURL(files[0]);
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: 200,
      }}
    >
      <input
        type="file"
        name="file"
        onChange={onAddFileAction}
        accept="image/*,.pdf"
      />
      <input type="submit" value="Send Email" />
    </form>
  );
}
