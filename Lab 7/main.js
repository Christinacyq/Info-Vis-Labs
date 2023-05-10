var svgs = d3.select('#scartterplot');
var legend = d3.select('#legend');
var svgb = d3.select('#main').append('svg')
.attr("width", 600)
.attr("height", 350)
.attr('transform', 'translate(-130, -100)');

var svgsWidth = +svgs.attr('width');
var svgsHeight = +svgs.attr('height');
var padding = {t: 50, r: 30, b: 50, l: 80};
var cellWidth = svgsWidth - padding.l - padding.r;
var cellHeight = svgsHeight - padding.t - padding.b;

var chartS = svgs.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');
var leng = legend.append('g');

var extentByAttribute = {};
var dataAttributes = ['duration', 'aspect_ratio', 'imdb_score', 'budget', 'gross',
	'num_user_for_reviews', 'facenumber_in_poster', 'num_voted_users'];

var x_category = 'duration';
var y_category = 'imdb_score';
var year_category = 'all';

var xScale = d3.scaleLinear().range([0, cellWidth]);
var yScale = d3.scaleLinear().range([cellHeight, 0]);
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);
var xAxis;
var yAxis;
var doubleClick = false;
var movie_name;
var svgbWidth = +svgb.attr('width');
var svgbHeight = +svgb.attr('height');
var barpadding = {t: 20, r: 20, b: 20, l: 150};
var barcellWidth = svgbWidth - barpadding.l - barpadding.r;
var barcellHeight = svgbHeight - barpadding.t - barpadding.b;

var yDomain = ['actor_1_facebook_likes','actor_2_facebook_likes','actor_3_facebook_likes', 'director_facebook_likes','cast_total_facebook_likes','movie_facebook_likes'];
var chartB = svgb.append("g")
.attr('transform', 'translate('+[barpadding.l, barpadding.t]+')');
var barxScale = d3.scaleLinear().range([0, barcellWidth]);
var baryScale = d3.scaleBand().range([barcellHeight, 0]).domain(yDomain);
var barXaxis;
var barYaias;
var newData = {};
function onXChanged() {
	var x_select = d3.select('#xSelect').node();
    x_category = x_select.options[x_select.selectedIndex].value;
    console.log(x_category);

    if (year_category != 'all') {
        var filteredData = movies.filter(function(d){
            // console.log(d);
            return d.year == year_category;
        });
        updateChart(filteredData);
    } else {
        updateChart(movies);
    }

}
function onYChanged() {
	var y_select = d3.select('#ySelect').node();
    y_category = y_select.options[y_select.selectedIndex].value;
    console.log(y_category);

    if (year_category != 'all') {
        var filteredData = movies.filter(function(d){
            // console.log(d);
            return d.year == year_category;
        });
        updateChart(filteredData);
    } else {
        updateChart(movies);
    }

}
function onYearChanged() {
	var year_select = d3.select('#yearSelect').node();
    year_category = year_select.options[year_select.selectedIndex].value;
    console.log(year_category);
    if (year_category != 'all') {
	    var filteredData = movies.filter(function(d){
	    	// console.log(d);
	    	return d.year == year_category;
	    });
	    updateChart(filteredData);
	} else {
		updateChart(movies);
	}
    
}

var movies = [];

var toolTip = d3.tip()
.attr("class", "d3-tip")
.offset([-12, 0])
.html(function(event, d) {
    // Inject html, when creating your html I recommend editing the html within your index.html first
    return "<h5>"+d['name']+" (" + d['rating']+ ")</h5>"
});

svgs.call(toolTip);

d3.csv('movies.csv', dataPreprocessor).then(function(dataset) {

	movies = dataset;

	dataAttributes.forEach(function(attribute){
        extentByAttribute[attribute] = d3.extent(dataset, function(d){
            return d[attribute];
        });
    });

    if (x_category == 'duration') {
        xScale.domain([60, extentByAttribute[x_category][1]+2]);
        yScale.domain([0, extentByAttribute[y_category][1]+2]);
    } else if (y_category == 'duration') {
        yScale.domain([60, extentByAttribute[y_category][1]+2]);
        xScale.domain([0, extentByAttribute[x_category][1]+2]);
    } else {
        xScale.domain([0, extentByAttribute[x_category][1]+2]);
        yScale.domain([0, extentByAttribute[y_category][1]+2]);
    }

	xAxis = chartS.append('g').attr('class', '.axis');
	xAxis.call(d3.axisBottom(xScale).ticks(8))
	.attr('transform', 'translate('+[0, cellHeight]+')');

	yAxis = chartS.append('g').attr('class', '.axis');
	yAxis.call(d3.axisLeft(yScale).ticks(8));

	chartS.append('g')
    .selectAll("g")
    .data(dataset)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return xScale(d[x_category]); } )
      .attr("cy", function (d) { return yScale(d[y_category]); } )
      .attr("r", 4)
      .style("fill", function(d) { return colorScale(d.year); })
      .on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide)
    .on('click', function(d) {
        if (doubleClick) {
            if (d.srcElement.__data__['name'] != newData.name) {
                updateBarchart(d.srcElement.__data__);
            } else {
                removeBarchart();
                doubleClick = !doubleClick;
            }
        } else {
            createBarchart(d.srcElement.__data__);
            doubleClick = !doubleClick;
        }
    });

    var titleGroup = leng.append('g')
    .attr('transform', 'translate(0, 20)');

    titleGroup.append('text')
    .text('Movie Year')
    .attr('x', 0)
    .attr('y', 0)
    .style('text-decoration', 'underline')
    .style("font-size", "18px");

    var squareGroup = leng.append('g')
    .attr('transform', 'translate(0, 30)');

    var squ = squareGroup.append('g').selectAll('g')
    .data(d3.sort(d3.group(dataset, d=>d.year).keys()))
    .enter()
    .append('g')
    .attr('transform', function(d, i) {return 'translate(0,' + i*25 + ')';});

    squ.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', function(d) { return colorScale(d); });

    squ.append('text')
        .attr('x', 30)
        .attr('y', 15)
        .text(function(d) { return d; });

});

