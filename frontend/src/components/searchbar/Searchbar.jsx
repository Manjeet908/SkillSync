import React,{useState,useEffect, use} from 'react'
import './Searchbar.css'
import axios from 'axios';
function Searchbar() {
    const [suggestions, setSuggestions] = useState([]);
    const [query,setQuery] = useState('');
    useEffect(() => {
        const fetchSuggestions = async () => {
            if(query.trim()==="")
            {
                setSuggestions([]);
                return;
            }
            try{
                const res= await axios.get(`http://localhost:8000/api/v1/search?q=${query}`);
                setSuggestions(res.data.suggestions);
            }
            catch(err){
                console.error("Error fetching suggestions:", err);
            }
        };
        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }
    , [query]);
  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((item) => (
            <li key={item._id} className="suggestion-item">
              {item.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Searchbar