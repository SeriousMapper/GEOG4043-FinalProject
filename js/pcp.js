    // var data = [
    //   [0, -0, 0, 0, 0, 1],
    //   [1, -1, 1, 2, 1, 1],
    //   [2, -2, 4, 4, 0.5, 1],
    //   [3, -3, 9, 6, 0.33, 1],
    //   [4, -4, 16, 8, 0.25, 1]
    // ];
    // var pc = d3.parcoords()('#pcp')
    //   .data(data)
    //   .render()
    //   .createAxes();
    var dataLoad;
    var colorscale = d3.scale.linear()
      .domain([10, 450, 702]) //use d3 max
      .range(["red", "orange", "yellow"])
      .interpolate(d3.interpolateLab);

    var color = function(d) {
      return colorscale(d['TARGET_FID_12'])
    }

    var parcoords = d3.parcoords()('#pcp')
      .color(color)
      .alpha(0.4);

    d3.csv('data/tracts_csv_final3.csv', function(data) {
      parcoords
        .data(data)
        .hideAxis(["GEOID_D", "TARGET_FID_12", "FIPS", "FREQAUG19D", "FREQSEP20D", "FREQPAND_1"])
        .render()
        .shadows()
        .reorderable()
        .alpha(0.5)
        .brushMode("1D-axes") //enables brushing
        .interactive()
        .rate(50)
        // .on("brush", function(d) {
        // console.log(d.FIPS);
        // })
        //.attr("id", function(data) { return data.States + "line"})
        
        parcoords.on("brush", function(d) {
        //console.log(d3.select(this));
        generateFIPS(d);
        })
        dataLoad = data;

        
      // .on({
      //   "mouseover": function(d) { parcoords.highlight([d]) },
      //   "mouseout": parcoords.unhighlight
      // )};
    });
    function generateFIPS(d) {
      selectedTracts = []
      for (let i = 0; i <d.length; i++) {
        selectedTracts.push(Number(d[i].TARGET_FID_12));
      }
      //console.log(selectedTracts);
      triggerHighlight();
    }
    function highlightLine() {
      parcoords.highlight([dataLoad[layerHighlight]]);
      
    }
    function unhighlightLine() {
      parcoords.unhighlight([dataLoad[layerHighlight]]);
    }
    function generateColors() {
      for(i=0; i<dataLoad.length; i++) {
      }
    }
    // function highlight_par() {
    //   d3.select("#pcp svg")
    //   .on({
    //     "mouseover": function(data) { parcoords.highlight([d]) },
    //     "mouseout": parcoords.unhighlight
    //   });
    // }
    // var grid = d3.divgrid    //remove first column, use target_FID_12