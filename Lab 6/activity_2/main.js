var svgs = d3.select('#scartterplot');
var svgb = d3.select('#barchart');

var svgsWidth = +svgs.attr('width');
var svgsHeight = +svgs.attr('height');

var svgbWidth = +svgb.attr('width');
var svgbHeight = +svgb.attr('height');

var padding = {t: 60, r: 80, b: 60, l: 80};
var cellPadding = 10;
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

var dataAttributes = ['economy (mpg)', 'cylinders', 'power (hp)', '0-60 mph (s)', 'displacement (cc)', 'weight (lb)', '0-60 mph (s)','year'];

var chartS = svgs.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

var chartB = svgb.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

var cellWidth = svgsWidth - padding.l - padding.r;
var cellHeight = svgsHeight - padding.t - padding.b;

var x_category = 'cylinders';
var y_category = 'power (hp)';

var xAxis;
var yAxis;
var xb;
var yb;
var xlabel;
var ylabel;
var countData = [];

var extentByAttribute = {};
// Object for keeping state of which cell is currently being brushed
var brushCell;
var N = dataAttributes.length;
var histogramBarWidth = 40;
var xScale = d3.scaleLinear().range([0, cellWidth]);
var yScale = d3.scaleLinear().range([cellHeight, 0]);
var countScale = d3.scaleLinear().domain([250, 0]).range([0, cellHeight]);
var cyScale = d3.scaleLinear().range([0, cellWidth]).domain([3, 8]);

// var xAxis = d3.axisBottom(xScale).ticks(7);
// var yAxis = d3.axisLeft(yScale).ticks(6);

// Object for keeping state of which cell is currently being brushed

// ****** Add reusable components here ****** //
var brushS = d3.brush()
    .extent([[0, 0], [cellWidth, cellHeight]])
    .on("start", brushstartS)
    .on("brush", brushmoveS)
    .on("end", brushendS);

var brushB = d3.brush()
   .extent([[padding.l, padding.t], [padding.l + cellWidth +histogramBarWidth, padding.t + cellHeight]])
   .on("start", brushstartB)
   .on("brush", brushmoveB)
   .on("end", brushendB);

var newScale = d3.scaleLinear().range([0, cellWidth+histogramBarWidth]).domain([3, 8]);
console.log(svgsWidth);


var toolTip = d3.tip()
.attr("class", "d3-tip")
.offset([-12, 0])
.html(function(event, d) {
    // Inject html, when creating your html I recommend editing the html within your index.html first
    return "<h5>"+d['name']+"</h5><table><thead><tr><td>0-60 mph (s)</td><td>Power (hp)</td><td>Cylinders</td><td>Year</td></tr></thead>"
         + "<tbody><tr><td>"+d['0-60 mph (s)']+"</td><td>"+d['power (hp)']+"</td><td>"+d['cylinders']+"</td><td>"+d['year']+"</td></tr></tbody>"
         + "<thead><tr><td>Economy (mpg)</td><td colspan='2'>Displacement (cc)</td><td>Weight (lb)</td></tr></thead>"
         + "<tbody><tr><td>"+d['economy (mpg)']+"</td><td colspan='2'>"+d['displacement (cc)']+"</td><td>"+d['weight (lb)']+"</td></tr></tbody></table>"
});

svgs.call(toolTip);

function onCategoryChanged() {

    var x_select = d3.select('#xSelect').node();
    // Get current value of select element
    x_category = x_select.options[x_select.selectedIndex].value;
    console.log(x_category);
    
    var y_select = d3.select('#ySelect').node();
    // Get current value of select element
    y_category = y_select.options[y_select.selectedIndex].value;
    console.log(y_category);

    // var filteredLetters = letters.filter(function(d){
    //     return lettersMap[category].indexOf(d.letter) >= 0 || d.frequency >= cutoffInput;
    // });
    // updateChart(filteredLetters);

    updateChart(cars);
}



var cars = [];


