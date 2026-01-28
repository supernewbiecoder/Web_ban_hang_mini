export default function Loading({ text = 'Loading...' }) {
  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <span>{text}</span>
    </div>
  );
}
