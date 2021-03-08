DROP TABLE IF EXISTS song;
DROP TABLE IF EXISTS event;


CREATE TABLE song (
    id SERIAL NOT NULL PRIMARY KEY,
    title VARCHAR(100),
    artist VARCHAR(100),
    album VARCHAR (255),
    rating FLOAT(4),
    genre VARCHAR(100),
    lyrics TEXT,
    image_url TEXT
);

CREATE TABLE event (
    id SERIAL NOT NULL PRIMARY KEY,
    event_url TEXT,
    status VARCHAR(255),
    country VARCHAR(255),
    city VARCHAR(255),
    region VARCHAR(255),
    name VARCHAR(255),
    date VARCHAR(255),
    saleDate VARCHAR(255),
    image_url TEXT,
    description TEXT,
    artistName VARCHAR(255),
    facebook_page_url VARCHAR(255)

);