d3.csv('cars.csv', dataPreprocessor).then(function(dataset) {
	cars = dataset;

	dataAttributes.forEach(function(attribute){
        extentByAttribute[attribute] = d3.extent(dataset, function(d){
            return d[attribute];
        });
    });

    console.log(extentByAttribute);
    // var xd = extentByAttribute[x_category][1];

    xScale.domain([extentByAttribute[x_category][0], extentByAttribute[x_category][1]]);
	yScale.domain([extentByAttribute[y_category][0], extentByAttribute[y_category][1]]);

	// var xScale = d3.scaleLinear().range([0, cellWidth])
	// .domain([extentByAttribute[x_category][0], xd]);

	// var yScale = d3.scaleLinear().range([cellHeight, 0])
	// .domain([extentByAttribute[y_category][0], extentByAttribute[y_category][1]]);

	xAxis = chartS.append('g').attr('class', '.axis');
	xAxis.call(d3.axisBottom(xScale).ticks(7))
	.attr('transform', 'translate('+[0, cellHeight]+')');

	yAxis = chartS.append('g').attr('class', '.axis');
	yAxis.call(d3.axisLeft(yScale).ticks(6));

	xlabel = chartS.append('text').attr('class', '.axis-label')
	.attr('transform', 'translate('+[cellWidth/2-30, cellHeight+40]+')')
	.text(x_category);

	ylabel = chartS.append('text').attr('class', '.axis-label')
	.attr('transform', 'translate('+[-30, -10]+')')
	.text(y_category);

	chartS.append('text')
	.attr('class', 'title')
	.attr('transform', 'translate('+[cellWidth/2-30, -20]+')')
	.text("Scartter Plot")
	.style('fill', 'black');


	chartS.append('g')
    .selectAll("g")
    .data(dataset)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return xScale(d[x_category]); } )
      .attr("cy", function (d) { return yScale(d[y_category]); } )
      .attr("r", 5)
      .style("fill", function(d) { return colorScale(d.cylinders); })
      .on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

	chartS.append("g")
   .attr("class", "brush")
   .call(brushS);

	xb = chartB.append('g').attr('class', '.axis');
	xb.call(d3.axisBottom(cyScale).ticks(7))
	.attr('transform', 'translate('+[histogramBarWidth/2, cellHeight]+')');

	yb = chartB.append('g').attr('class', '.axis');
	yb.call(d3.axisLeft(countScale).ticks(6));

	chartB.append('text')
	.attr('class', 'title')
	.attr('transform', 'translate('+[cellWidth/2, -20]+')')
	.text("Bar Chart")
	.style('fill', 'black');

	chartB.append('text').attr('class', '.axis-label')
	.attr('transform', 'translate('+[cellWidth/2, cellHeight+40]+')')
	.text('cylinders');

	chartB.append('text').attr('class', '.axis-label')
	.attr('transform', 'translate('+[-30, -10]+')')
	.text('count');

    svgb.append("g")
       .attr("class", "brush")
       .call(brushB);

    countData = d3.rollup(dataset, v => v.length, d => d.cylinders);

	var bars = chartB.append('g')
	  .attr('class', 'bars');

	bars.selectAll('rect')
	.attr('class', 'bar')
	  .data(countData)
	  .enter()
	  .append('rect')
	  .attr('x', d => xScale(d[0]))
	  .attr('y', d => countScale(d[1]))
	  .attr('width', histogramBarWidth)
	  .attr('height', d => cellHeight - countScale(d[1]))
	  .attr("fill", function(d) { 
	  	return colorScale(d[0]); 
	  });

// ********* Your data dependent code goes here *********//

});

function brushstartS(event) {
   if (brushCell !== this) {
        brushS.move(d3.select(brushCell), null);

        brushCell = this;
   }
}

function brushstartB(event) {
   if (brushCell !== this) {
        brushB.move(d3.select(brushCell), null);

        brushCell = this;
   }
}

function brushmoveS(event) {
    var s = event.selection;
    if (s) {
        svgs.selectAll("circle")
            .classed("hidden", function(d){
                return s[0][0] > xScale(d[x_category]) || xScale(d[x_category]) > s[1][0]
                    || s[0][1] > yScale(d[y_category]) || yScale(d[y_category]) > s[1][1];
            });
   }
   if (!s) {
       chartS.selectAll("circle")
           .classed("hidden", false);
       return;
   }
   // var [[x0, y0], [x1, y1]] = s;
   // chartB.selectAll(".bar")
   //     .classed("fade", function(d) {
   //         return xScale(d[x_category]) < x0 || xScale(d[x_category]) > x1 || yScale(d[y_category]) < y0 || yScale(d[y_category]) > y1;
   //     })
   //     .classed("highlight", function(d) {
   //         return xScale(d[x_category]) >= x0 && xScale(d[x_category]) <= x1 && yScale(d[y_category]) >= y0 && yScale(d[y_category]) <= y1;
   //     });
}



function brushmoveB(event) {
   var s = event.selection;
   // var [[x0, y0], [x1, y1]] = s;
   console.log(newScale(4))
   if (s) {
        svgs.selectAll("circle")
        .classed("hidden", function(d){
            console.log(newScale(d.cylinders));
            console.log(s[0][0]);

            return newScale(d.cylinders)+padding.l < s[0][0] || newScale(d.cylinders)+padding.l > s[1][0];                  
        });
   }
   if (!s) {
       chartS.selectAll("circle")
           .classed("hidden", false);
       return;
   }
   // var [[x0, y0], [x1, y1]] = s;
   // chartS.selectAll("circle")
   //     .classed("hidden", function(d) {
   //         return cyScale(d.cylinders) < x0 || cyScale(d.cylinders) > x1;
   //     })
   //     .classed("highlight", function(d) {
   //         return cyScale(d.cylinders) >= x0 && cyScale(d.cylinders) <= x1;
   //     });
}

