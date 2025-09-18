var hoverStr = "Hover for Info";

var urlsJSON = {
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
var data ={
  "Angela":.0041,
  "Kelly":0.0040,
  "Jim":.0035,
  "Andy":-.0008,
  "Ryan":-.0022,
  "Pam":.0004,
  "Oscar":.0007,
  "Phyllis":.005,
  "Meredith":.0022,
  "Darryl":.0004,
  "Erin":-.0066,
  "Kevin":.0112,
  "Stanley": 0.0147,
  "Michael":.0050,
  "Toby":0.0020,
  "Jan": .0030
}


//set up the box
var container2 = d3.select("#head_graph2");
var svg2 = container2.append("svg")
              .attr("width", "100vw")
              .attr("height", "40vw");
var defs2 = svg2.append('svg:defs');
var div2= d3.select("#tipwell2").append("div")
    .style("opacity", 1);

var buffer = $('#head_graph2').width()*.015
var height = $('#head_graph2').height();
var width = $('#head_graph2').width()-2*buffer;
var array_length = Object.keys(data).length;


var radius = (width/(array_length-1)-width/(array_length-1)/(array_length-1))/2 ;
var space = height-4*radius;
var min_data = 10000000;
var max_data = -10000000;


for(var i = 0; i < array_length; i++){

   if(data[Object.keys(data)[i]]>max_data){
     max_data = data[Object.keys(data)[i]];
   }
   if(data[Object.keys(data)[i]]<min_data){
     min_data = data[Object.keys(data)[i]];
   }

}
var data_RANGE = max_data-min_data;
var y_naught = height-radius+min_data/data_RANGE*space;

//ex: {Michael: [1,20],jim: [2,80]}
var coordinates = {}
//CONDENSE
for(var i = 0; i < array_length; i++){
  var key = Object.keys(data)[i]

  var cy = y_naught-data[key]/data_RANGE*space;
  var cx = buffer+width/2
  var nottouching = 0
  while(!nottouching){
      if(i%2){cx = cx - 1}
      else{cx = cx +1}
      for(var j = 0; j < i; j++){
          var cx0 = coordinates[Object.keys(data)[j]][0];
          var cy0 = coordinates[Object.keys(data)[j]][1];
          if(((cx-cx0)*(cx-cx0)+(cy-cy0)*(cy-cy0)) >= 4*radius*radius){
            nottouching++;
          }
      }
      if(nottouching == i){
        nottouching = 1;
      }
      else {
        nottouching = 0;
      }

      if(cx <= radius+buffer){
        nottouching = 1;
      }
      if(cx >= width-radius-buffer){
        nottouching = 1;
      }
    }
    coordinates[key] = [cx, cy]
}
var xmin = 124350
var xmax = 0
for(var i = 0; i < array_length; i++){
  var key = Object.keys(data)[i]
    if(coordinates[key][0] > xmax){
      xmax = coordinates[key][0];
    }
    if(coordinates[key][0] < xmin){
      xmin = coordinates[key][0];
    }
}

xdiff = xmax-xmin;


for(var i = 0; i < array_length; i++){
    var key = Object.keys(data)[i]
    coordinates[key][0] = coordinates[key][0]+radius-buffer;
}




var min_distance = xmax*xmax*width*width;
for(var i = 0; i < array_length; i++){
  for(var j = 0; j < array_length; j++){
    if(i != j){
      var x0 = coordinates[Object.keys(data)[i]][0];
      var x1 = coordinates[Object.keys(data)[j]][0];
      var y0 = coordinates[Object.keys(data)[i]][1];
      var y1 = coordinates[Object.keys(data)[j]][1];
      if(min_distance > Math.sqrt((y0-y1)*(y0-y1)+(x0-x1)*(x0-x1))/2){
        min_distance = Math.sqrt((y0-y1)*(y0-y1)+(x0-x1)*(x0-x1))/2
      }
    }
  }
}
radius = min_distance









for(var i = 0; i < array_length; i++){

  var key = Object.keys(data)[i];
  var url = urlsJSON[key];
  var cx = coordinates[key][0];
  var cy = coordinates[key][1];

  defs2.append("svg:pattern")
    .attr("id", key+"2")
    .attr("width", $('#head_graph2').width())
    .attr("height", $('#head_graph2').height())
    .attr("patternUnits", "userSpaceOnUse")
    .append("svg:image")
    .attr("xlink:href", url)
    .attr("height", String(Math.round((radius*2))))
    .attr("width", String(Math.round((radius*2))))
    .attr("x", String(Math.round(cx-radius)))
    .attr("y", String(Math.round(cy-radius)));
  defs2.append("svg:pattern")
    .attr("id", key + "double")
    .attr("width", $('#head_graph2').width())
    .attr("height", $('#head_graph2').height())
    .attr("patternUnits", "userSpaceOnUse")
    .append("svg:image")
    .attr("xlink:href", url)
    .attr("height", String(Math.round((radius*4))))
    .attr("width", String(Math.round((radius*4))))
    .attr("x", String(Math.round(cx-2*radius)))
    .attr("y", String(Math.round(cy-2*radius)));
  circle2 = svg2.append("circle")
    .attr("cx",  String(Math.round(cx)))
    .attr("cy", String(Math.round(cy)))
    .attr("r", String(Math.round(radius)))
    .attr('id', key)
    .style("fill", "#fff")
    .style("fill", "url(#"+ key+"2)")
    .on("mouseover", mouseover2)
    .on("mouseout",mouseout2);

 }
 function mouseover2(){
   document.getElementById("tipwell2").innerHTML = "<b>"+this.id+ "</b>: " + data[this.id] + " &Delta;IMDB"
   d3.select(this)
   .transition()
   .attr("r", String(Math.round(2*radius)))
   .style("fill","url(#"+ this.id+"double)");
   this.parentNode.appendChild(this);
 }
 function mouseout2(){
   document.getElementById("tipwell2").innerHTML = hoverStr
   d3.select(this)
   .transition()
   .attr("r", String(Math.round(radius)))
   .transition()
   .style("fill","url(#"+ this.id+"2)");
 }
