import { useEffect, useState } from 'react';
import { FiEdit, FiEye, FiTrash2, FiPlus } from 'react-icons/fi';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import Loading from '../components/Loading';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({});
      setProducts(res.products || []);
    } catch (e) {
      setError(e?.error || 'Lỗi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setEditForm({ ...product });
    setIsViewMode(true);
    setShowModal(true);
  };

  const handleEdit = async (product) => {
    setSelectedProduct(product);
    setEditForm({ ...product });
    setIsViewMode(false);
    setIsCreateMode(false);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setEditForm({
      code: '',
      name: '',
      category: '',
      supplier_id: '',
      import_price: 0,
      sell_price: 0,
      total_quantity: 0,
      description: '',
      status: 'active'
    });
    setIsViewMode(false);
    setIsCreateMode(true);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (isCreateMode) {
        // Create new product
        const createData = {
          code: editForm.code,
          name: editForm.name,
          category: editForm.category,
          supplier_id: editForm.supplier_id,
          import_price: parseFloat(editForm.import_price),
          sell_price: parseFloat(editForm.sell_price),
          total_quantity: parseInt(editForm.total_quantity),
          description: editForm.description,
          status: editForm.status
        };
        await createProduct(createData);
        alert('Thêm sản phẩm thành công!');
      } else {
        // Update existing product
        const updateData = {
          name: editForm.name,
          category: editForm.category,
          supplier_id: editForm.supplier_id,
          import_price: parseFloat(editForm.import_price),
          sell_price: parseFloat(editForm.sell_price),
          total_quantity: parseInt(editForm.total_quantity),
          description: editForm.description,
          status: editForm.status
        };
        await updateProduct(editForm.code, updateData);
        alert('Cập nhật sản phẩm thành công!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (e) {
      alert('Lỗi: ' + (e?.response?.data?.error || e.message));
    }
  };

  const handleDelete = async (productCode) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác!')) {
      try {
        await deleteProduct(productCode);
        alert('Đã xóa sản phẩm thành công!');
        fetchProducts();
      } catch (e) {
        alert('Lỗi: ' + (e?.response?.data?.error || e.message));
      }
    }
  };

  if (loading) return <Loading text="Đang tải sản phẩm..." />;
  if (error) return <div style={{color:'#ef4444',padding:24}}>{error}</div>;

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 className="section-title" style={{margin:0}}>Quản lý sản phẩm</h2>
        <button className="btn" onClick={handleCreate} style={{display:'flex',alignItems:'center',gap:8}}>
          <FiPlus/> Thêm sản phẩm
        </button>
      </div>

      <div className="card" style={{overflow:'auto'}}>
        <table className="table" style={{margin:0}}>
          <thead>
            <tr>
              <th>Mã SP</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá bán</th>
              <th style={{textAlign:'right'}}>Tồn kho</th>
              <th>Trạng thái</th>
              <th style={{textAlign:'center'}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.code}>
                <td style={{fontWeight:600}}>{p.code}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td style={{color:'#ee4d2d',fontWeight:700}}>{p.sell_price?.toLocaleString()}đ</td>
                <td style={{textAlign:'right'}}>{p.total_quantity}</td>
                <td>
                  <span style={{
                    background:p.status === 'active' ? '#d1fae5' : '#fee2e2',
                    color:p.status === 'active' ? '#065f46' : '#991b1b',
                    padding:'4px 12px',
                    borderRadius:4,
                    fontSize:12,
                    fontWeight:600
                  }}>
                    {p.status === 'active' ? '✓ Active' : '✗ Inactive'}
                  </span>
                </td>
                <td style={{textAlign:'center'}}>
                  <div style={{display:'flex',gap:8,justifyContent:'center'}}>
                    <button 
                      className="btn" 
                      onClick={() => handleViewDetails(p)}
                      style={{padding:'6px 12px',fontSize:12,background:'#3b82f6',display:'flex',alignItems:'center',gap:4}}
                      title="Xem chi tiết"
                    >
                      <FiEye size={16}/>
                      Xem
                    </button>
                    <button 
                      className="btn" 
                      onClick={() => handleEdit(p)}
                      style={{padding:'6px 12px',fontSize:12,background:'#10b981',display:'flex',alignItems:'center',gap:4}}
                      title="Sửa"
                    >
                      <FiEdit size={16}/>
                      Sửa
                    </button>
                    {p.status === 'inactive' && (
                      <button 
                        className="btn" 
                        onClick={() => handleDelete(p.code)}
                        style={{padding:'6px 12px',fontSize:12,background:'#ef4444',display:'flex',alignItems:'center',gap:4}}
                        title="Xóa sản phẩm"
                      >
                        <FiTrash2 size={16}/>
                        Xóa
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position:'fixed',
          top:0,left:0,right:0,bottom:0,
          background:'rgba(0,0,0,.5)',
          display:'flex',alignItems:'center',justifyContent:'center',
          zIndex:1000,
          padding:20
        }}>
          <div className="card" style={{maxWidth:700,width:'90%',maxHeight:'85vh',overflowY:'auto',padding:32}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <h2 style={{margin:0,fontSize:24}}>
                {isCreateMode ? '➕ Thêm sản phẩm mới' : isViewMode ? '👁️ Xem chi tiết sản phẩm' : '✏️ Sửa sản phẩm'}
              </h2>
              {isViewMode && (
                <button 
                  className="btn" 
                  onClick={() => setIsViewMode(false)}
                  style={{background:'#10b981',padding:'8px 16px',fontSize:14}}
                >
                  Chuyển sang sửa
                </button>
              )}
            </div>
            
            <div style={{marginBottom:16}}>
              <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151'}}>Mã sản phẩm</label>
              <input 
                disabled={!isCreateMode}
                className="input" 
                value={editForm.code || ''} 
                onChange={(e) => setEditForm({...editForm, code: e.target.value})}
                style={!isCreateMode ? {background:'#f9fafb',cursor:'not-allowed'} : {}}
                placeholder={isCreateMode ? "VD: PRD001" : ""}
              />
            </div>

            <div style={{marginBottom:16}}>
              <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151'}}>Tên sản phẩm</label>
              <input 
                disabled={isViewMode}
                className="input" 
                value={editForm.name || ''} 
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                style={isViewMode ? {background:'#f9fafb',cursor:'not-allowed'} : {}}
              />
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div>
                <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151'}}>Danh mục</label>
                {isViewMode ? (
                  <input 
                    disabled
                    className="input" 
                    value={editForm.category || ''} 
                    style={{background:'#f9fafb',cursor:'not-allowed'}}
                  />
                ) : (
                  <select 
                    className="input" 
                    value={editForm.category || ''}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    style={{cursor:'pointer'}}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    <option value="Thực phẩm">Thực phẩm</option>
                    <option value="Quần áo">Quần áo</option>
                    <option value="Điện tử">Điện tử</option>
                    <option value="Đồ gia dụng">Đồ gia dụng</option>
                    <option value="Dụng cụ bếp">Dụng cụ bếp</option>
                  </select>
                )}
              </div>
              <div>
                <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151'}}>Nhà cung cấp ID</label>
                <input 
                  disabled={isViewMode}
                  className="input" 
                  value={editForm.supplier_id || ''} 
                  onChange={(e) => setEditForm({...editForm, supplier_id: e.target.value})}
                  style={isViewMode ? {background:'#f9fafb',cursor:'not-allowed'} : {}}
                />
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div>
                <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151'}}>Giá nhập (đ)</label>
                <input 
                  disabled={isViewMode}
                  className="input" 
                  type="number"
                  value={editForm.import_price || ''} 
                  onChange={(e) => setEditForm({...editForm, import_price: Number(e.target.value)})}
                  style={isViewMode ? {background:'#f9fafb',cursor:'not-allowed'} : {}}
                />
              </div>
              <div>
                <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151'}}>Giá bán (đ)</label>
                <input 
                  disabled={isViewMode}
                  className="input" 
                  type="number"
                  value={editForm.sell_price || ''} 
                  onChange={(e) => setEditForm({...editForm, sell_price: Number(e.target.value)})}
                  style={isViewMode ? {background:'#f9fafb',cursor:'not-allowed'} : {}}
                />
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div>
                <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151'}}>Tồn kho</label>
                <input 
                  disabled={isViewMode}
                  className="input" 
                  type="number"
                  value={editForm.total_quantity || ''} 
                  onChange={(e) => setEditForm({...editForm, total_quantity: Number(e.target.value)})}
                  style={isViewMode ? {background:'#f9fafb',cursor:'not-allowed'} : {}}
                />
              </div>
              <div>
                <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151'}}>Trạng thái</label>
                {isViewMode ? (
                  <input 
                    disabled
                    className="input" 
                    value={editForm.status === 'active' ? 'Active' : 'Inactive'} 
                    style={{background:'#f9fafb',cursor:'not-allowed'}}
                  />
                ) : (
                  <select 
                    className="input" 
                    value={editForm.status || 'active'}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    style={{cursor:'pointer'}}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                )}
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151'}}>Mô tả</label>
              <textarea 
                disabled={isViewMode}
                className="input" 
                rows="4"
                value={editForm.description || ''} 
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                style={isViewMode ? {background:'#f9fafb',cursor:'not-allowed'} : {}}
              />
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>
              <div>
                <label style={{display:'block',marginBottom:8,fontWeight:600,fontSize:12,color:'#6b7280'}}>Tạo lúc</label>
                <div style={{padding:'10px 12px',background:'#f9fafb',borderRadius:8,fontSize:13,border:'1px solid #e5e7eb'}}>
                  {editForm.created_at ? new Date(editForm.created_at).toLocaleString('vi-VN') : 'N/A'}
                </div>
              </div>
              <div>
                <label style={{display:'block',marginBottom:8,fontWeight:600,fontSize:12,color:'#6b7280'}}>Cập nhật lúc</label>
                <div style={{padding:'10px 12px',background:'#f9fafb',borderRadius:8,fontSize:13,border:'1px solid #e5e7eb'}}>
                  {editForm.updated_at ? new Date(editForm.updated_at).toLocaleString('vi-VN') : 'N/A'}
                </div>
              </div>
            </div>

            <div style={{display:'flex',gap:12}}>
              {!isViewMode && (
                <button className="btn" onClick={handleSave} style={{flex:1}}>
                  {isCreateMode ? '➕ Thêm sản phẩm' : '💾 Lưu thay đổi'}
                </button>
              )}
              <button 
                className="btn outline" 
                onClick={() => setShowModal(false)} 
                style={{flex:1}}
              >
                {isViewMode ? 'Đóng' : 'Hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