function brushendB(event) {
   var s = event.selection;
   if (!s) {
       chartS.selectAll("circle")
           .classed("hidden", false);
       updateChart(cars);
       updateBar(cars);
       return;
   }
   var [[x0, y0], [x1, y1]] = s;
   var brushedData = cars.filter(function(d) {
       return newScale(d.cylinders)+padding.l >= x0 && cyScale(d.cylinders)+padding.l <= x1;
   });
   // chartB.selectAll('bar')
   //      .classed(".hide", function(d){
   //          return newScale(d.cylinders)+padding.l < s[0][0] || newScale(d.cylinders)+padding.l > s[1][0];                  
   //      });
    // svgs.selectAll("circle")
    //     .classed("hidden", function(d){
    //         console.log(x0);
    //         return cyScale(d.cylinders) < x0 && cyScale(d.cylinders) > x1;                  
    //     });
   updateBar(brushedData);
}

function brushendS(event) {
    var s = event.selection;

    if(!s) {
        // Bring back all hidden .dot elements
        svgs.selectAll('.hidden').classed('hidden', false);
        // Return the state of the active brushCell to be undefined
        brushCell = undefined;
        updateBar(cars);
    }
   // var s = event.selection;
   // if (!s) {
   //     chartB.selectAll(".bar")
   //         .classed("highlight", false)
   //         .classed("fade", false);
   //     updateBar(cars);
   //     updateChart(cars);
   //     return;
   // }
    if (s) {
       var [[x0, y0], [x1, y1]] = s;
       var brushedData = cars.filter(function(d) {
           return xScale(d[x_category]) >= x0 && xScale(d[x_category]) <= x1 && yScale(d[y_category]) >= y0 && yScale(d[y_category]) <= y1;
       });
       // updateChart(brushedData);

       updateBar(brushedData);
    }
}

function updateBar(data) {
	// var newData = d3.group(data, d=>d.cylinders);

    // chartB.selectAll('rect').data(cars)
    // .enter()
    // .append('rect')  
    // .attr('x', d => cyScale(d[0]))
    //   .attr('y', d => countScale(d[1]))
    //   .attr('width', histogramBarWidth)
    //   .attr('height', d => cellHeight-countScale(d[1]))
    //   .attr("fill", 'grey')
    //   .attr("opacity", 0.2);

	var newData = d3.rollup(data, v => v.length, d => d.cylinders);

	var bars = chartB.selectAll('rect').data(newData);
	bars.enter()
	  .append('rect')
	  .merge(bars)
      .attr('class','bar')
	  .attr('x', d => cyScale(d[0]))
	  .attr('y', d => countScale(d[1]))
	  .attr('width', histogramBarWidth)
	  .attr('height', d => cellHeight-countScale(d[1]))
	  .attr("fill", function(d) { 
	  	return colorScale(d[0]); 
	  });
	bars.exit().remove();

	// chartB.append("g")
	//    .attr("class", "brush")
	//    .call(brushB);

}

function dataPreprocessor(row) {
    return {
        'name': row['name'],
        'economy (mpg)': +row['economy (mpg)'],
        'cylinders': +row['cylinders'],
        'displacement (cc)': +row['displacement (cc)'],
        'power (hp)': +row['power (hp)'],
        'weight (lb)': +row['weight (lb)'],
        '0-60 mph (s)': +row['0-60 mph (s)'],
        'year': +row['year']
    };
}


function updateChart(data) {

	xScale.domain([extentByAttribute[x_category][0], extentByAttribute[x_category][1]]);
    yScale.domain([extentByAttribute[y_category][0], extentByAttribute[y_category][1]]);
    
    var dots = chartS.selectAll('circle').data(data);
    dots.enter().append('circle')
        // .attr('class', 'dot')
        .attr('r', 5)
        .merge(dots)
        .attr('cx', function(d) { return xScale(d[x_category]); })
        .attr('cy', function(d) { return yScale(d[y_category]); })
        .style('fill', function(d) { return colorScale(d.cylinders); });
    dots.exit().remove();

    xlabel.text(x_category);
    ylabel.text(y_category);
    xAxis.call(d3.axisBottom(xScale).ticks(6));
    yAxis.call(d3.axisLeft(yScale).ticks(6));
    
}

