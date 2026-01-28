import { Link } from 'react-router-dom';
import { FiShoppingBag, FiTruck, FiShield } from 'react-icons/fi';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="card" style={{
        padding:'40px 32px',
        background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color:'#fff',
        marginBottom:30,
        display:'flex',
        alignItems:'center',
        justifyContent:'space-between',
        gap:24,
        flexWrap:'wrap'
      }}>
        <div style={{flex:1,minWidth:280}}>
          <h1 style={{margin:'0 0 12px',fontSize:36,fontWeight:900,lineHeight:1.2}}>Chào mứng đến MiniShop</h1>
          <p style={{margin:'0 0 24px',fontSize:16,opacity:0.95,lineHeight:1.6}}>Khám phá sản phẩm chất lượng với giá tốt nhất. Giao diện lấy cảm hứng từ Shopee.</p>
          <Link to="/products" className="btn" style={{background:'#fff',color:'#667eea',display:'inline-flex',alignItems:'center',gap:8}}>
            <FiShoppingBag/> Mua sắm ngay
          </Link>
        </div>
        <div style={{flex:0.8,minWidth:280,textAlign:'center'}}>
          <div style={{
            background:'rgba(255,255,255,.15)',
            borderRadius:16,
            padding:'24px 32px',
            backdropFilter:'blur(10px)',
            border:'2px solid rgba(255,255,255,.2)'
          }}>
            <div style={{fontSize:48,fontWeight:900,marginBottom:8}}>🎉 SALE</div>
            <div style={{fontSize:32,fontWeight:800}}>Lên đến 50%</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',gap:20,marginTop:30}}>
        <div className="card" style={{padding:24,textAlign:'center'}}>
          <FiTruck size={40} style={{color:'#ee4d2d',marginBottom:12}}/>
          <h3 style={{margin:'0 0 8px',fontSize:18}}>Giao hàng nhanh</h3>
          <p style={{margin:0,color:'#6b7280',fontSize:14}}>Giao hàng tốc độ trong 24h</p>
        </div>
        <div className="card" style={{padding:24,textAlign:'center'}}>
          <FiShield size={40} style={{color:'#ee4d2d',marginBottom:12}}/>
          <h3 style={{margin:'0 0 8px',fontSize:18}}>Bảo hành chất lượng</h3>
          <p style={{margin:0,color:'#6b7280',fontSize:14}}>Bảo hành 1 đổi 1 trong 30 ngày</p>
        </div>
        <div className="card" style={{padding:24,textAlign:'center'}}>
          <FiShoppingBag size={40} style={{color:'#ee4d2d',marginBottom:12}}/>
          <h3 style={{margin:'0 0 8px',fontSize:18}}>Nhiều ưu đãi</h3>
          <p style={{margin:0,color:'#6b7280',fontSize:14}}>Khuyến mãi hấp dẫn mỗi ngày</p>
        </div>
      </div>
    </div>
  );
}
