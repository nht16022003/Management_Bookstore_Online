CREATE DATABASE MANAGEMENT_BOOKSTORE_ONLINE
GO

USE MANAGEMENT_BOOKSTORE_ONLINE
GO

CREATE TABLE ROLES
(
	ID_ROLE INT PRIMARY KEY,
	ROLE_NAME NVARCHAR(30),
	CONSTRAINT CH_IDROLE CHECK (ID_ROLE >= 0 AND ID_ROLE <=2)
);

INSERT INTO ROLES(ID_ROLE, ROLE_NAME) VALUES (0, 'ADMIN')
INSERT INTO ROLES(ID_ROLE, ROLE_NAME) VALUES (1, 'STAFF')
INSERT INTO ROLES(ID_ROLE, ROLE_NAME) VALUES (2, 'CUSTOMER')


CREATE TABLE USERS(
	ID_USER INT IDENTITY PRIMARY KEY, 
	ID_ROLE INT NULL, --ID NÀY ĐỂ FK ĐẾN ROLES
	USER_NAME NVARCHAR(35), 
	USER_AGE INT, 
	USER_ADDRESS NVARCHAR(200),
	USER_PHONE NCHAR(11),
	USER_EMAIL NCHAR(50)
	CONSTRAINT FK_USERS_ROLES FOREIGN KEY(ID_ROLE) REFERENCES ROLES(ID_ROLE)
);

INSERT INTO USERS(ID_ROLE, USER_NAME, USER_AGE, USER_ADDRESS, USER_PHONE, USER_EMAIL) 
VALUES (2,'Nguyen Linh Nhi', 20, N'Kien Giang', '-', 'nln@gmail.com')
INSERT INTO USERS(ID_ROLE, USER_NAME, USER_AGE, USER_ADDRESS, USER_PHONE, USER_EMAIL) 
VALUES (0,'Nguyen Hoang Tuan', 23, N'Tien Giang', '-', 'nht@gmail.com')

--Table USER này để lưu thông tin tài khoản login
CREATE TABLE ACCOUNTS
(
	ID INT IDENTITY PRIMARY KEY, 
	ID_USER INT NULL,
	USERNAME NVARCHAR(30) NOT NULL, 
	HashPassword NCHAR(20) NOT NULL, 
	STATUS BIT NOT NULL DEFAULT 1
);

SELECT U.USER_NAME, A.USERNAME, R.ROLE_NAME, R.ID_ROLE, A.ID_USER
FROM ROLES R, USERS U, ACCOUNTS A
WHERE R.ID_ROLE = U.ID_ROLE AND A.ID_USER = U.ID_USER

/*
ALTER TABLE USERS
ADD ID_ROLE INT 

ALTER TABLE USERS
ADD CONSTRAINT FK_USERS_ROLES FOREIGN KEY (ID_ROLE) REFERENCES ROLES(ID_ROLE);
*/

INSERT INTO ACCOUNTS(USERNAME, HashPassword,ID_USER) VALUES ('admin','123',NULL)
INSERT INTO ACCOUNTS(USERNAME, HashPassword,ID_USER) VALUES ('customer','123',1)
INSERT INTO ACCOUNTS(USERNAME, HashPassword,ID_USER) VALUES ('staff','123',NULL)


SELECT * FROM ROLES;
SELECT * FROM USERS;
SELECT * FROM ACCOUNTS;



SELECT U.USER_NAME, A.USERNAME, A.HashPassword, R.ROLE_NAME
FROM ROLES R, USERS U, ACCOUNTS A
WHERE R.ID_ROLE = U.ID_ROLE AND A.ID_USER = U.ID_USER


CREATE TABLE CATEGORIES( --Nhóm sách theo chủ đề
	ID_CATEGORY NCHAR(20) NOT NULL PRIMARY KEY, 
	CATEGORY_NAME NVARCHAR(150)
);

INSERT INTO CATEGORIES(ID_CATEGORY, CATEGORY_NAME)
VALUES
('VH', N'Văn học'),
('KT', N'Kinh tế'),
('CN', N'Công nghệ'),
('KNS', N'Kỹ năng sống'),
('TN', N'Thiếu nhi');

