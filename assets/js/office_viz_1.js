var hoverStr = "Hover for Info";

var URLSJSON = {
  "Jim":"assets/img/office/jim.png",
  "Angela":"assets/img/office/angela.jpg",
  "Andy":"assets/img/office/andy.png",
  "Pam":"assets/img/office/pam.jpg",
  "Oscar":"assets/img/office/oscar.png",
  "Phyllis":"assets/img/office/phyllis.jpg",
  "Meredith":"assets/img/office/meredith.jpg",
  "Michael":"assets/img/office/michael.png",
  "Ryan":"assets/img/office/ryan.jpg",
  "Darryl":"assets/img/office/darryl.png",
  "Kelly":"assets/img/office/kelly.png",
  "Toby":"assets/img/office/toby.jpg",
  "Erin":"assets/img/office/erin.png",
  "Kevin":"assets/img/office/kevin.jpg",
  "Dwight":"assets/img/office/dwight.png",
  "Stanley": "assets/img/office/stanley.png",
  "Jan": "assets/img/office/jan.png"
}

var DATA ={  "Jim":1.6671,
  "Angela":-0.046,
  "Andy":0.151,
  "Pam":-0.061,
  "Oscar":0.060,
  "Phyllis":-0.019,
  "Meredith":0.115,
  "Michael":0.519,
  "Ryan":-.037,
  "Darryl":.027,
  "Kelly":0.040,
  "Toby":0.121,
  "Erin":-.023,
  "Kevin":-.069,
  "Stanley":.067,
  "Jan":.028
}

//set up the box
var CONTAINER = d3.select("#head_graph");
var svg = CONTAINER.append("svg")
              .attr("width", "100vw")
              .attr("height", "40vw");
var defs = svg.append('svg:defs');
var div = d3.select("#tipwell").append("div")
    .style("opacity", 1);

var BUFFER = $('#head_graph').width()*.015
var HEIGHT = $('#head_graph').height();
var WIDTH = $('#head_graph').width()-2*BUFFER;
var ARRAY_LENGTH = Object.keys(DATA).length;


var RADIUS = (WIDTH/(ARRAY_LENGTH-1)-WIDTH/(ARRAY_LENGTH-1)/(ARRAY_LENGTH-1))/2 ;
var SPACE = HEIGHT-4*RADIUS;
var MIN_DATA = 10000000;
var MAX_DATA = -10000000;


for(var i = 0; i < ARRAY_LENGTH; i++){

   if(DATA[Object.keys(DATA)[i]]>MAX_DATA){
     MAX_DATA = DATA[Object.keys(DATA)[i]];
   }
   if(DATA[Object.keys(DATA)[i]]<MIN_DATA){
     MIN_DATA = DATA[Object.keys(DATA)[i]];
   }

}
var DATA_RANGE = MAX_DATA-MIN_DATA;
var Y_NAUGHT = HEIGHT-RADIUS+MIN_DATA/DATA_RANGE*SPACE;

//ex: {Michael: [1,20],jim: [2,80]}
var COORDINATES = {}
//CONDENSE
for(var i = 0; i < ARRAY_LENGTH; i++){
  var KEY = Object.keys(DATA)[i]

  var CY = Y_NAUGHT-DATA[KEY]/DATA_RANGE*SPACE;
  var CX = BUFFER+WIDTH/2
  var NOTTOUCHING = 0
  while(!NOTTOUCHING){
      if(i%2){CX = CX - 1}
      else{CX = CX +1}
      for(var j = 0; j < i; j++){
          var CX0 = COORDINATES[Object.keys(DATA)[j]][0];
          var CY0 = COORDINATES[Object.keys(DATA)[j]][1];
          if(((CX-CX0)*(CX-CX0)+(CY-CY0)*(CY-CY0)) >= 4*RADIUS*RADIUS){
            NOTTOUCHING++;
          }
      }
      if(NOTTOUCHING == i){
        NOTTOUCHING = 1;
      }
      else {
        NOTTOUCHING = 0;
      }

      if(CX <= RADIUS+BUFFER){
        NOTTOUCHING = 1;
      }
      if(CX >= WIDTH-RADIUS-BUFFER){
        NOTTOUCHING = 1;
      }
    }
    COORDINATES[KEY] = [CX, CY]
}
var XMIN = 124350
var XMAX = 0
for(var i = 0; i < ARRAY_LENGTH; i++){
  var KEY = Object.keys(DATA)[i]
    if(COORDINATES[KEY][0] > XMAX){
      XMAX = COORDINATES[KEY][0];
    }
    if(COORDINATES[KEY][0] < XMIN){
      XMIN = COORDINATES[KEY][0];
    }
}