function dataPreprocessor(row) {
    return {
        'name': row['movie_title'],
        'rating': row['content_rating'],
        'duration': +row['duration'],
        'gross': +row['gross'],
        'imdb_score': +row['imdb_score'],
        'num_user_for_reviews': +row['num_user_for_reviews'],
        'num_voted_users': +row['num_voted_users'],
        'facenumber_in_poster': +row['facenumber_in_poster'],
        'aspect_ratio': +row['aspect_ratio'],
        'budget': +row['budget'],
        'year': +row['title_year'],
        'actor_1_facebook_likes': +row['actor_1_facebook_likes'],
        'actor_2_facebook_likes': +row['actor_2_facebook_likes'],
        'actor_3_facebook_likes': +row['actor_3_facebook_likes'],
        'director_facebook_likes': +row['director_facebook_likes'],
        'cast_total_facebook_likes': +row['cast_total_facebook_likes'],
        'movie_facebook_likes': +row['movie_facebook_likes']
    };
}

function updateChart(data) {
	// console.log(data);
    if (x_category == 'duration') {
        xScale.domain([60, extentByAttribute[x_category][1]+2]);
        yScale.domain([0, extentByAttribute[y_category][1]+2]);
    } else if (y_category == 'duration') {
        yScale.domain([60, extentByAttribute[y_category][1]+2]);
        xScale.domain([0, extentByAttribute[x_category][1]+2]);
    } else {
        xScale.domain([0, extentByAttribute[x_category][1]+2]);
        yScale.domain([0, extentByAttribute[y_category][1]+2]);
    }
    var dots = chartS.selectAll('circle').data(data);
    dots.enter().append('circle')
        // .attr('class', 'dot')
        .attr('r', 4)
        .merge(dots)
        .attr('cx', function(d) { return xScale(d[x_category]); })
        .attr('cy', function(d) { return yScale(d[y_category]); })
        .style('fill', function(d) { return colorScale(d.year); });
    dots.exit().remove();

    xAxis.call(d3.axisBottom(xScale).ticks(8));
    yAxis.call(d3.axisLeft(yScale).ticks(8));

}

function createBarchart(data) {
    var max_x = 0;
    for (i in yDomain) {
        newData[yDomain[i]] = data[yDomain[i]];
        if (data[yDomain[i]] > max_x) {
            max_x = data[yDomain[i]];
        }
    }
    newData['name'] = data['name'];
    console.log(newData);
    // console.log(max_x);
    barxScale.domain([0, max_x]);
    baryScale.domain(yDomain);
    barXAxis = chartB.append('g').attr('class', '.axis');
    barXAxis.call(d3.axisBottom(barxScale).ticks(8))
    .attr('transform', 'translate('+[0, barcellHeight]+')');

    barYAxis = chartB.append('g').attr('class', '.axis');
    barYAxis.call(d3.axisLeft(baryScale).ticks(8));

    movie_name = chartB.append('text')
    .attr('transform', 'translate(100, 0)')
    .attr('class', 'title')
    .text(data['name']);

    var bars = chartB.append('g').attr('transform', 'translate(0, 10)');

    var bar = bars.selectAll('.bar')
    .data(yDomain)
    .enter()
    .append('g')
    .attr('class', 'bar')
    .attr('transform', function(d, i) {
        return 'translate(0,' + (i*52) + ')';
    });

    bar.append('rect')
      .attr('width', function(d, i) {
        return barxScale(newData[d]);
      })
      .attr('height', 30)
      .attr("fill", 'purple');

}
function updateBarchart(data) {
    var max_x = 0;
    for (i in yDomain) {
        newData[yDomain[i]] = data[yDomain[i]];
        if (data[yDomain[i]] > max_x) {
            max_x = data[yDomain[i]];
        }
    }
    console.log(max_x);
    barxScale.domain([0, max_x]);
    newData['name'] = data['name'];
    console.log(newData);
    var bars = chartB.selectAll('rect').data(yDomain);
    bars.enter()
      .append('rect')
      .merge(bars)
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', 30)
      .attr('width', function(d, i) {
        return barxScale(newData[d]);
      })
      .attr("fill", 'purple');
    bars.exit().remove();
    movie_name.text(newData['name']);
    barXAxis.call(d3.axisBottom(barxScale).ticks(8));
}

function removeBarchart() {
    var bars = chartB.selectAll('g').data(newData);
    bars.exit().remove();
    var texts = chartB.selectAll('text').data(newData);
    texts.exit().remove();
}