CREATE TABLE BOOKS(
	ID_BOOK INT IDENTITY NOT NULL PRIMARY KEY,
	BOOK_NAME NVARCHAR(150),
	PRICE MONEY, 
	ID_CATEGORY NCHAR(20),
	DESCRIPTION NVARCHAR(MAX),
	IMAGE_URL NVARCHAR(500),
	CONSTRAINT FK_BOOKS_CATEGORIES FOREIGN KEY(ID_CATEGORY) REFERENCES CATEGORIES(ID_CATEGORY)
);

INSERT INTO BOOKS
    (BOOK_NAME, PRICE, ID_CATEGORY, DESCRIPTION, IMAGE_URL)
VALUES

-- Văn học
(N'Nhà Giả Kim',
 79000,
 'VH',
 N'Câu chuyện kể về hành trình theo đuổi ước mơ và khám phá ý nghĩa của cuộc sống. Cuốn sách mang đến nhiều bài học về niềm tin, sự kiên trì và việc theo đuổi mục tiêu cá nhân.',
 N'https://thpthuonghoa.quangtri.edu.vn/upload/32300/fck/files/sach-nha-gia-kim.jpg'),

(N'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
 95000,
 'VH',
 N'Một câu chuyện tuổi thơ trong trẻo xoay quanh tình cảm gia đình, tình anh em và những kỷ niệm đẹp của tuổi học trò.',
 N'https://static.hotdeal.vn/images/809/809235/500x500/184703-combo-sach-toi-thay-hoa-vang-tren-co-xanh-chuc-mot-ngay-tot-lanh.jpg'),

