/**
 * 🏪 Shop Phase Component
 * 
 * หน้าขายของ, จัดสต็อก, ตั้งราคา
 * Accessibility: Fixed with semantic buttons, ARIA labels, focus styles, WCAG color contrast
 */

import React, { useState } from 'react';
import Button, { IconButton } from '../Button';

// Item Card Component - Fixed: proper buttons
const ItemCard = ({ item, onEdit, onDelete, onStock }) => (
  <article className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-700 hover:border-yellow-500/50 transition-all group">
    <div className="flex items-start gap-4">
      {/* Item Icon */}
      <div 
        className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-600 to-amber-800 flex items-center justify-center text-3xl shadow-lg"
        aria-hidden="true"
      >
        {item.icon}
      </div>
      
      {/* Item Info */}
      <div className="flex-1">
        <h3 className="text-white font-bold text-lg">{item.name}</h3>
        <p className="text-gray-300 text-sm mb-2">{item.description}</p>
        
        <div className="flex items-center gap-4">
          {/* Price */}
          <div className="flex items-center gap-1">
            <span className="text-yellow-400" aria-hidden="true">💰</span>
            <span className="text-white font-bold">{item.price}</span>
          </div>
          
          {/* Stock */}
          <div className="flex items-center gap-2">
            <span className="text-gray-300 text-sm">สต็อก:</span>
            <span className={`font-bold ${item.stock < 5 ? 'text-red-400' : 'text-green-400'}`}>
              {item.stock}
            </span>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col gap-2">
        <IconButton 
          onClick={() => onEdit(item)} 
          ariaLabel={`แก้ไข ${item.name}`}
          variant="primary"
          size="sm"
        >
          ✏️
        </IconButton>
        <IconButton 
          onClick={() => onDelete(item.id)} 
          ariaLabel={`ลบ ${item.name}`}
          variant="danger"
          size="sm"
        >
          🗑️
        </IconButton>
      </div>
    </div>
    
    {/* Stock Controls */}
    <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
      <div className="flex items-center gap-2" role="group" aria-label="ปรับจำนวนสินค้า">
        <IconButton 
          onClick={() => onStock(item.id, -1)} 
          ariaLabel={`ลดจำนวน ${item.name}`}
          variant="secondary"
          size="sm"
          disabled={item.stock <= 0}
        >
          -
        </IconButton>
        <span className="text-white w-8 text-center" aria-live="polite">{item.stock}</span>
        <IconButton 
          onClick={() => onStock(item.id, 1)} 
          ariaLabel={`เพิ่มจำนวน ${item.name}`}
          variant="secondary"
          size="sm"
        >
          +
        </IconButton>
      </div>
      <span className={`text-sm ${item.stock === 0 ? 'text-red-400' : 'text-gray-300'}`} aria-live="polite">
        {item.stock === 0 ? '❌ สินค้าหมด' : `${item.sold} ชิ้น ขายแล้ว`}
      </span>
    </div>
  </article>
);

