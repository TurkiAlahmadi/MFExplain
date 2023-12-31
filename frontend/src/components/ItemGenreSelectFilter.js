import React from "react";
import Multiselect from "multiselect-react-dropdown";

export const ItemGenreSelectFilter = ({ selectedGenres, handleGenreSelect }) => {

    // Define options
    const options = [
        "Action", "Adventure", "Animation", "Children", "Comedy", "Crime", "Documentary", "Drama",
        "Fantasy", "Horror", "IMAX", "Musical", "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western"
    ].map(genre => ({ key: genre, value: genre }));

    const customStyles = {
        chips: { background: '#e7d8c9', color: '#555b6e' },
        option: { color: 'black' },
        searchBox: { border: '1px solid #ccc', borderRadius: '8px', width: '436px', height: '45px'},
        multiselectContainer: { "background-color": 'white', borderRadius: '8px', width: '436px',
            height: '45px', position: 'absolute', left: '7px', top: '187px' },
        optionContainer: {"background-color": 'white', width: '436px', height: '125px', position: 'absolute', left: '0px', top: '0px' },
    }

    return (
        <div className="item-space-multiselect">
            <Multiselect
                options={options}
                onSelect={handleGenreSelect}
                onRemove={handleGenreSelect}
                displayValue="key"
                selectedValues={selectedGenres}
                placeholder={"Filter space by genre"}
                avoidHighlightFirstOption={true}
                hidePlaceholder={true}
                style={customStyles}
            />
        </div>
    );
};