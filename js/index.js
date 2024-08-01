// Initialize global variables
var year_count = 0; // Keeps track of the current year index in the visualization
var numberOfGames = Infinity; // Stores the total number of games available, set to Infinity initially
var hostCountry = ''; // Stores the host country of the current game
var hostCity = ''; // Stores the host city of the current game
var hostYear = ''; // Stores the host year of the current game
var olympics = 0; // Flag to differentiate between Olympics and FIBA data (0 = Olympics, 1 = FIBA)
var dataPath = ''; // Stores the path to the CSV data file for game results
var venuePath = ''; // Stores the path to the CSV data file for venue locations

// Function to initialize the first page view
function firstPage() {
    year_count = 0; // Reset the year counter to zero
    document.getElementById("bp").style.visibility = 'hidden'; // Hide the "Back" button
    document.getElementById("bn").style.visibility = 'hidden'; // Hide the "Next" button
    document.getElementById("bh").style.visibility = 'hidden'; // Hide the "Home" button
    document.getElementById("bs").style.visibility = 'visible'; // Show the "Explore Olympic Men's Basketball" button
    document.getElementById("bw").style.visibility = 'visible'; // Show the "Explore FIBA Men's Basketball" button
    document.getElementById("bs").innerHTML = "Explore Olympic Mens Basketball"; // Set the text for the Olympic button
    document.getElementById("bw").innerHTML = "Explore FIBA Mens Basketball"; // Set the text for the FIBA button
    document.getElementById("bh").innerHTML = ""; // Clear the text for the "Home" button
    clearVenueYearsChart(); // Clear any existing charts or venue data
    document.getElementById("introDivId").style.display = "block"; // Display the introduction section
    d3.select("#sourceDivId").html(""); // Clear the source information section
}

// Function to set up the page for viewing Olympic data
function Olympics() {
    olympics = 0; // Set the flag to indicate we are viewing Olympic data
    dataPath = 'data/summerMensBasketball.csv'; // Set the path to the Olympic data file
    venuePath = 'data/summerMensBasketballLocations.csv'; // Set the path to the Olympic venue data file
    initVisualization(); // Initialize the visualization with the selected data
}

// Function to set up the page for viewing FIBA data
function FIBA() {
    olympics = 1; // Set the flag to indicate we are viewing FIBA data
    dataPath = 'data/FibaMensBasketball.csv'; // Set the path to the FIBA data file
    venuePath = 'data/FibaMensBasketballLocations.csv'; // Set the path to the FIBA venue data file
    initVisualization(); // Initialize the visualization with the selected data
}

// Function to initialize the visualization after a data set has been chosen
function initVisualization() {
    document.getElementById("bn").disabled = false; // Enable the "Next" button
    document.getElementById("bp").style.visibility = 'visible'; // Make the "Back" button visible
    document.getElementById("bn").style.visibility = 'visible'; // Make the "Next" button visible
    document.getElementById("bh").style.visibility = 'visible'; // Make the "Home" button visible
    document.getElementById("bw").style.visibility = 'hidden'; // Hide the Olympic exploration button
    document.getElementById("bs").style.visibility = 'hidden'; // Hide the FIBA exploration button
    document.getElementById("bh").innerHTML = "Home"; // Set the "Home" button text
    document.getElementById("bs").innerHTML = ""; // Clear the Olympic button text
    document.getElementById("bw").innerHTML = ""; // Clear the FIBA button text
    document.getElementById("introDivId").style.display = "none"; // Hide the introduction section
    forwardButton(0); // Move forward to the first data point
    d3.select("#sourceDivId").html("<p>*Original data source: <a href='https://www.basketball-reference.com/international/mens-olympics/'>https://www.basketball-reference.com/international/mens-olympics/</a></p>"); // Update the source information
}

// Function to handle the "Next" button click and move to the next year of data
function forwardButton(clickId) {
    if (clickId != 0) {
        year_count = clickId - 1; // Adjust the year count based on the click ID
    }
    if (year_count < numberOfGames) {
        year_count += 1; // Increment the year count
        document.getElementById("bp").disabled = false; // Enable the "Back" button
        document.getElementById("bn").disabled = true; // Disable the "Next" button temporarily
        clearVenueYearsChart(); // Clear the current chart and venue data
        updateVenue(year_count); // Update the venue information based on the new year count
        BubbleChart(year_count); // Generate a new bubble chart for the selected year
        TotalFreqPlot(year_count); // Generate a new frequency plot for the selected year
    }
    if (year_count == 1) {
        document.getElementById("bp").disabled = true; // Disable the "Back" button if we are at the first year
    }
    if (year_count >= numberOfGames) {
        document.getElementById("bn").disabled = true; // Disable the "Next" button if we are at the last year
    } else {
        setTimeout(function() {
            document.getElementById("bn").disabled = false; // Re-enable the "Next" button after a short delay
        }, 200);
    }
}

