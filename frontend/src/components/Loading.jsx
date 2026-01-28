export default function Loading({ text = 'Loading...' }) {
  return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <div style={{
        display:'inline-block',
        width:50,
        height:50,
        border:'4px solid #f3f4f6',
        borderTop:'4px solid #ee4d2d',
        borderRadius:'50%',
        animation:'spin 1s linear infinite',
        marginBottom:16
      }}></div>
      <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      <div style={{color:'#6b7280',fontSize:16,fontWeight:500}}>{text}</div>
    </div>
  );
}
