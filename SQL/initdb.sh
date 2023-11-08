#!/usr/bin/env bash

DB = "testDB.db"

init_users()
{
    echo "Initializing user table"
    cat users.sql | sqlite3 $DB
}

init_groups(){
    echo "Initializing groups table"
    cat groups.sql | sqlite3 $DB
}
init_ratings()
{
    echo "Initializing ratings table"
    cat ratings.sql | sqlite3 $DB
}
init_sessions()
{
    echo "Initializing sessions table"
    cat sessions.sql | sqlite3 $DB
}
init_rpg()
{
    echo "Initializing the rpg table"
    cat rpg.sql | sqlite3 $DB
}
init_intermediary()
{
    echo "Initializing the intermediary tables"
    cat intermediary.sql | sqlite3 $DB
}

init_users()
init_groups()
init_rpg()
init_sessions()

init_ratings()
init_intermediary()
