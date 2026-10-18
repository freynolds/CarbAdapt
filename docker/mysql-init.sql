-- prisma migrate reset drops and recreates the database, which needs more
-- than the default grants on MYSQL_DATABASE. Local development only.
GRANT ALL PRIVILEGES ON *.* TO 'carbadapt'@'%';
FLUSH PRIVILEGES;
