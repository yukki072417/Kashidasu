CREATE DATABASE KASHIDASU CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE KASHIDASU;

CREATE TABLE ADMIN_USER(ID CHAR(10) PRIMARY KEY, PASSWORD CHAR(30) CHARACTER SET utf8mb4);
CREATE TABLE BOOKS(ID CHAR(10) PRIMARY KEY, BOOK_NAME CHAR(30), WRITTER CHAR(30) CHARACTER SET utf8mb4);
CREATE TABLE LENDING_BOOK(BOOK_ID CHAR(10) PRIMARY KEY, USER_ID CHAR(10), LEND_DAY DATE);

INSERT INTO ADMIN_USER (ID, PASSWORD) VALUES ("1234567891","PASSWORD");