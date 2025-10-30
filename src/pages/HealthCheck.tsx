export default function HealthCheck() {
  return (
    <div style={{padding:24}}>
      <h1 style={{color:"#FFD700"}}>✅ SmartFlow dev server is alive</h1>
      <p style={{color:"#fff"}}>Router & mount OK. If '/' is black, a page threw a runtime error.</p>
      <a href="/" style={{color:"#FFD700"}}>Back to Home</a>
    </div>
  );
}
