//frequency chart

/*
This D3.js script generates an interactive bar chart that visualizes 
the cumulative accolades earned by different countries in various competitions,
 based on a selected (`idcall`). 
 
 The chart dynamically adjusts its size and layout based on the user's window dimensions and the number of active countries with accolades. The data is loaded from a CSV file, filtered to include only countries with non-zero accolades, and then sorted by the total number of accolades in descending order. The chart's axes are dynamically generated, with a linear scale for the x-axis representing the total accolades and a band scale for the y-axis representing the country codes. 


Each bar is colored according to the continent of the country,
 with a color legend provided for clarity. 
 
 Tooltips are implemented to display detailed information about each country's population, GDP per capita, 
 
 and accolades breakdown (medals, All-Star appearances, All-NBA appearances) when the user hovers over a bar.
 
 
 
 Additionally, interactive elements allow users to filter the chart by continent, 
 
 
 dimming bars and data points from other continents to focus on a specific region. 
 
 
 The chart also includes transitions for the axes, bars, l
 
 abels, and legend, enhancing the visual presentation. 
 
 Modular functions are used to calculate various data points, such as total accolades,
 
 maximum accolades, and continent lists, making the code easier to maintain and 
 
 extend for future use cases or datasets.
*/
function TotalFreqPlot(idcall) {
    var whole = window,
        page = document,
        pageelem = page.documentElement,
        g = page.getElementsByTagName('body')[0],
        x_size = whole.innerWidth || pageelem.clientWidth || tagelem.clientWidth;
    let svg;

// Load data from CSV file
    d3.csv(dataPath, function(error, data) {
        if (error) throw error;
        var totAcc1 = maximumAcc(data);
        var contMap = getContinentsList(data);

        var allCountries = data.length;
        data = data.filter(function(page) {
            return (functTotalAccolades(page, idcall) !== 0);
        });

        data.sort(function(b, a) {
            return functTotalAccolades(a, idcall) - functTotalAccolades(b, idcall);
        });

        var allActiveCountries = data.length;

        const width = 0.86 * x_size;
        const height = 49 + (allActiveCountries / allCountries) * (olympics ? 495 : 1390);
        const canvas = { width: width, height: height };
        const margin = { left: 65, right: 52, top: 0, bottom: 45 };
        const chart = {
            width: canvas.width - (margin.right + margin.left),
            height: canvas.height - (margin.top + margin.bottom)
        };

        svg = d3.select("#barDivId")
            .append("svg")
            .attr("width", canvas.width)
            .attr("height", canvas.height)
            .style("background-color", olympics ? '#b3daf117' : '#ffff6f07')
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");


     
        var x = d3.scaleLinear()
            .domain([1, totAcc1])
            .range([2, chart.width]);
        var y = d3.scaleBand()
            .range([0, chart.height])
            .domain(data.map(function(page) { return page.Country_Code; })).padding(0.15);
        var c = d3.scaleOrdinal()
            .domain(["Europe", "Africa", 'North America', 'South America', "Asia", "Oceania"])
            .range(["#0069b3ff", "#f07d00ff", "#00963fff", "#b70d7fff", "#ffcc01ff", "#e40613ff"]);

        var tooltip = d3.select("#barDivId")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

    
        var mouseOver = function(page) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.8);

            tooltip.html(getTooltipInfo(page))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 30) + "px");
        };

        var mouseOn = function(page) {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 30) + "px");
        };

        var mouseLeave = function(page) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        };

// Calculate the maximum accolades and get a list of continents
// Calculate canvas and chart dimensions
// Append SVG element to the specified div
// Define scales for the x and y axes
// Create tooltip element for displaying detailed info
// Add y-axis label to the chart
        svg.append("g")
            .attr("transform", "translate(0," + chart.height + ")")
            .attr("class", "x axis")
            .transition().delay(3500).duration(1500)
            .call(d3.axisBottom(x))
            .selectAll("text");
    

        svg.append("g")
            .attr("class", "y axis")
            .transition().delay(3500).duration(1500)
            .call(d3.axisLeft(y));


        svg.append('g')
            .attr('transform', 'translate(' + (chart.width / 2) + ', ' + (chart.height + margin.top + 42) + ')')
            .append('text')
            .style("opacity", 0).transition().delay(3500).duration(2000).style("opacity", 1)
            .attr("class", "x label")
            .attr('text-anchor', 'middle')
            .text("Cumulative Accolade Count");

        svg.append('g')
            .attr('transform', 'translate(' + (-margin.left + 15) + ', ' + (chart.height / 2 + margin.top) + ')')
            .append('text')
            .attr("class", "y label")
            .attr('text-anchor', 'middle')
            .attr("transform", "rotate(-90)")
            .text("Country")
            .style("opacity", 0).transition().delay(3500).duration(2000).style("opacity", 1);

    
        var bars = svg.append('g')
            .selectAll("bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", x(0))
            .attr("y", function(page) { return y(page.Country_Code); })
            .attr("width", 0)
            .attr("height", y.bandwidth())
            .style("fill", function(page) { return c(page.Continent); })
            .style("opacity", 0.8);


        bars.transition()
            .delay(3750)
            .duration(4000)
            .attr('width', function(page) { return x(functTotalAccolades(page, idcall)); });

    
        bars.on("mouseover", mouseOver)
            .on("mousemove", mouseOn)
            .on("mouseleave", mouseLeave);


        svg.append('g')
            .selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "datapoints")
            .attr("x", function(page) { return x(functTotalAccolades(page, idcall)); })
            .attr("y", function(page) { return y(page.Country_Code); })
            .attr("dx", 4)
            .attr("dy", y.bandwidth() / 2)
            .style("alignment-baseline", "central")
            .text(function(page) { return functTotalAccolades(page, idcall); })
            .style("font-size", "9px")
            .style("opacity", 0).transition().delay(6250).duration(2500).style("opacity", 0.8);


      
        var colorLegend = svg.selectAll("colorlegend")
            .data(contMap)
            .enter().append("g")
            .attr("class", "colorlegend")
            .attr("transform", function(page, i) {
                return "translate(0," + (5 + 42 * (allActiveCountries / allCountries) + i * 20) + ")";
            });

        colorLegend.append("rect")
            .attr("x", chart.width - y.bandwidth())
            .attr("width", y.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function(page) { return c(page); })
            .style("stroke-width", 0)
            .on("mouseover", filterContinents)
            .on("mouseout", filterContinentsOff)
            .style("opacity", 0).transition().delay(7000).duration(2000).style("opacity", 0.8);

            // Calculate the maximum accolades and get a list of continents