XDIFF = XMAX-XMIN;


for(var i = 0; i < ARRAY_LENGTH; i++){
    var KEY = Object.keys(DATA)[i]
    COORDINATES[KEY][0] = COORDINATES[KEY][0]+RADIUS-BUFFER;
}




var MIN_DISTANCE = XMAX*XMAX*WIDTH*WIDTH;
for(var i = 0; i < ARRAY_LENGTH; i++){
  for(var j = 0; j < ARRAY_LENGTH; j++){
    if(i != j){
      var X0 = COORDINATES[Object.keys(DATA)[i]][0];
      var X1 = COORDINATES[Object.keys(DATA)[j]][0];
      var Y0 = COORDINATES[Object.keys(DATA)[i]][1];
      var Y1 = COORDINATES[Object.keys(DATA)[j]][1];
      if(MIN_DISTANCE > Math.sqrt((Y0-Y1)*(Y0-Y1)+(X0-X1)*(X0-X1))/2){
        MIN_DISTANCE = Math.sqrt((Y0-Y1)*(Y0-Y1)+(X0-X1)*(X0-X1))/2
      }
    }
  }
}
RADIUS = MIN_DISTANCE









for(var i = 0; i < ARRAY_LENGTH; i++){

  var KEY = Object.keys(DATA)[i];
  var URL = URLSJSON[KEY];
  var CX = COORDINATES[KEY][0]-$('#head_graph').width()*.035;
  var CY = COORDINATES[KEY][1];

  defs.append("svg:pattern")
    .attr("id", KEY)
    .attr("width", $('#head_graph').width())
    .attr("height", $('#head_graph').height())
    .attr("patternUnits", "userSpaceOnUse")
    .append("svg:image")
    .attr("xlink:href", URL)
    .attr("height", String(Math.round((RADIUS*2))))
    .attr("width", String(Math.round((RADIUS*2))))
    .attr("x", String(Math.round(CX-RADIUS)))
    .attr("y", String(Math.round(CY-RADIUS)));
  defs.append("svg:pattern")
    .attr("id", KEY + "DOUBLE")
    .attr("width", $('#head_graph').width())
    .attr("height", $('#head_graph').height())
    .attr("patternUnits", "userSpaceOnUse")
    .append("svg:image")
    .attr("xlink:href", URL)
    .attr("height", String(Math.round((RADIUS*4))))
    .attr("width", String(Math.round((RADIUS*4))))
    .attr("x", String(Math.round(CX-2*RADIUS)))
    .attr("y", String(Math.round(CY-2*RADIUS)));
  circle = svg.append("circle")
    .attr("cx",  String(Math.round(CX)))
    .attr("cy", String(Math.round(CY)))
    .attr("r", String(Math.round(RADIUS)))
    .attr('id', KEY)
    .style("fill", "#fff")
    .style("fill", "url(#"+ KEY+")")
    .on("mouseover", mouseover)
    .on("mouseout",mouseout);

 }
 function mouseover(){
   document.getElementById("tipwell").innerHTML = "<b>"+this.id+ "</b>: " + DATA[this.id] + " &Delta;IMDB"
   d3.select(this)
   .transition()
   .attr("r", String(Math.round(2*RADIUS)))
   .style("fill","url(#"+ this.id+"DOUBLE)");
   this.parentNode.appendChild(this);
 }
 function mouseout(){
   document.getElementById("tipwell").innerHTML = hoverStr
   d3.select(this)
   .transition()
   .attr("r", String(Math.round(RADIUS)))
   .transition()
   .style("fill","url(#"+ this.id+")");
 }
