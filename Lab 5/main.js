// Global function called when select element is changed
var cutoff = 0;
var category = 'all-letters';
function onCategoryChanged() {
    cutoff = 0;
    var select = d3.select('#categorySelect').node();
    // Get current value of select element
    category = select.options[select.selectedIndex].value;
    // Update chart with the selected category of letters
    // cutoff = d3.select('#cutoffInput').node().value;
    // console.log(cutoff);

    var filteredLetters = letters.filter(function(d){
        return lettersMap[category].indexOf(d.letter) >= 0 || d.frequency >= cutoffInput;
    });
    updateChart(filteredLetters);

    // updateChart(category);
}

// recall that when data is loaded into memory, numbers are loaded as strings
// this function helps convert numbers into string during data preprocessing
function dataPreprocessor(row) {
    return {
        letter: row.letter,
        frequency: +row.frequency
    };
}

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 60, r: 40, b: 30, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Compute the spacing for bar bands based on all 26 letters
const barBand = chartHeight / 26;
const barHeight = barBand * 0.7;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

// A map with arrays for each category of letter sets
var lettersMap = {
    'all-letters': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    'only-consonants': 'BCDFGHJKLMNPQRSTVWXZ'.split(''),
    'only-vowels': 'AEIOUY'.split('')
};

var letters = [];
var percentageScale;

d3.csv('letter_freq.csv', dataPreprocessor).then(function(dataset) {
    // Create global variables here and intialize the chart
    // letters = dataset['letter'];
    // **** Your JavaScript code goes here ****
    letters = dataset;

    var format = d3.format(".0%");
    var xDomain = [0, d3.max(dataset, d=>d.frequency)];
    percentageScale = d3.scaleLinear()
                   .domain(xDomain)
                   .range([0, chartWidth]);

    chartG.append('g')
    .attr('transform', 'translate(0, -5)')
    .call(d3.axisTop(percentageScale).ticks(6).tickFormat(d3.format('.0%')))
    chartG.append('text').attr('class', '.axis-label')
    .attr('transform', 'translate('+padding.l +', -30)')
    .text("Letter Frequency (%)");

    chartG.append('g')
    .attr('transform', 'translate(0, '+chartHeight+')')
    .call(d3.axisBottom(percentageScale).ticks(6).tickFormat(d3.format('.0%')));

    // Update the chart for all letters to initialize
    // updateChart('all-letters');

    onCategoryChanged();

    var main = document.getElementById('main');
    d3.select(main)
      .append('p')
      .append('button')
      .style("border", "1px solid black")
      .text('Filter Data')
      .on('click', function() {
            cutoff = d3.select('#cutoffInput').node().value;
            console.log(cutoff);
            var fL = letters.filter(function(d){
                if (d.frequency >= cutoff) {
                    return d;
                }
            });

            updateChart(fL);
      });
});

function updateChart(filteredLetters) { 
    // Create a filtered array of letters based on the filterKey

    // **** Draw and Update your chart here ****

    var bars = chartG.selectAll('.bar')
    .data(filteredLetters, function(d, i){ return d.letter; });

    // Enter and append all new elements
    var newBars = bars.enter().append('g').attr('class', 'bar');
    newBars.merge(bars)
    .attr('transform', function(d, i) {
        return 'translate(' + [0,  i*barBand]+')';
    });

    newBars.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', barHeight)
    .attr('width', function(d, i){ return percentageScale(d.frequency); })
    .style('fill', '#69b3a2');
    

    newBars
    .append('text')
    .attr('transform',function(d, i) {return 'translate(-20, '+barHeight+')';})
    .text(function(d, i) {return d.letter;})
    .style('fill', 'black');


    // Exit and remove filtered bars
    bars.exit().remove();

}



// Remember code outside of the data callback function will run before the data loads