import { useEffect, useState } from 'react';
import { FiEdit, FiEye, FiTrash2, FiPlus } from 'react-icons/fi';
import { getSuppliers, updateSupplier, deleteSupplier } from '../services/supplierService';
import Loading from '../components/Loading';

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await getSuppliers({});
      setSuppliers(res.suppliers || []);
    } catch (e) {
      setError(e?.error || 'Lỗi tải nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setEditForm({ ...supplier });
    setIsViewMode(true);
    setShowModal(true);
  };

  const handleEdit = async (supplier) => {
    setSelectedSupplier(supplier);
    setEditForm({ ...supplier });
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const updateData = {
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email,
        address: editForm.address,
        status: editForm.status
      };

      await updateSupplier(editForm._id, updateData);
      alert('Cập nhật nhà cung cấp thành công!');
      setShowModal(false);
      fetchSuppliers();
    } catch (e) {
      alert('Lỗi: ' + (e?.response?.data?.error || e.message));
    }
  };

  const handleDelete = async (supplierId) => {
    if (window.confirm('Bạn có chắc muốn xóa nhà cung cấp này? Hành động này không thể hoàn tác!')) {
      try {
        await deleteSupplier(supplierId);
        alert('Đã xóa nhà cung cấp thành công!');
        fetchSuppliers();
      } catch (e) {
        alert('Lỗi: ' + (e?.response?.data?.error || e.message));
      }
    }
  };

  if (loading) return <Loading text="Đang tải nhà cung cấp..." />;
  if (error) return <div style={{color:'#ef4444',padding:24}}>{error}</div>;

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 className="section-title" style={{margin:0}}>Quản lý nhà cung cấp</h2>
        <button className="btn" style={{display:'flex',alignItems:'center',gap:8}}>
          <FiPlus/> Thêm nhà cung cấp
        </button>
      </div>

      <div className="card" style={{overflow:'auto'}}>
        <table className="table" style={{margin:0}}>
          <thead>
            <tr>
              <th>Mã NCC</th>
              <th>Tên nhà cung cấp</th>
              <th>Số điện thoại</th>
              <th>Email</th>
              <th>Địa chỉ</th>
              <th>Trạng thái</th>
              <th style={{textAlign:'center'}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.code}>
                <td style={{fontWeight:600}}>{s.code}</td>
                <td>{s.name}</td>
                <td>{s.phone}</td>
                <td>{s.email}</td>
                <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.address}</td>
                <td>
                  <span style={{
                    background:s.status === 'active' ? '#d1fae5' : '#fee2e2',
                    color:s.status === 'active' ? '#065f46' : '#991b1b',
                    padding:'4px 12px',
                    borderRadius:4,
                    fontSize:12,
                    fontWeight:600
                  }}>
                    {s.status === 'active' ? '✓ Active' : '✗ Inactive'}
                  </span>
                </td>
                <td style={{textAlign:'center'}}>
                  <div style={{display:'flex',gap:8,justifyContent:'center'}}>
                    <button 
                      className="btn" 
                      onClick={() => handleViewDetails(s)}
                      style={{padding:'6px 12px',fontSize:12,background:'#3b82f6',display:'flex',alignItems:'center',gap:4}}
                      title="Xem chi tiết"
                    >
                      <FiEye size={16}/>
                      Xem
                    </button>
                    <button 
                      className="btn" 
                      onClick={() => handleEdit(s)}
                      style={{padding:'6px 12px',fontSize:12,background:'#10b981',display:'flex',alignItems:'center',gap:4}}
                      title="Sửa"
                    >
                      <FiEdit size={16}/>
                      Sửa
                    </button>
                    {s.status === 'inactive' && (
                      <button 
                        className="btn" 
                        onClick={() => handleDelete(s._id)}
                        style={{padding:'6px 12px',fontSize:12,background:'#ef4444',display:'flex',alignItems:'center',gap:4}}
                        title="Xóa nhà cung cấp"
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
                {isViewMode ? '👁️ Xem chi tiết nhà cung cấp' : '✏️ Sửa nhà cung cấp'}
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
              <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151'}}>Mã nhà cung cấp</label>
              <input 
                disabled 
                className="input" 
                value={editForm.code || ''} 
                style={{background:'#f9fafb',cursor:'not-allowed'}}
              />
            </div>

            <div style={{marginBottom:16}}>
              <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151'}}>Tên nhà cung cấp</label>
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
                <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151'}}>Số điện thoại</label>
                <input 
                  disabled={isViewMode}
                  className="input" 
                  value={editForm.phone || ''} 
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  style={isViewMode ? {background:'#f9fafb',cursor:'not-allowed'} : {}}
                />
              </div>
              <div>
                <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151'}}>Email</label>
                <input 
                  disabled={isViewMode}
                  className="input" 
                  type="email"
                  value={editForm.email || ''} 
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  style={isViewMode ? {background:'#f9fafb',cursor:'not-allowed'} : {}}
                />
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <label style={{display:'block',marginBottom:8,fontWeight:600,color:'#374151'}}>Địa chỉ</label>
              <textarea 
                disabled={isViewMode}
                className="input" 
                rows="3"
                value={editForm.address || ''} 
                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                style={isViewMode ? {background:'#f9fafb',cursor:'not-allowed'} : {}}
              />
            </div>

            <div style={{marginBottom:16}}>
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
                  💾 Lưu thay đổi
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
