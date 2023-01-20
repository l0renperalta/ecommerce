CREATE DATABASE db_ecommerce;

use db_ecommerce;

-- Users table
CREATE TABLE users(
    id INT(11) NOT NULL,
    email VARCHAR(30) NOT NULL,
    password VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL
);

ALTER TABLE users
    ADD PRIMARY KEY (id);

ALTER TABLE users
    MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 2;

DESCRIBE users;

-- Contacts table
CREATE TABLE products(
    id INT(11) NOT NULL,
    name VARCHAR(30) NOT NULL,
    description TEXT,
    price INT(10) NOT NULL,
    stock INT(10) NOT NULL,
    image VARCHAR(200) NOT NULL,
    user_id INT(11),
    created_at timestamp NOT NULL DEFAULT current_timestamp,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE products
    ADD PRIMARY KEY (id);

ALTER TABLE products
    MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 2;

DESCRIBE products;
