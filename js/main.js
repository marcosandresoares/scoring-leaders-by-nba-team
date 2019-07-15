$(document).ready(function() {

    let diameter = 750;
    let format = d3.format(",d");
    let color = d3.scaleOrdinal(d3.schemeCategory20c);

    let bubble = d3.pack()
        .size([diameter, diameter])
        .padding(1.5);


    let svgContainer = d3.select("#data-visualisation");

    // Append <svg> to body
    let svg = svgContainer.append('svg')
        .attr('width', diameter)
        .attr('height', diameter)
        .attr("align", "center")
        .attr('class', 'bubble');

    // Read the data
    d3.json("data/nba-franchise-scoring-leaders.json", function(error, data) {

        // error scenario
        if (error) throw error;

        let root = d3.hierarchy(classes(data))
            .sum(function(d) {
                return d.value;
            })
            .sort(function(a, b) {
                return b.value - a.value;
            });

        bubble(root);

        //////////////
        // tooltip
        //////////////

        //Create a tooltip div that is hidden by default:
        let tooltip = d3.select('body')
            .append("div")
            .style("display", "none")
            .style("opacity", 0)
            .attr("class", "tooltip");

        // Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
        let showTooltip = function(d) {
            tooltip
                .transition()
                .duration(200)
            tooltip
                .style("display", "inline")
                .style("opacity", 1)
                .style("left", (d3.event.pageX + 15) + "px")
                .style("top", (d3.event.pageY + 15) + "px")
                //
                .style("padding", "8px")
                .style("background-color", "#212121")
                .style("color", "#f6f6f6")
                .style("height", "8em");
        }

        let moveTooltip = function(d) {
            tooltip
                .html("<b>" + d.data.className + "</b><br>" + d.data.team + "<br><br> Points with franchise: " + d.data.value)
                .style("left", (d3.event.pageX + 15) + "px")
                .style("top", (d3.event.pageY + 15) + "px");

        }

        let hideTooltip = function(d) {
                tooltip
                    .transition()
                    .duration(200)
                    .style("opacity", 0);
            }
            //////////////



        let node = svg.selectAll(".node")
            .data(root.children)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        node.append("circle")
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d) {
                return d.data.color;
            })
            .style("stroke", "none")
            // trigger tooltip functions
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip);

        node.append("text")
            .attr("dy", "0.3em")
            .style("text-anchor", "middle")
            //.text(function(d) {
            //    return d.data.className.substring(0, d.r / 3.8);
            //});

    });

    function classes(root) {
        let classes = [];

        function recurse(name, node) {
            if (node.children) {
                node.children.forEach(function(child) {
                    recurse(node.name, child);
                });
            } else {
                classes.push({
                    packageName: name,
                    className: node.name,
                    value: node.size,
                    color: node.color,
                    team: node.team
                });
            }
        }

        recurse(null, root);
        return {
            children: classes
        };
    }


    d3.select(self.frameElement)
        .style("height", diameter + "px");
});