(N'Mắt Biếc',
 85000,
 'VH',
 N'Câu chuyện tình cảm về tuổi trẻ, tình yêu và những ký ức không thể quên. Tác phẩm mang màu sắc nhẹ nhàng và giàu cảm xúc.',
 N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcUxnwE-4wi4WPredWCyHVsvdDYGNtvYk0hrHI3zDaQA&s=10'),

(N'Dế Mèn Phiêu Lưu Ký',
 65000,
 'VH',
 N'Câu chuyện phiêu lưu của chú Dế Mèn qua nhiều vùng đất, qua đó truyền tải những bài học về tình bạn, trách nhiệm và cách sống.',
 N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQrNWHsJNaLtthCGRsLyDSZx_o-7Zk_rxZTeSNV8wtSQ&s=10'),


-- Kinh tế
(N'Cha Giàu Cha Nghèo',
 120000,
 'KT',
 N'Cuốn sách trình bày những góc nhìn khác nhau về tiền bạc, đầu tư và cách xây dựng tư duy tài chính cá nhân.',
 N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCuw1T261Ef3pc7OifbASQTZpzvHzgVfgxMJmpkXv2FA&s=10'),

(N'Thông Minh Tài Chính',
 110000,
 'KT',
 N'Cung cấp những kiến thức cơ bản về quản lý tiền bạc, tiết kiệm, đầu tư và lập kế hoạch tài chính cá nhân.',
 N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjOEh2lcwW3X3DXOT97ijZ4QkzQtqLPNmpdMjki5uCHA&s'),

(N'Từ Tốt Đến Vĩ Đại',
 135000,
 'KT',
 N'Phân tích những yếu tố giúp doanh nghiệp xây dựng năng lực quản trị và phát triển bền vững trong thời gian dài.',
 N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcnOvBQYg-Jp4WMINx5CCv7LCLj2kEpWE1FYauW3aZzg&s=10'),

(N'Khởi Nghiệp Tinh Gọn',
 99000,
 'KT',
 N'Giới thiệu phương pháp xây dựng sản phẩm, kiểm chứng ý tưởng và phát triển doanh nghiệp dựa trên phản hồi thực tế từ khách hàng.',
 N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSo--PU1DH-BzL4ChVmsEqZGKuG0oUYX_KEzziFCdsEaw&s=10'),


-- Công nghệ
(N'Lập Trình C# Cơ Bản',
 150000,
 'CN',
 N'Giáo trình giới thiệu các kiến thức nền tảng của ngôn ngữ C#, bao gồm biến, kiểu dữ liệu, câu điều kiện, vòng lặp, phương thức và lập trình hướng đối tượng.',
 N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkv1EgYN7LRdwdzKqg6LtL15BamKLzFyLeQYlxJ9wX_A&s=10'),

(N'ASP.NET Core Web API',
 180000,
 'CN',
 N'Cuốn sách hướng dẫn xây dựng Web API với ASP.NET Core, Entity Framework Core, REST API và kết nối cơ sở dữ liệu.',
 N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRji5nqv-eqH5OXAz23QT_SdvYDwhvkcjx3HknWY2VD0A&s=10'),


(N'SQL Server Thực Chiến',
 145000,
 'CN',
 N'Giới thiệu cách thiết kế cơ sở dữ liệu, truy vấn SQL, khóa chính, khóa ngoại, JOIN, Stored Procedure và các kỹ thuật quản lý dữ liệu.',
 N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIIDydY1AxizYs3zJ_MfSozXuocsAO9yCE5hknOVC5KQ&s=10'),


-- Kỹ năng sống
(N'Đắc Nhân Tâm',
 85000,
 'KNS',
 N'Cuốn sách tập trung vào nghệ thuật giao tiếp, cách xây dựng mối quan hệ và cách ứng xử hiệu quả với những người xung quanh.',
 N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfDoQPhPDskeL0xO7aWWDTGu6Tubq6lIh7XfYCyDdLgQ&s=10'),

(N'Atomic Habits',
 125000,
 'KNS',
 N'Cuốn sách trình bày phương pháp xây dựng những thói quen nhỏ và duy trì chúng để tạo ra những thay đổi tích cực trong cuộc sống.',
 N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRT-udB1hsUxyaw3urGNX7NrPI4idvVIq5i4FJrnyR0Kw&s=10'),

(N'7 Thói Quen Hiệu Quả',
 130000,
 'KNS',
 N'Giới thiệu các nguyên tắc giúp cá nhân chủ động hơn, quản lý thời gian tốt hơn và xây dựng các mối quan hệ hiệu quả.',
 N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVIpCOMCH4Olfo5pWeoddArIgmwhI13E8s8dQa8Gc5GQ&s=10'),

(N'Đời Ngắn Đừng Ngủ Dài',
 90000,
 'KNS',
 N'Những câu chuyện và góc nhìn giúp người đọc suy nghĩ tích cực hơn, biết trân trọng thời gian và chủ động theo đuổi mục tiêu.',
 N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTF7V-iTjiNP9O0z2G9oDcQLuXJxuUtoAb2ki_MdBRBFg&s=10'),


-- Thiếu nhi
(N'Hoàng Tử Bé',
 75000,
 'TN',
 N'Một câu chuyện giàu tính biểu tượng về hành trình của một hoàng tử nhỏ qua nhiều hành tinh và những con người khác nhau.',
 N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRO_QLnbh7GuYEKfFWQm_aBUDPHdQAgYZ1TIIvbPIL9eA&s'),

(N'Harry Potter Và Hòn Đá Phù Thủy',
 140000,
 'TN',
 N'Câu chuyện mở đầu cho hành trình khám phá thế giới phù thủy của Harry Potter tại trường Hogwarts.',
 N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLPEb3XnsezHhSjfo7GxtyvlsLEwvKxebCwRIAA2MWvA&s=10'),

(N'Không Gia Đình',
 100000,
 'TN',
 N'Câu chuyện về hành trình trưởng thành của một cậu bé qua nhiều hoàn cảnh khó khăn và những cuộc gặp gỡ trong cuộc sống.',
 N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzDz7a70OGfnV0raYelPgne4AnUbx0QSbvlYPM7NgyYQ&s=10'),

(N'Truyện Cổ Tích Việt Nam',
 70000,
 'TN',
 N'Tuyển tập những câu chuyện cổ tích quen thuộc của Việt Nam, phù hợp với trẻ em và mang nhiều bài học về cuộc sống.',
 N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPe54nF28603mhGxNlmZvEYlq5X8cFddAaNX_hQl81dA&s=10');

DROP TABLE STAFFS;
DROP TABLE CUSTOMERS;
DROP TABLE USERS;