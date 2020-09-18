# bacon-finder

This is an REST API to find the number of levels between actor Kevin Bacon and other actors.
To run it, after cloning the repo, do the following: 
- `npm install` to install all dependencies
- `npm start` to run it

At this point, the system will import data from the csv files to memory. No database is set or has to be setup in this simple version. The data import will happen every time to program starts. 

From there you can use any app to send requests to the API, like Postman. 
You can use it as such: 
`localhost:3000/bacon?actor=Kevin Costner` 

It will return the level between the actor and Kevin Bacon. 

## Code Structure

#### `server.ts`
Initializes the server and the API routes, and loads the data from the csv in memory

#### repositories
The repositories mock database calls, and would have database knowledge. The ones in this version tap into in-memory arrays. 

#### routers
Those define the routes used in the API

#### controllers
Start the actual work required. Controllers are the only ones who have knowledge of 'API' context and request, returning status codes and JSON responses. 
Controllers would call repositories and services to get what it needs to do the job.

## Logic

I chose to start from the actor's costars instead of Kevin Bacon, however it would have the same results. 
We search a complete level at a time. For Christian Bale, for example, we would get all his costars and look for KB in there. If he's not found, we get all of Christian Bale's costars' costars in the second level, and look for KB. 
In a tree it would look like this, where the numbers indicate the loop iteration: 
```
          0
    1          1
 2     2     2     2
3 3   3 3   3 3   3 3
```

The other way would be to go deep into each movie, finding KB somewhere along the way. I thought this to be too heavy and long, because you still have to go through everything to make sure that the result is the most optimal. 
In a tree it would look like this, where the numbers indicate the loop iteration
```
          0
    1           8
 2     5     9     12
3 4   6 7  10 11  13 14
```

## Possible improvements

#### Cache

It's not realistic to think we could cache a whole lot of actors and their levels. There are so many that it would be huge in memory for no real gain. 
However, we could get Kevin Bacon's first-level costars and keep them in memory in a flat Set of names. Future calls could check this Set first before starting more investigation. 

#### Levels between two actors

By passing a second actor name in the query string, we could get the level between two actors. Right now, Kevin Bacon's name is hardcoded, but we could instead make an API call to find the second actor and compare names with him. 

#### Info on the Way to Kevin Bacon

One nice improvement would be to know how we found our way to Kevin Bacon, for example `Michael Papajohn (The Dark Knight Rises) -> Gary Oldman (Murder in the First) -> Kevin Bacon` 
In the current flat costar list it would be difficult to do. Once we find KB, we would have to go back to the actor and keep the movies and actors in some array. 
It would be a far better experience for a UI client. 
