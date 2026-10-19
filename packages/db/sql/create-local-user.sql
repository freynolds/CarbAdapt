-- Local MySQL account for CarbAdapt. Safe to run more than once.
--
--   mysql -u root -p < packages/db/sql/create-local-user.sql
--
-- Prisma `migrate dev` creates a shadow database (a second schema it names
-- prisma_migrate_shadow_…, then drops) and `migrate reset` drops and
-- recreates `carbadapt`. A grant limited to `carbadapt`.* cannot create or
-- drop those databases. ALL PRIVILEGES ON *.* is the same grant
-- docker/mysql-init.sql applies to the Compose user: CREATE, DROP, ALTER,
-- and the DML the app and the seed use, on the app database and on the
-- shadow database. This account is for local development only.
--
-- MySQL 8 authenticates with caching_sha2_password (and MySQL 8.4 disables
-- mysql_native_password). Prisma 6 speaks caching_sha2_password, so the
-- account uses that plugin and .env.example does not set an auth parameter.
-- 127.0.0.1 is a different account from localhost: the URL uses TCP, which
-- matches 'carbadapt'@'127.0.0.1'. localhost is the socket account.
-- CREATE USER IF NOT EXISTS does not change an existing password, so
-- ALTER USER sets it again and a second run still matches .env.example.

CREATE DATABASE IF NOT EXISTS carbadapt
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'carbadapt'@'localhost'
  IDENTIFIED WITH caching_sha2_password BY 'carbadapt';
CREATE USER IF NOT EXISTS 'carbadapt'@'127.0.0.1'
  IDENTIFIED WITH caching_sha2_password BY 'carbadapt';

ALTER USER 'carbadapt'@'localhost'
  IDENTIFIED WITH caching_sha2_password BY 'carbadapt';
ALTER USER 'carbadapt'@'127.0.0.1'
  IDENTIFIED WITH caching_sha2_password BY 'carbadapt';

GRANT ALL PRIVILEGES ON *.* TO 'carbadapt'@'localhost';
GRANT ALL PRIVILEGES ON *.* TO 'carbadapt'@'127.0.0.1';

FLUSH PRIVILEGES;
