// **** Example of how to create padding and spacing for trellis plot****
var svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object
// This will space out the trellis subplots
var padding = {t: 20, r: 20, b: 60, l: 60};

// Compute the dimensions of the trellis plots, assuming a 2x2 layout matrix.
trellisWidth = svgWidth / 2 - padding.l - padding.r;
trellisHeight = svgHeight / 2 - padding.t - padding.b;

// As an example for how to layout elements with our variables
// Lets create .background rects for the trellis plots
svg.selectAll('.background')
    .data(['A', 'B', 'C', 'C']) // dummy data
    .enter()
    .append('rect') // Append 4 rectangles
    .attr('class', 'background')
    .attr('width', trellisWidth) // Use our trellis dimensions
    .attr('height', trellisHeight)
    .attr('transform', function(d, i) {
        // Position based on the matrix array indices.
        // i = 1 for column 1, row 0)
        var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
        var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
        return 'translate('+[tx, ty]+')';
    });

var parseDate = d3.timeParse('%b %Y');
// To speed things up, we have already computed the domains for your scales
var dateDomain = [new Date(2000, 0), new Date(2010, 2)];
var priceDomain = [0, 223.02];

// **** How to properly load data ****

d3.csv('stock_prices.csv').then(function(dataset) {

// **** Your JavaScript code goes here ****
dataset.forEach(function(d){
    d.date = parseDate(d.date);
});
// console.log(dataset); 
var companies = d3.group(dataset, d => d.company);
console.log(companies); 

var dateScale = d3.scaleTime()
.domain(dateDomain).range([0, trellisWidth]);

var priceScale = d3.scaleLinear()
.domain(priceDomain).range([trellisHeight, 0]);

var xGrid = d3.axisTop(dateScale)
    .tickSize(-trellisHeight, 0, 0)
    .tickFormat('');

var yGrid = d3.axisLeft(priceScale)
    .tickSize(-trellisWidth, 0, 0)
    .tickFormat('');

var charts = svg.selectAll('g')
.data(companies) // dummy data
.enter()
.append('g')
.attr('transform', function(d, i) {
        // Position based on the matrix array indices.
        // i = 1 for column 1, row 0)
        var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
        var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
        return 'translate('+[tx, ty]+')';
    });

charts.append('g')
.attr('class', 'x grid')
.call(xGrid);

charts.append('g')
.attr('class', 'y grid')
.call(yGrid);

charts.append('g').call(d3.axisLeft(priceScale));
charts.append('g')
.attr('transform','translate(0,'+trellisHeight+')')
.call(d3.axisBottom(dateScale));

var color = d3.scaleOrdinal()
    .domain(companies.keys())
    .range(d3.schemeCategory10);

var lineInterpolate = d3.line()
    .x(function(d) { return dateScale(d.date); })
    .y(function(d) { return priceScale(d.price); });

charts.append('path')
    .datum(function(d,i) {return d[1];})
    .attr('class', 'line-plot')
    .attr("d", lineInterpolate)
    .style('stroke', function(d) { return color(d[0].company); });

charts.append('text')
    .datum(function(d,i) {return d[1];})
    .attr('class', 'company-label')
    .attr('x', trellisWidth / 2)
    .attr('y', trellisHeight / 2)
    .text(function(d) {return d[0].company;})
    .style('fill', function(d) { return color(d[0].company); });

charts.append('text')
.attr('class', 'axis-label')
.attr('transform', 'translate(-30,'+(trellisHeight / 2)+') rotate(-90)')
.text("Stock Price(USD)")
.style('fill', 'black')
.style('opacity', 1);

charts.append('text')
.attr('class', 'axis-label')
.attr('transform', 'translate('+(trellisWidth / 2)+', '+(trellisHeight+34)+')')
.text("Date (by Month)")
.style('fill', 'black');

});         

// Remember code outside of the data callback function will run before the data loads



