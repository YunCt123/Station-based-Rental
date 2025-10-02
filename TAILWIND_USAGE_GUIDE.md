# 🎨 Hướng dẫn sử dụng Tailwind Config trong dự án EV Station

## ❌ **Vấn đề hiện tại:**
Bạn đang sử dụng **Tailwind CSS v4** nhưng config được viết theo style **v3**, và cách sử dụng màu custom không đúng.

## ✅ **Cách sử dụng màu từ tailwind.config.ts đúng cách:**

### 1. **Cách ĐÚNG để sử dụng màu custom:**

```tsx
// ✅ ĐÚNG - Sử dụng màu từ config
<div className="bg-primary-500 text-primary-100">Primary Button</div>
<div className="bg-success-500 text-success-100">Success Button</div>
<div className="bg-warning-500 text-warning-100">Warning Button</div>

// ✅ ĐÚNG - Sử dụng màu với gradients
<div className="bg-gradient-to-r from-primary-500 to-success-500">Gradient</div>

// ✅ ĐÚNG - Sử dụng màu với opacity
<div className="bg-primary-500/20">20% opacity</div>
```

### 2. **Cách SAI mà bạn đang dùng:**

```tsx
// ❌ SAI - Các class này không tồn tại
<div className="bg-primary-light text-primary-dark">Wrong</div>
<div className="bg-success-light text-success-dark">Wrong</div>
<div className="bg-warning-light text-warning-dark">Wrong</div>

// ❌ SAI - Sử dụng CSS variables trong Tailwind class
<div className="from-primary-500 to-success-500">Wrong</div>
```

## 🔧 **Cách sửa file hiện tại:**

### Trong DetailsPage.tsx - Thay đổi:
```tsx
// Thay đổi từ:
'bg-green-light text-green-dark'
'bg-warning-light text-warning-dark'

// Thành:
'bg-success-100 text-success-700'
'bg-warning-100 text-warning-700'
```

### Trong VehicleCard.tsx - Thay đổi:
```tsx
// Giữ nguyên (đã đúng):
'from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/10 group-hover:to-success-500/10'
```

## 📚 **Quy tắc sử dụng màu:**

### 1. **Màu nền (background):**
- `bg-primary-500` - Màu chính
- `bg-success-500` - Màu thành công (xanh lá)
- `bg-warning-500` - Màu cảnh báo (vàng)
- `bg-danger-500` - Màu nguy hiểm (đỏ)

### 2. **Màu chữ (text):**
- `text-primary-500` - Chữ màu chính
- `text-success-500` - Chữ màu xanh lá
- `text-warning-500` - Chữ màu vàng

### 3. **Màu viền (border):**
- `border-primary-500` - Viền màu chính
- `border-success-500` - Viền màu xanh lá

### 4. **Gradient:**
- `bg-gradient-to-r from-primary-500 to-success-500`
- `bg-primary-gradient` (đã define trong config)

## 🚀 **Test màu hoạt động:**

Để test xem màu có hoạt động không, thử tạo một component đơn giản:

```tsx
export const ColorTest = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-primary-500 text-white p-4 rounded">Primary Color</div>
      <div className="bg-success-500 text-white p-4 rounded">Success Color</div>
      <div className="bg-warning-500 text-white p-4 rounded">Warning Color</div>
      <div className="bg-danger-500 text-white p-4 rounded">Danger Color</div>
      <div className="bg-gradient-to-r from-primary-500 to-success-500 text-white p-4 rounded">
        Gradient Primary to Success
      </div>
    </div>
  );
};
```

## 🔍 **Debug màu không hiển thị:**

1. **Kiểm tra Tailwind build:** `npm run build`
2. **Kiểm tra console có lỗi:** F12 → Console
3. **Kiểm tra class được generate:** Inspect element
4. **Restart dev server:** `npm run dev`

## 📝 **Lưu ý quan trọng:**
- Tailwind CSS v4 tự động purge CSS không sử dụng
- Phải đảm bảo các class được sử dụng trong code mới được build
- Không dùng dynamic class names như `bg-${color}-500` vì sẽ bị purge