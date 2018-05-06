-- Using WGS84 geographic reference system because that is what openstreetmaps use and
-- the data comes from openstreetmaps.
create table public.webmobile_questions (
    id serial primary key,
    question varchar,
    answer1 varchar,
    answer2 varchar,
    answer3 varchar,
    answer4 varchar,
    correct_answer varchar,
    geom geometry(Point, 4326)
);