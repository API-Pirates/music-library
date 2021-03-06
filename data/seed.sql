INSERT INTO song (
    title,
    artist,
    album,
    rating,
    genre,
    lyrics,
    image_url
) VALUES(
    'song title',
    'artitst',
    'album ',
    99.6,
    'rock',
    'song lyrics',
    'default img url'
);

-- Register 2 : Song 2
INSERT INTO song (
    title,
    artist,
    album,
    rating,
    genre,
    lyrics,
    image_url
) VALUES(
    'song title 2',
    'artitst 2',
    'album 2',
    95.6,
    'rock 2',
    'song lyrics 2',
    'default img url 2'
);

 -- ................................... events seeds .........................

INSERT INTO event(
    event_url,
    venue ,
    title ,
    date ,
    image_url ,
    description 
) VALUES (
    ' default link to the original page',
    'venue',
    'the event title',
    '2021-2-24 at 9 pm',
    'image url from api',
    'description text'
);
 -- data set 2
INSERT INTO event(
    event_url,
    venue ,
    title ,
    date ,
    image_url ,
    description 
) VALUES (
    ' default link to the original page 2',
    'venue 2',
    'the event title 2',
    '2021-2-24 at 9 pm 2',
    'image url from api 2',
    'description text 2'
);