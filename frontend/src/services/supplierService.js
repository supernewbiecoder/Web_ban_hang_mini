import api from './api';

export const getSuppliers = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.name) params.append('name', filters.name);
  if (filters.code) params.append('code', filters.code);
  if (filters.status) params.append('status', filters.status);

  const query = params.toString();
  const url = query ? `/suppliers?${query}` : '/suppliers';
  const res = await api.get(url);
  return res.data;
};

export const createSupplier = async (supplierData) => {
  const res = await api.post('/suppliers', supplierData);
  return res.data;
};

export const updateSupplier = async (code, supplierData) => {
  const res = await api.patch(`/suppliers/${code}`, supplierData);
  return res.data;
};

export const deleteSupplier = async (code) => {
  const res = await api.delete(`/suppliers/${code}`);
  return res.data;
};

export const setSupplierActive = async (code) => {
  const res = await api.patch(`/suppliers/active/${code}`);
  return res.data;
};

export const setSupplierInactive = async (code) => {
  const res = await api.patch(`/suppliers/inactive/${code}`);
  return res.data;
};
