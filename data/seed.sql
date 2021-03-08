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
    status,
    country,
    city,
    region,
    name,
    date,
    saleDate,
    image_url ,
    description 
) VALUES (
     ' default link to the original page 1',
    'default status 1',
    'country 1',
    'city 1',
    'region 1',
    'the event title 1',
    '2021-2-24 at 9 pm 1',
     '2021-2-24 at 9 pm 1',
    'image url from api 1',
    'description text 1'
);
 -- data set 2
INSERT INTO event(
      event_url,
    status,
    country,
    city,
    region,
    name,
    date,
    saleDate,
    image_url ,
    description 
) VALUES (
    ' default link to the original page 2',
    'default status',
    'country',
    'city',
    'region',
    'the event title 2',
    '2021-2-24 at 9 pm 2',
     '2021-2-24 at 9 pm 2',
    'image url from api 2',
    'description text 2'
);