// Add Item Modal - Fixed: proper form and buttons
const AddItemModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '', icon: '📦', price: 0, stock: 10, description: '' });
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-md border border-gray-700">
        <h2 id="modal-title" className="text-2xl font-bold text-white mb-6">➕ เพิ่มสินค้าใหม่</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="item-name" className="text-gray-300 text-sm">ชื่อสินค้า</label>
            <input
              id="item-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mt-1 border border-gray-700 focus:border-yellow-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              placeholder="เช่น ยาพิษ"
              required
            />
          </div>
          
          <div>
            <label id="icon-label" className="text-gray-300 text-sm">ไอคอน</label>
            <div className="flex gap-2 mt-1" role="radiogroup" aria-labelledby="icon-label">
              {['⚔️', '🛡️', '🧪', '📦', '💎', '🍖'].map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({...formData, icon})}
                  aria-pressed={formData.icon === icon}
                  aria-label={`เลือกไอคอน ${icon}`}
                  className={`w-10 h-10 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                    formData.icon === icon ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="item-price" className="text-gray-300 text-sm">ราคา (💰)</label>
              <input
                id="item-price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mt-1 border border-gray-700 focus:border-yellow-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                min="0"
                required
              />
            </div>
            <div className="flex-1">
              <label htmlFor="item-stock" className="text-gray-300 text-sm">สต็อก</label>
              <input
                id="item-stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mt-1 border border-gray-700 focus:border-yellow-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                min="0"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="item-description" className="text-gray-300 text-sm">คำอธิบาย</label>
            <textarea
              id="item-description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mt-1 border border-gray-700 focus:border-yellow-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 h-20 resize-none"
              placeholder="รายละเอียดสินค้า..."
            />
          </div>
        
          <div className="flex gap-4 mt-6">
            <Button 
              type="button"
              onClick={onClose} 
              variant="secondary"
              ariaLabel="ยกเลิกการเพิ่มสินค้า"
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button 
              type="submit"
              variant="warning"
              ariaLabel="บันทึกสินค้า"
              className="flex-1"
            >
              💾 บันทึก
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Shop Phase Component
export default function ShopPhase() {
  const [items, setItems] = useState([
    { id: 1, name: 'ยาพิษ', icon: '🧪', price: 50, stock: 10, description: 'พิษสำหรับอาวุธ', sold: 3 },
    { id: 2, name: 'หน้ากาก', icon: '🎭', price: 100, stock: 5, description: 'ปกปิดตัวตน', sold: 1 },
    { id: 3, name: 'อาหาร', icon: '🍖', price: 30, stock: 20, description: 'ฟื้นฟูพลัง', sold: 8 },
  ]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all');
  
  const totalRevenue = items.reduce((acc, item) => acc + (item.sold * item.price), 0);
  const totalStock = items.reduce((acc, item) => acc + item.stock, 0);
  
  const handleStockChange = (id, delta) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, stock: Math.max(0, item.stock + delta) } : item
    ));
  };
  
  const handleAddItem = (newItem) => {
    setItems([...items, { ...newItem, id: Date.now(), sold: 0 }]);
    setShowAddModal(false);
  };
  
  const filteredItems = filter === 'all' ? items : filter === 'low' 
    ? items.filter(i => i.stock < 5) 
    : items.filter(i => i.stock === 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900/30 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span aria-hidden="true">🏪</span> ร้านค้า
              <span className="text-lg font-normal text-yellow-400">Gods' Arena</span>
            </h1>
            <p className="text-gray-300 mt-1">จัดการสต็อกและตั้งราคาสินค้า</p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4" role="group" aria-label="สถิติร้านค้า">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
              <p className="text-gray-300 text-xs">💰 รายได้รวม</p>
              <p className="text-2xl font-bold text-yellow-400">{totalRevenue}</p>
            </div>
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
              <p className="text-gray-300 text-xs">📦 สินค้าคงคลัง</p>
              <p className="text-2xl font-bold text-green-400">{totalStock}</p>
            </div>
          </div>
        </div>
        
        {/* Filter & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-2" role="tablist" aria-label="ตัวกรองสินค้า">
            {[
              { id: 'all', label: 'ทั้งหมด', count: items.length },
              { id: 'low', label: 'ใกล้หมด', count: items.filter(i => i.stock < 5).length },
              { id: 'out', label: 'หมดแล้ว', count: items.filter(i => i.stock === 0).length },
            ].map(f => (
              <Button
                key={f.id}
                onClick={() => setFilter(f.id)}
                variant={filter === f.id ? 'warning' : 'secondary'}
                aria-pressed={filter === f.id}
                aria-label={`แสดงสินค้า ${f.label} (${f.count} ชิ้น)`}
                size="sm"
              >
                {f.label} ({f.count})
              </Button>
            ))}
          </div>
          
          <Button
            onClick={() => setShowAddModal(true)}
            variant="warning"
            ariaLabel="เพิ่มสินค้าใหม่"
          >
            ➕ เพิ่มสินค้า
          </Button>
        </div>
        
        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="รายการสินค้า">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={(item) => console.log('Edit:', item)}
              onDelete={(id) => setItems(items.filter(i => i.id !== id))}
              onStock={handleStockChange}
            />
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-16 text-gray-400" role="status">
            <p className="text-4xl mb-4" aria-hidden="true">📦</p>
            <p>ไม่มีสินค้าในหมวดนี้</p>
          </div>
        )}
      </div>
      
      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddItem}
      />
    </div>
  );
}
