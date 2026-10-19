-- Optional Docker path only. Native MySQL uses packages/db/sql/create-local-user.sql.
-- prisma migrate dev creates a shadow database, and migrate reset drops the
-- application database. The default Docker user can only touch MYSQL_DATABASE.
-- Local development only.
GRANT ALL PRIVILEGES ON *.* TO 'carbadapt'@'%';
FLUSH PRIVILEGES;
