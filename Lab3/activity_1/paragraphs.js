// **** Your JavaScript code goes here ****

d3.csv("baseball_hr_leaders_2017.csv").then(function(dataset) {
	console.log("load data");
	var p = d3.select("#homerun-leaders")
	.selectAll("p")
	.data(dataset)
	.enter()
	.append("p")
	.text(function(d, i) { return d.rank + ". " + d.name + " with " + d.homeruns +" home runs"; })
	.style('font-weight', function(d, i) {
		return i == 0 ? 'bold' : 'normal';
	});

var tboby= d3.select("#main").select('tbody')
var tr = tboby.selectAll('tr')
.data(dataset)
.enter()
.append("tr")

var td1 = tr
.append("td")
.text(function(d, i) {return d.rank;})

var td2 = tr
.append("td")
.text(function(d, i) {return d.name;});

var td3 = tr
.append("td")
.text(function(d, i) {return d.homeruns;});


	// var td = tr.selectAll('td')
	// .data(dataset)
	// .enter()
	// .append('td')
	// .text(function (d) { return d.value; });

});

