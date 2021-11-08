///////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////
//  Chord Diagram Mouseover Code
//  http://bl.ocks.org/nbremer/f9dacd23eece9d23669c
var outerRadius = $('#chord').width()/2
if(outerRadius > $('#chord').height()/2)
  outerRadius = $('#chord').height()/2

var innerRadius = outerRadius*8/10;
var fill = d3.scale.category20c();

var chord = d3.layout.chord()
    .padding(.04)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending);

var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(innerRadius + 20);

var svg = d3.select("#chord").append("svg")
    .attr("width", outerRadius * 2)
    .attr("height", outerRadius * 2)
  .append("g")
    .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

d3.json("https://raw.githubusercontent.com/timothy-krock/theOffice/master/front/data/interactions.json", function(error, imports) {

  if (error) throw error;
  var indexByName = d3.map(),
      nameByIndex = d3.map(),
      matrix = [],
      n = 0;
    // Compute a unique index for each package name.
    imports.forEach(function(d) {
      if (!indexByName.has(d = (d.name))) {
        nameByIndex.set(n, d);
        indexByName.set(d, n++);
      }
    });



  // Construct a square matrix counting package imports.
  imports.forEach(function(d,i ) {
    var source = indexByName.get((d.name)),
        row = matrix[source];
     row = matrix[source] = [];
     for (var i = -1; ++i < n+1;){
       row[i] = 1;
    }

  });
  matrixSize = (matrix.length)
  imports.forEach(function(d) {

    matrix[indexByName.get((d.name))][indexByName.get((d.imports[0]))]*=d.size;

  });
  imports.forEach(function(d) {
    //matrix[indexByName.get((d.name))][indexByName.get((d.imports[0]))]*=d.size;

    try{
      matrix[indexByName.get((d.imports[0]))][indexByName.get((d.name))]*=d.size;
      matrix[indexByName.get((d.name))][indexByName.get((d.name))] = 0;
      matrix[indexByName.get((d.imports[0]))][indexByName.get((d.imports[0]))] = 0;


    }
    catch(err){console.log("whatever")}


    //matrix[matrixSize-indexByName.get((d.imports[0]))][matrixSize-indexByName.get((d.name))]*=d.size;

  });
  chord.matrix(matrix);

  var g = svg.selectAll(".group")
      .data(chord.groups)
    .enter().append("g")
      .attr("class", "group");

  g.append("path")
      .style("fill", function(d) { return fill(d.index); })
      .style("stroke", function(d) { return fill(d.index); })
      .on("mouseover", fadeset)
      .on("mouseout", unfade())
      .attr("d", arc);
  if($('#chord').width() > 688){
    g.append("text")
        .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .attr("transform", function(d) {
          return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
              + "translate(" + (innerRadius + 25) + ")"
              + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .text(function(d) { return nameByIndex.get(d.index); });
}
  svg.selectAll("chord")
      .data(chord.chords)
      .enter().append("path")
      .attr("class", "chord")
      .style("stroke", function(d) { return d3.rgb(fill(d.source.index)).darker(); })
      .style("fill", function(d) { return fill(d.source.index); })
      .style('opacity', .67)
      //.on("mouseover", fadeOnChord)
      //.on("mouseout", fade(opacityDefault))
      .on("mouseover", fade)
      .on("mouseout", unfade())
      .attr("d", d3.svg.chord().radius(innerRadius));



function fade(d, i) {
  var chosen = d;
  document.getElementById("chordExplanation").innerHTML = nameByIndex.get(d.source.index)+
  ' and '+ nameByIndex.get(d.target.index) + " shared "+ matrix[d.target.index][d.source.index] + " scenes."

  //return function(d, i) {
  svg.selectAll(".chord")
    .transition()
    .style("opacity", function(d){
      if(chosen == d){
        return .67;
      }
      return .03;
    });
  //};
}//fade
function fadeset(d, i) {
  var chosen = d;
  //return function(d, i) {
  document.getElementById("chordExplanation").innerHTML = nameByIndex.get(d.index)
  svg.selectAll(".chord")
    .transition()
    .style("opacity", function(d){

      if(chosen.index == d.source.index || chosen.index == d.target.index){
        return .67;
      }
      return .03;
    });
  //};
}//fade
function unfade() {

  return function(d, i) {
  svg.selectAll(".chord").transition()
    .style("opacity", .67);
    document.getElementById("chordExplanation").innerHTML = "Hover over the Chord Diagram"
  };


}
// Fade function when hovering over chord
function fadeOnChord(d) {
  var chosen = d;
  wrapper.selectAll("path.chord")
    .transition()
    .style("opacity", function(d) {
      return d.source.index === chosen.source.index && d.target.index === chosen.target.index ? opacityDefault : opacityLow;
    });
}//fadeOnChord
});

d3.select(self.frameElement).style("height", outerRadius * 2 + "px");
