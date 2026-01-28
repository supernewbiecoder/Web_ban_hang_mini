export default function Home() {
  return (
    <div>
      <div className="card" style={{padding:24, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div>
          <h2 style={{margin:'0 0 8px'}}>Chào mừng đến MiniShop</h2>
          <p style={{margin:0,color:'#6b7280'}}>Khám phá sản phẩm với giao diện lấy cảm hứng từ Shopee.</p>
        </div>
        <img alt="banner" src="https://dummyimage.com/420x140/fff/aaa&text=Sale+Up+to+50%25" style={{borderRadius:10}} />
      </div>
    </div>
  );
}
