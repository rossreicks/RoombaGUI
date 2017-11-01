## A gui for creating a navigable map for the roomba
Creates a simple visual 2D map in p5js to output csv coordinates to send to a roomba for indoor navigation.

Uses websockets for real time positioning of the roomba while it navigates the map

## installing instructions
clone this repo

pip install git+https://github.com/dpallot/simple-websocket-server.git

python app.py

open browser to localhost: 5000

draw lines by clicking in the first spot and then click again to finish

place roomba using the place roomba button and click where you would like the roomba placed

can send new x y values using the console using the arrow keys

