import * as React from 'react';

interface IndexProps {}

export const Index: React.FC<Readonly<IndexProps>> = () => {
  const [content, setContent] = React.useState(null);
  const [filename, setFilename] = React.useState('');

  const onSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          filename,
        }),
      });

      alert('Request sent');
    } catch (e) {
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
    
    reader.readAsArrayBuffer(files[0]);
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: 200 }}>
      <input type="file" name="file" onChange={onAddFileAction} accept="image/*" />
      <input type="submit" value="Send Email" />
    </form>
  );
};

export default Index;