/*
This D3.js script generates a dynamic and interactive bubble chart that visualizes the correlation between a country’s population, GDP per capita, and their total accolades in a specified Olympics. The chart is designed to be responsive, adjusting its size based on the user's window dimensions. The layout is structured with a canvas that defines the overall dimensions and margins, creating a dedicated space for the main chart area. 

The data is loaded from a CSV file and filtered to exclude entries with zero or missing values for population, GDP per capita, or accolades, ensuring the chart only displays meaningful data. Population values are plotted on a logarithmic scale on the x-axis, allowing for a wide range of values to be displayed effectively, while GDP per capita is plotted on a linear scale on the y-axis. The size of each bubble represents the total number of accolades (e.g., medals, all-star appearances, all-NBA appearances), with a maximum bubble radius that scales according to the chart’s dimensions. 

Each bubble’s color corresponds to the continent of the country, with a legend provided to help users quickly interpret the data. Interactive tooltips are integrated, offering detailed information when the user hovers over a bubble, including the country’s name, population, GDP per capita, and a breakdown of accolades. Additional features include animated transitions for the bubbles and axis labels, making the chart more visually engaging.

The script also handles user interactions, such as hovering over the color legend to filter bubbles by continent, which helps in focusing on specific regions of interest. The axes are dynamically generated with appropriate tick values based on the data’s range, and text labels are added to bubbles for better identification of countries. Moreover, a separate annotation is included to guide users on how to interact with the chart, enhancing the overall user experience. The modular design of the code, with well-defined helper functions for calculating values and filtering data, ensures that the script is maintainable and adaptable to different datasets or configurations.
*/
function BubbleChart(idcall) {
    // Get the window dimensions for responsive chart sizing
    var w = window,
        page = document,
        e = page.documentElement,
        g = page.getElementsByTagName('body')[0],
        x_size = w.innerWidth || e.clientWidth || g.clientWidth,
        y_size = w.innerHeight || e.clientHeight || g.clientHeight;

   // Set canvas size based on window dimensions
    const width = 0.85 * x_size;
    const height = (0.5 * x_size < 0.62 * y_size) ? 0.5 * x_size : 0.62 * y_size;
    const canvas = { width: width, height: height };
    const margin = { left: 65, right: 52, top: 12, bottom: 36 };
    const chart = {
        width: canvas.width - (margin.right + margin.left),
        height: canvas.height - (margin.top + margin.bottom)
    };

   
    const maxradius = (chart.width + chart.height) / 40;

   
    var svg = d3.select("#scatterDivId")
        .append("svg")
        .attr("width", canvas.width)
        .attr("height", canvas.height)
        .style("background-color", olympics ? '#b3daf117' : '#ffff6f07')
       
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

   
    d3.csv(dataPath, function(error, data) {
        if (error) throw error;

        data = data.filter(
            function(page) {
                return (getPopulation(page) !== 0 && getGDPperCapita(page) !== 0 && calcTotalAcco(page) !== 0);
            }
        );

        
        var pop_minmax = getMinMaxPopulation(data);
        var gdp_minmax = getMinMaxGDP(data);
        var totAcc1 = maximumAcc(data);
        var contMap = getContinentsList(data);
        

        
        var pop_min_round = (pop_minmax[0] > 1) ? 1 : 0.1;
        var gdp_min = Math.floor(gdp_minmax[0] / 5000) * 5000; 
        var gdp_max = Math.ceil(gdp_minmax[1] / 10000) * 10000; 
        var pop_min = Math.max(0.01, Math.floor(pop_minmax[0] / pop_min_round) * pop_min_round); 
        var pop_max = Math.ceil(pop_minmax[1] / 100) * 100; 
       


   
        var x = d3.scaleLog().base(10).domain([pop_min, pop_max]).range([0, chart.width]);
        var y = d3.scaleLinear().domain([gdp_min, gdp_max]).range([chart.height, 0]);
        var r = d3.scaleSqrt().domain([1, totAcc1]).range([1.5, maxradius]);
        var c = d3.scaleOrdinal()
            .domain(["Europe", "Africa", 'North America', 'South America', "Asia", "Oceania"])
            .range(["#0069b3ff", "#f07d00ff", "#00963fff", "#b70d7fff", "#ffcc01ff", "#e40613ff"]);

        
        var tooltip = d3.select("#scatterDivId")
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

     
        var xTickValAll = [0.01, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
        let xTickVal = [];
        for (let i = 0; i < xTickValAll.length; i++) {
            if (xTickValAll[i] >= pop_min && xTickValAll[i] <= pop_max) {
                xTickVal.push(xTickValAll[i]);
            }
        }

        var xAxis = d3.axisBottom(x)
            .tickValues(xTickVal)
            .tickFormat(d3.format('.1r'));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chart.height + ")")
            .transition().duration(1500)
            .call(xAxis);

        var yAxis = d3.axisLeft(y)
            .tickFormat(d3.format(',.2r'));

        svg.append("g")
            .attr("class", "y axis")
            .transition().duration(1500)
            .call(yAxis);

       
        svg.append('g')
            .attr('transform', 'translate(' + (chart.width / 2) + ', ' + (chart.height + 32) + ')')
            .append('text')
            .style("opacity", 0).transition().duration(2000).style("opacity", 1)
            .attr("class", "x label")
            .attr('text-anchor', 'middle')
            .text("Current Population in Country(in milions, log scale)");

        svg.append('g')
            .attr('transform', 'translate(' + (-margin.left + 15) + ', ' + (chart.height / 2 + margin.top) + ')')
            .append('text')
            .attr("class", "y label")
            .attr('text-anchor', 'middle')
            .attr("transform", "rotate(-90)")
            .text("Current GDP per Capita (in USD)")
            .style("opacity", 0).transition().duration(2000).style("opacity", 1);

        
        var dots = svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "datapoints")
            .attr("cx", 0)
            .attr("cy", (chart.height))
            .attr("r", 0)
            .style("fill", function(page) { return c(page.Continent); })
            .style("opacity", 0.8);

    
        dots.transition()
            .delay(750)
            .duration(2000)
            .attr("r", function(page) { return r(calcTotalAcco(page)); })
            .attr("cx", function(page) { return x(getPopulation(page)); })
            .attr("cy", function(page) { return y(getGDPperCapita(page)); });

        
        dots.on("mouseover", mouseOver)
            .on("mousemove", mouseOn)
            .on("mouseleave", mouseLeave);

    // Animate bubble transition to final positions and sizes
        svg.append('g')
            .selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "datapoints")
            .attr("x", function(page) { return x(getPopulation(page)); })
            .attr("y", function(page) { return y(getGDPperCapita(page)); })
            .attr("dx", function(page) { return 0.75 * r(calcTotalAcco(page)); })
            .attr("dy", function(page) { return -0.8 * r(calcTotalAcco(page)); })
            .text(function(page) { return page.Country_Code; })
            .style("font-size", "8px")
            .style("opacity", 0).transition().delay(500).duration(2000).style("opacity", 0.6);

      // Add color legend for continents
        var colorLegend = svg.selectAll("colorlegend")
            .data(contMap)
            .enter().append("g")
            .attr("class", "colorlegend")
            .attr("transform", function(page, i) {
                return "translate(0," + (10 + i * 20) + ")";
            });

        colorLegend.append("circle")
            .attr("cx", chart.width - 8)
            .attr("r", 7)
            .style("fill", function(page) { return c(page); })
            .style("stroke-width", 0)
            .on("mouseover", filterContinents)
            .on("mouseout", filterContinentsOff)
            .style("opacity", 0).transition().delay(1500).duration(2000).style("opacity", 0.8);

        colorLegend.append("text")
            .attr("x", chart.width - 20)
            .attr("y", 0)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .on("mouseover", filterContinents)
            .on("mouseout", filterContinentsOff)
            .text(function(page) { return page; })
            .style("fill-opacity", 0).transition().delay(2000).duration(2000).style("fill-opacity", 0.7);

     
        var xCircle = chart.width-100;
        var yCircle = 2 * maxradius + 200;
        var xLabel = xCircle + 60;

        var valuesToShow = [1, Math.round(totAcc1 / 3), totAcc1];

        var radiLegend = svg.selectAll("radilegend")
            .data(valuesToShow)
            .enter()
            .append("g")
            .attr("class", "legend");

        radiLegend.append("circle")
            .attr("cx", xCircle)
            .attr("cy", function(page) { return yCircle - r(page); })
            .attr("r", function(page) { return r(page); })
            .style("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 0.7)
            .style('stroke-opacity', 0).transition().delay(2500).duration(2000).style('stroke-opacity', 0.7);

        radiLegend.append("line")
            .attr('x1', function(page) { return xCircle + r(page); })
            .attr('x2', xLabel)
            .attr('y1', function(page) { return yCircle - r(page); })
            .attr('y2', function(page) { return yCircle - r(page); })
            .attr('stroke', 'black')
            .style('stroke-opacity', 0).transition().delay(2250).duration(2000).style('stroke-opacity', 0.7)
            .attr("stroke-width", 0.5)
            .style('stroke-dasharray', ('2,1'));

        radiLegend.append("text")
            .attr('x', xLabel)
            .attr('dx', '0.5em')
            .attr('y', function(page) { return yCircle - r(page); })
            .text(function(page) { return page; })
            .style("font-size", 10)
            .attr('alignment-baseline', 'middle')
            .style("fill-opacity", 0).transition().delay(2000).duration(2000).style("fill-opacity", 0.6);

        svg.append("text")
            .attr('x', xCircle)
            .attr("y", yCircle + 13)
            .attr("class", "legendtext")
            .text("Accolades count")
            .style("fill-opacity", 0).transition().delay(2500).duration(2000).style("fill-opacity", 0.6);


        var yAnnotation = -3;
        svg.append("text")
            .attr("x", 10)
            .attr("y", yAnnotation)
            .attr("class", "annotation")
            .style("text-anchor", "start")
            .text("Hover over the bubbles and color legend for more details.")
            .style('opacity', 0);

        
        var xMaxcountry = chart.width / 2;
        var yMaxcountry = 40;

        var maxCountry = svg.selectAll("maxcountry")
            .data(data.filter(
                function(page) {
                    return (calcTotalAcco(page) == totAcc1);
                }
            ))
            .enter()
            .append("g");

        maxCountry.append("line")
            .attr('x1', function(page) { return x(getPopulation(page)); })
            .attr('x2', xMaxcountry)
            .attr('y1', function(page) { return y(getGDPperCapita(page)); })
            .attr('y2', function(page) { return yMaxcountry; })
            .attr('stroke', 'black')
            .style('stroke-opacity', 0).transition().delay(2750).duration(2000).style('stroke-opacity', 0.5)
            .attr("stroke-width", 0.5)
            .style('stroke-dasharray', ('1,1'));

        maxCountry.append("text")
            .attr('x', xMaxcountry)
            .attr('dy', '-0.3em')
            .attr('y', yMaxcountry)
            .text('Country with Most Accolades')
            .style("font-size", '9pt')
            .style('text-decoration', "underline")
            .style('text-anchor', "middle")
            .style("fill-opacity", 0).transition().delay(3000).duration(2000).style("fill-opacity", 0.5);

    
        

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

    function calcAccolades(page) {
        const offset = 5; 
        var index = offset + 3 * (idcall - 1);

        var totalmedals = d3.values(page)[index];
        var allstars = d3.values(page)[index + 1];
        var allnba = d3.values(page)[index + 2];

        totalmedals = (isNaN(totalmedals) || totalmedals == "") ? 0 : parseInt(totalmedals);
        allstars = (isNaN(allstars) || allstars == "") ? 0 : parseInt(allstars);
        allnba = (isNaN(allnba) || allnba == "") ? 0 : parseInt(allnba);

        return { allstars, allnba, totalmedals };
    }

    function calcTotalAcco(page) {

        let { allstars, allnba, totalmedals } = calcAccolades(page);
        var tot = 0;

        tot += allstars;
        tot += totalmedals;
        tot += allnba;
        return tot;
    }

    function maximumAcc(data) {
        let medals;
        var maxMedals = 0;

        for (let i = 0; i < data.length; i++) {
            medals = calcTotalAcco(data[i]);
            if (maxMedals < medals) {
                maxMedals = medals;
            }
        }
        return maxMedals;
    }

    function getMinMaxPopulation(data) {
        var minPop = Infinity;
        var maxPop = 0;
        let pop;

        for (let i = 0; i < data.length; i++) {
            if (calcTotalAcco(data[i]) > 0 && getGDPperCapita(data[i]) > 0) {
                pop = getPopulation(data[i]);
                if (maxPop < pop) {
                    maxPop = pop;
                }
                if (minPop > pop && pop !== 0) {
                    minPop = pop;
                }
            }
        }
        return [minPop, maxPop];
    }

    function getMinMaxGDP(data) {
        var minGDP = Infinity;
        var maxGDP = 0;
        let gdp;

        for (let i = 0; i < data.length; i++) {
            if (calcTotalAcco(data[i]) > 0 && getPopulation(data[i])) {
                gdp = getGDPperCapita(data[i]);
                if (maxGDP < gdp) {
                    maxGDP = gdp;
                }
                if (minGDP > gdp && gdp !== 0) {
                    minGDP = gdp;
                }
            }
        }
        return [minGDP, maxGDP];
    }

    function getContinentsList(data) {
        const contMap = [];

        for (let i = 0; i < data.length; i++) {
            if (calcTotalAcco(data[i]) > 0) {
                if (!contMap.includes(data[i].Continent)) {
                    contMap.push(data[i].Continent);
                }
            }
        }
        return contMap;
    }

    function getTooltipInfo(page) {
        let { allstars, allnba, totalmedals } = calcAccolades(page);
        let totalAccolades = calcTotalAcco(page);
        let htmlInfo;

        htmlInfo = "<b>Country:</b> " + page.Country + '<br>' +
            "&emsp;&#8226;<b>&emsp;Population:</b> " + d3.format(',.3s')(getPopulation(page) * 1e6).replace(/G/, "B") + '<br>' +
            "&emsp;&#8226;<b>&emsp;GDP per Capita:</b> " + "$" + d3.format(',.3s')(getGDPperCapita(page)) + '<br><br>' +
            "<b>Total Accolades won:</b> " + totalAccolades + '<br>' +
            "&emsp;&#8226;<b>&emsp;Total Medals in all Competitions:</b> " + totalmedals + '<br>' +
            "&emsp;&#8226;<b>&emsp;NBA All-Star Appearances:</b> " + allstars + '<br>' +
            "&emsp;&#8226;<b>&emsp;All-NBA Appearances:</b> " + allnba;
        return htmlInfo;
    }

    function filterContinents(page) {
        svg.selectAll('.datapoints')
            .filter(function(data) {
                return (data.Continent != page);
            })
            .transition()
            .style('opacity', 0.04);
    }

    function filterContinentsOff(page) {
        svg.selectAll('.datapoints')
            .transition()
            .style('opacity', 0.8);
    }
}
