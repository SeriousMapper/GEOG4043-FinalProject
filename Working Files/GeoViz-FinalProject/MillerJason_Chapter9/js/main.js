//begin script when window loads
window.onload = setMap();
let map;
//set up choropleth map
function setMap(){

    //map frame dimensions
    var width = 960,
        height = 460;

    //create new svg container for the map
    var map = d3
        .select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);
        console.log(map)

    //create Albers equal area conic projection centered on France
    var projection = d3
        .geoAlbers()
        .center([0, 46.2])
        .rotate([-2, 0, 0])
        .parallels([43, 62])
        .scale(2500)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    //use Promise.all to parallelize asynchronous data loading
    var promises = [
        d3.csv("data/unitsData.csv"),
        d3.json("data/EuropeCountries.topojson"),
        d3.json("data/FranceRegions.topojson"),
    ];
    Promise.all(promises).then(callback);

function callback(data) {
        var csvData = data[0],
            europe = data[1],
            france = data[2];
        console.log(csvData);
        console.log(europe);
        console.log(france);
        var europeCountries = topojson.feature(europe, europe.objects.EuropeCountries),
            franceRegions = topojson.feature(france, france.objects.FranceRegions).features;
        var graticule = d3.geoGraticule()
            .step([5, 5]); 
        var gratBackground = map.append("path")
            .datum(graticule.outline()) //bind graticule background
            .attr("class", "gratBackground") //assign class for styling
            .attr("d", path) //project graticule
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines
        //add Europe countries to map
        var countries = map.append("path")
            .datum(europeCountries)
            .attr("class", "countries")
            .attr("d", path);

        //add France regions to map
        var regions = map.selectAll(".regions")
            .data(franceRegions)
            .enter()
            .append("g")
            .attr("id", function(d){
                return d.properties.adm1_code;
            })
            .attr("class", "regionGroup")
            .attr("opacity", "0.8")
            .on('mouseover', function (d, i) {
                var select = d3.select(this);
                
                     select.transition()
                     .duration('500')
                     .attr('opacity', '1'); 
                     select.select(".regionText").transition()
                     .duration("250")
                     .ease(d3.easeCubic)
                     .attr("fill", "black")
                     .attr("font-weight", "bold")
                     .attr("dy", "0em");
            })   
            .on('mouseout', function (d, i) {
                var select = d3.select(this);
                
                     select.transition()
                     .duration('500')
                     .attr('opacity', '0.8');
                     select.select(".regionText").transition()
                     .duration("250")
                     .ease(d3.easeCubic)
                     .attr("fill", "grey")
                     .attr("font-weight", "light")
                     .attr("dy", ".5em");
            });
        var regionPaths = regions.append("path")

            .attr("id", function(d){
                return "regions " + d.properties.adm1_code;
            })
            .attr("d", path)
            .attr("class", "regions");
        var regionPoints = regions.append("circle")
            .attr("class","circles")
            .attr("cx", function(d) {var centroid = path.centroid(d); return centroid[0];})
            .attr("cy", function(d) {var centroid = path.centroid(d); return  centroid[1] + 10;})
            .attr("r", "2px");
        var regionText = regions.append("text")
        .attr("fill", "grey")
        .attr("class", "regionText")
        .attr("transform", function(d) { 
            var centroid = path.centroid(d);
            return "translate(" + centroid[0] + "," + centroid[1] + ")"
        })
        .attr("text-anchor", "middle")
        .attr("dy", ".5em")
        .attr("font-size", "10px")
        .text(function(d) {
              return d.properties.name;
        });
            

}
};