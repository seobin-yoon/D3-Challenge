var svg_width = 600;
var svg_height = 400;

var margin = {
    top: 20, bottom: 80, right: 40, left: 100
};

// Calculate chart width and height
var width = (svg_width - margin.left - margin.right);
var height = (svg_height - margin.top - margin.bottom);

//// append svg and group
var svg = d3.select("#scatter")
            .append("svg")
            .attr("width", svg_width)
            .attr("height", svg_height);


var chart_group = svg.append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`)

// Set the initial variables
var x_axis_update = "poverty";
var y_axis_update = "healthcare";

// function used for updating x-axis var upon click on axis label
function renderXAxes(newx_scale, x_axis) {
  var bottomAxis = d3.axisBottom(newx_scale);

  x_axis.transition()
    .duration(1000)
    .call(bottomAxis);

  return x_axis;
}
// function used for updating y_axis var upon click on axis label
function render_yaxis(newy_scale, y_axis) {
  var leftAxis = d3.axisLeft(newy_scale);

  y_axis.transition()
    .duration(1000)
    .call(leftAxis);

  return y_axis;
}


// transition to new circle groups

function render_circles(circle_group, newx_scale, newy_scale, x_axis_update, y_axis_update) {

  circle_group.transition()
    .duration(1000)
    .attr("cx", d => newx_scale(d[x_axis_update]))
    .attr("cy", d=>newy_scale(d[y_axis_update]));
  return circle_group;
}
function render_texts(text_group, newx_scale, newy_scale, x_axis_update, y_axis_update) {

  text_group.transition()
    .duration(1000)
    .attr("x", d=>newx_scale(d[x_axis_update]))
    .attr("y", d=>newy_scale(d[y_axis_update]))
  return text_group;
}

// scales
function x_scale(healthData, x_axis_update) {
    var x_linear_scale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[x_axis_update]*0.8),
        d3.max(healthData, d => d[x_axis_update]*1.2)
      ])
      .range([0, width]);
    return x_linear_scale;
}
function y_scale(healthData, y_axis_update) {
    var y_linear_scale = d3.scaleLinear()
      .domain([d3.min(healthData, d=>d[y_axis_update])*0.8, d3.max(healthData, d=>d[y_axis_update])*1.2 ])
      .range([height, 0]);
    return y_linear_scale;
}

// updating tooltip for circles group
function update_tool(x_axis_update, y_axis_update, circle_group){
  let x_label = ""
  let y_label = ""
  if (x_axis_update === "poverty"){
    x_label = "Poverty (%): ";
  }
  else if (x_axis_update === "age"){
    x_label = "Age (Median): ";
  }
  else{
    x_label = "Income (Median): $";
  }
  if (y_axis_update === "healthcare"){
    y_label = "Healthcare (%): "
  }
  else if (y_axis_update === "smokes"){
    y_label = "Smokes (%): "
  }
  else{
    y_label = "Obesity (%): "
  }
  var toolTip = d3.tip()
                    .attr("class", "d3-tip")
                    .offset([80, -60])
                    .html(function(d){
                      if (y_axis_update === "smokes" || y_axis_update === "obesity") {
                          
                        if (x_axis_update === "poverty"){
                          return(`${d.state},${d.abbr}<br>${x_label}${d[x_axis_update]}%<br>${y_label}${d[y_axis_update]}%`)
                        }
                        return(`${d.state},${d.abbr}<br>${x_label}${d[x_axis_update]}<br>${y_label}${d[y_axis_update]}%`)
                      }
                      else if (x_axis_update === "poverty"){
                        return(`${d.state},${d.abbr}<br>${x_label}${d[x_axis_update]}%<br>${y_label}${d[y_axis_update]}`)
                      }
                      else{
                        return(`${d.state},${d.abbr}<br>${x_label}${d[x_axis_update]}<br>${y_label}${d[y_axis_update]}`)
                      }  
                    })
  
  circle_group.call(toolTip);
  circle_group.on("mouseover", function(data){
    toolTip.show(data, this);
    d3.select(this).style("stroke", "black");
    
  })
  circle_group.on("mouseout", function(data, index){
    toolTip.hide(data, this)
    d3.select(this).style("stroke", "white");
  })
  return circle_group;
}

// Extract and load the data from the CSV file
(async function(){
    var healthData = await d3.csv("assets/data/data.csv");

    // Parse the data to integer
    healthData.forEach(function(data){
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.poverty = +data.poverty;
        data.smokes = +data.smokes;
    
    })

    // x_linear_scale function after importing csv 
    let x_linear_scale = x_scale(healthData, x_axis_update);

    // y_linear_scale function after importing csv
    let y_linear_scale = y_scale(healthData, y_axis_update)

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(x_linear_scale);
    var leftAxis = d3.axisLeft(y_linear_scale);

    // append X-axis
    let x_axis = chart_group.append("g")
                        .classed("x-axis", true)
                        .attr("transform", `translate(0, ${height})`)
                        .call(bottomAxis)
    
    let y_axis = chart_group.append("g")
                        .classed("y-axis", true)
                        .call(leftAxis)
    
    let crltext_group = chart_group.selectAll("mycircles")
                      .data(healthData)
                      .enter()
                      .append("g")
    
    let circle_group = crltext_group.append("circle")
                            .attr("cx", d=>x_linear_scale(d[x_axis_update]))
                            .attr("cy", d=>y_linear_scale(d[y_axis_update]))
                            .classed("stateCircle", true)
                            .attr("r", 8)
                            .attr("opacity", "2");

    let text_group = crltext_group.append("text")
                              .text(d=>d.abbr)
                              .attr("x", d=>x_linear_scale(d[x_axis_update]))
                              .attr("y", d=>y_linear_scale(d[y_axis_update])+3)
                              .classed("stateText", true)
                              .style("font-size", "8px")
                              .style("font-weight", "1000")

     // Create 3 labels on x-axis
     var x_labelsGroup = chart_group.append("g")
                                .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);
    
    // Create 3 labels on y-axis
    var y_labelsGroup = chart_group.append("g")
                                .attr("transform", `translate(${0-margin.left/4}, ${height/2})`);

    var poverty_label = x_labelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 0)
                                .attr("value", "poverty") 
                                .classed("active", true)
                                .classed("aText", true)
                                .text("In Poverty (%)");

    var age_label = x_labelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 20)
                                .attr("value", "age") 
                                .classed("inactive", true)
                                .classed("aText", true)
                                .text("Age (Median)");

    var income_label = x_labelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 40)
                                .attr("value", "income") 
                                .classed("inactive", true)
                                .classed("aText", true)
                                .text("Household Income (Median)");
    
    var healthcare_label = y_labelsGroup.append("text")
                                .attr("y", 0 - 20)
                                .attr("x", 0)
                                .attr("transform", "rotate(-90)")
                                .attr("dy", "1em")
                                .attr("value", "healthcare")
                                .classed("active", true)
                                .classed("aText", true)
                                .text("Lacks Healthcare (%)");
    
    var smoke_label = y_labelsGroup.append("text")
                                .attr("y", 0 - 40)
                                .attr("x", 0)
                                .attr("transform", "rotate(-90)")
                                .attr("dy", "1em")
                                .attr("value", "smokes")
                                .classed("inactive", true)
                                .classed("aText", true)
                                .text("Smokes (%)");
                                
    var obesity_label = y_labelsGroup.append("text")
                                .attr("y", 0 - 60)
                                .attr("x", 0)
                                .attr("transform", "rotate(-90)")
                                .attr("dy", "1em")
                                .attr("value", "obesity")
                                .classed("inactive", true)
                                .classed("aText", true)
                                .text("Obese (%)");

     
     circle_group = update_tool(x_axis_update, y_axis_update, circle_group);

    // x axis labels event listener
    x_labelsGroup.selectAll("text")
        .on("click", function() {

    // get the selected value 
        var value = d3.select(this).attr("value");
        console.log(`${value} click`)
        if (value !== x_axis_update) {

            // replace x_axis_update with value
            x_axis_update = value;
            console.log(x_axis_update)

            // update x scale for new data
            x_linear_scale = x_scale(healthData, x_axis_update);

            // update x axis with transition
            x_axis = renderXAxes(x_linear_scale, x_axis);

             // update texts with new x values
            text_group = render_texts(text_group, x_linear_scale, y_linear_scale, x_axis_update, y_axis_update);

            // update circles with new x values
            circle_group = render_circles(circle_group, x_linear_scale, y_linear_scale, x_axis_update, y_axis_update);

            // changes classes to change bold text
            if (x_axis_update === "poverty") {
                poverty_label
                    .classed("active", true)
                    .classed("inactive", false);
                age_label
                    .classed("active", false)
                    .classed("inactive", true);
                income_label
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (x_axis_update === "age"){
              poverty_label
                  .classed("active", false)
                  .classed("inactive", true);
              age_label
                  .classed("active", true)
                  .classed("inactive", false);
              income_label
                  .classed("active", false)
                  .classed("inactive", true);
            }
            else{
              poverty_label
                    .classed("active", false)
                    .classed("inactive", true);
                age_label
                    .classed("active", false)
                    .classed("inactive", true);
                income_label
                    .classed("active", true)
                    .classed("inactive", false);  
            }
          // update tooltip with new info after changing x-axis 
          circle_group = update_tool(x_axis_update, y_axis_update, circle_group); 
      }})
// y axis labels event listener
y_labelsGroup.selectAll("text")
.on("click", function() {
// get the selected value 
var value = d3.select(this).attr("value");
console.log(`${value} click`)
if (value !== y_axis_update) {

    // replace x_axis_update with value
    y_axis_update = value;
    console.log(y_axis_update)

    // functions here found above csv import
    // update x scale for new data
    y_linear_scale = y_scale(healthData, y_axis_update);

    // update x axis with transition
    y_axis = render_yaxis(y_linear_scale, y_axis);

    // update circles and texts  with new x values
    circle_group = render_circles(circle_group, x_linear_scale, y_linear_scale, x_axis_update, y_axis_update);
    text_group = render_texts(text_group, x_linear_scale, y_linear_scale, x_axis_update, y_axis_update);
    
    // update the tooltip with new info
    circle_group = update_tool(x_axis_update, y_axis_update, circle_group); 
    // changes classes to change bold text ; change y-axis
    if (y_axis_update === "smokes") {
      smoke_label
            .classed("active", true)
            .classed("inactive", false);

      obesity_label
            .classed("active", false)
            .classed("inactive", true);

      healthcare_label
            .classed("active", false)
            .classed("inactive", true);
    }
    else if (y_axis_update === "healthcare"){
      smoke_label
          .classed("active", false)
          .classed("inactive", true);

      obesity_label
          .classed("active", false)
          .classed("inactive", true);

      healthcare_label
          .classed("active", true)
          .classed("inactive", false);
    }
    else{
      smoke_label
            .classed("active", false)
            .classed("inactive", true);

      obesity_label
            .classed("active", true)
            .classed("inactive", false);  

      healthcare_label
            .classed("active", false)
            .classed("inactive", true);           
    }
     
     
  }})

})()