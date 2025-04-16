# The Crime Sim App

## How to use:
1. Click the "surroundings" tile in the upper right hand corner
2. Click any layers that you want to see. The simulated data was made for the 
   NYC Madison Square Gardens area specifically.

## Quick backend notes
1. Server would have an API access to a crime data API and pull in/overwrite existing
   information often (thinking around every 1-10 minutes) to make sure data is current
2. This information would be cached on the server so the client side would make calls and retrieve relevant data for their location. This method might have to vary with different sources.