// Function to handle the "Back" button click and move to the previous year of data
function backButton() {
    if (year_count > 1) {
        year_count -= 1; // Decrement the year count
        document.getElementById("bp").disabled = true; // Disable the "Back" button temporarily
        document.getElementById("bn").disabled = false; // Enable the "Next" button
        updateVenue(year_count); // Update the venue information based on the new year count
        clearVenueYearsChart(); // Clear the current chart and venue data
        BubbleChart(year_count); // Generate a new bubble chart for the selected year
        TotalFreqPlot(year_count); // Generate a new frequency plot for the selected year
    }
    if (year_count == 1) {
        document.getElementById("bp").disabled = true; // Disable the "Back" button if we are at the first year
    } else {
        setTimeout(function() {
            document.getElementById("bp").disabled = false; // Re-enable the "Back" button after a short delay
        }, 200);
    }
}

// Function to clear the current venue and year charts from the page
function clearVenueYearsChart() {
    d3.select("#venueDivId").selectAll('h2').remove(); // Remove all H2 elements from the venue section
    d3.select("#yearsDivId").selectAll('p').remove(); // Remove all P elements from the years section
    document.getElementById("scatterDivId").innerHTML = ""; // Clear the scatter plot div
    document.getElementById("barDivId").innerHTML = ""; // Clear the bar chart div
}

// Function to update the venue information based on the current year
function updateVenue(idcall) {
    // Load the venue data from the CSV file
    d3.csv(venuePath, function(error, data) {
        if (error) throw error; // Throw an error if the CSV file cannot be loaded

        var olympicsType = ''; // Initialize a variable to store the type of competition (Olympics or FIBA)
        if (olympics) {
            olympicsType = 'FIBA Mens Basketball'; // Set the type to FIBA if the flag is set
        } else {
            olympicsType = 'Mens Summer Olympics'; // Set the type to Olympics if the flag is not set
        }

        window.numberOfGames = data.length; // Set the global number of games variable to the length of the data

        var yearText_i = ''; // Initialize a variable to store the formatted text for each year
        var yearText = ''; // Initialize a variable to store the overall formatted year text
        yearText = '<p><b>' + olympicsType + ' games*:</b> '; // Start building the year text with the competition type

        for (var i = 0; i < data.length; i++) {
            if (data[i].ID < idcall) {
                // Format the years before the current year
                yearText_i = '<b style="background-color : ' + (olympics ? '#cd5c5c;">' : '#cd5c5c;">'); 
                yearText_i += '<a href="javascript:forwardButton(' + (i + 1) + ')">' + data[i].Year + '</a></b>';
            } else if (data[i].ID == idcall) {
                // Highlight the current year and display its venue information
                d3.select("#venueDivId").insert("h2").text(olympicsType + ' in ' + data[i].City + ' (' +
                    data[i].Year + ')').style('background', olympics ? '#cd5c5c' : '#cd5c5c');
                yearText_i = '<b style="border:2px; border-style:solid; border-color:#FF0000; border-radius: 3px; background-color :' + (olympics ? '#cd5c5c;">' : '#cd5c5c;">') + data[i].Year + '</b>';
                window.hostCountry = data[i].Country; // Set the global host country variable
                window.hostCity = data[i].City; // Set the global host city variable
                window.hostYear = data[i].Year; // Set the global host year variable
            } else {
                // Format the years after the current year
                yearText_i = '<a href="javascript:forwardButton(' + (i + 1) + ')">' + data[i].Year + '</a>';
            }
            if (data[i].ID < idcall) {
                yearText_i += '<b style="background-color : ' + (olympics ? '#cd5c5c;">' : '#cd5c5c;">') + ((i < data.length - 1) ? ' | ' : '') + '</b>';
            } else {
                yearText_i += (i < data.length - 1) ? ' | ' : '';
            }
            yearText += yearText_i; // Append the formatted year text to the overall text
        }
        yearText += '</p>'; // Close the year text paragraph
        d3.select("#yearsDivId").html(yearText); // Update the years section with the formatted year text
    });
}
