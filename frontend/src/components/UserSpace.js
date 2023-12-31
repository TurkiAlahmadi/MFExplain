import * as d3 from 'd3'
import { useState, useEffect, useRef } from "react";
import {UserGenreSelectFilter} from "./UserGenreSelectFilter";

export const UserSpace = ({data, userDataUpdate, recommendationsUpdate, userList, userColors}) => {

    // Define useState variables
    const [user, setUser] = useState({});
    const [hover, setHover] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState([]);

    // Set width and height
    const margin = {top: 1, right: 1, bottom: 1, left: 1},
        width = 440 - margin.left - margin.right,
        height = 440 - margin.top - margin.bottom,
        legendWidth = 150,
        legendHeight = 200;

    // Calculate the minimum and maximum x and y values from your data
    const xMin = d3.min(data, d => d.x);
    const xMax = d3.max(data, d => d.x);
    const yMin = d3.min(data, d => d.y);
    const yMax = d3.max(data, d => d.y);

    const svgRef = useRef(null);
    const legendRef = useRef(null);

    useEffect(() => {
        const legendSvg = d3.select(legendRef.current);

        const legend = legendSvg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(10, 10)`)
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        const legendData = [
            { label: "You", color: userColors.self },
            { label: "Similar", color: userColors.similar },
            { label: "Highlighted", color: userColors.highlighted },
            { label: "Other", color: userColors.other },
        ];

        const legendItems = legend.selectAll(".legend-item")
            .data(legendData)
            .enter().append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`)

        legendItems.append("circle")
            .attr("r", 5)
            .attr("cx", 10)
            .attr("fill", d => d.color)
            .attr("opacity", 0.7)
            .attr("stroke", d => d.color)
            .attr("fill-opacity", 0.5)
            .attr("stroke-width", 1);

        legendItems.append("text")
            .attr("x", 20)
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .style("font-weight", "lighter")
            .text(d => d.label);

        // Cleanup function to remove the legend when the component unmounts
        return () => {
            legendSvg.selectAll(".legend").remove();
        };
    }, []); // Empty dependency array ensures this runs only once

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        const x = d3.scaleLinear().domain([xMin, xMax]).range([0, width]);
        const y = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);

        const zoom = d3.zoom().scaleExtent([0.5, 50]).on("zoom", handleZoom);
        svg.call(zoom);

        function handleZoom(event) {
            const newTransform = event.transform;
            svg.selectAll("circle")
                .attr("transform", newTransform)
                .attr("r", 5 / newTransform.k)
                .attr("stroke-width", 1 / newTransform.k);
        }

        const createMarks = svg
            .selectAll("circle")
            .data(data)

        createMarks.enter().append("circle")
            .attr("key", (d) => d.id)
            .attr("r", 5)
            .attr("cx", (d) => x(d.x))
            .attr("cy", (d) => y(d.y))
            .attr("opacity", 0.7)
            .attr("stroke", (d) => d.color)
            .attr("fill", (d) => d.color)
            .attr("fill-opacity", 0.5)
            .attr("stroke-width", 1)
            .on("mouseenter", (event, d) => hoverOn(event, d))
            .on("mouseleave", () => hoverOff())
            .on("click", (event, d) => handleClick(event, d));

        createMarks.exit().remove();

        if (selectedGenres.length > 0) {
            createMarks.attr("fill-opacity", (d) => {
                if (!d.favoriteGenres) return 0.1
                const userGenres = d.favoriteGenres.split(" ");
                return selectedGenres.every(selectedGenre => userGenres.includes(selectedGenre.value)) ? 0.6 : 0.1;
            })
            .attr("opacity", (d) => {
                if (!d.favoriteGenres) return 0.1
                const userGenres = d.favoriteGenres.split(" ");
                return selectedGenres.every(selectedGenre => userGenres.includes(selectedGenre.value)) ? 1 : 0.4;
            })
            .attr("stroke", (d) => d.color);

            createMarks.exit().remove();
        } else {
            createMarks
                .attr("fill-opacity", 0.5)
                .attr("opacity", 0.7)
                .attr("fill", (d) => d.color)
                .attr("stroke", (d) => d.color);
        }

        if (userList.length > 0) {
            createMarks
                .attr('stroke', (d) => userList.includes(d.id) ? userColors["highlighted"] : d.color)
                .attr('fill', (d) => d.id == 0 ? d.color : d.color == userColors["similar"] ? userColors["similar"] :
                        userList.includes(d.id) ? userColors["highlighted"] : d.color)

            createMarks.exit().remove();
        } else {
            createMarks
                .attr('stroke', (d) => d.color)
                .attr('fill', (d) => d.color);
        }

        // Define interaction handlers
        function hoverOn(event, d) {
            setUser({"favoriteGenres": d.favoriteGenres, "favoriteTags": d.favoriteTags});
            setHover(true);
        }

        function hoverOff() {
            setUser({"favoriteGenres": "", "favoriteTags": ""});
            setHover(false);
        }

        function handleClick(event, d) {
            let tempColor = event.currentTarget.getAttribute('fill');
            if (tempColor === userColors["self"]) return;
            else if (tempColor === userColors["other"] || tempColor === userColors["highlighted"]) {
                tempColor = userColors["similar"];
            }
            else if (tempColor === userColors["similar"]) {
                tempColor = userColors["other"];
            }
            userDataUpdate(d, tempColor);
            recommendationsUpdate();
        };

    }, [data, userDataUpdate, recommendationsUpdate, userColors, selectedGenres]);

    // Function to handle changes in selected genre options
    const handleGenreSelect = (selectedList, selectedItem) => {
        setSelectedGenres(selectedList);
    };

    return (
        <div className='user-space'>
            <h4 id="user-space-title">User Space</h4>
            <p id="user-space-description">The user space displays all users. Users who have rated movies
                similarly are closer to each other. Hovering over users shows their preferences based on
                movies they liked below the figure. Clicking on users allows labeling them as "Similar"/"Other".
                When a movie is selected in the item space, user points labeled with "other" appear grey, while
                points labeled with "You" or "Similar" appear with a black border instead.
                Applying genre filtering makes users satisfying the filtering condition appear darker, while
                irrelevant users look more transparent.
            </p>
            <svg
                className="user-svg"
                width={width}
                height={height}
                ref={svgRef}
            />
            <svg
                className="user-legend"
                width={legendWidth}
                height={legendHeight}
                ref={legendRef}
            />
            {hover && (
                <div className="user-hover">
                    <>
                    <p><strong>Top Genres of Liked Movies:</strong> {user.favoriteGenres}
                        <br />
                        <strong>Top Tags of Liked Movies:</strong> {user.favoriteTags}
                    </p>
                    </>
                </div>
            )}
            <UserGenreSelectFilter
                selectedGenres={selectedGenres}
                handleGenreSelect={handleGenreSelect}
            />
        </div>
    );
};