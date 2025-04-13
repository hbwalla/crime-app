# The Crime Sim App

## How to use:
1. Click the "surroundings" tile in the upper right hand corner
2. Click any layers that you want to see. The simulated data was made for the 
   NYC Madison Square Gardens area specifically.

## Features I would have liked to implement in the GUI:
1. Local news API (on click of the "News" option) showing news in the area
2. 911 call options
3. An overlay of the map with crime history represented with shading (showing neighborhoods with higher crime rates, etc)
4. Make the "Surroundings" drop down menu stay open when a checkbox is clicked.
5. More intense error handling, and clean things up a litte more.
6. Relate the 911 calls with the news and the crimes shown
7. Color code the check boxes in some way to represent the different markers

## Quick backend notes
1. Server would have an API access to a crime data API and pull in/overwrite existing
   information often (thinking around every 1-10 minutes) to make sure data is current
2. This information would be cached on the server so the client side would make calls and retrieve relevant data for their location. This method might have to vary with different sources.