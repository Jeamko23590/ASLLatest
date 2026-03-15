export function TestPage() {
  return (
    <div style={{ padding: '40px', background: 'red', color: 'white', fontSize: '32px' }}>
      <h1>TEST PAGE - If you see this, routing works!</h1>
      <p>Current URL: {window.location.pathname}</p>
    </div>
  );
}
