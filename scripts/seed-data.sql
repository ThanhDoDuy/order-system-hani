-- Insert sample products
INSERT INTO products (name, description, price, unit, status) VALUES
('Áo thun cotton', 'Áo thun cotton cao cấp, thoáng mát, phù hợp mọi lứa tuổi', 150000, 'cái', 'in_stock'),
('Quần jeans', 'Quần jeans nam nữ thời trang, chất liệu bền đẹp', 350000, 'cái', 'in_stock'),
('Giày sneaker', 'Giày sneaker thể thao, thiết kế hiện đại', 800000, 'đôi', 'in_stock'),
('Túi xách', 'Túi xách da thật, thiết kế sang trọng', 500000, 'cái', 'out_of_stock'),
('Mũ lưỡi trai', 'Mũ lưỡi trai thể thao, chống nắng hiệu quả', 120000, 'cái', 'in_stock'),
('Áo khoác', 'Áo khoác gió, phù hợp thời tiết se lạnh', 280000, 'cái', 'in_stock'),
('Dép sandal', 'Dép sandal êm ái, phù hợp đi trong nhà', 80000, 'đôi', 'in_stock'),
('Balo laptop', 'Balo laptop chống nước, nhiều ngăn tiện lợi', 450000, 'cái', 'in_stock');

-- Insert sample order (optional)
INSERT INTO orders (order_number, customer_name, customer_phone, customer_address, subtotal, shipping_fee, total, notes, status, created_by) VALUES
('ORD-001', 'Nguyễn Văn A', '0901234567', '123 Đường ABC, Quận 1, TP.HCM', 500000, 30000, 530000, 'Giao hàng buổi sáng', 'pending', 'admin');

-- Get the order ID for order items
DO $$
DECLARE
    order_uuid UUID;
    product1_uuid UUID;
    product2_uuid UUID;
BEGIN
    -- Get order ID
    SELECT id INTO order_uuid FROM orders WHERE order_number = 'ORD-001';
    
    -- Get product IDs
    SELECT id INTO product1_uuid FROM products WHERE name = 'Áo thun cotton';
    SELECT id INTO product2_uuid FROM products WHERE name = 'Quần jeans';
    
    -- Insert order items
    INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, unit, total_price) VALUES
    (order_uuid, product1_uuid, 'Áo thun cotton', 150000, 1, 'cái', 150000),
    (order_uuid, product2_uuid, 'Quần jeans', 350000, 1, 'cái', 350000);
END $$;
