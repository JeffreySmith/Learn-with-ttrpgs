#!/usr/bin/env bash

#This should get changed before we submit this
DB=testDB.db

#Sets the cli options
OPTSTRING=":ugrsiRa"
declare -a options=()
while getopts ${OPTSTRING} opt; do
    case ${opt} in
        u)
            options+=("users")
            ;;
        g)
            options+=("groups")
            ;;
        r)
            options+=("ratings")
            ;;
        s)
            options+=("sessions")
            ;;
        R)
            options+=("rpgs")
            ;;
        i)
            options+=("intermediaries")
            ;;
        a)
            options+=("users" "groups" "ratings" "sessions" "intermediaries" "rpgs")
            ;;
        ?)        
        echo "Invalid option -${OPTARG}"
        echo "Valid options are:"
        echo "-u = users"
        echo "-g = groups"
        echo "-r = ratings"
        echo "-s = sessions"
        echo "-i = intermediary tables"
        echo "-R = Rpg table"

        exit 1
        ;;      
    esac
done

init_users ()
{
    echo "Initializing user table"
    cat users.sql | sqlite3 $DB
}

init_groups ()
{
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

create_initial_data()
{
    if [ "${1}" == "users" ]
    then
        init_users
    elif [ "${1}" == "groups" ]
    then
        init_groups
    elif [ "${1}" == "ratings" ]
    then
        init_ratings
    elif [ "${1}" == "sessions" ]
    then
        init_sessions
    elif [ "${1}" == "rpgs" ]
    then
        init_rpg
    elif [ "${1}" == "intermediaries" ]
    then
        init_intermediary
    else
        echo "This should not be possible (invalid input)"
    fi
}
for i in "${options[@]}"
do
    echo $i
    create_initial_data $i
done
