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
    venue VARCHAR(255),
    title VARCHAR(255),
    date VARCHAR(255),
    image_url text,
    description TEXT
);