// Calculate canvas and chart dimensions
// Append SVG element to the specified div
// Define scales for the x and y axes
// Create tooltip element for displaying detailed info
// Add y-axis label to the chart
        colorLegend.append("text")
            .attr("x", chart.width - y.bandwidth() - 10)
            .attr("dy", y.bandwidth() - 1)
            .style("text-anchor", "end")
            .on("mouseover", filterContinents)
            .on("mouseout", filterContinentsOff)
            .text(function(page) { return page; })
            .style("fill-opacity", 0).transition().delay(6750).duration(2000).style("fill-opacity", 0.7);

      
        svg.append("text")
            .attr("x", chart.width / 2)
            .attr("y", chart.height / 2)
            .attr("class", "annotation2")
            .style("text-anchor", "middle")
            .style("opacity", 0).transition().delay(5750).duration(3000).style("opacity", 0.3);

    });

    function getPopulation(page) {
        var pop = 0;
        pop += page.Population == "" ? 0 : parseInt(page.Population.replace(/[^\d\.\-eE+]/g, ""));
        pop = Math.round(pop / 1000) / 1000; 
        return pop;
    }

    function getGDPperCapita(page) {
        var gdp = 0;
        gdp += page.GDP_Per_Capita == "" ? 0 : parseInt(page.GDP_Per_Capita.replace(/[^\d\.\-eE+]/g, ""));
        return gdp;
    }

    function getTotalAccolades(page, untilId) {

        var allNBA = 0;
        var totalmedals = 0;
        var allstar = 0;

        let firstcol;
        let secondcol;
        let thirdcol;

        const offset = 5;
        let index;

        for (let i = 1; i <= untilId; i++) {
            index = offset + 3 * (i - 1);

            firstcol = d3.values(page)[index];
            secondcol = d3.values(page)[index + 1];
            thirdcol = d3.values(page)[index + 2];

            allNBA += (isNaN(thirdcol) || thirdcol == "") ? 0 : parseInt(thirdcol);
            totalmedals += (isNaN(firstcol) || firstcol == "") ? 0 : parseInt(firstcol);
            allstar += (isNaN(secondcol) || secondcol == "") ? 0 : parseInt(secondcol);
        }
        return { totalmedals, allstar, allNBA };
    }

    function functTotalAccolades(page, untilId) {

        let { totalmedals, allstar, allNBA } = getTotalAccolades(page, untilId);
        var tot = 0;

        tot += totalmedals;
        tot += allNBA;
        tot += allstar;
        return tot;
    }
// Add legend for continent colors
// Append bars to the SVG for each country
    function maximumAcc(data) {
        let medals;
        var maxMedals = 0;

        for (let i = 0; i < data.length; i++) {
            medals = functTotalAccolades(data[i], numberOfGames);
            if (maxMedals < medals) {
                maxMedals = medals;
            }
        }
        return maxMedals;
    }

    function getContinentsList(data) {
        const contMap = [];

        for (let i = 0; i < data.length; i++) {
            if (functTotalAccolades(data[i], idcall) > 0) {
                if (!contMap.includes(data[i].Continent)) {
                    contMap.push(data[i].Continent);
                }
            }
        }
        return contMap;
    }

    function getTooltipInfo(page) {
        let { totalmedals, allstar, allNBA } = getTotalAccolades(page, idcall);
        let totalAccolades = functTotalAccolades(page, idcall);
        let htmlInfo;

        htmlInfo = "<b>Country:</b> " + page.Country + '<br>' +
            "&emsp;&#8226;<b>&emsp;Population:</b> " + d3.format(',.3s')(getPopulation(page) * 1e6).replace(/G/, "B") + '<br>' +
            "&emsp;&#8226;<b>&emsp;GDP per Capita:</b> " + "$" + d3.format(',.3s')(getGDPperCapita(page)) + '<br><br>' +
            "<b>Total accolades:</b> " + totalAccolades + '<br>' +
            "&emsp;&#8226;<b>&emsp;Total Medals in all Competitions:</b> " + totalmedals + '<br>' +
            "&emsp;&#8226;<b>&emsp;All Star Appearences:</b> " + allstar + '<br>' +
            "&emsp;&#8226;<b>&emsp;All NBA Appearences:</b> " + allNBA;
        return htmlInfo;
    }

    function filterContinents(page) {
        svg.selectAll('.bar')
            .filter(function(data) {
                return (data.Continent != page);
            })
            .transition()
            .style('opacity', 0.05);

        svg.selectAll('.datapoints')
            .filter(function(data) {
                return (data.Continent != page);
            })
            .transition()
            .style('opacity', 0.05);
    }

    function filterContinentsOff(page) {
        svg.selectAll('.bar')
            .transition()
            .style('opacity', 0.8);

        svg.selectAll('.datapoints')
            .transition()
            .style('opacity', 0.8);
    }

}