CREATE TABLE IF NOT EXISTS guilds(
    guild_id INT NOT NULL AUTO_INCREMENT,
    guild_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (guild_id)
);

CREATE TABLE IF NOT EXISTS repos(
    repo_id INT NOT NULL AUTO_INCREMENT,
    repo_url VARCHAR(65000) NOT NULL,
    repo_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (repo_id)
);

CREATE TABLE IF NOT EXISTS guild_repos(
    pair_id INT NOT NULL AUTO_INCREMENT,
    guild_id INT NOT NULL,
    repo_id INT NOT NULL,
    PRIMARY KEY (pair_id)
);