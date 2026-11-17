# Toán Lab 3D · v24

Mã nguồn của Toán Lab 3D v24 với 147 bài, mô phỏng tương tác và chế độ chơi Ô ăn quan. Trang chạy bằng HTML, CSS và JavaScript trong trình duyệt. Cấu hình triển khai nằm trong `vercel.json`. Trang chạy trực tiếp từ `dist/` và không cần biến môi trường hay cơ sở dữ liệu.

## Đưa mã lên GitHub

1. Giải nén ZIP.
2. Tạo một repository trống trên GitHub.
3. Tải nội dung đã giải nén lên thư mục gốc của repository. Giữ nguyên hai thư mục `dist/`, `tests/` và đặt `vercel.json` cùng cấp với chúng.

Bạn cũng có thể mở terminal ở thư mục đã giải nén và chạy các lệnh sau. Thay `TEN_TAI_KHOAN` bằng tên GitHub của bạn và sửa tên repository nếu bạn chọn tên khác.

```bash
git init -b main
git add .
git commit -m "Add Toan Lab 3D v24"
git remote add origin https://github.com/TEN_TAI_KHOAN/toan-lab-3d.git
git push -u origin main
```

## Triển khai trên Vercel

1. Mở bảng điều khiển Vercel, chọn **Add New → Project** rồi nhập repository GitHub vừa tạo.
2. Để **Root Directory** ở thư mục gốc repository và bấm **Deploy**. Tệp `vercel.json` đã đặt Framework Preset là **Other**, Output Directory là `dist` và bỏ bước cài đặt, biên dịch.
3. Khi triển khai xong, mở URL Vercel. Thêm `/#bai-81` vào sau tên miền để mở thẳng bài Ô ăn quan.

- [Hướng dẫn kết nối repository GitHub](https://vercel.com/docs/git)
- [Tài liệu cấu hình Vercel](https://vercel.com/docs/project-configuration/vercel-json)

## Chạy thử trên máy

Tại thư mục gốc, dùng Python 3 để chạy máy chủ tĩnh.

```bash
python3 -m http.server 8000 --directory dist
```

Mở [Toán Lab 3D trên máy](http://localhost:8000/) hoặc [bài Ô ăn quan](http://localhost:8000/#bai-81).

Nếu có Node.js, bạn có thể chạy bộ kiểm thử đi kèm.

```bash
node --test tests/lesson-consistency.test.mjs
```

Tiến độ luyện tập và đề tự tạo được lưu trong trình duyệt theo tên miền. Bản trên Vercel có vùng lưu riêng.
